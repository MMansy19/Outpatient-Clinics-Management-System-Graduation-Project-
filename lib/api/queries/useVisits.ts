import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { doctorApi } from '@/lib/api/doctor.service';
import type { CreateVisitDto, CreateVisitResponse, PaginatedVisitsResponse } from '@/lib/api/types';
import type { Visit, VisitWithRelations, VisitFormData } from '@/types/entities/Visit';
import { mockVisitsAPI, getStorageData, STORAGE_KEYS, initUsers } from '@/lib/api/mockData';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineMutation } from '@/lib/offline/useOfflineMutation';
import { toPayload, toBlobs } from '@/lib/offline/formDataHelpers';

/**
 * Toggle between mock data and real backend API
 *
 * Set to false when ready to integrate with real backend.
 * Can be controlled via environment variable.
 * See docs/integration/PROFESSIONAL_BE_INTEGRATION_GUIDE.md for migration steps.
 */
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

const VISITS_KEY = ['visits'];
const PATIENTS_KEY = ['patients'];

export const useGetPatientVisits = (patientId: string): UseQueryResult<VisitWithRelations[], Error> => {
  return useQuery({
    queryKey: [...VISITS_KEY, 'patient', patientId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockVisitsAPI.getPatientVisits(patientId);
      }
      const response = await apiClient.get<VisitWithRelations[]>(`/doctor/patient/${patientId}/visits`);
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetVisit = (id: number): UseQueryResult<VisitWithRelations, Error> => {
  return useQuery({
    queryKey: [...VISITS_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<VisitWithRelations>(`/doctor/visits/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * Create Visit Hook
 *
 * Professional implementation with backend integration support.
 *
 * **Backend API:** POST /api/v1/doctor/visit/create
 * **Required Role:** DOCTOR
 *
 * @returns {UseMutationResult} Mutation object with loading states
 *
 * @example
 * ```typescript
 * const { mutate: createVisit, isPending } = useCreateVisit();
 *
 * createVisit({
 *   diagnoses: "Common cold, 3 Days rest, Panadol 500 mg",
 *   patientId: "patient-uuid"
 * }, {
 *   onSuccess: (response) => {
 *     toast.success('Visit created successfully');
 *     console.log('Visit ID:', response.id);
 *   },
 *   onError: (error) => {
 *     toast.error('Failed to create visit');
 *   }
 * });
 * ```
 */
export const useCreateVisit = () => {
  const user = useAuthStore((state) => state.user);

  return useOfflineMutation<CreateVisitResponse, CreateVisitDto | FormData>({
    mutationFn: async (data) => {
      if (data instanceof FormData) {
        return await doctorApi.createVisit(data as unknown as CreateVisitDto);
      }

      if (USE_MOCK_DATA) {
        const visitData = {
          ...data,
          patient_id: 1,
          doctor_id: 1,
          clinic_id: (user as { clinic_id?: number })?.clinic_id || 0,
          chief_complaint: '',
          diagnosis: data.diagnoses,
          vitals: { weight: 0 },
        };
        const mockResult = await mockVisitsAPI.createVisit(
          visitData as typeof visitData & { chief_complaint: string; diagnosis: string; vitals: { weight: number } }
        );
        return { message: 'Visit Created Successfully', id: mockResult.global_id };
      }

      const clinicId = data.clinicId || user?.clinicId;
      const payload: CreateVisitDto = { diagnoses: data.diagnoses, patientId: data.patientId };
      if (clinicId) payload.clinicId = clinicId;
      return await doctorApi.createVisit(payload);
    },
    offlineConfig: {
      type: 'createVisit',
      endpoint: '/doctor/visit',
      method: 'POST',
      getPayload: (data) => toPayload(data),
      getBlobs: (data) => toBlobs(data),
      getPatientId: (data) =>
        data instanceof FormData ? (data.get('patientId') as string) : data.patientId,
    },
    invalidateKeys: [VISITS_KEY, [...VISITS_KEY, 'recent'], ['patients']],
  });
};

export const useUpdateVisit = () => {
  return useOfflineMutation<Visit, { id: number; data: Partial<VisitFormData>; patientId?: string }>({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch<Visit>(`/doctor/visits/${id}`, data);
      return response.data;
    },
    offlineConfig: {
      type: 'updateVisit',
      endpoint: ({ id }) => `/doctor/visits/${id}`,
      method: 'PATCH',
      getPayload: ({ data }) => toPayload(data),
      getBlobs: ({ data }) => toBlobs(data),
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [VISITS_KEY, ['patients']],
  });
};

export const useGetRecentVisits = (limit: number = 10): UseQueryResult<VisitWithRelations[], Error> => {
  return useQuery({
    queryKey: [...VISITS_KEY, 'recent', limit],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockVisitsAPI.getRecentVisits(limit);
      }
      const response = await apiClient.get<VisitWithRelations[]>(`/doctor/visits/recent?limit=${limit}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get All Visits
 *
 * Retrieves all visits for the authenticated doctor with pagination.
 *
 * @param {Object} params - Query parameters
 * @param {number} [params.page] - Page number (default: 1)
 * @param {number} [params.limit] - Items per page (default: 10)
 * @returns {UseQueryResult} Query result with paginated visits
 *
 * @example
 * ```typescript
 * const { data, isLoading, error } = useGetAllVisits({ page: 1, limit: 20 });
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorAlert error={error} />;
 *
 * return (
 *   <div>
 *     {data.items.map(visit => (
 *       <VisitCard key={visit.id} visit={visit} />
 *     ))}
 *     <Pagination page={data.page} totalPages={data.totalPages} />
 *   </div>
 * );
 * ```
 */
export const useGetAllVisits = (params?: { page?: number; limit?: number }): UseQueryResult<PaginatedVisitsResponse, Error> => {
  return useQuery<PaginatedVisitsResponse>({
    queryKey: [...VISITS_KEY, 'all', params?.page || 1, params?.limit || 10],
    queryFn: async (): Promise<PaginatedVisitsResponse> => {
      const response = await doctorApi.getAllVisits(params);
      return response as PaginatedVisitsResponse;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useGetAllPatients = (): UseQueryResult<unknown[], Error> => {
  return useQuery<unknown[]>({
    queryKey: [...PATIENTS_KEY, 'all'],
    queryFn: async (): Promise<unknown[]> => {
      if (USE_MOCK_DATA) {
        // For mock data, get patients from mock API
        const users = getStorageData(STORAGE_KEYS.USERS, initUsers());
        return users.filter((user: any) => user.role === 'patient');
      }
      const response = await doctorApi.getAllPatients();
      return response;
    },
    staleTime: 2 * 60 * 1000,
  });
};