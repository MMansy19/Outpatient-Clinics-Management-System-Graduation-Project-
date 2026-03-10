import { useMutation, useQuery, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { adminApi } from '@/lib/api/admin.service';
import type { Doctor, DoctorWithClinic } from '@/types/entities/Doctor';
import type { Patient } from '@/types/entities/Patient';
import type { PaginatedDoctorsResponse } from '@/lib/api/types';

const DOCTORS_KEY = ['doctors'];
const PATIENTS_KEY = ['patients'];

// Doctor Management Hooks
export const useGetDoctors = (clinicId?: number): UseQueryResult<DoctorWithClinic[], Error> => {
  return useQuery({
    queryKey: clinicId ? [...DOCTORS_KEY, { clinicId }] : DOCTORS_KEY,
    queryFn: async () => {
      const url = clinicId ? `/super-admin/doctors?clinic_id=${clinicId}` : '/super-admin/doctors';
      const response = await apiClient.get<DoctorWithClinic[]>(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get doctors in the admin's clinic
 *
 * The backend determines the clinic from the JWT cookie.
 * No clinicId query parameter needed.
 *
 * @param page - Page number (default 1)
 * @param limit - Items per page (default 30)
 * @returns Paginated list of doctors in the clinic
 */
export const useGetClinicDoctors = (
  page: number = 1,
  limit: number = 30
): UseQueryResult<PaginatedDoctorsResponse, Error> => {
  return useQuery({
    queryKey: [...DOCTORS_KEY, 'clinic', { page, limit }],
    queryFn: async () => {
      const response = await adminApi.getClinicDoctors({ page, limit });
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateDoctor = (): UseMutationResult<
  { message: string; id: string },
  Error,
  {
    firstName: string;
    lastName: string;
    language: number;
    socialSecurityNumber: string;
    email: string;
    phone: string;
    password: string;
    speciality: string;
    clinicId: string;
  }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await adminApi.createDoctor(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_KEY });
    },
    onError: (error) => {
      console.error('[useCreateDoctor] Error:', error);
    },
  });
};

export const useUpdateDoctor = (): UseMutationResult<Doctor, Error, { id: number; data: Partial<Doctor> }> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch<Doctor>(`/super-admin/doctors/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_KEY });
    },
  });
};

export const useDeleteDoctor = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/super-admin/doctors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCTORS_KEY });
    },
  });
};

// Patient Management Hooks
export const useGetPatients = (searchQuery?: string): UseQueryResult<Patient[], Error> => {
  return useQuery({
    queryKey: searchQuery ? [...PATIENTS_KEY, { searchQuery }] : PATIENTS_KEY,
    queryFn: async () => {
      const url = searchQuery ? `/super-admin/patients?search=${searchQuery}` : '/super-admin/patients';
      const response = await apiClient.get<Patient[]>(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDeletePatient = (): UseMutationResult<void, Error, number> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/super-admin/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PATIENTS_KEY });
    },
  });
};
