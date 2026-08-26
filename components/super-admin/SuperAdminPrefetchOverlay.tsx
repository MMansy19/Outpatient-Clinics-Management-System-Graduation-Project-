'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import {
  prefetchSuperAdminData,
  getLastFullSyncAt,
} from '@/lib/offline/prefetchSuperAdmin';

interface SuperAdminPrefetchOverlayProps {
  /** Force re-run prefetch even when cache is fresh. */
  refreshKey?: number;
  /** @deprecated no longer used — prefetch is always silent. */
  silent?: boolean;
  /** Notify parent when prefetch finishes (success or skipped). */
  onComplete?: (lastSyncAt: number) => void;
}

export function SuperAdminPrefetchOverlay({
  refreshKey = 0,
  silent: _silent,
  onComplete,
}: SuperAdminPrefetchOverlayProps) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isOnline) {
        onComplete?.(await getLastFullSyncAt());
        return;
      }

      const last = await getLastFullSyncAt();
      // Always prefetch silently — never block the user with an overlay,
      // even on the very first load.
      void last;

      try {
        await prefetchSuperAdminData(queryClient, {
          freshnessMs: refreshKey > 0 ? undefined : 60_000,
        });
      } finally {
        if (!cancelled) {
          onComplete?.(await getLastFullSyncAt());
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryClient, refreshKey, isOnline, onComplete]);

  // Nothing to render — prefetch is always silent.
  return null;
}

