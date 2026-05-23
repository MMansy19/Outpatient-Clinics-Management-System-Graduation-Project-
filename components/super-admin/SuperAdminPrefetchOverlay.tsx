'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import {
  prefetchSuperAdminData,
  getLastFullSyncAt,
  type PrefetchProgress,
} from '@/lib/offline/prefetchSuperAdmin';

interface SuperAdminPrefetchOverlayProps {
  /** Force re-run prefetch even when cache is fresh. */
  refreshKey?: number;
  /** Skip the overlay when cache exists; still triggers a background prefetch. */
  silent?: boolean;
  /** Notify parent when prefetch finishes (success or skipped). */
  onComplete?: (lastSyncAt: number) => void;
}

const STAGE_LABEL: Record<PrefetchProgress['stage'], string> = {
  lists: 'Loading clinics, doctors, patients & visits...',
  patients: 'Loading patient records...',
  done: 'Done',
};

/**
 * Triggers `prefetchSuperAdminData` once on mount (and whenever `refreshKey`
 * changes) and shows a blocking overlay during the very first sync, when no
 * cached data exists yet. Subsequent runs sync silently in the background.
 */
export function SuperAdminPrefetchOverlay({
  refreshKey = 0,
  silent = false,
  onComplete,
}: SuperAdminPrefetchOverlayProps) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetworkStatus();
  const [progress, setProgress] = useState<PrefetchProgress | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!isOnline) {
        onComplete?.(await getLastFullSyncAt());
        return;
      }

      const last = await getLastFullSyncAt();
      const showOverlay = !silent && (last === 0 || refreshKey > 0);
      if (showOverlay) setVisible(true);

      try {
        await prefetchSuperAdminData(queryClient, {
          freshnessMs: refreshKey > 0 ? undefined : 60_000,
          onProgress: (p) => {
            if (!cancelled) setProgress(p);
          },
        });
      } finally {
        if (!cancelled) {
          setVisible(false);
          onComplete?.(await getLastFullSyncAt());
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryClient, refreshKey, silent, isOnline, onComplete]);

  if (!visible || !progress) return null;

  const total = progress.total || 1;
  const pct = Math.min(100, Math.round((progress.processed / total) * 100));

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="medical-card flex w-[90%] max-w-md flex-col items-center gap-4 p-6 text-center shadow-2xl">
        <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Preparing offline data
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {STAGE_LABEL[progress.stage]}
          </p>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-medical-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {progress.processed} / {progress.total}
        </p>
      </div>
    </div>
  );
}

