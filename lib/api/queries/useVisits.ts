import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Visit, VisitWithRelations, VisitFormData } from '@/types/entities/Visit';
import { mockVisitsAPI } from '@/lib/api/mockData';
import { useAuthStore } from '@/stores/authStore';

const USE_MOCK_DATA = true;
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

export const useCreateVisit = (): UseMutationResult<Visit, Error, VisitFormData> => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (data: VisitFormData) => {
      if (USE_MOCK_DATA) {
        // Add doctor_id and clinic_id from auth store
        // TODO: Update when backend integration is complete
        const visitData = {
          ...data,
          doctor_id: 1, // Mock value - will come from backend session
          clinic_id: (user as { clinic_id?: number })?.clinic_id || 0,
        };
        return await mockVisitsAPI.createVisit(visitData);
      }
      const response = await apiClient.post<Visit>('/doctor/visits', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: VISITS_KEY });
      queryClient.invalidateQueries({ queryKey: ['patients', data.patient_id] });
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
