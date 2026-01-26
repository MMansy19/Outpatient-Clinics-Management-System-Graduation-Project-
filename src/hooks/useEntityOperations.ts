'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UseEntityOperationsOptions<TData, TError> {
  createMutation: any; // UseMutation object
  updateMutation?: any;
  deleteMutation?: any;
  onSuccess?: (data: TData, action: 'create' | 'update' | 'delete') => void;
  onError?: (error: TError, action: 'create' | 'update' | 'delete') => void;
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
}

export function useEntityOperations<TData, TError = any>(
  options: UseEntityOperationsOptions<TData, TError>
) {
  const {
    createMutation,
    updateMutation,
    deleteMutation,
    onSuccess,
    onError,
    successMessages,
  } = options;

  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: createMutation.mutationFn,
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: createMutation.queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(createMutation.queryKey);

      return { previousData };
    },
    onError: (err, _context) => {
      // Rollback optimistic update
      const context = _context as any;
      if (context?.previousData) {
        queryClient.setQueryData(createMutation.queryKey, context.previousData);
      }
      onError?.(err as TError, 'create');
    },
    onSuccess: (data: TData) => {
      toast.success(successMessages?.create || 'Created successfully');
      onSuccess?.(data, 'create');
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: createMutation.queryKey });
    },
  });

  const update = useMutation({
    mutationFn: updateMutation?.mutationFn || (() => Promise.reject('Update not configured')),
    onMutate: async () => {
      if (!updateMutation?.queryKey) return;

      await queryClient.cancelQueries({ queryKey: updateMutation.queryKey });

      const previousData = queryClient.getQueryData(updateMutation.queryKey);

      return { previousData };
    },
    onError: (err, _context) => {
      const context = _context as any;
      if (context?.previousData && updateMutation?.queryKey) {
        queryClient.setQueryData(updateMutation.queryKey, context.previousData);
      }
      onError?.(err as TError, 'update');
    },
    onSuccess: (data: TData) => {
      toast.success(successMessages?.update || 'Updated successfully');
      onSuccess?.(data, 'update');
    },
    onSettled: () => {
      if (updateMutation?.queryKey) {
        queryClient.invalidateQueries({ queryKey: updateMutation.queryKey });
      }
    },
  });

  const remove = useMutation({
    mutationFn: deleteMutation?.mutationFn || (() => Promise.reject('Delete not configured')),
    onMutate: async () => {
      if (!deleteMutation?.queryKey) return;

      await queryClient.cancelQueries({ queryKey: deleteMutation.queryKey });

      const previousData = queryClient.getQueryData(deleteMutation.queryKey);

      return { previousData };
    },
    onError: (err, _context) => {
      const context = _context as any;
      if (context?.previousData && deleteMutation?.queryKey) {
        queryClient.setQueryData(deleteMutation.queryKey, context.previousData);
      }
      onError?.(err as TError, 'delete');
    },
    onSuccess: (data: TData) => {
      toast.success(successMessages?.delete || 'Deleted successfully');
      onSuccess?.(data, 'delete');
    },
    onSettled: () => {
      if (deleteMutation?.queryKey) {
        queryClient.invalidateQueries({ queryKey: deleteMutation.queryKey });
      }
    },
  });

  return {
    create: create.mutate,
    update: update.mutate,
    remove: remove.mutate,
    isCreating: create.isPending,
    isUpdating: update.isPending,
    isDeleting: remove.isPending,
  };
}
