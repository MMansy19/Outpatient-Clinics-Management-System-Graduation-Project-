import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
  keepPreviousData,
} from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor.service';
import type {
  CreateMedicationDto,
  CreateMedicationResponse,
} from '@/lib/api/types';
import { mockMedicalHistoryAPI } from '@/lib/api/mockData';
import { useOfflineMutation } from '@/lib/offline/useOfflineMutation';
import { toPayload, toBlobs } from '@/lib/offline/formDataHelpers';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import {
  upsertMedications,
  getMedicationsByPatient,
  getMedicationById,
  getPendingMedicationCreates,
} from '@/lib/offline/medicationCache';

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
 * Toggle between mock data and real backend API
 */
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

/**
 * Get Patient Medications
 *
 * Retrieves all medications for a specific patient.
 *
 * @param {string} patientId - Patient's UUID (globalId)
 * @returns {UseQueryResult} Query result with medications array
 *
 * @example
 * ```typescript
 * const { data: medications, isLoading, error } = useGetPatientMedications("0281ba4f-7592-477e-9d02-f2641aa89221");
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
): UseQueryResult<unknown, Error> => {
  const { isOnline } = useNetworkStatus();
  return useQuery({
    queryKey: [...medicationsKeys.patient(patientId), isOnline ? 'online' : 'offline'],
    queryFn: async () => {
      if (!isOnline) {
        const [cached, pending] = await Promise.all([
          getMedicationsByPatient(patientId),
          getPendingMedicationCreates(patientId),
        ]);
        const seen = new Set<string>();
        const merged = [...pending, ...cached].filter((v) => {
          const key = v.global_id ?? String(v.id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        return { medications: merged } as unknown;
      }
      if (USE_MOCK_DATA) {
        return await mockMedicalHistoryAPI.getPatientMedications(patientId);
      }
      const data = await doctorApi.getPatientMedications(patientId);
      try {
        await upsertMedications(data, patientId);
      } catch (e) {
        console.warn('[useMedications] upsertMedications failed (non-fatal):', e);
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
  const { isOnline } = useNetworkStatus();
  return useQuery({
    queryKey: [...medicationsKeys.detail(medicationId), isOnline ? 'online' : 'offline'],
    queryFn: async () => {
      if (!isOnline) {
        const cached = await getMedicationById(medicationId);
        if (!cached) throw new Error('Medication not available offline');
        return cached;
      }
      const data = await doctorApi.getMedication(medicationId);
      try {
        await upsertMedications(data);
      } catch (e) {
        console.warn('[useMedications] upsertMedications failed (non-fatal):', e);
      }
      return data;
    },
    enabled: !!medicationId,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
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
export const useCreateMedication = () => {
  return useOfflineMutation<CreateMedicationResponse, CreateMedicationDto | FormData>({
    mutationFn: (data) => doctorApi.createMedication(data),
    offlineConfig: {
      type: 'createMedication',
      endpoint: '/doctor/medication',
      method: 'POST',
      getPayload: (data) => toPayload(data),
      getBlobs: (data) => toBlobs(data),
      getPatientId: (data) =>
        data instanceof FormData ? (data.get('patientId') as string) : data.patientId,
    },
    invalidateKeys: [medicationsKeys.all, ['patients']],
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
export const useUpdateMedication = () => {
  return useOfflineMutation<
    unknown,
    { medicationId: string; data: Partial<CreateMedicationDto>; socialSecurityNumber: string }
  >({
    mutationFn: ({ medicationId, data }) => doctorApi.updateMedication(medicationId, data),
    offlineConfig: {
      type: 'updateMedication',
      endpoint: ({ medicationId }) => `/doctor/medication/${medicationId}`,
      method: 'PATCH',
      getPayload: ({ data }) => toPayload(data),
      getBlobs: ({ data }) => toBlobs(data),
      getPatientId: ({ socialSecurityNumber }) => socialSecurityNumber,
    },
    invalidateKeys: [medicationsKeys.all],
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
  { medicationId: string; socialSecurityNumber: string }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ medicationId }) => doctorApi.deleteMedication(medicationId),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: medicationsKeys.detail(variables.medicationId),
      });

      // Invalidate all medications queries
      queryClient.invalidateQueries({
        queryKey: medicationsKeys.all,
      });

      // Invalidate patient details
      queryClient.invalidateQueries({
        queryKey: ['patients'],
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
    onMutate: async () => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: medicationsKeys.all });

      // Note: In a real optimistic update, you would:
      // 1. Get previous data from the specific query
      // 2. Optimistically update the cache with new data
      // 3. Return context with both previousData and queryKey for rollback

      // Return empty context for now
      return {};
    },

    // On error, rollback to snapshot
    onError: (err) => {
      // Rollback logic would go here if we had stored previous data
      console.error('[useCreateMedicationOptimistic] Error:', err);
    },

    // On success, invalidate all queries
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: medicationsKeys.all,
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
 * @param {string} patientId - Patient's UUID (globalId)
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