import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor.service';
import type { Scan } from '@/types/entities/Scan';
import { mockMedicalHistoryAPI } from '@/lib/api/mockData';

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
  return useQuery({
    queryKey: scansKeys.patient(patientId),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockMedicalHistoryAPI.getPatientScans(patientId);
      }
      return await doctorApi.getPatientScans(patientId);
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
  return useQuery({
    queryKey: scansKeys.detail(scanId),
    queryFn: () => doctorApi.getScan(scanId),
    enabled: !!scanId,
    staleTime: 5 * 60 * 1000,
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
export const useCreateScan = (): UseMutationResult<
  unknown,
  Error,
  { patientId: string; data: { name: string; comments: string; type: string } | FormData }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }) => {
      return doctorApi.createScan(patientId, data);
    },
    onSuccess: (response, variables) => {
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

      // Optionally set the new scan in cache
      if (response && typeof response === 'object' && 'id' in response) {
        queryClient.setQueryData(
          scansKeys.detail((response as { id: string }).id),
          variables.data
        );
      }
    },
    onError: (error) => {
      console.error('[useCreateScan] Error:', error);
    },
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
export const useUpdateScan = (): UseMutationResult<
  unknown,
  Error,
  { scanId: string; data: Partial<Scan>; patientId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scanId, data }) =>
      doctorApi.updateScan(scanId, data),
    onSuccess: (_updatedScan, variables) => {
      // Invalidate the specific scan cache
      queryClient.invalidateQueries({
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
    },
    onError: (error) => {
      console.error('[useUpdateScan] Error:', error);
    },
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