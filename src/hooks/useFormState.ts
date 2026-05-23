'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface FormStateOptions {
  onSuccess?: (data?: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useFormState(options: FormStateOptions = {}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { onSuccess, onError, successMessage, errorMessage } = options;

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
    }
  }, []);

  const execute = useCallback(
    async <T>(fn: () => Promise<T>, customSuccessMessage?: string): Promise<T | undefined> => {
      setIsPending(true);
      setError(null);

      try {
        const result = await fn();

        if (successMessage || customSuccessMessage) {
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
        setIsPending(false);
      }
    },
    [onSuccess, onError, successMessage, errorMessage]
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
