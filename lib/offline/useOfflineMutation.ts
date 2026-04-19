'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { queueMutation, type QueueMutationParams } from './mutationQueue';
import { useAuthStore } from '@/stores/authStore';
import type { MutationType } from './db';

interface OfflineMutationConfig<TData, TVariables> {
  /** Normal online mutation function */
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** How to build the queue entry when offline */
  offlineConfig: {
    type: MutationType;
    endpoint: string | ((variables: TVariables) => string);
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    /** Extract serializable payload from variables (strip File/Blob objects) */
    getPayload: (variables: TVariables) => Record<string, unknown>;
    /** Extract blobs from variables for separate storage */
    getBlobs?: (variables: TVariables) => Array<{ fieldName: string; blob: Blob; fileName: string; mimeType: string }>;
    /** Extract patientId for UI display */
    getPatientId?: (variables: TVariables) => string | undefined;
    /** Extract patient name for UI display */
    getPatientName?: (variables: TVariables) => string | undefined;
  };
  /** Query keys to invalidate on success */
  invalidateKeys?: unknown[][];
}

export function useOfflineMutation<TData = unknown, TVariables = unknown>(
  config: OfflineMutationConfig<TData, TVariables>
) {
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation<TData | { offline: true; clientTempId: string }, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      // Online — execute normally
      if (isOnline) {
        return config.mutationFn(variables);
      }

      // Offline — queue for later sync
      const endpoint =
        typeof config.offlineConfig.endpoint === 'function'
          ? config.offlineConfig.endpoint(variables)
          : config.offlineConfig.endpoint;

      const params: QueueMutationParams = {
        type: config.offlineConfig.type,
        endpoint,
        method: config.offlineConfig.method,
        payload: config.offlineConfig.getPayload(variables),
        patientId: config.offlineConfig.getPatientId?.(variables),
        patientName: config.offlineConfig.getPatientName?.(variables),
        userId: user?.name,
        blobs: config.offlineConfig.getBlobs?.(variables),
      };

      const clientTempId = await queueMutation(params);
      return { offline: true, clientTempId } as TData;
    },
    onSuccess: () => {
      // Invalidate cached queries so UI updates
      if (config.invalidateKeys) {
        for (const key of config.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }
    },
    retry: 0,
  });
}
