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
  PatientByIdResponse,
} from './types';

/**
 * Super Admin API Service
 *
 * Handles all system-level super-admin operations:
 * - View all doctors, patients, visits across the system
 * - Clinic CRUD management
 * - Get/update individual doctor and patient records
 *
 * All endpoints require SUPER_ADMIN role authentication.
 *
 * @see Backend module: SuperAdmin (/api/v1/super-admin/*)
 */
export const superAdminApi = {
  // ──────────────────────────────────────────────────────────────────────────
  // Health Check
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/super-admin */
  isUp: async (): Promise<string> => {
    const response = await apiClient.get<string>('/super-admin');
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // System-wide Listing (Paginated)
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/super-admin/doctors */
  getDoctors: async (params: PaginationParams): Promise<PaginatedDoctorsResponse> => {
    const response = await apiClient.get<PaginatedDoctorsResponse>('/super-admin/doctors', {
      params: { page: params.page, limit: params.limit },
    });
    return response.data;
  },

  /** GET /api/v1/super-admin/patients */
  getPatients: async (params: PaginationParams): Promise<PaginatedPatientsResponse> => {
    const response = await apiClient.get<PaginatedPatientsResponse>('/super-admin/patients', {
      params: { page: params.page, limit: params.limit },
    });
    return response.data;
  },

  /** GET /api/v1/super-admin/visits */
  getVisits: async (params: PaginationParams): Promise<PaginatedVisitsResponse> => {
    const response = await apiClient.get<PaginatedVisitsResponse>('/super-admin/visits', {
      params: { page: params.page, limit: params.limit },
    });
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Individual Record Access
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/super-admin/doctor/{id} */
  getDoctorById: async (id: string): Promise<DoctorByIdResponse> => {
    const response = await apiClient.get<DoctorByIdResponse>(`/super-admin/doctor/${id}`);
    return response.data;
  },

  /** GET /api/v1/super-admin/patient/{id} */
  getPatientById: async (id: string): Promise<PatientByIdResponse> => {
    const response = await apiClient.get<PatientByIdResponse>(`/super-admin/patient/${id}`);
    return response.data;
  },

  /** PATCH /api/v1/super-admin/patient/{id} */
  updatePatient: async (
    id: string,
    data: { firstName?: string; lastName?: string; job?: string; address?: string },
  ): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/patient/${id}`, data);
    return response.data;
  },

  /** PATCH /api/v1/super-admin/doctor/{id} */
  updateDoctor: async (
    id: string,
    data: { firstName?: string; lastName?: string; email?: string; phone?: string; speciality?: string },
  ): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/doctor/${id}`, data);
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Clinic Management
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/super-admin/clinics */
  getClinics: async (): Promise<ClinicResponse[]> => {
    const response = await apiClient.get<ClinicResponse[]>('/super-admin/clinics');
    return response.data;
  },

  /** POST /api/v1/super-admin/clinic */
  createClinic: async (data: CreateClinicDto): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post<{ message: string; id: string }>('/super-admin/clinic', data);
    return response.data;
  },

  /** PATCH /api/v1/super-admin/clinic/{id} — not yet in Swagger, kept for forward-compat */
  updateClinic: async (id: string, data: UpdateClinicDto): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/clinic/${id}`, data);
    return response.data;
  },

  /** DELETE /api/v1/super-admin/clinic/{id} — not yet in Swagger, kept for forward-compat */
  deleteClinic: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/super-admin/clinic/${id}`);
    return response.data;
  },
};
