/**
 * API Type Definitions
 *
 * These types are derived from the OpenAPI schema (auth.json) and backend DTOs.
 * They ensure type safety when communicating with the CodeBlue backend.
 */

// ============================================================================
// Enums
// ============================================================================

export enum Language {
  ARABIC = 0,
  ENGLISH = 1,
}

export enum Role {
  SUPER_ADMIN = 0,
  DOCTOR = 1,
  PATIENT = 2,
}

export enum Gender {
  MALE = 0,
  FEMALE = 1,
}

// ============================================================================
// Authentication DTOs
// ============================================================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  name: string;
  language: Language;
  role: Role;
  /**
   * Clinic ID to scope doctor actions to their clinic.
   */
  clinicId?: string;
}

// ============================================================================
// User Creation DTOs
// ============================================================================

export interface CreateDoctorDto {
  firstName: string;
  lastName: string;
  language: Language;
  socialSecurityNumber: string; // 14 digits
  email: string;
  phone: string;
  password: string; // Minimum 8 characters
  speciality: string;
  clinicId: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  language: Language;
  socialSecurityNumber: string; // 14 digits
  address?: string;
  job?: string;
  gender?: 'male' | 'female';
  birthdate?: string; // ISO date string
}

export interface CreateUserResponse {
  message: string;
  id: string; // globalId (UUID)
  socialSecurityNumber?: string; // 14-digit national ID
}

// ============================================================================
// User Entities (from backend)
// ============================================================================

export interface User {
  id: number;
  globalId: string;
  firstName: string;
  lastName: string;
  role: Role;
  gender: Gender;
  language: Language;
  dateOfBirth: Date;
  socialSecurityNumber: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isDeleted: boolean;
}

export interface Doctor extends User {
  email: string;
  phone: string;
  speciality: string;
  isApproved: boolean;
}

export interface Patient extends User {
  address?: string;
  job?: string;
}

// ============================================================================
// API Error Response
// ============================================================================

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// ============================================================================
// Doctor API DTOs
// ============================================================================

/**
 * Create Visit DTO
 * @see {@link docs/API/doctor.json} - OpenAPI specification
 */
export interface CreateVisitDto {
  diagnoses: string;
  patientId: string; // UUID format
  clinicId?: string; // Optional - backend reads from JWT for doctor
}

export interface CreateVisitResponse {
  message: string;
  id: string; // Visit globalId (UUID)
}

/**
 * Create Medication DTO
 * @see {@link docs/API/doctor.json} - OpenAPI specification
 */
export interface CreateMedicationDto {
  name: string;
  dosage: string;
  period: string;
  comments?: string;
  patientId: string; // Patient global id (UUID)
}

export interface CreateMedicationResponse {
  message: string;
  id: string; // Medication globalId (UUID)
}

// ============================================================================
// JWT Payload (for reference - not directly accessible in frontend)
// ============================================================================

export interface JwtPayload {
  sub: number; // User ID
  globalId: string;
  socialSecurityNumber: string;
  role: Role;
  iat?: number; // Issued at
  exp?: number; // Expiration
  iss?: string; // Issuer
  aud?: string; // Audience
}

// ============================================================================
// Pagination
// ============================================================================

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

// ============================================================================
// Admin API Response Types
// ============================================================================

/**
 * Doctor Response (from admin endpoint)
 */
export interface DoctorResponse {
  id: string;
  phone: string;
  email: string;
  speciality: string;
  isApproved: boolean;
  isDeleted?: boolean;
  user: {
    id: string;
    socialSecurityNumber: string;
    gender: Gender;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO date string
  };
}

/**
 * Patient Response (from admin endpoint)
 */
export interface PatientResponse {
  id: string;
  address: string;
  job: string;
  user: {
    id: string;
    socialSecurityNumber: string;
    gender: Gender;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO date string
  };
}

/**
 * Visit Response (from admin endpoint)
 * Updated to include audio diagnosis URL
 */
export interface VisitResponse {
  id: string;
  diagnoses: string;
  diagnosesAudioUrl?: string;
  patientId: string;
  doctorId: string;
  patientName?: string;
  doctorName?: string;
  createdAt: string; // ISO date string
  patientID: string;
  doctorID: string;
}

/**
 * Clinic Response
 */
export interface ClinicResponse {
  id: string;
  name: string;
  speciality: string;
  createdAt?: string; // ISO date string
  deletedAt?: string | null;
  isDeleted?: boolean;
}

/**
 * Paginated Doctors Response
 */
export interface PaginatedDoctorsResponse {
  page: number;
  items: DoctorResponse[];
  totalItems: number;
  totalPages: number;
}

/**
 * Paginated Patients Response
 */
export interface PaginatedPatientsResponse {
  page: number;
  items: PatientResponse[];
  totalItems: number;
  totalPages: number;
}

/**
 * Paginated Visits Response
 */
export interface PaginatedVisitsResponse {
  page: number;
  items: VisitResponse[];
  totalItems: number;
  totalPages: number;
}

/**
 * Super Admin Visit Item (nested patient/doctor objects from backend)
 */
export interface SuperAdminVisitItem {
  id: string;
  diagnoses: string;
  diagnosesAudioUrl: string | null;
  patient: {
    id: string;
    name: string;
  };
  doctor: {
    id: string;
    name: string;
  };
  clinic: {
    id: string;
    name: string;
  };
  createdAt: Date; // ISO date string
}

/**
 * Super Admin Paginated Visits Response
 */
export interface SuperAdminPaginatedVisitsResponse {
  page: number;
  items: SuperAdminVisitItem[];
  totalItems: number;
  totalPages: number;
}

// ============================================================================
// Update DTOs
// ============================================================================

/**
 * Update Patient DTO
 */
export interface UpdatePatientDto {
  firstName?: string;
  lastName?: string;
  job?: string;
  address?: string;
}

/**
 * Update Patient Response
 */
export interface UpdatePatientResponse {
  message: string;
}

/**
 * Create Clinic DTO
 */
export interface CreateClinicDto {
  name: string;
  speciality: string;
}

/**
 * Update Clinic DTO
 */
export interface UpdateClinicDto {
  name?: string;
  speciality?: string;
}

/**
 * Doctor By ID Response
 */
export interface DoctorByIdResponse {
  id: string;
  phone: string;
  email: string;
  speciality: string;
  isApproved: boolean;
  socialSecurityNumber: string;
  gender: Gender;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  createdAt?: string; // ISO date string
  clinic?: {
    id: string;
    name: string;
  };
}

/**
 * Patient By ID Response
 */
export interface PatientByIdResponse {
  id: string;
  address: string;
  job: string;
  socialSecurityNumber: string;
  gender: Gender;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  createdAt?: string; // ISO date string
}

/**
 * Enhanced Visit Response with populated names and audio URL
 */
export interface EnhancedVisitResponse extends VisitResponse {
  patientName?: string;
  doctorName?: string;
}

export interface UpdateVisitDto {
  diagnoses?: string;
  clinicId?: string;
}

