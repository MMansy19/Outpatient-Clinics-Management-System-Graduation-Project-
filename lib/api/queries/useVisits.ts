import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { doctorApi } from '@/lib/api/doctor.service';
import type { CreateVisitDto, CreateVisitResponse, PaginatedVisitsResponse } from '@/lib/api/types';
import type { Visit, VisitWithRelations, VisitFormData } from '@/types/entities/Visit';
// import type { User } from '@/types/entities/User';
import { mockVisitsAPI, getStorageData, STORAGE_KEYS, initUsers } from '@/lib/api/mockData';
import { useAuthStore } from '@/stores/authStore';

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
  console.log('🔍 useGetPatientVisits called with patientId:', patientId, 'USE_MOCK_DATA:', USE_MOCK_DATA);

  return useQuery({
    queryKey: [...VISITS_KEY, 'patient', patientId],
    queryFn: async () => {
      console.log('🔍 useGetPatientVisits - queryFn executing for patientId:', patientId);

      if (USE_MOCK_DATA) {
        console.log('🔍 useGetPatientVisits - using mock data (by SSN not supported with new contract)');
        const result = await mockVisitsAPI.getPatientVisits(patientId);
        console.log('🔍 useGetPatientVisits - mock result:', result);
        return result;
      }
      console.log('🔍 useGetPatientVisits - using real API');
      const response = await apiClient.get<VisitWithRelations[]>(`/doctor/patient/${patientId}/visits`);
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get Single Visit Hook
 * 
 * Retrieves detailed information for a specific visit, including audio URL.
 * 
 * @param {number} id - Visit ID
 * @returns {UseQueryResult} Query result with visit details
 * 
 * @example
 * ```typescript
 * const { data: visit } = useGetVisit(visitId);
 * 
 * if (visit?.diagnosesAudioUrl) {
 *   return <AudioPlayer url={visit.diagnosesAudioUrl} />;
 * }
 * ```
 */
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
 * Creates a new visit record and optionally generates audio diagnosis.
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
 *     // Backend may generate audio automatically
 *   },
 *   onError: (error) => {
 *     toast.error('Failed to create visit');
 *   }
 * });
 * ```
 */
export const useCreateVisit = (): UseMutationResult<CreateVisitResponse, Error, CreateVisitDto | FormData> => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (data: CreateVisitDto | FormData) => {
      if (USE_MOCK_DATA) {
        const dto = data instanceof FormData
          ? { diagnoses: data.get('diagnoses') as string || '', patientId: data.get('patientId') as string }
          : data;
        // Mock implementation - transform to match mock API signature
        const visitData = {
          ...dto,
          patient_id: 1,
          doctor_id: 1,
          clinic_id: (user as { clinic_id?: number })?.clinic_id || 0,
          chief_complaint: '',
          diagnosis: dto.diagnoses,
          vitals: { weight: 0 },
        };
        const mockResult = await mockVisitsAPI.createVisit(visitData as typeof visitData & { chief_complaint: string; diagnosis: string; vitals: { weight: number } });
        
        return {
          message: 'Visit Created Successfully',
          id: mockResult.global_id,
        };
      }
      
      // Real backend implementation
      // Backend will automatically generate diagnosesAudioUrl if configured
      return await doctorApi.createVisit(data);
    },
    onSuccess: (_response, variables) => {
      const patientId = variables instanceof FormData
        ? variables.get('patientId') as string
        : variables.patientId;

      queryClient.invalidateQueries({ queryKey: VISITS_KEY });
      queryClient.invalidateQueries({ 
        queryKey: [...VISITS_KEY, 'patient', patientId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['patients', patientId] 
      });
    },
    onError: (error) => {
      console.error('[useCreateVisit] Error:', error);
      // Centralized error handling could go here
    },
  });
};

/**
 * Update Visit Hook
 * 
 * Updates an existing visit. If diagnosis text is updated,
 * the backend may regenerate the audio URL.
 * 
 * @returns {UseMutationResult} Mutation object
 * 
 * @example
 * ```typescript
 * const { mutate: updateVisit } = useUpdateVisit();
 * 
 * updateVisit({
 *   id: visitId,
 *   data: { diagnosis: "Updated diagnosis text" }
 * }, {
 *   onSuccess: (updatedVisit) => {
 *     // updatedVisit.diagnosesAudioUrl may be newly generated
 *     toast.success('Visit updated');
 *   }
 * });
 * ```
 */
export const useUpdateVisit = (): UseMutationResult<Visit, Error, { id: number; data: Partial<VisitFormData> }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<VisitFormData> }) => {
      const response = await apiClient.patch<Visit>(`/doctor/visits/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate queries to fetch updated data with new audio URL if applicable
      queryClient.invalidateQueries({ queryKey: VISITS_KEY });
      queryClient.invalidateQueries({ queryKey: [...VISITS_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: ['patients', data.patient_id] });
    },
  });
};

/**
 * Get Recent Visits Hook
 * 
 * Retrieves the most recent visits, including audio URLs.
 * Useful for dashboard displays.
 * 
 * @param {number} limit - Maximum number of visits to retrieve
 * @returns {UseQueryResult} Query result with recent visits
 * 
 * @example
 * ```typescript
 * const { data: recentVisits } = useGetRecentVisits(5);
 * 
 * return (
 *   <div>
 *     {recentVisits?.map(visit => (
 *       <VisitCard key={visit.id} visit={visit} />
 *     ))}
 *   </div>
 * );
 * ```
 */
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
 * Get All Visits Hook
 *
 * Retrieves all visits for the authenticated doctor with pagination.
 * Each visit includes diagnosesAudioUrl if available.
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
      // if (USE_MOCK_DATA) {
      //   // For mock data, return recent visits
      //   const visits = await mockVisitsAPI.getRecentVisits(params?.limit || 10);
      //   // Transform VisitWithRelations[] to VisitResponse[]
      //   const items: VisitResponse[] = visits.map((visit) => ({
      //     id: visit.global_id,
      //     diagnoses: visit.diagnosis,
      //     doctorId: visit.doctor.id.toString(),
      //     patientId: visit.patient.id.toString(),
      //     createdAt: visit.created_at.toISOString(),
      //   }));
      //   return {
      //     items,
      //     page: 1,
      //     totalPages: 1,
      //     totalItems: 10,
      //   };
      // }
      const response = await doctorApi.getAllVisits(params);
      return response as PaginatedVisitsResponse;
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get All Patients Hook
 * 
 * Retrieves all patients accessible to the current doctor.
 * 
 * @returns {UseQueryResult} Query result with patients list
 */
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

/**
 * Prefetch Visit Hook
 * 
 * Prefetches a visit to improve perceived performance.
 * Useful when hovering over visit cards before clicking.
 * 
 * @returns {Function} Prefetch function
 * 
 * @example
 * ```typescript
 * const prefetchVisit = usePrefetchVisit();
 * 
 * <VisitCard
 *   onMouseEnter={() => prefetchVisit(visit.id)}
 *   visit={visit}
 * />
 * ```
 */
export const usePrefetchVisit = () => {
  const queryClient = useQueryClient();

  return (visitId: number) => {
    queryClient.prefetchQuery({
      queryKey: [...VISITS_KEY, visitId],
      queryFn: async () => {
        const response = await apiClient.get<VisitWithRelations>(`/doctor/visits/${visitId}`);
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};

/**
 * Check Audio Availability Hook
 * 
 * Utility hook to check if a visit has an audio diagnosis.
 * 
 * @param {VisitWithRelations | VisitResponse} visit - Visit object
 * @returns {boolean} True if audio URL exists and is valid
 * 
 * @example
 * ```typescript
 * const hasAudio = useCheckAudioAvailability(visit);
 * 
 * {hasAudio && <AudioPlayer url={visit.diagnosesAudioUrl} />}
 * ```
 */
export const useCheckAudioAvailability = (
  visit: VisitWithRelations | VisitResponse | null | undefined
): boolean => {
  if (!visit) return false;
  
  const audioUrl = 'diagnosesAudioUrl' in visit 
    ? visit.diagnosesAudioUrl 
    : undefined;
    
  return !!(audioUrl && audioUrl.trim().length > 0);
};

/**
 * Get Visit Audio URL Hook
 * 
 * Safely retrieves the audio URL from a visit object.
 * Handles both VisitWithRelations and VisitResponse types.
 * 
 * @param {VisitWithRelations | VisitResponse} visit - Visit object
 * @returns {string | undefined} Audio URL if available
 * 
 * @example
 * ```typescript
 * const audioUrl = useGetVisitAudioUrl(visit);
 * 
 * if (audioUrl) {
 *   return <AudioPlayer url={audioUrl} />;
 * }
 * ```
 */
export const useGetVisitAudioUrl = (
  visit: VisitWithRelations | VisitResponse | null | undefined
): string | undefined => {
  if (!visit) return undefined;
  
  return 'diagnosesAudioUrl' in visit 
    ? visit.diagnosesAudioUrl 
    : undefined;
};