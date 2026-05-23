'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function OfflineIndicator() {
  const t = useTranslations('admin');
  const { isOnline, wasOffline, acknowledgeReconnect } = useNetworkStatus();

  useEffect(() => {
    if (wasOffline && isOnline) {
      toast.success('Back online — syncing pending changes...', { duration: 3000 });
      acknowledgeReconnect();
    }
  }, [wasOffline, isOnline, acknowledgeReconnect]);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
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
      <span>{t('offlineBanner')}</span>
    </div>
  );
}
