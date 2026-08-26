'use client';

import { WifiOff } from 'lucide-react';

interface OfflineEmptyStateProps {
  /** What kind of items would be shown — e.g. "patients", "doctors". */
  label?: string;
  title?: string;
  description?: string;
}

/**
 * Shown by super-admin tables when the user is offline AND the React Query
 * cache has no data for the requested list. Prevents an infinite spinner.
 */
export function OfflineEmptyState({ label, title, description }: OfflineEmptyStateProps) {
  const resolvedTitle = title || 'You are offline';
  const resolvedDescription =
    description ||
    (label
      ? `This list of ${label} has not been loaded yet. Connect to the internet once to load it.`
      : 'This list has not been loaded yet. Connect to the internet once to load it.');

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <WifiOff className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{resolvedTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{resolvedDescription}</p>
    </div>
  );
}
