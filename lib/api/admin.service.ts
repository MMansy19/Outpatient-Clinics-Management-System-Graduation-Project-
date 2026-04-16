import { apiClient } from './client';
import type {
  AdminClinicInfoResponse,
  AdminPaginatedPatientsResponse,
  AdminPaginatedVisitsResponse,
  AdminPatientVisitsResponse,
  AdminPatientMedicationsResponse,
  AdminPatientLabsResponse,
  AdminPatientScansResponse,
  AdminPatientSearchResponse,
  AdminClinicDoctorsResponse,
  AdminClinicPatientsResponse,
  AdminClinicVisitsResponse,
  PaginationParams,
  CreateVisitDto,
  CreateVisitResponse,
  CreateMedicationDto,
  CreateMedicationResponse,
} from './types';

/**
 * Admin API Service
 *
 * Handles clinic-scoped operations for users with the ADMIN role:
 * - Patient visit / medication / lab / scan creation
 * - Querying patient records within the admin's clinic
 * - Clinic-scoped listing of doctors, patients, visits
 *
 * The backend reads the clinic context from the JWT cookie —
 * no explicit clinicId parameter is required.
 *
 * All endpoints require ADMIN role authentication.
 *
 * @see Backend module: Admin (/api/v1/admin/*)
 */
export const adminApi = {
  // ──────────────────────────────────────────────────────────────────────────
  // Health Check
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/admin */
  isUp: async (): Promise<string> => {
    const response = await apiClient.get<string>('/admin');
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Clinic Info (for clinic manager)
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/admin/clinic — returns the clinic name and id for the logged-in admin */
  getClinic: async (): Promise<AdminClinicInfoResponse> => {
    const response = await apiClient.get<AdminClinicInfoResponse>('/admin/clinic');
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Admin-scoped Listing (Paginated)
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/admin/patients */
  getPatients: async (params: PaginationParams): Promise<AdminPaginatedPatientsResponse> => {
    const response = await apiClient.get<AdminPaginatedPatientsResponse>('/admin/patients', {
      params: { page: params.page, limit: params.limit },
    });
    return response.data;
  },

  /** GET /api/v1/admin/visits */
  getVisits: async (params: PaginationParams): Promise<AdminPaginatedVisitsResponse> => {
    const response = await apiClient.get<AdminPaginatedVisitsResponse>('/admin/visits', {
      params: { page: params.page, limit: params.limit },
    });
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Clinic-scoped Queries
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/admin/clinic/doctors */
  getClinicDoctors: async (params: PaginationParams): Promise<AdminClinicDoctorsResponse> => {
    const response = await apiClient.get<AdminClinicDoctorsResponse>('/admin/clinic/doctors', {
      params: { page: params.page, limit: params.limit },
    });
    return response.data;
  },

  /** GET /api/v1/admin/clinic/patients */
  getClinicPatients: async (params: PaginationParams): Promise<AdminClinicPatientsResponse> => {
    const response = await apiClient.get<AdminClinicPatientsResponse>('/admin/clinic/patients', {
      params: { page: params.page, limit: params.limit },
    });
    return response.data;
  },

  /** GET /api/v1/admin/clinic/visits */
  getClinicVisits: async (params: PaginationParams): Promise<AdminClinicVisitsResponse> => {
    const response = await apiClient.get<AdminClinicVisitsResponse>('/admin/clinic/visits', {
      params: { page: params.page, limit: params.limit },
    });
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Patient Search
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/admin/patient/{socialSecurityNumber} */
  getPatientBySSN: async (socialSecurityNumber: string): Promise<AdminPatientSearchResponse> => {
    const response = await apiClient.get<AdminPatientSearchResponse>(`/admin/patient/${socialSecurityNumber}`);
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Patient Visit Management
  // ──────────────────────────────────────────────────────────────────────────

  /** POST /api/v1/admin/visit  (multipart/form-data) */
  createVisit: async (data: CreateVisitDto | FormData): Promise<CreateVisitResponse> => {
    const response = await apiClient.post<CreateVisitResponse>('/admin/visit', data);
    return response.data;
  },

  /** GET /api/v1/admin/patient/{id}/visits */
  getPatientVisits: async (patientId: string): Promise<AdminPatientVisitsResponse> => {
    const response = await apiClient.get<AdminPatientVisitsResponse>(`/admin/patient/${patientId}/visits`);
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Patient Medication Management
  // ──────────────────────────────────────────────────────────────────────────

  /** POST /api/v1/admin/medication  (multipart/form-data) */
  createMedication: async (data: CreateMedicationDto | FormData): Promise<CreateMedicationResponse> => {
    const response = await apiClient.post<CreateMedicationResponse>('/admin/medication', data);
    return response.data;
  },

  /** GET /api/v1/admin/patient/{id}/medications */
  getPatientMedications: async (patientId: string): Promise<AdminPatientMedicationsResponse> => {
    const response = await apiClient.get<AdminPatientMedicationsResponse>(`/admin/patient/${patientId}/medications`);
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Patient Lab Management
  // ──────────────────────────────────────────────────────────────────────────

  /** POST /api/v1/admin/lab  (multipart/form-data) */
  createLab: async (
    patientId: string,
    data: { name: string; comments: string; image?: File; patientId?: string } | FormData,
  ): Promise<unknown> => {
    const isFormData = data instanceof FormData;
    if (isFormData) {
      (data as FormData).set('patientId', patientId);
    }
    const payload = isFormData ? data : { ...data, patientId };
    const response = await apiClient.post<unknown>('/admin/lab', payload);
    return response.data;
  },

  /** GET /api/v1/admin/patient/{id}/labs */
  getPatientLabs: async (patientId: string): Promise<AdminPatientLabsResponse> => {
    const response = await apiClient.get<AdminPatientLabsResponse>(`/admin/patient/${patientId}/labs`);
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Patient Scan Management
  // ──────────────────────────────────────────────────────────────────────────

  /** POST /api/v1/admin/scan  (multipart/form-data) */
  createScan: async (
    patientId: string,
    data: { name: string; comments: string; type: string; image?: File; patientId?: string } | FormData,
  ): Promise<unknown> => {
    const isFormData = data instanceof FormData;
    if (isFormData) {
      (data as FormData).set('patientId', patientId);
    }
    const payload = isFormData ? data : { ...data, patientId };
    const response = await apiClient.post<unknown>('/admin/scan', payload);
    return response.data;
  },

  /** GET /api/v1/admin/patient/{id}/scans */
  getPatientScans: async (patientId: string): Promise<AdminPatientScansResponse> => {
    const response = await apiClient.get<AdminPatientScansResponse>(`/admin/patient/${patientId}/scans`);
    return response.data;
  },
};