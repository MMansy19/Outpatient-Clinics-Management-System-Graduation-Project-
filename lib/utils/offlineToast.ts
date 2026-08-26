import { toast } from 'sonner';

/**
 * Detects whether a `useOfflineMutation` result was queued (offline) rather
 * than executed against the backend.
 */
export function wasQueuedOffline(
  result: unknown,
): result is { offline: true; clientTempId: string } {
  return (
    typeof result === 'object' &&
    result !== null &&
    (result as { offline?: boolean }).offline === true
  );
}

/**
 * Show the right success toast based on whether the action ran online or was
 * queued for later sync. Use after `mutate(vars, { onSuccess })`.
 */
export function showOfflineAwareSuccess(
  result: unknown,
  options: { onlineMessage: string; offlineMessage?: string; description?: string },
) {
  const offlineMessage =
    options.offlineMessage ?? 'Saved offline — will sync when you reconnect.';
  if (wasQueuedOffline(result)) {
    toast.success(offlineMessage, options.description ? { description: options.description } : undefined);
  } else {
    toast.success(options.onlineMessage, options.description ? { description: options.description } : undefined);
  }
}
