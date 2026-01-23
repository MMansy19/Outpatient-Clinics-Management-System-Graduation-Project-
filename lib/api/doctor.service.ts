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
   * **Endpoint:** POST /api/v1/doctor/visit/create
   * 
   * @param {CreateVisitDto} data - Visit creation data
   * @param {string} data.diagnoses - Diagnoses and treatment plan
   * @param {string} data.patientId - Patient UUID from backend
   * @returns {Promise<CreateVisitResponse>} Visit creation confirmation with UUID
   * @throws {AxiosError} When request fails (401, 403, 400, 500)
   * 
   * @example
   * ```typescript
   * const result = await doctorApi.createVisit({
   *   diagnoses: "Common cold, 3 Days rest, Panadol 500 mg twice per day for 3 days",
   *   patientId: "0281ba4f-7592-477e-9d02-f2641aa89221"
   * });
   * console.log(result.id); // Visit UUID
   * ```
   */
  createVisit: async (data: CreateVisitDto): Promise<CreateVisitResponse> => {
    const response = await apiClient.post<CreateVisitResponse>(
      '/doctor/visit/create',
      data
    );
    return response.data;
  },

  /**
   * Get Patient Visits
   * 
   * Retrieves all visits for a specific patient.
   * 
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/visit/patient/:patientId
   * 
   * @param {string} patientId - Patient UUID
   * @returns {Promise<Visit[]>} Array of patient visits
   * @throws {AxiosError} When request fails
   * 
   * @example
   * ```typescript
   * const visits = await doctorApi.getPatientVisits("patient-uuid");
   * visits.forEach(visit => console.log(visit.diagnoses));
   * ```
   */
  getPatientVisits: async (patientId: string): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(
      `/doctor/visit/patient/${patientId}`
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
   * **Endpoint:** POST /api/v1/doctor/medication/create
   * 
   * @param {CreateMedicationDto} data - Medication creation data
   * @param {string} data.name - Medication name (e.g., "Panadol")
   * @param {number} data.dosage - Dosage amount per administration
   * @param {number} data.period - Treatment period in days
   * @param {string} [data.comments] - Optional instructions or notes
   * @param {string} data.patientId - Patient UUID
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
   *   patientId: "0281ba4f-7592-477e-9d02-f2641aa89221"
   * });
   * console.log(result.id); // Medication UUID
   * ```
   */
  createMedication: async (
    data: CreateMedicationDto
  ): Promise<CreateMedicationResponse> => {
    const response = await apiClient.post<CreateMedicationResponse>(
      '/doctor/medication/create',
      data
    );
    return response.data;
  },

  /**
   * Get Patient Medications
   *
   * Retrieves all medications prescribed to a specific patient.
   *
   * **Authentication Required:** Yes (DOCTOR role)
   * **Endpoint:** GET /api/v1/doctor/patient/:socialSecurityNumber/medications
   *
   * @param {string} socialSecurityNumber - Patient's 14-digit social security number
   * @returns {Promise<Medication[]>} Array of patient medications
   * @throws {AxiosError} When request fails
   *
   * @example
   * ```typescript
   * const medications = await doctorApi.getPatientMedications("29512011234567");
   * medications.forEach(med => console.log(`${med.name}: ${med.dosage}`));
   * ```
   */
  getPatientMedications: async (socialSecurityNumber: string): Promise<unknown[]> => {
    const response = await apiClient.get<unknown[]>(
      `/doctor/patient/${socialSecurityNumber}/medications`
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
