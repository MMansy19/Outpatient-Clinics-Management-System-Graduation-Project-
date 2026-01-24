import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { Patient } from '@/types/entities/Patient';
import type { SearchFilters } from '@/types/entities/Visit';
import type { CreatePatientRequest } from '@/types/api';
import { calculateDateRange, formatDateForAPI } from '@/lib/utils/dateRange';

const PATIENTS_KEY = ['patients'];

interface PatientsResponse {
  patients: Patient[];
  total: number;
}

export const useSearchPatients = (filters: SearchFilters): UseQueryResult<PatientsResponse, Error> => {
  return useQuery({
    queryKey: [...PATIENTS_KEY, 'search', filters],
    queryFn: async () => {
      // Build query parameters for backend API
      const params = new URLSearchParams();

      // General search (searches across name, national_id, email, phone)
      if (filters.query) params.append('search', filters.query);

      // Convert period to actual date ranges
      if (filters.period && filters.period !== 'custom') {
        const { startDate, endDate } = calculateDateRange(filters.period);
        if (startDate) params.append('start_date', formatDateForAPI(startDate));
        if (endDate) params.append('end_date', formatDateForAPI(endDate));
      }

      // Custom date range (overrides period)
      if (filters.startDate) params.append('start_date', formatDateForAPI(filters.startDate));
      if (filters.endDate) params.append('end_date', formatDateForAPI(filters.endDate));

      // Other filters
      if (filters.clinicId) params.append('clinic_id', filters.clinicId.toString());
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.minAge !== undefined) params.append('min_age', filters.minAge.toString());
      if (filters.maxAge !== undefined) params.append('max_age', filters.maxAge.toString());
      if (filters.nationalId) params.append('national_id', filters.nationalId);

      // TODO: Verify endpoint path with backend team
      // Possible endpoints: /doctor/patients, /clinic/patients, /patients
      const response = await apiClient.get<PatientsResponse>(`/doctor/patients?${params.toString()}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    // Only execute query when at least one meaningful filter is active
    enabled: !!filters.query || !!filters.period || !!filters.nationalId || !!filters.gender || filters.minAge !== undefined,
  });
};

export const useGetPatient = (id: number): UseQueryResult<Patient, Error> => {
  return useQuery({
    queryKey: [...PATIENTS_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<Patient>(`/doctor/patients/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreatePatient = (): UseMutationResult<Patient, Error, CreatePatientRequest> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePatientRequest) => {
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
      const response = await apiClient.patch<Patient>(`/doctor/patients/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
      queryClient.invalidateQueries({ queryKey: [...PATIENTS_KEY, data.id] });
    },
  });
};
