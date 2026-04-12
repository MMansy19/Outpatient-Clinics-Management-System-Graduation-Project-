'use client';

import { useState, useEffect, useCallback } from 'react';
import { getQueueSize, getFailedMutations, getPendingMutations, retryMutation, deleteMutation, getMutationLabel } from '@/lib/offline/mutationQueue';
import { processSyncQueue, addSyncListener, type SyncEvent } from '@/lib/offline/syncEngine';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { QueuedMutation } from '@/lib/offline/db';

export function SyncStatusIndicator() {
  const { isOnline } = useNetworkStatus();
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  const refreshCount = useCallback(async () => {
    const count = await getQueueSize();
    setQueueCount(count);
  }, []);

  // Listen for sync events
  useEffect(() => {
    const unsub = addSyncListener((event: SyncEvent) => {
      if (event.type === 'start') setIsSyncing(true);
      if (event.type === 'complete' || event.type === 'error') {
        setIsSyncing(false);
        refreshCount();
      }
    });
    return unsub;
  }, [refreshCount]);

  // Refresh count periodically
  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, 5000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  if (queueCount === 0) return null;

  return (
    <>
      <button
        onClick={() => setShowDrawer(true)}
        className="relative inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        {isSyncing ? (
          <svg className="h-3.5 w-3.5 animate-spin text-emerald-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span>{queueCount} pending</span>
      </button>

      {showDrawer && (
        <PendingMutationsDrawer
          isOnline={isOnline}
          onClose={() => setShowDrawer(false)}
          onRefresh={refreshCount}
        />
      )}
    </>
  );
}

// ============================================================================
// Pending Mutations Drawer
// ============================================================================

function PendingMutationsDrawer({
  isOnline,
  onClose,
  onRefresh,
}: {
  isOnline: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [mutations, setMutations] = useState<QueuedMutation[]>([]);
  const [failedOnly, setFailedOnly] = useState(false);

  const loadMutations = useCallback(async () => {
    const items = failedOnly ? await getFailedMutations() : await getPendingMutations();
    setMutations(items);
  }, [failedOnly]);

  useEffect(() => {
    loadMutations();
  }, [loadMutations]);

  async function handleRetry(autoId: number) {
    await retryMutation(autoId);
    await loadMutations();
    onRefresh();
    if (isOnline) processSyncQueue();
  }

  async function handleDelete(autoId: number) {
    await deleteMutation(autoId);
    await loadMutations();
    onRefresh();
  }

  async function handleSyncNow() {
    if (isOnline) {
      await processSyncQueue();
      await loadMutations();
      onRefresh();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white shadow-xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Changes</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 border-b px-4 py-2 dark:border-gray-700">
          <button
            onClick={() => setFailedOnly(false)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              !failedOnly
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFailedOnly(true)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              failedOnly
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Failed
          </button>
          {isOnline && (
            <button
              onClick={handleSyncNow}
              className="ml-auto rounded-lg bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
            >
              Sync Now
            </button>
          )}
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {mutations.length === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
              No pending changes
            </p>
          ) : (
            <ul className="space-y-3">
              {mutations.map((m) => (
                <li
                  key={m.autoId}
                  className="rounded-lg border p-3 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {getMutationLabel(m.type)}
                      </p>
                      {m.patientName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          Patient: {m.patientName}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(m.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.status === 'failed'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : m.status === 'syncing'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  {m.errorMessage && (
                    <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                      {m.errorMessage}
                    </p>
                  )}

                  {m.status === 'failed' && m.autoId && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleRetry(m.autoId!)}
                        className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => handleDelete(m.autoId!)}
                        className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                      >
                        Discard
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
