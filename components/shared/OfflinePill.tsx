'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { WifiOff, History } from 'lucide-react';

interface OfflinePillProps {
  /** Source of the data being shown. */
  source: 'offline' | 'cached';
  /** Optional count of pending-sync rows merged into the result. */
  pendingCount?: number;
  /** Tailwind utility classes to override layout (margin, etc.). */
  className?: string;
}

/**
 * Subtle inline indicator that the data shown is from the offline cache or
 * a stale cached snapshot. Renders as an amber pill above the affected
 * section. Intentionally non-blocking — see InlineProgressBar for the
 * "still fetching in the background" affordance.
 */
export function OfflinePill({ source, pendingCount, className = '' }: OfflinePillProps) {
  const tSearch = useTranslations('search');
  const tCommon = useTranslations('common');

  const label = source === 'offline' ? tSearch('showingOfflineResults') : tCommon('cachedData');
  const Icon = source === 'offline' ? WifiOff : History;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-between rounded-md border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-900 dark:text-amber-100 ${className}`}
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </span>
      {(pendingCount ?? 0) > 0 && (
        <Badge variant="outline" className="border-amber-400 text-amber-900 dark:text-amber-100">
          {pendingCount} {tCommon('pending')}
        </Badge>
      )}
    </div>
  );
}
