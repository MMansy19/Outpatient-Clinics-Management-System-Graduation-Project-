import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
  keepPreviousData,
} from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor.service';
import type { Scan } from '@/types/entities/Scan';
import { mockMedicalHistoryAPI } from '@/lib/api/mockData';
import { useOfflineMutation } from '@/lib/offline/useOfflineMutation';
import { toPayload, toBlobs } from '@/lib/offline/formDataHelpers';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import {
  upsertScans,
  getScansByPatient,
  getScanById,
  getPendingScanCreates,
} from '@/lib/offline/scanCache';

/**
 * Toggle between mock data and real backend API
 */
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/**
 * Query Key Factory for Scans
 *
 * Centralized query key management for better cache control.
 */
const scansKeys = {
  all: ['scans'] as const,
  patient: (patientId: string) => [...scansKeys.all, 'patient', patientId] as const,
  detail: (id: string) => [...scansKeys.all, id] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get Patient Scans
 *
 * Retrieves all scan records for a specific patient.
 *
 * @param {string} patientId - Patient's UUID (globalId)
 * @returns {UseQueryResult} Query result with scans array
 *
 * @example
 * ```typescript
 * const { data: scans, isLoading, error } = useGetPatientScans("0281ba4f-7592-477e-9d02-f2641aa89221");
 *
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorAlert error={error} />;
 *
 * return scans.map(scan => (
 *   <ScanCard key={scan.id} scan={scan} />
 * ));
 * ```
 */
export const useGetPatientScans = (
  patientId: string
): UseQueryResult<unknown, Error> => {
  const { isOnline } = useNetworkStatus();
  return useQuery({
    queryKey: [...scansKeys.patient(patientId), isOnline ? 'online' : 'offline'],
    queryFn: async () => {
      if (!isOnline) {
        const [cached, pending] = await Promise.all([
          getScansByPatient(patientId),
          getPendingScanCreates(patientId),
        ]);
        const seen = new Set<string>();
        const merged = [...pending, ...cached].filter((v) => {
          const key = v.global_id ?? String(v.id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        return { scans: merged } as unknown;
      }
      if (USE_MOCK_DATA) {
        return await mockMedicalHistoryAPI.getPatientScans(patientId);
      }
      const data = await doctorApi.getPatientScans(patientId);
      try {
        await upsertScans(data, patientId);
      } catch (e) {
        console.warn('[useScans] upsertScans failed (non-fatal):', e);
      }
      return data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

/**
 * Get Scan Details
 *
 * Retrieves detailed information for a specific scan.
 *
 * @param {string} scanId - Scan UUID
 * @returns {UseQueryResult} Query result with scan details
 *
 * @example
 * ```typescript
 * const { data: scan, isLoading } = useGetScan(scanId);
 * ```
 */
export const useGetScan = (
  scanId: string
): UseQueryResult<unknown, Error> => {
  const { isOnline } = useNetworkStatus();
  return useQuery({
    queryKey: [...scansKeys.detail(scanId), isOnline ? 'online' : 'offline'],
    queryFn: async () => {
      if (!isOnline) {
        const cached = await getScanById(scanId);
        if (!cached) throw new Error('Scan not available offline');
        return cached;
      }
      const data = await doctorApi.getScan(scanId);
      try {
        await upsertScans(data);
      } catch (e) {
        console.warn('[useScans] upsertScans failed (non-fatal):', e);
      }
      return data;
    },
    enabled: !!scanId,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create Scan
 *
 * Mutation hook for creating a new scan record.
 * Automatically invalidates related queries on success.
 *
 * @returns {UseMutationResult} Mutation object with loading states
 *
 * @example
 * ```typescript
 * const createScanMutation = useCreateScan();
 *
 * const handleSubmit = (data: { name: string; comments: string; type: string }) => {
 *   createScanMutation.mutate({ patientId, data }, {
 *     onSuccess: (response) => {
 *       toast.success(`Scan created: ${response.id}`);
 *       onClose();
 *     },
 *     onError: (error) => {
 *       toast.error('Failed to create scan');
 *       console.error(error);
 *     },
 *   });
 * };
 *
 * return (
 *   <Form onSubmit={handleSubmit}>
 *     <Button disabled={createScanMutation.isPending}>
 *       {createScanMutation.isPending ? 'Creating...' : 'Create Scan'}
 *     </Button>
 *   </Form>
 * );
 * ```
 */
export const useCreateScan = () => {
  return useOfflineMutation<
    unknown,
    { patientId: string; data: { name: string; comments: string; type: string } | FormData }
  >({
    mutationFn: ({ patientId, data }) => doctorApi.createScan(patientId, data),
    offlineConfig: {
      type: 'createScan',
      endpoint: '/doctor/scan',
      method: 'POST',
      getPayload: ({ patientId, data }) => ({
        ...toPayload(data),
        patientId,
      }),
      getBlobs: ({ data }) => toBlobs(data),
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [scansKeys.all, ['patients']],
  });
};

/**
 * Update Scan
 *
 * Mutation hook for updating an existing scan record.
 * Supports partial updates.
 *
 * @returns {UseMutationResult} Mutation object with loading states
 *
 * @example
 * ```typescript
 * const updateScanMutation = useUpdateScan();
 *
 * const handleUpdate = () => {
 *   updateScanMutation.mutate(
 *     {
 *       scanId: 'uuid',
 *       data: { comments: 'Updated comments' }
 *     },
 *     {
 *       onSuccess: () => {
 *         toast.success('Scan updated successfully');
 *       },
 *     }
 *   );
 * };
 * ```
 */
export const useUpdateScan = () => {
  return useOfflineMutation<
    unknown,
    { scanId: string; data: Partial<Scan>; patientId: string }
  >({
    mutationFn: ({ scanId, data }) => doctorApi.updateScan(scanId, data),
    offlineConfig: {
      type: 'updateScan',
      endpoint: ({ scanId }) => `/doctor/scan/${scanId}`,
      method: 'PATCH',
      getPayload: ({ data }) => toPayload(data),
      getBlobs: ({ data }) => toBlobs(data),
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [scansKeys.all],
  });
};

/**
 * Delete Scan
 *
 * Mutation hook for soft-deleting a scan record.
 *
 * @returns {UseMutationResult} Mutation object with loading states
 *
 * @example
 * ```typescript
 * const deleteScanMutation = useDeleteScan();
 *
 * const handleDelete = (scanId: string, socialSecurityNumber: string) => {
 *   if (confirm('Are you sure you want to delete this scan?')) {
 *     deleteScanMutation.mutate(
 *       { scanId, socialSecurityNumber },
 *       {
 *         onSuccess: () => {
 *           toast.success('Scan deleted');
 *         },
 *       }
 *     );
 *   }
 * };
 * ```
 */
export const useDeleteScan = (): UseMutationResult<
  void,
  Error,
  { scanId: string; patientId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scanId }) => doctorApi.deleteScan(scanId),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: scansKeys.detail(variables.scanId),
      });

      // Invalidate patient scans list
      queryClient.invalidateQueries({
        queryKey: scansKeys.patient(variables.patientId),
      });

      // Invalidate all scans queries
      queryClient.invalidateQueries({
        queryKey: scansKeys.all,
      });

      // Invalidate patient details
      queryClient.invalidateQueries({
        queryKey: ['patients'],
      });
    },
    onError: (error) => {
      console.error('[useDeleteScan] Error:', error);
    },
  });
};

/**
 * Prefetch Patient Scans
 *
 * Utility function to prefetch scans before user navigates.
 * Improves perceived performance.
 *
 * @param {string} patientId - Patient's UUID (globalId)
 *
 * @example
 * ```typescript
 * // In a patient list, prefetch on hover
 * <PatientCard
 *   onMouseEnter={() => prefetchPatientScans(patient.id)}
 * />
 * ```
 */
export const usePrefetchPatientScans = () => {
  const queryClient = useQueryClient();

  return (patientId: string) => {
    queryClient.prefetchQuery({
      queryKey: scansKeys.patient(patientId),
      queryFn: () => doctorApi.getPatientScans(patientId),
      staleTime: 5 * 60 * 1000,
    });
  };
};