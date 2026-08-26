'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface FormStateOptions {
  onSuccess?: (data?: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
  /** Toast text when the operation was queued for offline sync. */
  offlineMessage?: string;
}

function isOfflineResult(value: unknown): boolean {
  return !!value && typeof value === 'object' && (value as { offline?: unknown }).offline === true;
}

export function useFormState(options: FormStateOptions = {}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useNetworkStatus();

  const { onSuccess, onError, successMessage, errorMessage, offlineMessage } = options;

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
    }
  }, []);

  const execute = useCallback(
    async <T>(fn: () => Promise<T>, customSuccessMessage?: string): Promise<T | undefined> => {
      // When offline we skip the pending spinner entirely. The offline-aware
      // mutation resolves nearly synchronously (it just enqueues to IndexedDB)
      // so the dialog should close immediately with no loading flicker.
      const skipSpinner = !isOnline;
      if (!skipSpinner) setIsPending(true);
      setError(null);

      try {
        const result = await fn();

        if (isOfflineResult(result)) {
          toast.success(offlineMessage || 'Saved offline — will sync when online');
        } else if (successMessage || customSuccessMessage) {
          toast.success(customSuccessMessage || successMessage || 'Operation completed successfully');
        }

        onSuccess?.(result);
        setOpen(false);
        return result;
      } catch (err: any) {
        const errorMsg = errorMessage || err?.message || 'An error occurred';
        setError(errorMsg);

        toast.error(errorMessage || 'Error', {
          description: errorMsg,
        });

        onError?.(err);
        throw err;
      } finally {
        if (!skipSpinner) setIsPending(false);
      }
    },
    [onSuccess, onError, successMessage, errorMessage, offlineMessage, isOnline]
  );

  const reset = useCallback(() => {
    setIsPending(false);
    setError(null);
    setOpen(false);
  }, []);

  return {
    open,
    setOpen,
    isPending,
    error,
    handleOpenChange,
    execute,
    reset,
  };
}
