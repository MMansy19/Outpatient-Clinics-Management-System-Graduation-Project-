import { v4 as uuidv4 } from 'uuid';
import { offlineDb, type QueuedMutation, type MutationType, type MutationStatus, type BlobEntry } from './db';

// ============================================================================
// Queue a new mutation for offline sync
// ============================================================================

export interface QueueMutationParams {
  type: MutationType;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: Record<string, unknown>;
  patientId?: string;
  patientName?: string;
  userId?: string;
  blobs?: Array<{ fieldName: string; blob: Blob; fileName: string; mimeType: string }>;
}

export async function queueMutation(params: QueueMutationParams): Promise<string> {
  const clientTempId = uuidv4();
  const now = Date.now();

  // Store blobs separately
  const blobKeys: string[] = [];
  if (params.blobs?.length) {
    for (const b of params.blobs) {
      const blobKey = `${clientTempId}:${b.fieldName}`;
      const entry: BlobEntry = {
        key: blobKey,
        data: b.blob,
        mimeType: b.mimeType,
        fileName: b.fileName,
        createdAt: now,
      };
      await offlineDb.blobStore.put(entry);
      blobKeys.push(blobKey);
    }
  }

  const mutation: QueuedMutation = {
    clientTempId,
    type: params.type,
    endpoint: params.endpoint,
    method: params.method,
    payload: params.payload,
    blobKeys: blobKeys.length > 0 ? blobKeys : undefined,
    status: 'pending',
    retryCount: 0,
    maxRetries: 5,
    userId: params.userId,
    patientId: params.patientId,
    patientName: params.patientName,
    createdAt: now,
  };

  await offlineDb.mutationQueue.add(mutation);
  return clientTempId;
}

// ============================================================================
// Query helpers
// ============================================================================

export async function getPendingMutations(): Promise<QueuedMutation[]> {
  return offlineDb.mutationQueue
    .where('status')
    .anyOf('pending', 'failed')
    .sortBy('createdAt');
}

export async function getSyncingMutations(): Promise<QueuedMutation[]> {
  return offlineDb.mutationQueue
    .where('status')
    .equals('syncing')
    .toArray();
}

export async function getQueueSize(): Promise<number> {
  return offlineDb.mutationQueue
    .where('status')
    .anyOf('pending', 'failed', 'syncing')
    .count();
}

export async function getFailedMutations(): Promise<QueuedMutation[]> {
  return offlineDb.mutationQueue
    .where('status')
    .equals('failed')
    .sortBy('createdAt');
}

// ============================================================================
// Status updates
// ============================================================================

export async function markSyncing(autoId: number): Promise<void> {
  await offlineDb.mutationQueue.update(autoId, {
    status: 'syncing' as MutationStatus,
    lastAttemptAt: Date.now(),
  });
}

export async function markSynced(autoId: number): Promise<void> {
  // Remove synced mutation and associated blobs
  const mutation = await offlineDb.mutationQueue.get(autoId);
  if (mutation?.blobKeys?.length) {
    await offlineDb.blobStore.bulkDelete(mutation.blobKeys);
  }
  await offlineDb.mutationQueue.delete(autoId);
}

export async function markFailed(autoId: number, errorMessage: string): Promise<void> {
  const mutation = await offlineDb.mutationQueue.get(autoId);
  if (!mutation) return;

  const newRetryCount = mutation.retryCount + 1;
  await offlineDb.mutationQueue.update(autoId, {
    status: (newRetryCount >= mutation.maxRetries ? 'failed' : 'pending') as MutationStatus,
    retryCount: newRetryCount,
    errorMessage,
    lastAttemptAt: Date.now(),
  });
}

export async function retryMutation(autoId: number): Promise<void> {
  await offlineDb.mutationQueue.update(autoId, {
    status: 'pending' as MutationStatus,
    retryCount: 0,
    errorMessage: undefined,
  });
}

export async function deleteMutation(autoId: number): Promise<void> {
  const mutation = await offlineDb.mutationQueue.get(autoId);
  if (mutation?.blobKeys?.length) {
    await offlineDb.blobStore.bulkDelete(mutation.blobKeys);
  }
  await offlineDb.mutationQueue.delete(autoId);
}

// ============================================================================
// Mutation labels for UI
// ============================================================================

const MUTATION_LABELS: Record<MutationType, string> = {
  createVisit: 'New Visit',
  createMedication: 'New Medication',
  createLab: 'New Lab',
  createScan: 'New Scan',
  createPatient: 'New Patient',
  updateVisit: 'Update Visit',
  updateMedication: 'Update Medication',
  updateLab: 'Update Lab',
  updateScan: 'Update Scan',
};

export function getMutationLabel(type: MutationType): string {
  return MUTATION_LABELS[type] || type;
}
