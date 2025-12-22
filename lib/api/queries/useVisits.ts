import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { doctorApi } from '@/lib/api/doctor.service';
import type { CreateVisitDto, CreateVisitResponse } from '@/lib/api/types';
import type { Visit, VisitWithRelations, VisitFormData } from '@/types/entities/Visit';
import { mockVisitsAPI } from '@/lib/api/mockData';
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

export const useGetPatientVisits = (patientId: number): UseQueryResult<VisitWithRelations[], Error> => {
  return useQuery({
    queryKey: [...VISITS_KEY, 'patient', patientId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockVisitsAPI.getPatientVisits(patientId);
      }
      const response = await apiClient.get<VisitWithRelations[]>(`/doctor/visits/patient/${patientId}`);
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
export const useCreateVisit = (): UseMutationResult<CreateVisitResponse, Error, CreateVisitDto> => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (data: CreateVisitDto) => {
      if (USE_MOCK_DATA) {
        // Mock implementation - transform to match mock API signature
        const visitData = {
          ...data,
          // Mock data expects different field names
          patient_id: 1, // In mock, we use numeric ID
          doctor_id: 1,
          clinic_id: (user as { clinic_id?: number })?.clinic_id || 0,
          chief_complaint: '', // Mock requires this
          diagnosis: data.diagnoses, // Map to mock field name
          vitals: { weight: 0 }, // Mock requires this
        };
        const mockResult = await mockVisitsAPI.createVisit(visitData as typeof visitData & { chief_complaint: string; diagnosis: string; vitals: { weight: number } });
        
        // Transform mock response to match backend API response
        return {
          message: 'Visit Created Successfully',
          id: mockResult.global_id,
        };
      }
      
      // Real backend implementation
      return await doctorApi.createVisit(data);
    },
    onSuccess: (_response, variables) => {
      // Invalidate all visits queries
      queryClient.invalidateQueries({ queryKey: VISITS_KEY });
      
      // Invalidate patient-specific visits
      queryClient.invalidateQueries({ 
        queryKey: [...VISITS_KEY, 'patient', variables.patientId] 
      });
      
      // Invalidate patient details (may include visit count)
      queryClient.invalidateQueries({ 
        queryKey: ['patients', variables.patientId] 
      });
    },
    onError: (error) => {
      console.error('[useCreateVisit] Error:', error);
      // Centralized error handling could go here
    },
  });
};

export const useUpdateVisit = (): UseMutationResult<Visit, Error, { id: number; data: Partial<VisitFormData> }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<VisitFormData> }) => {
      const response = await apiClient.patch<Visit>(`/doctor/visits/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: VISITS_KEY });
      queryClient.invalidateQueries({ queryKey: [...VISITS_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: ['patients', data.patient_id] });
    },
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
