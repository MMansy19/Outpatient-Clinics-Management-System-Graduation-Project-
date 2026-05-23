import { apiClient } from './client';
import { Gender } from './types';
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
  getDoctors: async (
    params: PaginationParams & { includeDeleted?: boolean; onlyDeleted?: boolean } = { page: 1, limit: 10 },
  ): Promise<PaginatedDoctorsResponse> => {
    const { includeDeleted, onlyDeleted, ...pagination } = params;
    const response = await apiClient.get<PaginatedDoctorsResponse>('/super-admin/doctors', {
      params: { ...pagination, includeDeleted, onlyDeleted },
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
  getClinics: async (params?: { includeDeleted?: boolean }): Promise<ClinicResponse[]> => {
    const response = await apiClient.get<{
      items: ClinicResponse[];
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    }>('/super-admin/clinics', params as Record<string, unknown>);
    return response.data.items;
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

  /** DELETE /api/v1/super-admin/clinic/{id} — kept for service layer; not exposed in UI */
  deleteClinic: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/super-admin/clinic/${id}`);
    return response.data;
  },

  /** PATCH /api/v1/super-admin/clinic/{id}/restore */
  restoreClinic: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/clinic/${id}/restore`);
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Doctor Management
  // ──────────────────────────────────────────────────────────────────────────

  /** DELETE /api/v1/super-admin/doctor/{id} — kept for service layer; not exposed in UI */
  deleteDoctor: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/super-admin/doctor/${id}`);
    return response.data;
  },

  /** PATCH /api/v1/super-admin/doctor/{id}/restore */
  restoreDoctor: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/doctor/${id}/restore`);
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
    audio?: File;
  }): Promise<void> => {
    if (data.audio) {
      const formData = new FormData();
      if (data.diagnoses) formData.append('diagnoses', data.diagnoses);
      formData.append('patientId', data.patientId);
      formData.append('clinicId', data.clinicId);
      formData.append('audio', data.audio);
      await apiClient.post('/super-admin/visit', formData);
    } else {
      await apiClient.post('/super-admin/visit', data);
    }
  },

  /** POST /api/v1/super-admin/visit — with data refetch */
  createVisitAndRefetch: async (data: {
    diagnoses?: string;
    patientId: string;
    clinicId: string;
    audio?: File;
  }): Promise<{
    visits: {
      id: string;
      diagnoses: string;
      diagnosesAudioUrl: string | null;
      patientId: string;
      doctorId: string;
      doctorName?: string;
      clinicId?: string;
      clinicName?: string;
      createdAt: string;
    }[];
  }> => {
    if (data.audio) {
      const formData = new FormData();
      if (data.diagnoses) formData.append('diagnoses', data.diagnoses);
      formData.append('patientId', data.patientId);
      formData.append('clinicId', data.clinicId);
      formData.append('audio', data.audio);
      await apiClient.post('/super-admin/visit', formData);
    } else {
      await apiClient.post('/super-admin/visit', data);
    }
    const result = await superAdminApi.getPatientVisits(data.patientId);
    return JSON.parse(JSON.stringify(result));
  },

  /** PATCH /api/v1/super-admin/visit/{id} */
  updateVisit: async (id: string, data: { diagnoses?: string }): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/visit/${id}`, data);
    return response.data;
  },

  /** POST /api/v1/super-admin/medication */
  createMedication: async (data: {
    name: string;
    dosage: number;
    period: number;
    comments?: string;
    audio?: File;
    patientId: string;
    clinicId: string;
  }): Promise<void> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('dosage', String(data.dosage));
    formData.append('period', String(data.period));
    formData.append('patientId', data.patientId);
    formData.append('clinicId', data.clinicId);
    if (data.comments) formData.append('comments', data.comments);
    if (data.audio) formData.append('audio', data.audio);
    await apiClient.post('/super-admin/medication', formData);
  },

  /** POST /api/v1/super-admin/medication — with data refetch */
  createMedicationAndRefetch: async (data: {
    name: string;
    dosage: number;
    period: number;
    comments?: string;
    audio?: File;
    patientId: string;
    clinicId: string;
  }): Promise<{
    medications: {
      name: string;
      dosage: string;
      period: string;
      comments: string | null;
      commentsAudioUrl: string | null;
      doctor: { id?: string; name: string; speciality: string | null };
      createdAt: string;
    }[];
  }> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('dosage', String(data.dosage));
    formData.append('period', String(data.period));
    formData.append('patientId', data.patientId);
    formData.append('clinicId', data.clinicId);
    if (data.comments) formData.append('comments', data.comments);
    if (data.audio) formData.append('audio', data.audio);
    await apiClient.post('/super-admin/medication', formData);
    const result = await superAdminApi.getPatientMedications(data.patientId);
    return JSON.parse(JSON.stringify({ medications: result.medications }));
  },

  /** PATCH /api/v1/super-admin/medication/{id} */
  updateMedication: async (
    id: string,
    data: { name?: string; dosage?: string; period?: string; comments?: string },
  ): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/medication/${id}`, data);
    return response.data;
  },

  /** POST /api/v1/super-admin/lab */
  createLab: async (data: {
    name: string;
    image?: File;
    audio?: File;
    comments?: string;
    patientId: string;
    clinicId: string;
  }): Promise<void> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('patientId', data.patientId);
    formData.append('clinicId', data.clinicId);
    if (data.image) formData.append('image', data.image);
    if (data.audio) formData.append('audio', data.audio);
    if (data.comments) formData.append('comments', data.comments);
    await apiClient.post('/super-admin/lab', formData);
  },

  /** POST /api/v1/super-admin/lab — with data refetch */
  createLabAndRefetch: async (data: {
    name: string;
    image?: File;
    audio?: File;
    comments?: string;
    patientId: string;
    clinicId: string;
  }): Promise<{
    labs: {
      name: string;
      photoUrl: string;
      comments: string | null;
      commentsAudioUrl: string | null;
      doctor: { id?: string; name: string; speciality: string | null };
      createdAt: string;
    }[];
  }> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('patientId', data.patientId);
    formData.append('clinicId', data.clinicId);
    if (data.image) formData.append('image', data.image);
    if (data.audio) formData.append('audio', data.audio);
    if (data.comments) formData.append('comments', data.comments);
    await apiClient.post('/super-admin/lab', formData);
    const result = await superAdminApi.getPatientLabs(data.patientId);
    return JSON.parse(JSON.stringify({ labs: result.labs }));
  },

  /** PATCH /api/v1/super-admin/lab/{id} */
  updateLab: async (id: string, data: { name?: string; photoUrl?: string; comments?: string }): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/lab/${id}`, data);
    return response.data;
  },

  /** POST /api/v1/super-admin/scan */
  createScan: async (data: {
    name: string;
    type: number;
    image?: File;
    audio?: File;
    comments?: string;
    patientId: string;
    clinicId: string;
  }): Promise<void> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', String(data.type));
    formData.append('patientId', data.patientId);
    formData.append('clinicId', data.clinicId);
    if (data.image) formData.append('image', data.image);
    if (data.audio) formData.append('audio', data.audio);
    if (data.comments) formData.append('comments', data.comments);
    await apiClient.post('/super-admin/scan', formData);
  },

  /** POST /api/v1/super-admin/scan — with data refetch */
  createScanAndRefetch: async (data: {
    name: string;
    type: number;
    image?: File;
    audio?: File;
    comments?: string;
    patientId: string;
    clinicId: string;
  }): Promise<{
    scans: {
      name: string;
      type: string;
      photoUrl: string;
      comments: string | null;
      commentsAudioUrl: string | null;
      doctor: { id?: string; name: string; speciality: string | null };
      createdAt: string;
    }[];
  }> => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', String(data.type));
    formData.append('patientId', data.patientId);
    formData.append('clinicId', data.clinicId);
    if (data.image) formData.append('image', data.image);
    if (data.audio) formData.append('audio', data.audio);
    if (data.comments) formData.append('comments', data.comments);
    await apiClient.post('/super-admin/scan', formData);
    const result = await superAdminApi.getPatientScans(data.patientId);
    return JSON.parse(JSON.stringify({ scans: result.scans }));
  },

  /** PATCH /api/v1/super-admin/scan/{id} */
  updateScan: async (
    id: string,
    data: { name?: string; type?: number; photoUrl?: string; comments?: string },
  ): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(`/super-admin/scan/${id}`, data);
    return response.data;
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Patient Search & Queries
  // ──────────────────────────────────────────────────────────────────────────

  /** GET /api/v1/super-admin/patient-search/{socialSecurityNumber} */
  searchPatientBySSN: async (ssn: string): Promise<{
    id: string;
    name: string;
    gender: Gender;
    dateOfBirth: string;
    socialSecurityNumber: string;
    job: string | null;
    address: string | null;
    createdAt: string;
  }> => {
    const response = await apiClient.get<{
      id: string;
      name: string;
      gender: Gender;
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
    visits: {
      id: string;
      diagnoses: string;
      diagnosesAudioUrl: string | null;
      patientId: string;
      doctorId: string;
      doctorName?: string;
      clinicId?: string;
      clinicName?: string;
      createdAt: string;
    }[];
  }> => {
    const visitsResponse = await apiClient.get<{
      patient: { id: string; name: string; socialSecurityNumber: string; dateOfBirth: string; gender: number; address: string; job: string };
      clinics: {
        id: string;
        name: string;
        visits: {
          id?: string;
          doctor: { name: string; speciality: string };
          diagnoses: string;
          diagnosesAudioUrl: string | null;
          patientId?: string;
          doctorId?: string;
          clinicId?: string;
          createdAt: string;
        }[];
      }[];
    }>(`/super-admin/patient/${patientId}/visits`);

    // Extract visits from all clinics — doctor/clinic names come directly from backend
    // doctorId may be absent (backend doesn't include it), so we leave it empty string
    const visitResponseClinics = visitsResponse.data.clinics || [];
    const allVisits = [];
    for (const clinic of visitResponseClinics) {
      for (const visit of clinic.visits || []) {
        allVisits.push({
          id: visit.id || visit.createdAt,
          diagnoses: visit.diagnoses,
          diagnosesAudioUrl: visit.diagnosesAudioUrl,
          patientId: visit.patientId || patientId,
          doctorId: visit.doctorId || '',  // may be absent in backend response
          doctorName: visit.doctor?.name,
          clinicId: clinic.id,
          clinicName: clinic.name,
          createdAt: visit.createdAt,
        });
      }
    }

    return { visits: allVisits };
  },

  /** GET /api/v1/super-admin/patient/{id}/medications */
  getPatientMedications: async (patientId: string): Promise<{
    medications: {
      name: string;
      dosage: string;
      period: string;
      comments: string | null;
      commentsAudioUrl: string | null;
      doctor: { id: string; name: string; speciality: string | null };
      createdAt: string;
    }[];
  }> => {
    const response = await apiClient.get<{
      patient?: { id: string; name: string; gender: number; dateOfBirth: string; socialSecurityNumber: string; address: string | null; job: string | null };
      medications: {
        name: string;
        dosage: string;
        period: string;
        comments: string | null;
        commentsAudioUrl: string | null;
        doctor: { id?: string; name: string; speciality: string | null };
        createdAt: string;
      }[];
      page?: number;
      items?: unknown[];
      totalItems?: number;
      totalPages?: number;
    }>(`/super-admin/patient/${patientId}/medications`);
    const data = response.data as Record<string, unknown>;
    if (Array.isArray(data)) {
      return { medications: data as unknown[] };
    }
    if (Array.isArray(data['medications'])) {
      return { medications: data['medications'] as unknown[] };
    }
    return { medications: (data['items'] ?? []) as unknown[] };
  },

  /** GET /api/v1/super-admin/patient/{id}/labs */
  getPatientLabs: async (patientId: string): Promise<{
    labs: {
      name: string;
      photoUrl: string;
      comments: string | null;
      commentsAudioUrl: string | null;
      doctor: { id: string; name: string; speciality: string | null };
      createdAt: string;
    }[];
  }> => {
    const response = await apiClient.get<{
      patient?: { id: string; name: string; gender: number; dateOfBirth: string; socialSecurityNumber: string; address: string | null; job: string | null };
      labs: {
        name: string;
        photoUrl: string;
        comments: string | null;
        commentsAudioUrl: string | null;
        doctor: { id?: string; name: string; speciality: string | null };
        createdAt: string;
      }[];
      page?: number;
      items?: unknown[];
      totalItems?: number;
      totalPages?: number;
    }>(`/super-admin/patient/${patientId}/labs`);
    const data = response.data;
    if (Array.isArray(data)) {
      return { labs: data as typeof data extends (infer T)[] ? T : never };
    }
    if (Array.isArray(data.labs)) {
      return { labs: data.labs as typeof data.labs };
    }
    return { labs: (data.items ?? []) as typeof data extends { items: infer I } ? I : never };
  },

  /** GET /api/v1/super-admin/patient/{id}/scans */
  getPatientScans: async (patientId: string): Promise<{
    scans: {
      name: string;
      type: string;
      photoUrl: string;
      comments: string | null;
      commentsAudioUrl: string | null;
      doctor: { id: string; name: string; speciality: string | null };
      createdAt: string;
    }[];
  }> => {
    const response = await apiClient.get<{
      patient?: { id: string; name: string; gender: number; dateOfBirth: string; socialSecurityNumber: string; address: string | null; job: string | null };
      scans: {
        name: string;
        type: string;
        photoUrl: string;
        comments: string | null;
        commentsAudioUrl: string | null;
        doctor: { id?: string; name: string; speciality: string | null };
        createdAt: string;
      }[];
      page?: number;
      items?: unknown[];
      totalItems?: number;
      totalPages?: number;
    }>(`/super-admin/patient/${patientId}/scans`);
    const data = response.data;
    if (Array.isArray(data)) {
      return { scans: data as typeof data extends (infer T)[] ? T : never };
    }
    if (Array.isArray(data.scans)) {
      return { scans: data.scans as typeof data.scans };
    }
    return { scans: (data.items ?? []) as typeof data extends { items: infer I } ? I : never };
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
