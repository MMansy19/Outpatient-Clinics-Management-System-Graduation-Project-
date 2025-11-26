import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Clinic, ClinicWithStats, ClinicFormData } from '@/types/entities/Clinic';
import { mockClinicsAPI } from '@/lib/api/mockData';

const USE_MOCK_DATA = true;
const CLINICS_KEY = ['clinics'];

export const useGetClinics = (): UseQueryResult<Clinic[], Error> => {
  return useQuery({
    queryKey: CLINICS_KEY,
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockClinicsAPI.getClinics();
      }
      const response = await apiClient.get<Clinic[]>('/clinics');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetClinicsWithStats = (): UseQueryResult<ClinicWithStats[], Error> => {
  return useQuery({
    queryKey: [...CLINICS_KEY, 'stats'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockClinicsAPI.getClinicsWithStats();
      }
      const response = await apiClient.get<ClinicWithStats[]>('/clinics/stats');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useGetClinic = (id: number): UseQueryResult<Clinic, Error> => {
  return useQuery({
    queryKey: [...CLINICS_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<Clinic>(`/clinics/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateClinic = (): UseMutationResult<Clinic, Error, ClinicFormData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClinicFormData) => {
      if (USE_MOCK_DATA) {
        return await mockClinicsAPI.createClinic(data);
      }
      const response = await apiClient.post<Clinic>('/clinics', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICS_KEY });
    },
  });
};

export const useUpdateClinic = (): UseMutationResult<Clinic, Error, { id: number; data: Partial<ClinicFormData> }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      if (USE_MOCK_DATA) {
        return await mockClinicsAPI.updateClinic(id, data);
      }
      const response = await apiClient.patch<Clinic>(`/clinics/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CLINICS_KEY });
      queryClient.invalidateQueries({ queryKey: [...CLINICS_KEY, data.id] });
    },
  });
};

export const useDeleteClinic = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      if (USE_MOCK_DATA) {
        return await mockClinicsAPI.deleteClinic(id);
      }
      await apiClient.delete(`/clinics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICS_KEY });
    },
  });
};
