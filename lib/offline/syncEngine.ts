import { apiClient } from '@/lib/api/client';
import { offlineDb } from './db';
import {
  getPendingMutations,
  markSyncing,
  markSynced,
  markFailed,
  reconcileOrphanedSyncing,
} from './mutationQueue';
import { assertPatientUnique, assertDoctorUnique } from './preflightUniqueness';
import { isDuplicateError } from './errors';

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
    // Recover any rows orphaned in 'syncing' status from a previous run
    // (tab closed mid-sync, navigator.onLine flipped before catch, etc.).
    // Without this, those rows are invisible to getPendingMutations() but
    // still counted by getQueueSize() → stuck banner.
    await reconcileOrphanedSyncing();

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

        // ── Replay-time uniqueness guard ─────────────────────────────────
        // Between the time the user queued the create and the moment we
        // replay it, the same SSN/email may have been created elsewhere
        // (another tab, another device that synced first, or a still-
        // pending queued create). Catching this here avoids surfacing the
        // backend's 400 as a generic failed-sync row in the drawer.
        if (mutation.type === 'createPatient') {
          try {
            await assertPatientUnique({
              socialSecurityNumber: mutation.payload?.socialSecurityNumber as string | undefined,
              excludeAutoId: mutation.autoId,
            });
          } catch (err) {
            if (isDuplicateError(err)) {
              await markFailed(
                mutation.autoId!,
                `DUPLICATE_${err.source === 'cache' ? 'REMOTE' : 'LOCAL'}: ${err.message}`,
              );
              failed++;
              continue;
            }
            throw err;
          }
        } else if (mutation.type === 'createDoctor') {
          try {
            await assertDoctorUnique({
              socialSecurityNumber: mutation.payload?.socialSecurityNumber as string | undefined,
              email: mutation.payload?.email as string | undefined,
              excludeAutoId: mutation.autoId,
            });
          } catch (err) {
            if (isDuplicateError(err)) {
              await markFailed(
                mutation.autoId!,
                `DUPLICATE_${err.source === 'cache' ? 'REMOTE' : 'LOCAL'}: ${err.message}`,
              );
              failed++;
              continue;
            }
            throw err;
          }
        }

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
    // Final safety net: any row still flagged 'syncing' here was orphaned
    // by an exception path. Flip it back to 'pending' so the counter and
    // drawer stay in sync.
    try {
      await reconcileOrphanedSyncing(0);
    } catch {
      /* swallow */
    }
    isSyncing = false;
  }

  return { synced, failed };
}

// ============================================================================
// Auto-sync on reconnect + periodic fallback (Safari lacks Background Sync)
// ============================================================================

/** Debounce window for the `online` event. Network flapping (e.g. weak wifi
 * cycling on/off) can fire `online` multiple times in quick succession; we
 * coalesce those into a single drain. The `isSyncing` mutex inside
 * processSyncQueue is the secondary guard. */
const ONLINE_DEBOUNCE_MS = 300;
let onlineDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function handleOnline() {
  if (onlineDebounceTimer) clearTimeout(onlineDebounceTimer);
  onlineDebounceTimer = setTimeout(() => {
    onlineDebounceTimer = null;
    processSyncQueue();
  }, ONLINE_DEBOUNCE_MS);
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
  if (onlineDebounceTimer) {
    clearTimeout(onlineDebounceTimer);
    onlineDebounceTimer = null;
  }
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

export function isSyncInProgress(): boolean {
  return isSyncing;
}
