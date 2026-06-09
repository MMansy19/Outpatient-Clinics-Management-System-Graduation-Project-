import { apiClient } from './client';
import type {
  CreateVisitDto,
  CreateVisitResponse,
  CreateMedicationDto,
  CreateMedicationResponse,
} from './types';
import type {
  ScanNationalIdResponse,
} from '@/types/ocr';
import type { Lab } from '@/types/entities/Lab';
import type { Scan } from '@/types/entities/Scan';

/**
 * Doctor API Service
 * 
 * Handles all doctor-specific API operations including:
 * - Visit management (create, retrieve, update)
 * - Medication management (create, retrieve, update)
 * - Patient interactions
 * 
 * @module doctor.service
 * @see {@link docs/API/doctor.json} - OpenAPI specification
 * 
 * **Authentication Requirements:**
 * All endpoints require authentication with DOCTOR role.
 * The JWT token is automatically included via HTTP-only cookies.
 */

export const doctorApi = {
  /**
   * Check if Doctor service is running
   */
  isUp: async (): Promise<string> => {
    const response = await apiClient.get<string>('/doctor');
    return response.data;
  },

  // ============================================================================
  // OCR (National ID Scanning)
  // ============================================================================

  /**
   * Process National ID Card
   *
   * Uploads an image of a National ID card to the AI/OCR service for data extraction.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** POST /api/v1/ocr/process-id
   *
   * @param {string} imageBase64 - Base64 encoded image of National ID card
   * @returns {Promise<ScanNationalIdResponse>} Extracted data: FirstName, LastName, Location, socialSecurityNumber
   * @throws {AxiosError} When request fails (400, 422, 500)
   *
   * @example
   * ```typescript
   * const result = await doctorApi.processNationalId(imageBase64);
   * console.log(result.FirstName, result.LastName, result.socialSecurityNumber);
   * ```
   */
  processNationalId: async (imageBase64: string): Promise<ScanNationalIdResponse> => {
    // Convert base64 to Blob for file upload
    const byteCharacters = atob(imageBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const imageBlob = new Blob([byteArray], { type: 'image/jpeg' });

    // Create FormData for multipart file upload
    const formData = new FormData();
    formData.append('image', imageBlob, 'national-id.jpg');

    const response = await apiClient.post<ScanNationalIdResponse>(
      '/ocr/process-id',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // ============================================================================
  // Visit Management
  // ============================================================================

  /**
   * Create Visit
   * 
   * Creates a new patient visit record with diagnoses and treatment plan.
   * 
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** POST /api/v1/doctor/visit
   * 
   * @param {CreateVisitDto} data - Visit creation data
   * @param {string} data.diagnoses - Diagnoses and treatment plan
   * @param {string} data.patientId - Patient UUID from backend
   * @returns {Promise<CreateVisitResponse>} Visit creation confirmation with UUID
   * @throws {AxiosError} When request fails (401, 403, 400, 500)
   */
  createVisit: async (data: CreateVisitDto | FormData): Promise<CreateVisitResponse> => {
    const isFormData = data instanceof FormData;
    const response = await apiClient.post<CreateVisitResponse>(
      '/doctor/visit',
      data,
      {
        headers: isFormData
          ? {
              'Content-Type': 'multipart/form-data',
            }
          : undefined,
      }
    );
    return response.data;
  },

  /**
   * Get Patient Visits
   *
   * Retrieves all visits for a specific patient.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/patient/:id/visits
   *
   * @param {string} patientId - Patient global id (UUID)
   * @returns {Promise<Visit[]>} Array of patient visits
   * @throws {AxiosError} When request fails
   */
  getPatientVisits: async (patientId: string): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(
      `/doctor/patient/${patientId}/visits`
    );
    return response.data;
  },

  /**
   * Get Visit by ID
   * 
   * Retrieves detailed information for a specific visit.
   * 
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/visit/:visitId
   * 
   * @param {string} visitId - Visit UUID
   * @returns {Promise<Visit>} Visit details
   * @throws {AxiosError} When request fails or visit not found
   */
  getVisit: async (visitId: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/doctor/visit/${visitId}`);
    return response.data;
  },

  /**
   * Update Visit
   * 
   * Updates an existing visit record.
   * 
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** PATCH /api/v1/doctor/visit/:visitId
   * 
   * @param {string} visitId - Visit UUID
   * @param {Partial<CreateVisitDto>} data - Fields to update
   * @returns {Promise<any>} Updated visit
   * @throws {AxiosError} When request fails
   */
  updateVisit: async (
    visitId: string,
    data: Partial<CreateVisitDto>
  ): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(
      `/doctor/visit/${visitId}`,
      data
    );
    return response.data;
  },

  // ============================================================================
  // Medication Management
  // ============================================================================

  /**
   * Create Medication
   * 
   * Creates a new medication record for a patient.
   * 
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** POST /api/v1/doctor/medication
   * 
   * @param {CreateMedicationDto} data - Medication creation data
   * @param {string} data.name - Medication name (e.g., "Panadol")
   * @param {number} data.dosage - Dosage amount per administration
   * @param {number} data.period - Treatment period in days
   * @param {string} [data.comments] - Optional instructions or notes
   * @param {string} data.patientId - Patient social security number (14-digit National ID)
   * @returns {Promise<CreateMedicationResponse>} Medication creation confirmation
   * @throws {AxiosError} When request fails (401, 403, 400, 500)
   *
   * @example
   * ```typescript
   * const result = await doctorApi.createMedication({
   *   name: "Panadol",
   *   dosage: 2,
   *   period: 7,
   *   comments: "Can't be taken with an empty stomach",
   *   patientId: "30201011234567"
   * });
   * console.log(result.id); // Medication UUID
   * ```
   */
  createMedication: async (
    data: CreateMedicationDto | FormData
  ): Promise<CreateMedicationResponse> => {
    const isFormData = data instanceof FormData;
    const response = await apiClient.post<CreateMedicationResponse>(
      '/doctor/medication',
      data,
      {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : undefined,
      }
    );
    return response.data;
  },

  /**
   * Get Patient Medications
   *
   * Retrieves all medications prescribed to a specific patient.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/patient/:id/medications
   *
   * @param {string} patientId - Patient global id (UUID)
   * @returns {Promise<Medication[]>} Array of patient medications
   * @throws {AxiosError} When request fails
   *
   * @example
   * ```typescript
   * const medications = await doctorApi.getPatientMedications("29512011234567");
   * medications.forEach(med => console.log(`${med.name}: ${med.dosage}`));
   * ```
   */
  getPatientMedications: async (patientId: string): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(
      `/doctor/patient/${patientId}/medications`
    );
    return response.data;
  },

  /**
   * Get Medication by ID
   * 
   * Retrieves detailed information for a specific medication.
   * 
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/medication/:medicationId
   * 
   * @param {string} medicationId - Medication UUID
   * @returns {Promise<Medication>} Medication details
   * @throws {AxiosError} When request fails or medication not found
   */
  getMedication: async (medicationId: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(
      `/doctor/medication/${medicationId}`
    );
    return response.data;
  },

  /**
   * Update Medication
   * 
   * Updates an existing medication record.
   * 
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** PATCH /api/v1/doctor/medication/:medicationId
   * 
   * @param {string} medicationId - Medication UUID
   * @param {Partial<CreateMedicationDto>} data - Fields to update
   * @returns {Promise<any>} Updated medication
   * @throws {AxiosError} When request fails
   */
  updateMedication: async (
    medicationId: string,
    data: Partial<CreateMedicationDto>
  ): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(
      `/doctor/medication/${medicationId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete Medication (Soft Delete)
   * 
   * Marks a medication as deleted (soft delete).
   * 
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** DELETE /api/v1/doctor/medication/:medicationId
   * 
   * @param {string} medicationId - Medication UUID
   * @returns {Promise<void>} No content on success
   * @throws {AxiosError} When request fails
   */
  deleteMedication: async (medicationId: string): Promise<void> => {
    await apiClient.delete(`/doctor/medication/${medicationId}`);
  },

  // ============================================================================
  // Patient Search & Management (Doctor Context)
  // ============================================================================

  /**
   * Search Patients
   * 
   * Search for patients with various filters.
   * 
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/patients
   * 
   * @param {Object} filters - Search filters
   * @param {string} [filters.query] - Search term (name, national ID, etc.)
   * @param {string} [filters.nationalId] - Specific national ID
   * @returns {Promise<Patient[]>} Array of matching patients
   * @throws {AxiosError} When request fails
   */
  searchPatients: async (filters: {
    query?: string;
    nationalId?: string;
  }): Promise<unknown[]> => {
    const params = new URLSearchParams();
    if (filters.query) params.append('search', filters.query);
    if (filters.nationalId) params.append('national_id', filters.nationalId);

    const response = await apiClient.get<unknown[]>(
      `/doctor/patients?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get Patient Details
   *
   * Retrieves complete patient information.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/patients/:patientId
   *
   * @param {string} patientId - Patient UUID
   * @returns {Promise<Patient>} Complete patient details
   * @throws {AxiosError} When request fails or patient not found
   */
  getPatient: async (patientId: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/doctor/patients/${patientId}`);
    return response.data;
  },

  // ============================================================================
  // Get All Visits (for dashboard)
  // ============================================================================

  /**
   * Get All Visits
   *
   * Retrieves all visits for the authenticated doctor.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/visits
   *
   * @param {Object} params - Query parameters
   * @param {number} [params.page] - Page number (default: 1)
   * @param {number} [params.limit] - Items per page (default: 10)
   * @returns {Promise<any>} Paginated visits list
   * @throws {AxiosError} When request fails
   */
  getAllVisits: async (params?: { page?: number; limit?: number }): Promise<unknown> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<unknown>(`/doctor/visits?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get All Patients
   *
   * Retrieves all patients for the authenticated doctor.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/patients
   *
   * @returns {Promise<any[]>} Array of patients
   * @throws {AxiosError} When request fails
   */
  getAllPatients: async (): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(`/doctor/patients`);
    return response.data;
  },

  // ============================================================================
  // Lab Management
  // ============================================================================

  /**
   * Get Patient Labs
   *
   * Retrieves all lab records for a specific patient.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/patient/:id/labs
   *
   * @param {string} patientId - Patient global id (UUID)
   * @returns {Promise<any[]>} Array of patient labs
   * @throws {AxiosError} When request fails
   */
  getPatientLabs: async (patientId: string): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(
      `/doctor/patient/${patientId}/labs`
    );
    return response.data;
  },

  /**
   * Create Lab
   *
   * Creates a new lab record for a patient.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** POST /api/v1/doctor/lab
   *
   * @param {string} patientId - Patient global id (UUID)
   * @param {Object} data - Lab creation data
   * @param {string} data.name - Lab name
   * @param {string} data.comments - Lab comments
   * @param {File} [data.image] - Optional lab image
   * @returns {Promise<any>} Created lab details
   * @throws {AxiosError} When request fails
   */
  createLab: async (
    patientId: string,
    data: { name: string; comments: string; image?: File } | FormData
  ): Promise<unknown> => {
    const isFormData = data instanceof FormData;
    const payload =
      isFormData
        ? (() => {
            if (!data.has('patientId')) {
              data.append('patientId', patientId);
            }
            return data;
          })()
        : { ...data, patientId };

    const response = await apiClient.post<unknown>(
      '/doctor/lab',
      payload,
      {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : undefined,
      }
    );
    return response.data;
  },

  /**
   * Get Lab by ID
   *
   * Retrieves detailed information for a specific lab.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/lab/:labId
   *
   * @param {string} labId - Lab UUID
   * @returns {Promise<any>} Lab details
   * @throws {AxiosError} When request fails or lab not found
   */
  getLab: async (labId: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/doctor/lab/${labId}`);
    return response.data;
  },

  /**
   * Update Lab
   *
   * Updates an existing lab record.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** PATCH /api/v1/doctor/lab/:labId
   *
   * @param {string} labId - Lab UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<any>} Updated lab
   * @throws {AxiosError} When request fails
   */
  updateLab: async (labId: string, data: Partial<Lab>): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/doctor/lab/${labId}`, data);
    return response.data;
  },

  /**
   * Delete Lab (Soft Delete)
   *
   * Marks a lab as deleted (soft delete).
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** DELETE /api/v1/doctor/lab/:labId
   *
   * @param {string} labId - Lab UUID
   * @returns {Promise<void>} No content on success
   * @throws {AxiosError} When request fails
   */
  deleteLab: async (labId: string): Promise<void> => {
    await apiClient.delete(`/doctor/lab/${labId}`);
  },

  // ============================================================================
  // Scan Management
  // ============================================================================

  /**
   * Get Patient Scans
   *
   * Retrieves all scan records for a specific patient.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/patient/:id/scans
   *
   * @param {string} patientId - Patient global id (UUID)
   * @returns {Promise<any[]>} Array of patient scans
   * @throws {AxiosError} When request fails
   */
  getPatientScans: async (patientId: string): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(
      `/doctor/patient/${patientId}/scans`
    );
    return response.data;
  },

  /**
   * Create Scan
   *
   * Creates a new scan record for a patient.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** POST /api/v1/doctor/scan
   *
   * @param {string} patientId - Patient global id (UUID)
   * @param {Object} data - Scan creation data
   * @param {string} data.name - Scan name
   * @param {string} data.comments - Scan comments
   * @param {string} data.type - Scan type
   * @param {File} [data.image] - Optional scan image
   * @returns {Promise<any>} Created scan details
   * @throws {AxiosError} When request fails
   */
  createScan: async (
    patientId: string,
    data: { name: string; comments: string; type: string; image?: File } | FormData
  ): Promise<unknown> => {
    const isFormData = data instanceof FormData;
    const payload =
      isFormData
        ? (() => {
            if (!data.has('patientId')) {
              data.append('patientId', patientId);
            }
            return data;
          })()
        : { ...data, patientId };

    const response = await apiClient.post<unknown>(
      '/doctor/scan',
      payload,
      {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : undefined,
      }
    );
    return response.data;
  },

  /**
   * Get Scan by ID
   *
   * Retrieves detailed information for a specific scan.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/scan/:scanId
   *
   * @param {string} scanId - Scan UUID
   * @returns {Promise<any>} Scan details
   * @throws {AxiosError} When request fails or scan not found
   */
  getScan: async (scanId: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(`/doctor/scan/${scanId}`);
    return response.data;
  },

  /**
   * Update Scan
   *
   * Updates an existing scan record.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** PATCH /api/v1/doctor/scan/:scanId
   *
   * @param {string} scanId - Scan UUID
   * @param {Object} data - Fields to update
   * @returns {Promise<any>} Updated scan
   * @throws {AxiosError} When request fails
   */
  updateScan: async (scanId: string, data: Partial<Scan>): Promise<unknown> => {
    const response = await apiClient.patch<unknown>(`/doctor/scan/${scanId}`, data);
    return response.data;
  },

  /**
   * Delete Scan (Soft Delete)
   *
   * Marks a scan as deleted (soft delete).
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** DELETE /api/v1/doctor/scan/:scanId
   *
   * @param {string} scanId - Scan UUID
   * @returns {Promise<void>} No content on success
   * @throws {AxiosError} When request fails
   */
  deleteScan: async (scanId: string): Promise<void> => {
    await apiClient.delete(`/doctor/scan/${scanId}`);
  },
};

/**
 * Type Guards for Doctor API
 * 
 * Utility functions to validate API responses at runtime.
 */

export const isCreateVisitResponse = (
  obj: unknown
): obj is CreateVisitResponse => {
  const record = obj as Record<string, unknown>;
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof record.message === 'string' &&
    typeof record.id === 'string'
  );
};

export const isCreateMedicationResponse = (
  obj: unknown
): obj is CreateMedicationResponse => {
  const record = obj as Record<string, unknown>;
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof record.message === 'string' &&
    typeof record.id === 'string'
  );
};

/**
 * React Query Hook Examples
 * 
 * These are usage examples for implementing React Query hooks.
 * Actual implementations should be in lib/api/queries/
 * 
 * @example useCreateVisit
 * ```typescript
 * import { useMutation, useQueryClient } from '@tanstack/react-query';
 * import { doctorApi } from '@/lib/api/doctor.service';
 * 
 * export const useCreateVisit = () => {
 *   const queryClient = useQueryClient();
 *   
 *   return useMutation({
 *     mutationFn: doctorApi.createVisit,
 *     onSuccess: (data, variables) => {
 *       queryClient.invalidateQueries({ queryKey: ['visits', 'patient', variables.patientId] });
 *       queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
 *     },
 *   });
 * };
 * ```
 * 
 * @example useCreateMedication
 * ```typescript
 * import { useMutation, useQueryClient } from '@tanstack/react-query';
 * import { doctorApi } from '@/lib/api/doctor.service';
 * 
 * export const useCreateMedication = () => {
 *   const queryClient = useQueryClient();
 *   
 *   return useMutation({
 *     mutationFn: doctorApi.createMedication,
 *     onSuccess: (data, variables) => {
 *       queryClient.invalidateQueries({ queryKey: ['medications', 'patient', variables.patientId] });
 *       queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId] });
 *     },
 *   });
 * };
 * ```
 */
