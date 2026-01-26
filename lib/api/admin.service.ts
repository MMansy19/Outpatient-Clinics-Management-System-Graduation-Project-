import { apiClient } from './client';
import type { 
  PaginatedDoctorsResponse,
  PaginatedPatientsResponse,
  PaginatedVisitsResponse,
  PaginationParams,
  ClinicResponse,
  CreateClinicDto,
  UpdateClinicDto,
  DoctorByIdResponse,
  PatientByIdResponse
} from './types';

/**
 * Admin API Service
 * 
 * Handles all admin-related API calls for managing doctors, patients, visits, and clinics.
 */

export const adminApi = {
  /**
   * Check if Admin service is running
   */
  isUp: async (): Promise<string> => {
    const response = await apiClient.get<string>('/admin');
    return response.data;
  },

  /**
   * Get all doctors with pagination
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated list of doctors
   */
  getDoctors: async (params: PaginationParams): Promise<PaginatedDoctorsResponse> => {
    const response = await apiClient.get<PaginatedDoctorsResponse>('/admin/doctors', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Get all patients with pagination
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated list of patients
   */
  getPatients: async (params: PaginationParams): Promise<PaginatedPatientsResponse> => {
    const response = await apiClient.get<PaginatedPatientsResponse>('/admin/patients', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Get all visits with pagination
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated list of visits
   */
  getVisits: async (params: PaginationParams): Promise<PaginatedVisitsResponse> => {
    const response = await apiClient.get<PaginatedVisitsResponse>('/admin/visits', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Get doctor by ID
   * 
   * @param id - Doctor ID 
   * @returns Doctor details
   */
  getDoctorById: async (id: string): Promise<DoctorByIdResponse> => {
    const response = await apiClient.get<DoctorByIdResponse>(`/admin/doctor/${id}`);
    return response.data;
  },

  /**
   * Get patient by ID
   * 
   * @param id - Patient ID 
   * @returns Patient details
   */
  getPatientById: async (id: string): Promise<PatientByIdResponse> => {
    const response = await apiClient.get<PatientByIdResponse>(`/admin/patient/${id}`);
    return response.data;
  },

  /**
   * Get all clinics
   * 
   * @returns List of all clinics
   */
  getClinics: async (): Promise<ClinicResponse[]> => {
    const response = await apiClient.get<ClinicResponse[]>('/admin/clinics');
    return response.data;
  },

  /**
   * Create a new clinic
   * 
   * @param data - Clinic data (name, speciality)
   * @returns Success message with clinic ID
   */
  createClinic: async (data: CreateClinicDto): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post<{ message: string; id: string }>('/admin/clinic', data);
    return response.data;
  },

  /**
   * Update clinic information
   * 
   * @param id - Clinic ID (UUID)
   * @param data - Updated clinic data
   * @returns Success message
   */
  updateClinic: async (id: string, data: UpdateClinicDto): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/admin/clinic/${id}`, data);
    return response.data;
  },

  /**
   * Delete a clinic
   * 
   * @param id - Clinic ID (UUID)
   * @returns Success message
   */
  deleteClinic: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/admin/clinic/${id}`);
    return response.data;
  },

  /**
   * Update patient information
   * 
   * @param id - Patient ID (UUID)
   * @param data - Updated patient data
   * @returns Success message
   */
  updatePatient: async (id: string, data: { firstName?: string; lastName?: string; job?: string; address?: string }): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/admin/patient/${id}`, data);
    return response.data;
  },
};