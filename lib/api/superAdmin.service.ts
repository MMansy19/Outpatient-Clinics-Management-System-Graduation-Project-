import { apiClient } from './client';
import type { 
  PaginatedDoctorsResponse,
  PaginatedPatientsResponse,
  PaginatedAdminsResponse,
  SuperAdminPaginatedVisitsResponse,
  PaginationParams,
  ClinicResponse,
  CreateClinicDto,
  UpdateClinicDto,
  DoctorByIdResponse,
  PatientByIdResponse
} from './types';

/**
 * Super Admin API Service
 * 
 * Handles all super-admin-related API calls for managing doctors, patients, visits, and clinics.
 * Uses /super-admin/ endpoints.
 */

export const superAdminApi = {
  /**
   * Check if Super Admin service is running
   */
  isUp: async (): Promise<string> => {
    const response = await apiClient.get<string>('/super-admin');
    return response.data;
  },

  /**
   * Get all doctors with pagination
   */
  getDoctors: async (params: PaginationParams): Promise<PaginatedDoctorsResponse> => {
    const response = await apiClient.get<PaginatedDoctorsResponse>('/super-admin/doctors', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Get all admins with pagination
   */
  getAdmins: async (params: PaginationParams): Promise<PaginatedAdminsResponse> => {
    const response = await apiClient.get<PaginatedAdminsResponse>('/super-admin/admins', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Get all patients with pagination
   */
  getPatients: async (params: PaginationParams): Promise<PaginatedPatientsResponse> => {
    const response = await apiClient.get<PaginatedPatientsResponse>('/super-admin/patients', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Get all visits with pagination
   */
  getVisits: async (params: PaginationParams): Promise<SuperAdminPaginatedVisitsResponse> => {
    const response = await apiClient.get<SuperAdminPaginatedVisitsResponse>('/super-admin/visits', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Get doctor by ID
   */
  getDoctorById: async (id: string): Promise<DoctorByIdResponse> => {
    const response = await apiClient.get<DoctorByIdResponse>(`/super-admin/doctor/${id}`);
    return response.data;
  },

  /**
   * Get patient by ID
   */
  getPatientById: async (id: string): Promise<PatientByIdResponse> => {
    const response = await apiClient.get<PatientByIdResponse>(`/super-admin/patient/${id}`);
    return response.data;
  },

  /**
   * Get all clinics
   */
  getClinics: async (): Promise<ClinicResponse[]> => {
    const response = await apiClient.get<ClinicResponse[]>('/super-admin/clinics');
    return response.data;
  },

  /**
   * Create a new clinic
   */
  createClinic: async (data: CreateClinicDto): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post<{ message: string; id: string }>('/super-admin/clinic', data);
    return response.data;
  },

  /**
   * Update clinic information
   */
  updateClinic: async (id: string, data: UpdateClinicDto): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/clinic/${id}`, data);
    return response.data;
  },

  /**
   * Delete a clinic
   */
  deleteClinic: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/super-admin/clinic/${id}`);
    return response.data;
  },

  /**
   * Update patient information
   */
  updatePatient: async (id: string, data: { firstName?: string; lastName?: string; job?: string; address?: string }): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/patient/${id}`, data);
    return response.data;
  },

  /**
   * Update doctor information
   */
  updateDoctor: async (id: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string; speciality?: string }): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/doctor/${id}`, data);
    return response.data;
  },

  /**
   * Delete a doctor
   */
  deleteDoctor: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/super-admin/doctor/${id}`);
    return response.data;
  },

  /**
   * Create a new doctor
   */
  createDoctor: async (data: { firstName: string; lastName: string; language: number; socialSecurityNumber: string; email: string; phone: string; password: string; speciality: string; clinicId: string }): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post<{ message: string; id: string }>('/super-admin/doctor', data);
    return response.data;
  },

  /**
   * Get admin by ID
   */
  getAdminById: async (id: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/super-admin/admin/${id}`);
    return response.data;
  },

  /**
   * Create a new admin
   */
  createAdmin: async (data: { firstName: string; lastName: string; language: number; socialSecurityNumber: string; email: string; phone: string; password: string; speciality: string; clinicId: string }): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post<{ message: string; id: string }>('/super-admin/admin', data);
    return response.data;
  },

  /**
   * Update admin information
   */
  updateAdmin: async (id: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string; speciality?: string }): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/admin/${id}`, data);
    return response.data;
  },

  /**
   * Delete an admin
   */
  deleteAdmin: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/super-admin/admin/${id}`);
    return response.data;
  },
};
