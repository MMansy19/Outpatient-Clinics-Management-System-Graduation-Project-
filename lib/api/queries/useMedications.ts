import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor.service';
import type {
  CreateMedicationDto,
  CreateMedicationResponse,
} from '@/lib/api/types';

/**
 * Query Key Factory for Medications
 * 
 * Centralized query key management for better cache control.
 */
const medicationsKeys = {
  all: ['medications'] as const,
  patient: (patientId: string) => [...medicationsKeys.all, 'patient', patientId] as const,
  detail: (id: string) => [...medicationsKeys.all, id] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get Patient Medications
 * 
 * Retrieves all medications for a specific patient.
 * 
 * @param {string} patientId - Patient UUID from backend
 * @returns {UseQueryResult} Query result with medications array
 * 
 * @example
 * ```typescript
 * const { data: medications, isLoading, error } = useGetPatientMedications(patientId);
 * 
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorAlert error={error} />;
 * 
 * return medications.map(med => (
 *   <MedicationCard key={med.id} medication={med} />
 * ));
 * ```
 */
export const useGetPatientMedications = (
  patientId: string
): UseQueryResult<unknown[], Error> => {
  return useQuery({
    queryKey: medicationsKeys.patient(patientId),
    queryFn: () => doctorApi.getPatientMedications(patientId),
    enabled: !!patientId, // Only run when patientId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Get Medication Details
 * 
 * Retrieves detailed information for a specific medication.
 * 
 * @param {string} medicationId - Medication UUID
 * @returns {UseQueryResult} Query result with medication details
 * 
 * @example
 * ```typescript
 * const { data: medication, isLoading } = useGetMedication(medicationId);
 * ```
 */
export const useGetMedication = (
  medicationId: string
): UseQueryResult<unknown, Error> => {
  return useQuery({
    queryKey: medicationsKeys.detail(medicationId),
    queryFn: () => doctorApi.getMedication(medicationId),
    enabled: !!medicationId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create Medication
 * 
 * Mutation hook for creating a new medication record.
 * Automatically invalidates related queries on success.
 * 
 * @returns {UseMutationResult} Mutation object with loading states
 * 
 * @example
 * ```typescript
 * const createMedicationMutation = useCreateMedication();
 * 
 * const handleSubmit = (data: CreateMedicationDto) => {
 *   createMedicationMutation.mutate(data, {
 *     onSuccess: (response) => {
 *       toast.success(`Medication created: ${response.id}`);
 *       onClose();
 *     },
 *     onError: (error) => {
 *       toast.error('Failed to create medication');
 *       console.error(error);
 *     },
 *   });
 * };
 * 
 * return (
 *   <Form onSubmit={handleSubmit}>
 *     <Button disabled={createMedicationMutation.isPending}>
 *       {createMedicationMutation.isPending ? 'Creating...' : 'Create Medication'}
 *     </Button>
 *   </Form>
 * );
 * ```
 */
export const useCreateMedication = (): UseMutationResult<
  CreateMedicationResponse,
  Error,
  CreateMedicationDto
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMedicationDto) => doctorApi.createMedication(data),
    onSuccess: (response, variables) => {
      // Invalidate patient medications list
      queryClient.invalidateQueries({
        queryKey: medicationsKeys.patient(variables.patientId),
      });

      // Invalidate patient details (may include medication count)
      queryClient.invalidateQueries({
        queryKey: ['patients', variables.patientId],
      });

      // Optionally set the new medication in cache
      queryClient.setQueryData(
        medicationsKeys.detail(response.id),
        variables
      );
    },
    onError: (error) => {
      console.error('[useCreateMedication] Error:', error);
      // Could add global error handling here
    },
  });
};

/**
 * Update Medication
 * 
 * Mutation hook for updating an existing medication record.
 * Supports partial updates.
 * 
 * @returns {UseMutationResult} Mutation object with loading states
 * 
 * @example
 * ```typescript
 * const updateMedicationMutation = useUpdateMedication();
 * 
 * const handleUpdate = () => {
 *   updateMedicationMutation.mutate(
 *     {
 *       medicationId: 'uuid',
 *       data: { dosage: 3, comments: 'Take with food' }
 *     },
 *     {
 *       onSuccess: () => {
 *         toast.success('Medication updated successfully');
 *       },
 *     }
 *   );
 * };
 * ```
 */
export const useUpdateMedication = (): UseMutationResult<
  unknown,
  Error,
  { medicationId: string; data: Partial<CreateMedicationDto>; patientId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ medicationId, data }) =>
      doctorApi.updateMedication(medicationId, data),
    onSuccess: (_updatedMedication, variables) => {
      // Invalidate the specific medication cache
      queryClient.invalidateQueries({
        queryKey: medicationsKeys.detail(variables.medicationId),
      });

      // Invalidate patient medications list
      queryClient.invalidateQueries({
        queryKey: medicationsKeys.patient(variables.patientId),
      });
    },
    onError: (error) => {
      console.error('[useUpdateMedication] Error:', error);
    },
  });
};

/**
 * Delete Medication
 * 
 * Mutation hook for soft-deleting a medication record.
 * 
 * @returns {UseMutationResult} Mutation object with loading states
 * 
 * @example
 * ```typescript
 * const deleteMedicationMutation = useDeleteMedication();
 * 
 * const handleDelete = (medicationId: string, patientId: string) => {
 *   if (confirm('Are you sure you want to delete this medication?')) {
 *     deleteMedicationMutation.mutate(
 *       { medicationId, patientId },
 *       {
 *         onSuccess: () => {
 *           toast.success('Medication deleted');
 *         },
 *       }
 *     );
 *   }
 * };
 * ```
 */
export const useDeleteMedication = (): UseMutationResult<
  void,
  Error,
  { medicationId: string; patientId: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ medicationId }) => doctorApi.deleteMedication(medicationId),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: medicationsKeys.detail(variables.medicationId),
      });

      // Invalidate patient medications list
      queryClient.invalidateQueries({
        queryKey: medicationsKeys.patient(variables.patientId),
      });

      // Invalidate patient details
      queryClient.invalidateQueries({
        queryKey: ['patients', variables.patientId],
      });
    },
    onError: (error) => {
      console.error('[useDeleteMedication] Error:', error);
    },
  });
};

// ============================================================================
// Optimistic Update Example (Advanced)
// ============================================================================

/**
 * Create Medication with Optimistic Update
 * 
 * This is an advanced pattern that updates the UI immediately
 * before the server responds, improving perceived performance.
 * 
 * @example
 * ```typescript
 * const { mutate } = useCreateMedicationOptimistic();
 * 
 * mutate(medicationData, {
 *   onSuccess: () => toast.success('Medication created'),
 *   onError: () => toast.error('Failed - changes reverted'),
 * });
 * ```
 */
export const useCreateMedicationOptimistic = (): UseMutationResult<
  CreateMedicationResponse,
  Error,
  CreateMedicationDto
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMedicationDto) => doctorApi.createMedication(data),

    // Optimistic update: Modify cache before server responds
    onMutate: async (newMedication) => {
      const queryKey = medicationsKeys.patient(newMedication.patientId);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousMedications = queryClient.getQueryData(queryKey);

      // Optimistically update cache
      queryClient.setQueryData(queryKey, (old: unknown[] = []) => [
        ...old,
        {
          ...newMedication,
          id: 'temp-' + Date.now(), // Temporary ID
          created_at: new Date(),
        },
      ]);

      // Return context with snapshot
      return { previousMedications, queryKey };
    },

    // On error, rollback to snapshot
    onError: (err, _newMedication, context) => {
      if (context?.previousMedications) {
        queryClient.setQueryData(
          context.queryKey,
          context.previousMedications
        );
      }
      console.error('[useCreateMedicationOptimistic] Error:', err);
    },

    // On success, replace temp ID with real ID
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: medicationsKeys.patient(variables.patientId),
      });
    },
  });
};

/**
 * Prefetch Medications
 * 
 * Utility function to prefetch medications before user navigates.
 * Improves perceived performance.
 * 
 * @param {string} patientId - Patient UUID
 * 
 * @example
 * ```typescript
 * // In a patient list, prefetch on hover
 * <PatientCard
 *   onMouseEnter={() => prefetchPatientMedications(patient.id)}
 * />
 * ```
 */
export const usePrefetchPatientMedications = () => {
  const queryClient = useQueryClient();

  return (patientId: string) => {
    queryClient.prefetchQuery({
      queryKey: medicationsKeys.patient(patientId),
      queryFn: () => doctorApi.getPatientMedications(patientId),
      staleTime: 5 * 60 * 1000,
    });
  };
};
