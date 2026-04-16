import { apiClient } from './client';
import type {
  PaginatedDoctorsResponse,
  PaginatedPatientsResponse,
  SuperAdminPaginatedVisitsResponse,
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
  getVisits: async (params: PaginationParams): Promise<SuperAdminPaginatedVisitsResponse> => {
    const response = await apiClient.get<SuperAdminPaginatedVisitsResponse>('/super-admin/visits', {
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

  // ──────────────────────────────────────────────────────────────────────────
  // Doctor Management
  // ──────────────────────────────────────────────────────────────────────────

  /** DELETE /api/v1/super-admin/doctor/{id} */
  deleteDoctor: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/super-admin/doctor/${id}`);
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Patient Medical Data (Doctor capabilities for Super Admin)
  // ──────────────────────────────────────────────────────────────────────────

  /** POST /api/v1/super-admin/visit */
  createVisit: async (data: {
    diagnoses?: string;
    patientId: string;
    clinicId: string;
  }): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post<{ message: string; id: string }>('/super-admin/visit', data);
    return response.data;
  },

  /** POST /api/v1/super-admin/medication */
  createMedication: async (data: {
    name: string;
    dosage: string;
    period: string;
    comments?: string;
    patientId: string;
    clinicId: string;
  }): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post<{ message: string; id: string }>('/super-admin/medication', data);
    return response.data;
  },

  /** POST /api/v1/super-admin/lab */
  createLab: async (data: {
    name: string;
    photoUrl?: string;
    comments?: string;
    patientId: string;
    clinicId: string;
  }): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post<{ message: string; id: string }>('/super-admin/lab', data);
    return response.data;
  },

  /** POST /api/v1/super-admin/scan */
  createScan: async (data: {
    name: string;
    type: number;
    photoUrl?: string;
    comments?: string;
    patientId: string;
    clinicId: string;
  }): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post<{ message: string; id: string }>('/super-admin/scan', data);
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Patient Search & Queries
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/super-admin/patient-search/{socialSecurityNumber} */
  searchPatientBySSN: async (ssn: string): Promise<{
    id: string;
    name: string;
    gender: number;
    dateOfBirth: string;
    socialSecurityNumber: string;
    job: string | null;
    address: string | null;
    createdAt: string;
  }> => {
    const response = await apiClient.get<{
      id: string;
      name: string;
      gender: number;
      dateOfBirth: string;
      socialSecurityNumber: string;
      job: string | null;
      address: string | null;
      createdAt: string;
    }>(`/super-admin/patient-search/${ssn}`);
    return response.data;
  },

  /** GET /api/v1/super-admin/patient/{id}/visits */
  getPatientVisits: async (patientId: string): Promise<{
    patient: {
      id: string;
      name: string;
      socialSecurityNumber: string;
    };
    visits: {
      id: string;
      diagnoses: string;
      diagnosesAudioUrl: string | null;
      doctor: { name: string; speciality: string };
      clinic: { name: string };
      createdAt: string;
    }[];
  }> => {
    const response = await apiClient.get<{
      patient: { id: string; name: string; socialSecurityNumber: string };
      visits: {
        id: string;
        diagnoses: string;
        diagnosesAudioUrl: string | null;
        doctor: { name: string; speciality: string };
        clinic: { name: string };
        createdAt: string;
      }[];
    }>(`/super-admin/patient/${patientId}/visits`);
    return response.data;
  },

  /** GET /api/v1/super-admin/patient/{id}/medications */
  getPatientMedications: async (patientId: string): Promise<{
    patient: { id: string; name: string };
    medications: {
      name: string;
      dosage: string;
      period: string;
      comments: string | null;
      commentsAudioUrl: string | null;
      doctor: { id: string; name: string; speciality: string };
      createdAt: string;
    }[];
  }> => {
    const response = await apiClient.get<{
      patient: { id: string; name: string };
      medications: {
        name: string;
        dosage: string;
        period: string;
        comments: string | null;
        commentsAudioUrl: string | null;
        doctor: { id: string; name: string; speciality: string };
        createdAt: string;
      }[];
    }>(`/super-admin/patient/${patientId}/medications`);
    return response.data;
  },

  /** GET /api/v1/super-admin/patient/{id}/labs */
  getPatientLabs: async (patientId: string): Promise<{
    patient: { id: string; name: string };
    labs: {
      name: string;
      photoUrl: string;
      comments: string | null;
      commentsAudioUrl: string | null;
      doctor: { id: string; name: string; speciality: string };
      createdAt: string;
    }[];
  }> => {
    const response = await apiClient.get<{
      patient: { id: string; name: string };
      labs: {
        name: string;
        photoUrl: string;
        comments: string | null;
        commentsAudioUrl: string | null;
        doctor: { id: string; name: string; speciality: string };
        createdAt: string;
      }[];
    }>(`/super-admin/patient/${patientId}/labs`);
    return response.data;
  },

  /** GET /api/v1/super-admin/patient/{id}/scans */
  getPatientScans: async (patientId: string): Promise<{
    patient: { id: string; name: string };
    scans: {
      name: string;
      type: string;
      photoUrl: string;
      comments: string | null;
      commentsAudioUrl: string | null;
      doctor: { id: string; name: string; speciality: string };
      createdAt: string;
    }[];
  }> => {
    const response = await apiClient.get<{
      patient: { id: string; name: string };
      scans: {
        name: string;
        type: string;
        photoUrl: string;
        comments: string | null;
        commentsAudioUrl: string | null;
        doctor: { id: string; name: string; speciality: string };
        createdAt: string;
      }[];
    }>(`/super-admin/patient/${patientId}/scans`);
    return response.data;
  },

  // ────────────────────────────────────────────────────────────────���─��───────
  // Managed Patients/Visits
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/super-admin/managed-patients */
  getManagedPatients: async (): Promise<{
    page: number;
    items: {
      id: string;
      name: string;
      gender: number;
      dateOfBirth: string;
      socialSecurityNumber: string;
      address: string | null;
      job: string | null;
    }[];
    totalItems: number;
    totalPages: number;
  }> => {
    const response = await apiClient.get<{
      page: number;
      items: {
        id: string;
        name: string;
        gender: number;
        dateOfBirth: string;
        socialSecurityNumber: string;
        address: string | null;
        job: string | null;
      }[];
      totalItems: number;
      totalPages: number;
    }>('/super-admin/managed-patients');
    return response.data;
  },

  /** GET /api/v1/super-admin/managed-visits */
  getManagedVisits: async (params: { page: number; limit: number }): Promise<{
    page: number;
    items: {
      id: string;
      diagnoses: string;
      diagnosesAudioUrl: string | null;
      patient: { name: string; id: string };
      doctor: { name: string; id: string };
      clinic: { name: string };
      createdAt: string;
    }[];
    totalItems: number;
    totalPages: number;
  }> => {
    const response = await apiClient.get<{
      page: number;
      items: {
        id: string;
        diagnoses: string;
        diagnosesAudioUrl: string | null;
        patient: { name: string; id: string };
        doctor: { name: string; id: string };
        clinic: { name: string };
        createdAt: string;
      }[];
      totalItems: number;
      totalPages: number;
    }>('/super-admin/managed-visits', { params: { page: params.page, limit: params.limit } });
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Clinic-scoped Queries
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/super-admin/clinic/{clinicId}/visits */
  getClinicVisits: async (clinicId: string, params: { page: number; limit: number }): Promise<{
    page: number;
    items: {
      id: string;
      diagnoses: string;
      diagnosesAudioUrl: string | null;
      patient: { name: string; id: string };
      doctor: { name: string; id: string };
      createdAt: string;
    }[];
    totalItems: number;
    totalPages: number;
  }> => {
    const response = await apiClient.get<{
      page: number;
      items: {
        id: string;
        diagnoses: string;
        diagnosesAudioUrl: string | null;
        patient: { name: string; id: string };
        doctor: { name: string; id: string };
        createdAt: string;
      }[];
      totalItems: number;
      totalPages: number;
    }>(`/super-admin/clinic/${clinicId}/visits`, { params: { page: params.page, limit: params.limit } });
    return response.data;
  },

  /** GET /api/v1/super-admin/clinic/{clinicId}/doctors */
  getClinicDoctors: async (clinicId: string): Promise<{
    page: number;
    items: {
      id: string;
      name: string;
      email: string;
      phone: string;
      speciality: string;
      isApproved: boolean;
    }[];
    totalItems: number;
    totalPages: number;
  }> => {
    const response = await apiClient.get<{
      page: number;
      items: {
        id: string;
        name: string;
        email: string;
        phone: string;
        speciality: string;
        isApproved: boolean;
      }[];
      totalItems: number;
      totalPages: number;
    }>(`/super-admin/clinic/${clinicId}/doctors`);
    return response.data;
  },

  /** GET /api/v1/super-admin/clinic/{clinicId}/patients */
  getClinicPatients: async (clinicId: string): Promise<{
    page: number;
    items: {
      id: string;
      name: string;
      gender: number;
      dateOfBirth: string;
      socialSecurityNumber: string;
      address: string | null;
      job: string | null;
    }[];
    totalItems: number;
    totalPages: number;
  }> => {
    const response = await apiClient.get<{
      page: number;
      items: {
        id: string;
        name: string;
        gender: number;
        dateOfBirth: string;
        socialSecurityNumber: string;
        address: string | null;
        job: string | null;
      }[];
      totalItems: number;
      totalPages: number;
    }>(`/super-admin/clinic/${clinicId}/patients`);
    return response.data;
  },
};
