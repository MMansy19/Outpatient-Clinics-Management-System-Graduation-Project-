import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor.service';
import type { Lab } from '@/types/entities/Lab';

/**
 * Query Key Factory for Labs
 *
 * Centralized query key management for better cache control.
 */
const labsKeys = {
  all: ['labs'] as const,
  patient: (socialSecurityNumber: string) => [...labsKeys.all, 'patient', socialSecurityNumber] as const,
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
 * @param {string} socialSecurityNumber - Patient's 14-digit social security number
 * @returns {UseQueryResult} Query result with labs array
 *
 * @example
 * ```typescript
 * const { data: labs, isLoading, error } = useGetPatientLabs('29512011234567');
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
  socialSecurityNumber: string
): UseQueryResult<unknown[], Error> => {
  return useQuery({
    queryKey: labsKeys.patient(socialSecurityNumber),
    queryFn: () => doctorApi.getPatientLabs(socialSecurityNumber),
    enabled: !!socialSecurityNumber,
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
 *   createLabMutation.mutate({ socialSecurityNumber, data }, {
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
export const useCreateLab = (): UseMutationResult<
  unknown,
  Error,
  { socialSecurityNumber: string; data: { name: string; comments: string } | FormData }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ socialSecurityNumber, data }) => doctorApi.createLab(socialSecurityNumber, data),
    onSuccess: (response, variables) => {
      // Invalidate patient labs list
      queryClient.invalidateQueries({
        queryKey: labsKeys.patient(variables.socialSecurityNumber),
      });

      // Invalidate all labs queries
      queryClient.invalidateQueries({
        queryKey: labsKeys.all,
      });

      // Invalidate patient details
      queryClient.invalidateQueries({
        queryKey: ['patients'],
      });

      // Optionally set the new lab in cache
      if (response && typeof response === 'object' && 'id' in response) {
        queryClient.setQueryData(
          labsKeys.detail((response as { id: string }).id),
          variables.data
        );
      }
    },
    onError: (error) => {
      console.error('[useCreateLab] Error:', error);
    },
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
export const useUpdateLab = (): UseMutationResult<
  unknown,
  Error,
  { labId: string; data: Partial<Lab>; socialSecurityNumber: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ labId, data }) =>
      doctorApi.updateLab(labId, data),
    onSuccess: (_updatedLab, variables) => {
      // Invalidate the specific lab cache
      queryClient.invalidateQueries({
        queryKey: labsKeys.detail(variables.labId),
      });

      // Invalidate patient labs list
      queryClient.invalidateQueries({
        queryKey: labsKeys.patient(variables.socialSecurityNumber),
      });

      // Invalidate all labs queries
      queryClient.invalidateQueries({
        queryKey: labsKeys.all,
      });
    },
    onError: (error) => {
      console.error('[useUpdateLab] Error:', error);
    },
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
  { labId: string; socialSecurityNumber: string }
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
        queryKey: labsKeys.patient(variables.socialSecurityNumber),
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
 * @param {string} socialSecurityNumber - Patient's 14-digit social security number
 *
 * @example
 * ```typescript
 * // In a patient list, prefetch on hover
 * <PatientCard
 *   onMouseEnter={() => prefetchPatientLabs(patient.socialSecurityNumber)}
 * />
 * ```
 */
export const usePrefetchPatientLabs = () => {
  const queryClient = useQueryClient();

  return (socialSecurityNumber: string) => {
    queryClient.prefetchQuery({
      queryKey: labsKeys.patient(socialSecurityNumber),
      queryFn: () => doctorApi.getPatientLabs(socialSecurityNumber),
      staleTime: 5 * 60 * 1000,
    });
  };
};
