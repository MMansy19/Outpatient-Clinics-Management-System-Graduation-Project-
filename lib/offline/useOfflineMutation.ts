'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { queueMutation, type QueueMutationParams } from './mutationQueue';
import { useAuthStore } from '@/stores/authStore';
import type { MutationType } from './db';

/**
 * Returns true for axios/fetch errors that indicate the network never
 * reached the server (no response). These should be treated as "offline"
 * and the mutation queued for replay rather than reported as a failure.
 */
function isNetworkLikeError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as {
    code?: string;
    message?: string;
    response?: unknown;
    request?: unknown;
  };
  // axios populates `response` on HTTP responses. Absence means no response.
  if (e.response) return false;
  if (e.code === 'ERR_NETWORK' || e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT') return true;
  if (typeof e.message === 'string') {
    const m = e.message.toLowerCase();
    if (
      m.includes('network error') ||
      m.includes('failed to fetch') ||
      m.includes('load failed') ||
      m.includes('offline')
    ) {
      return true;
    }
  }
  // axios always sets `request` on send; if request is set but no response → network failed
  return e.request !== undefined;
}

function isBrowserOffline(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (navigator.onLine === false) return true;
  // Network Information API (Chrome/Edge): catches the case where
  // navigator.onLine is wrongly true but no usable connection exists.
  const conn = (navigator as unknown as { connection?: { type?: string } }).connection;
  if (conn && conn.type === 'none') return true;
  return false;
}

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
  /**
   * Optional async hook called right before a mutation is enqueued for
   * offline replay. Use this to enforce client-side invariants (e.g. SSN
   * uniqueness checks against the Dexie cache). Throw to abort: the error
   * is surfaced via React Query's onError exactly as if it came from the
   * online mutationFn, and the mutation is NOT queued.
   */
  beforeQueue?: (payload: Record<string, unknown>, variables: TVariables) => Promise<void>;
  /** Query keys to invalidate on success */
  invalidateKeys?: ReadonlyArray<ReadonlyArray<unknown>>;
}

export function useOfflineMutation<TData = unknown, TVariables = unknown>(
  config: OfflineMutationConfig<TData, TVariables>
) {
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation<TData | { offline: true; clientTempId: string }, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const buildQueueParams = (): QueueMutationParams => {
        const endpoint =
          typeof config.offlineConfig.endpoint === 'function'
            ? config.offlineConfig.endpoint(variables)
            : config.offlineConfig.endpoint;
        return {
          type: config.offlineConfig.type,
          endpoint,
          method: config.offlineConfig.method,
          payload: config.offlineConfig.getPayload(variables),
          patientId: config.offlineConfig.getPatientId?.(variables),
          patientName: config.offlineConfig.getPatientName?.(variables),
          userId: user?.name,
          blobs: config.offlineConfig.getBlobs?.(variables),
        };
      };

      const enqueueAndReturn = async () => {
        const params = buildQueueParams();
        if (config.beforeQueue) {
          // Any throw here propagates to React Query's onError. Critically,
          // we do NOT route this through the network-error fallback below
          // — a thrown DuplicateError must surface to the dialog, not be
          // silently re-queued.
          await config.beforeQueue(params.payload, variables);
        }
        const clientTempId = await queueMutation(params);
        return { offline: true as const, clientTempId } as unknown as TData;
      };

      // Fast offline path: trust the browser / polled status synchronously.
      if (!isOnline || isBrowserOffline()) {
        return enqueueAndReturn();
      }

      // Online path with network-failure fallback. If the request fails
      // because the network never reached the server (no response), queue
      // it instead of surfacing a "Network error" toast to the user.
      try {
        return await config.mutationFn(variables);
      } catch (err) {
        if (isNetworkLikeError(err)) {
          return enqueueAndReturn();
        }
        throw err;
      }
    },
    onSuccess: () => {
      // Invalidate cached queries so UI updates
      if (config.invalidateKeys) {
        for (const key of config.invalidateKeys) {
          queryClient.invalidateQueries({ queryKey: key as readonly unknown[] });
        }
      }
    },
    retry: 0,
  });
}
