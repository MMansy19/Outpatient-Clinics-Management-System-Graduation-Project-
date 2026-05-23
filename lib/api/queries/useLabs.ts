import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor.service';
import type { Lab } from '@/types/entities/Lab';
import { mockMedicalHistoryAPI } from '@/lib/api/mockData';
import { useOfflineMutation } from '@/lib/offline/useOfflineMutation';
import { toPayload, toBlobs } from '@/lib/offline/formDataHelpers';

/**
 * Toggle between mock data and real backend API
 */
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/**
 * Query Key Factory for Labs
 *
 * Centralized query key management for better cache control.
 */
const labsKeys = {
  all: ['labs'] as const,
  patient: (patientId: string) => [...labsKeys.all, 'patient', patientId] as const,
  detail: (id: string) => [...labsKeys.all, id] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get Patient Labs
 *
 * Retrieves all lab records for a specific patient.
 *
 * @param {string} patientId - Patient's UUID (globalId)
 * @returns {UseQueryResult} Query result with labs array
 *
 * @example
 * ```typescript
 * const { data: labs, isLoading, error } = useGetPatientLabs("0281ba4f-7592-477e-9d02-f2641aa89221");
 *
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorAlert error={error} />;
 *
 * return labs.map(lab => (
 *   <LabCard key={lab.id} lab={lab} />
 * ));
 * ```
 */
export const useGetPatientLabs = (
  patientId: string
): UseQueryResult<unknown, Error> => {
  return useQuery({
    queryKey: labsKeys.patient(patientId),
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockMedicalHistoryAPI.getPatientLabs(patientId);
      }
      return await doctorApi.getPatientLabs(patientId);
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Get Lab Details
 *
 * Retrieves detailed information for a specific lab.
 *
 * @param {string} labId - Lab UUID
 * @returns {UseQueryResult} Query result with lab details
 *
 * @example
 * ```typescript
 * const { data: lab, isLoading } = useGetLab(labId);
 * ```
 */
export const useGetLab = (
  labId: string
): UseQueryResult<unknown, Error> => {
  return useQuery({
    queryKey: labsKeys.detail(labId),
    queryFn: () => doctorApi.getLab(labId),
    enabled: !!labId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create Lab
 *
 * Mutation hook for creating a new lab record.
 * Automatically invalidates related queries on success.
 *
 * @returns {UseMutationResult} Mutation object with loading states
 *
 * @example
 * ```typescript
 * const createLabMutation = useCreateLab();
 *
 * const handleSubmit = (data: { name: string; comments: string }) => {
 *   createLabMutation.mutate({ patientId, data }, {
 *     onSuccess: (response) => {
 *       toast.success(`Lab created: ${response.id}`);
 *       onClose();
 *     },
 *     onError: (error) => {
 *       toast.error('Failed to create lab');
 *       console.error(error);
 *     },
 *   });
 * };
 *
 * return (
 *   <Form onSubmit={handleSubmit}>
 *     <Button disabled={createLabMutation.isPending}>
 *       {createLabMutation.isPending ? 'Creating...' : 'Create Lab'}
 *     </Button>
 *   </Form>
 * );
 * ```
 */
export const useCreateLab = () => {
  return useOfflineMutation<
    unknown,
    { patientId: string; data: { name: string; comments: string } | FormData }
  >({
    mutationFn: ({ patientId, data }) => doctorApi.createLab(patientId, data),
    offlineConfig: {
      type: 'createLab',
      endpoint: '/doctor/lab',
      method: 'POST',
      getPayload: ({ patientId, data }) => ({
        ...toPayload(data),
        patientId,
      }),
      getBlobs: ({ data }) => toBlobs(data),
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [labsKeys.all, ['patients']],
  });
};

/**
 * Update Lab
 *
 * Mutation hook for updating an existing lab record.
 * Supports partial updates.
 *
 * @returns {UseMutationResult} Mutation object with loading states
 *
 * @example
 * ```typescript
 * const updateLabMutation = useUpdateLab();
 *
 * const handleUpdate = () => {
 *   updateLabMutation.mutate(
 *     {
 *       labId: 'uuid',
 *       data: { comments: 'Updated comments' }
 *     },
 *     {
 *       onSuccess: () => {
 *         toast.success('Lab updated successfully');
 *       },
 *     }
 *   );
 * };
 * ```
 */
export const useUpdateLab = () => {
  return useOfflineMutation<
    unknown,
    { labId: string; data: Partial<Lab>; patientId: string }
  >({
    mutationFn: ({ labId, data }) => doctorApi.updateLab(labId, data),
    offlineConfig: {
      type: 'updateLab',
      endpoint: ({ labId }) => `/doctor/lab/${labId}`,
      method: 'PATCH',
      getPayload: ({ data }) => toPayload(data),
      getBlobs: ({ data }) => toBlobs(data),
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [labsKeys.all],
  });
};

/**
 * Delete Lab
 *
 * Mutation hook for soft-deleting a lab record.
 *
 * @returns {UseMutationResult} Mutation object with loading states
 *
 * @example
 * ```typescript
 * const deleteLabMutation = useDeleteLab();
 *
 * const handleDelete = (labId: string, socialSecurityNumber: string) => {
 *   if (confirm('Are you sure you want to delete this lab?')) {
 *     deleteLabMutation.mutate(
 *       { labId, socialSecurityNumber },
 *       {
 *         onSuccess: () => {
 *           toast.success('Lab deleted');
 *         },
 *       }
 *     );
 *   }
 * };
 * ```
 */
export const useDeleteLab = (): UseMutationResult<
  void,
  Error,
  { labId: string; patientId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ labId }) => doctorApi.deleteLab(labId),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: labsKeys.detail(variables.labId),
      });

      // Invalidate patient labs list
      queryClient.invalidateQueries({
        queryKey: labsKeys.patient(variables.patientId),
      });

      // Invalidate all labs queries
      queryClient.invalidateQueries({
        queryKey: labsKeys.all,
      });

      // Invalidate patient details
      queryClient.invalidateQueries({
        queryKey: ['patients'],
      });
    },
    onError: (error) => {
      console.error('[useDeleteLab] Error:', error);
    },
  });
};

/**
 * Prefetch Patient Labs
 *
 * Utility function to prefetch labs before user navigates.
 * Improves perceived performance.
 *
 * @param {string} patientId - Patient's UUID (globalId)
 *
 * @example
 * ```typescript
 * // In a patient list, prefetch on hover
 * <PatientCard
 *   onMouseEnter={() => prefetchPatientLabs(patient.id)}
 * />
 * ```
 */
export const usePrefetchPatientLabs = () => {
  const queryClient = useQueryClient();

  return (patientId: string) => {
    queryClient.prefetchQuery({
      queryKey: labsKeys.patient(patientId),
      queryFn: () => doctorApi.getPatientLabs(patientId),
      staleTime: 5 * 60 * 1000,
    });
  };
};