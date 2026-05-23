'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getQueueSize, addSyncListener } from '@/lib/offline';
import { PendingMutationsDialog } from './PendingMutationsDialog';

export function OfflineIndicator() {
  const t = useTranslations('admin');
  const { isOnline, wasOffline, acknowledgeReconnect } = useNetworkStatus();
  const [queueSize, setQueueSize] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const refreshSize = useCallback(async () => {
    try {
      setQueueSize(await getQueueSize());
    } catch {
      // ignore — DB may not be ready yet
    }
  }, []);

  useEffect(() => {
    void refreshSize();
    const unsub = addSyncListener(() => {
      void refreshSize();
    });
    const intervalId = setInterval(
      () => {
        void refreshSize();
      },
      isOnline ? 15000 : 5000,
    );
    return () => {
      unsub();
      clearInterval(intervalId);
    };
  }, [refreshSize, isOnline]);

  useEffect(() => {
    if (wasOffline && isOnline) {
      toast.success('Back online — syncing pending changes...', { duration: 3000 });
      acknowledgeReconnect();
    }
  }, [wasOffline, isOnline, acknowledgeReconnect]);

  const hasPending = queueSize > 0;

  if (isOnline && !hasPending) return null;

  return (
    <>
      <div
        className={`fixed bottom-0 inset-x-0 z-50 flex flex-wrap items-center justify-center gap-3 px-4 py-2 text-sm font-medium text-white shadow-lg ${
          isOnline ? 'bg-sky-600' : 'bg-amber-500'
        }`}
      >
        {isOnline ? (
          <>
            <span className="inline-flex h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>
              Syncing {queueSize} pending change{queueSize === 1 ? '' : 's'}…
            </span>
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l8.735 8.735m0 0a.374.374 0 11.53.53m-.53-.53l.53.53m0 0L21 21M8.25 8.829a4.49 4.49 0 011.765-.764m3.726 1.258a4.501 4.501 0 01.912.747M1.5 8.651a10.477 10.477 0 012.574-2.089m3.063-1.308A10.492 10.492 0 0112 4.5c2.205 0 4.25.68 5.938 1.843m2.476 2.088A10.451 10.451 0 0122.5 8.651"
              />
            </svg>
            <span className="hidden sm:inline">{t('offlineBanner')}</span>
            <span className="sm:hidden">{t('offlineBannerShort')}</span>
            {hasPending && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {queueSize} pending
              </span>
            )}
          </>
        )}
        {hasPending && (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="ml-2 rounded-md bg-white/15 px-3 py-1 text-xs font-medium hover:bg-white/25 transition-colors"
          >
            View
          </button>
        )}
      </div>
      <PendingMutationsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        isOnline={isOnline}
      />
    </>
  );
}
