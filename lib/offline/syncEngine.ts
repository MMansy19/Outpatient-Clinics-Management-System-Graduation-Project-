import { apiClient } from '@/lib/api/client';
import { offlineDb } from './db';
import {
  getPendingMutations,
  markSyncing,
  markSynced,
  markFailed,
} from './mutationQueue';

type SyncListener = (event: SyncEvent) => void;

export interface SyncEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  total: number;
  processed: number;
  failed: number;
  currentItem?: string;
}

// ============================================================================
// Sync engine singleton
// ============================================================================

let isSyncing = false;
let syncInterval: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<SyncListener>();

export function addSyncListener(listener: SyncListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(event: SyncEvent) {
  listeners.forEach((fn) => fn(event));
}

// ============================================================================
// Core sync logic
// ============================================================================

export async function processSyncQueue(): Promise<{ synced: number; failed: number }> {
  if (isSyncing) return { synced: 0, failed: 0 };
  if (!navigator.onLine) return { synced: 0, failed: 0 };

  isSyncing = true;
  let synced = 0;
  let failed = 0;

  try {
    const pending = await getPendingMutations();
    if (pending.length === 0) {
      isSyncing = false;
      return { synced: 0, failed: 0 };
    }

    emit({ type: 'start', total: pending.length, processed: 0, failed: 0 });

    for (const mutation of pending) {
      if (!navigator.onLine) break;
      if (!mutation.autoId) continue;

      try {
        await markSyncing(mutation.autoId);

        emit({
          type: 'progress',
          total: pending.length,
          processed: synced + failed,
          failed,
          currentItem: mutation.type,
        });

        // Reconstruct the request
        let data: Record<string, unknown> | FormData = { ...mutation.payload };

        // If there are blobs, build FormData
        if (mutation.blobKeys?.length) {
          const formData = new FormData();

          // Add all regular payload fields
          for (const [key, value] of Object.entries(mutation.payload)) {
            if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          }

          // Add blobs
          for (const blobKey of mutation.blobKeys) {
            const blobEntry = await offlineDb.blobStore.get(blobKey);
            if (blobEntry) {
              const fieldName = blobKey.split(':').slice(1).join(':');
              formData.append(fieldName, blobEntry.data, blobEntry.fileName);
            }
          }

          data = formData;
        }

        // Execute the API call
        switch (mutation.method) {
          case 'POST':
            await apiClient.post(mutation.endpoint, data);
            break;
          case 'PUT':
            await apiClient.put(mutation.endpoint, data);
            break;
          case 'PATCH':
            await apiClient.patch(mutation.endpoint, data);
            break;
          case 'DELETE':
            await apiClient.delete(mutation.endpoint);
            break;
        }

        await markSynced(mutation.autoId);
        synced++;
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        const status = (error as { response?: { status?: number } })?.response?.status;

        // 4xx errors (except 408, 429) are permanent failures
        if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
          await markFailed(mutation.autoId!, `${status}: ${errMsg}`);
        } else {
          // Network / 5xx errors — retry later
          await markFailed(mutation.autoId!, errMsg);
        }
        failed++;
      }
    }

    emit({ type: 'complete', total: pending.length, processed: synced + failed, failed });
  } catch (error) {
    console.error('[SyncEngine] Unexpected error:', error);
    emit({ type: 'error', total: 0, processed: 0, failed: 0 });
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

// ============================================================================
// Auto-sync on reconnect + periodic fallback (Safari lacks Background Sync)
// ============================================================================

function handleOnline() {
  processSyncQueue();
}

export function startAutoSync(intervalMs = 30_000): void {
  window.addEventListener('online', handleOnline);

  // Periodic fallback
  if (!syncInterval) {
    syncInterval = setInterval(() => {
      if (navigator.onLine) {
        processSyncQueue();
      }
    }, intervalMs);
  }
}

export function stopAutoSync(): void {
  window.removeEventListener('online', handleOnline);
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

export function isSyncInProgress(): boolean {
  return isSyncing;
}
