import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Patient } from '@/types/entities/Patient';
import type { SearchFilters } from '@/types/entities/Visit';
import { mockPatientsAPI } from '@/lib/api/mockData';

const USE_MOCK_DATA = true;
const PATIENTS_KEY = ['patients'];

interface PatientsResponse {
  patients: Patient[];
  total: number;
}

export const useSearchPatients = (filters: SearchFilters): UseQueryResult<PatientsResponse, Error> => {
  return useQuery({
    queryKey: [...PATIENTS_KEY, 'search', filters],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockPatientsAPI.searchPatients(filters.query);
      }
      const params = new URLSearchParams();
      
      if (filters.query) params.append('search', filters.query);
      if (filters.period) params.append('period', filters.period);
      if (filters.startDate) params.append('start_date', filters.startDate.toISOString());
      if (filters.endDate) params.append('end_date', filters.endDate.toISOString());
      if (filters.clinicId) params.append('clinic_id', filters.clinicId.toString());

      const response = await apiClient.get<PatientsResponse>(`/doctor/patients?${params.toString()}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!filters.query || !!filters.period,
  });
};

export const useGetPatient = (id: number): UseQueryResult<Patient, Error> => {
  return useQuery({
    queryKey: [...PATIENTS_KEY, id],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockPatientsAPI.getPatient(id);
      }
      const response = await apiClient.get<Patient>(`/doctor/patients/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePatient = (): UseMutationResult<Patient, Error, Partial<Patient>> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Patient>) => {
      if (USE_MOCK_DATA) {
        return await mockPatientsAPI.createPatient(data);
      }
      const response = await apiClient.post<Patient>('/doctor/patients', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
    },
  });
};

export const useUpdatePatient = (): UseMutationResult<Patient, Error, { id: number; data: Partial<Patient> }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Patient> }) => {
      if (USE_MOCK_DATA) {
        return await mockPatientsAPI.updatePatient(id, data);
      }
      const response = await apiClient.patch<Patient>(`/doctor/patients/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
      queryClient.invalidateQueries({ queryKey: [...PATIENTS_KEY, data.id] });
    },
  });
};
