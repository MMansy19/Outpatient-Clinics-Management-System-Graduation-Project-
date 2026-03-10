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
  CreateVisitDto,
  CreateVisitResponse,
  CreateMedicationDto,
  CreateMedicationResponse,
} from './types';
import type { Lab } from '@/types/entities/Lab';
import type { Scan } from '@/types/entities/Scan';

/**
 * Super Admin API Service
 * 
 * Handles all super-admin-related API calls for managing doctors, patients, visits, and clinics.
 */

export const adminApi = {
  /**
   * Check if Super Admin service is running
   */
  isUp: async (): Promise<string> => {
    const response = await apiClient.get<string>('/super-admin');
    return response.data;
  },

  /**
   * Get all doctors with pagination
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated list of doctors
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
   * Get all patients with pagination
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated list of patients
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
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated list of visits
   */
  getVisits: async (params: PaginationParams): Promise<PaginatedVisitsResponse> => {
    const response = await apiClient.get<PaginatedVisitsResponse>('/super-admin/visits', {
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
    const response = await apiClient.get<DoctorByIdResponse>(`/super-admin/doctor/${id}`);
    return response.data;
  },

  /**
   * Get patient by ID
   * 
   * @param id - Patient ID 
   * @returns Patient details
   */
  getPatientById: async (id: string): Promise<PatientByIdResponse> => {
    const response = await apiClient.get<PatientByIdResponse>(`/super-admin/patient/${id}`);
    return response.data;
  },

  /**
   * Get all clinics
   * 
   * @returns List of all clinics
   */
  getClinics: async (): Promise<ClinicResponse[]> => {
    const response = await apiClient.get<ClinicResponse[]>('/super-admin/clinics');
    return response.data;
  },

  /**
   * Create a new clinic
   * 
   * @param data - Clinic data (name, speciality)
   * @returns Success message with clinic ID
   */
  createClinic: async (data: CreateClinicDto): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post<{ message: string; id: string }>('/super-admin/clinic', data);
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
    const response = await apiClient.patch<{ message: string }>(`/super-admin/clinic/${id}`, data);
    return response.data;
  },

  /**
   * Delete a clinic
   * 
   * @param id - Clinic ID (UUID)
   * @returns Success message
   */
  deleteClinic: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(`/super-admin/clinic/${id}`);
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
    const response = await apiClient.patch<{ message: string }>(`/super-admin/patient/${id}`, data);
    return response.data;
  },

  // ============================================================================
  // Super Admin - Clinic Doctor Management
  // ============================================================================

  /**
   * Get doctors in a specific clinic
   *
   * @param params - Pagination parameters with clinicId
   * @returns Paginated list of doctors in the clinic
   * @see docs/16-2-2026.md - GET /api/v1/super-admin/clinic/doctors
   */
  getClinicDoctors: async (params: PaginationParams): Promise<PaginatedDoctorsResponse> => {
    const response = await apiClient.get<PaginatedDoctorsResponse>('/super-admin/clinic/doctors', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Create a new doctor (Super Admin)
   *
   * Super Admin can create doctors assigned to a clinic.
   *
   * @param data - Doctor creation data
   * @returns Success message with doctor ID
   * @see docs/16-2-2026.md - POST /api/v1/super-admin/doctor
   */
  createDoctor: async (data: {
    firstName: string;
    lastName: string;
    language: number;
    socialSecurityNumber: string;
    email: string;
    phone: string;
    password: string;
    speciality: string;
    clinicId: string;
  }): Promise<{ message: string; id: string }> => {
    const response = await apiClient.post<{ message: string; id: string }>('/super-admin/doctor', data);
    return response.data;
  },

  // ============================================================================
  // Super Admin - Clinic-scoped Patient Management
  // ============================================================================

  /**
   * Get all patients in a clinic (paginated)
   *
   * @param params - Pagination parameters
   * @returns Paginated list of patients in the clinic
   * @see GET /api/v1/super-admin/clinic/patients
   */
  getClinicPatients: async (params: PaginationParams): Promise<PaginatedPatientsResponse> => {
    const response = await apiClient.get<PaginatedPatientsResponse>('/super-admin/clinic/patients', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Get all visits in a clinic (paginated)
   *
   * @param params - Pagination parameters
   * @returns Paginated list of visits in the clinic
   * @see GET /api/v1/super-admin/clinic/visits
   */
  getClinicVisits: async (params: PaginationParams): Promise<PaginatedVisitsResponse> => {
    const response = await apiClient.get<PaginatedVisitsResponse>('/super-admin/clinic/visits', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  // ============================================================================
  // Super Admin - Patient Visit Management
  // ============================================================================

  /**
   * Create Visit
   *
   * Creates a new patient visit record with diagnoses and treatment plan.
   *
   * @param data - Visit creation data
   * @returns Visit creation confirmation with UUID
   * @see docs/16-2-2026.md - POST /api/v1/super-admin/visit
   */
  createVisit: async (data: CreateVisitDto): Promise<CreateVisitResponse> => {
    const response = await apiClient.post<CreateVisitResponse>('/super-admin/visit', data);
    return response.data;
  },

  /**
   * Get Patient Visits
   *
   * Retrieves all visits for a specific patient.
   *
   * @param patientId - Patient's UUID (globalId)
   * @returns Array of patient visits
   * @see docs/16-2-2026.md - GET /api/v1/super-admin/patient/:id/visits
   */
  getPatientVisits: async (patientId: string): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(`/super-admin/patient/${patientId}/visits`);
    return response.data;
  },

  // ============================================================================
  // Super Admin - Patient Medication Management
  // ============================================================================

  /**
   * Create Medication
   *
   * Creates a new medication record for a patient.
   *
   * @param data - Medication creation data
   * @returns Medication creation confirmation
   * @see docs/16-2-2026.md - POST /api/v1/super-admin/medication
   */
  createMedication: async (
    data: CreateMedicationDto
  ): Promise<CreateMedicationResponse> => {
    const response = await apiClient.post<CreateMedicationResponse>('/super-admin/medication', data);
    return response.data;
  },

  /**
   * Get Patient Medications
   *
   * Retrieves all medications prescribed to a specific patient.
   *
   * @param patientId - Patient's UUID (globalId)
   * @returns Array of patient medications
   * @see docs/16-2-2026.md - GET /api/v1/super-admin/patient/:id/medications
   */
  getPatientMedications: async (patientId: string): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(`/super-admin/patient/${patientId}/medications`);
    return response.data;
  },

  /**
   * Get Medication by ID
   *
   * @param medicationId - Medication UUID
   * @returns Medication details
   */
  getMedication: async (medicationId: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/super-admin/medication/${medicationId}`);
    return response.data;
  },

  /**
   * Update Medication
   *
   * @param medicationId - Medication UUID
   * @param data - Fields to update
   * @returns Updated medication
   */
  updateMedication: async (
    medicationId: string,
    data: Partial<CreateMedicationDto>
  ): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/super-admin/medication/${medicationId}`, data);
    return response.data;
  },

  /**
   * Delete Medication (Soft Delete)
   *
   * @param medicationId - Medication UUID
   */
  deleteMedication: async (medicationId: string): Promise<void> => {
    await apiClient.delete(`/super-admin/medication/${medicationId}`);
  },

  // ============================================================================
  // Super Admin - Patient Lab Management
  // ============================================================================

  /**
   * Get Patient Labs
   *
   * Retrieves all lab records for a specific patient.
   *
   * @param patientId - Patient's UUID (globalId)
   * @returns Array of patient labs
   * @see docs/16-2-2026.md - GET /api/v1/super-admin/patient/:id/labs
   */
  getPatientLabs: async (patientId: string): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(`/super-admin/patient/${patientId}/labs`);
    return response.data;
  },

  /**
   * Create Lab
   *
   * Creates a new lab record for a patient.
   *
   * @param patientId - Patient's UUID (globalId)
   * @param data - Lab creation data
   * @returns Created lab details
   * @see docs/16-2-2026.md - POST /api/v1/super-admin/lab
   */
  createLab: async (
    patientId: string,
    data: { name: string; comments: string; image?: File; patientId?: string } | FormData
  ): Promise<unknown> => {
    const isFormData = data instanceof FormData;
    // Add patientId to the data if not using FormData
    const payload = isFormData ? data : { ...data, patientId };
    const response = await apiClient.post<unknown>('/super-admin/lab', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  /**
   * Get Lab by ID
   *
   * @param labId - Lab UUID
   * @returns Lab details
   */
  getLab: async (labId: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/super-admin/lab/${labId}`);
    return response.data;
  },

  /**
   * Update Lab
   *
   * @param labId - Lab UUID
   * @param data - Fields to update
   * @returns Updated lab
   */
  updateLab: async (labId: string, data: Partial<Lab>): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/super-admin/lab/${labId}`, data);
    return response.data;
  },

  /**
   * Delete Lab (Soft Delete)
   *
   * @param labId - Lab UUID
   */
  deleteLab: async (labId: string): Promise<void> => {
    await apiClient.delete(`/super-admin/lab/${labId}`);
  },

  // ============================================================================
  // Super Admin - Patient Scan Management
  // ============================================================================

  /**
   * Get Patient Scans
   *
   * Retrieves all scan records for a specific patient.
   *
   * @param patientId - Patient's UUID (globalId)
   * @returns Array of patient scans
   * @see docs/16-2-2026.md - GET /api/v1/super-admin/patient/:id/scans
   */
  getPatientScans: async (patientId: string): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(`/super-admin/patient/${patientId}/scans`);
    return response.data;
  },

  /**
   * Create Scan
   *
   * Creates a new scan record for a patient.
   *
   * @param patientId - Patient's UUID (globalId)
   * @param data - Scan creation data
   * @returns Created scan details
   * @see docs/16-2-2026.md - POST /api/v1/super-admin/scan
   */
  createScan: async (
    patientId: string,
    data: { name: string; comments: string; type: string; image?: File; patientId?: string } | FormData
  ): Promise<unknown> => {
    const isFormData = data instanceof FormData;
    // Add patientId to the data if not using FormData
    const payload = isFormData ? data : { ...data, patientId };
    const response = await apiClient.post<unknown>('/super-admin/scan', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  /**
   * Get Scan by ID
   *
   * @param scanId - Scan UUID
   * @returns Scan details
   */
  getScan: async (scanId: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/super-admin/scan/${scanId}`);
    return response.data;
  },

  /**
   * Update Scan
   *
   * @param scanId - Scan UUID
   * @param data - Fields to update
   * @returns Updated scan
   */
  updateScan: async (scanId: string, data: Partial<Scan>): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/super-admin/scan/${scanId}`, data);
    return response.data;
  },

  /**
   * Delete Scan (Soft Delete)
   *
   * @param scanId - Scan UUID
   */
  deleteScan: async (scanId: string): Promise<void> => {
    await apiClient.delete(`/super-admin/scan/${scanId}`);
  },

  // ============================================================================
  // Super Admin - Patient Search
  // ============================================================================

  /**
   * Search Patient by SSN
   *
   * Search for a patient by social security number.
   *
   * @param socialSecurityNumber - Patient's 14-digit SSN
   * @returns Patient details
   * @see docs/16-2-2026.md - GET /api/v1/super-admin/patient/:socialSecurityNumber
   */
  getPatientBySSN: async (socialSecurityNumber: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/super-admin/patient/${socialSecurityNumber}`);
    return response.data;
  },
};