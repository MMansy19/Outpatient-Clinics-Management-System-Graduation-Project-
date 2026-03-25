import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.service';
import type {
  CreateVisitDto,
  CreateVisitResponse,
  CreateMedicationDto,
  CreateMedicationResponse,
  PaginationParams,
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
} from '@/lib/api/types';

// ============================================================================
// Query Keys
// ============================================================================

const adminKeys = {
  all: ['admin'] as const,
  patients: ['admin', 'patients'] as const,
  visits: ['admin', 'visits'] as const,
  patientVisits: (id: string) => ['admin', 'patient', id, 'visits'] as const,
  patientMedications: (id: string) => ['admin', 'patient', id, 'medications'] as const,
  patientLabs: (id: string) => ['admin', 'patient', id, 'labs'] as const,
  patientScans: (id: string) => ['admin', 'patient', id, 'scans'] as const,
  patientSearch: (ssn: string) => ['admin', 'patient', 'search', ssn] as const,
  clinicDoctors: ['admin', 'clinic', 'doctors'] as const,
  clinicPatients: ['admin', 'clinic', 'patients'] as const,
  clinicVisits: ['admin', 'clinic', 'visits'] as const,
};

// ============================================================================
// Admin's Own Patients & Visits
// ============================================================================

export const useAdminGetPatients = (
  params: PaginationParams
): UseQueryResult<AdminPaginatedPatientsResponse, Error> => {
  return useQuery({
    queryKey: [...adminKeys.patients, params.page, params.limit],
    queryFn: () => adminApi.getPatients(params),
    staleTime: 30 * 1000,
  });
};

export const useAdminGetVisits = (
  params: PaginationParams
): UseQueryResult<AdminPaginatedVisitsResponse, Error> => {
  return useQuery({
    queryKey: [...adminKeys.visits, params.page, params.limit],
    queryFn: () => adminApi.getVisits(params),
    staleTime: 30 * 1000,
  });
};

// ============================================================================
// Patient Search
// ============================================================================

export const useAdminSearchPatientBySSN = (
  socialSecurityNumber: string
): UseQueryResult<AdminPatientSearchResponse | null, Error> => {
  return useQuery({
    queryKey: adminKeys.patientSearch(socialSecurityNumber),
    queryFn: async () => {
      try {
        return await adminApi.searchPatientBySSN(socialSecurityNumber);
      } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status === 404 || axiosError?.response?.status === 500) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!socialSecurityNumber && socialSecurityNumber.length > 0,
    staleTime: 0,
    gcTime: 0,
  });
};

// ============================================================================
// Patient Data (Visits, Medications, Labs, Scans)
// ============================================================================

export const useAdminGetPatientVisits = (
  patientId: string
): UseQueryResult<AdminPatientVisitsResponse, Error> => {
  return useQuery({
    queryKey: adminKeys.patientVisits(patientId),
    queryFn: () => adminApi.getPatientVisits(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminGetPatientMedications = (
  patientId: string
): UseQueryResult<AdminPatientMedicationsResponse, Error> => {
  return useQuery({
    queryKey: adminKeys.patientMedications(patientId),
    queryFn: () => adminApi.getPatientMedications(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminGetPatientLabs = (
  patientId: string
): UseQueryResult<AdminPatientLabsResponse, Error> => {
  return useQuery({
    queryKey: adminKeys.patientLabs(patientId),
    queryFn: () => adminApi.getPatientLabs(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminGetPatientScans = (
  patientId: string
): UseQueryResult<AdminPatientScansResponse, Error> => {
  return useQuery({
    queryKey: adminKeys.patientScans(patientId),
    queryFn: () => adminApi.getPatientScans(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

// ============================================================================
// Create Mutations
// ============================================================================

export const useAdminCreateVisit = (): UseMutationResult<
  CreateVisitResponse,
  Error,
  CreateVisitDto | FormData
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminApi.createVisit(data),
    onSuccess: (_response, variables) => {
      const patientId =
        variables instanceof FormData
          ? (variables.get('patientId') as string)
          : variables.patientId;

      queryClient.invalidateQueries({ queryKey: adminKeys.visits });
      queryClient.invalidateQueries({ queryKey: adminKeys.patientVisits(patientId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.patients });
    },
  });
};

export const useAdminCreateMedication = (): UseMutationResult<
  CreateMedicationResponse,
  Error,
  CreateMedicationDto | FormData
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminApi.createMedication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useAdminCreateLab = (): UseMutationResult<unknown, Error, FormData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminApi.createLab(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

export const useAdminCreateScan = (): UseMutationResult<unknown, Error, FormData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => adminApi.createScan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
};

// ============================================================================
// Clinic Management
// ============================================================================

export const useAdminGetClinicDoctors = (
  params: PaginationParams
): UseQueryResult<AdminClinicDoctorsResponse, Error> => {
  return useQuery({
    queryKey: [...adminKeys.clinicDoctors, params.page, params.limit],
    queryFn: () => adminApi.getClinicDoctors(params),
    staleTime: 30 * 1000,
  });
};

export const useAdminGetClinicPatients = (
  params: PaginationParams
): UseQueryResult<AdminClinicPatientsResponse, Error> => {
  return useQuery({
    queryKey: [...adminKeys.clinicPatients, params.page, params.limit],
    queryFn: () => adminApi.getClinicPatients(params),
    staleTime: 30 * 1000,
  });
};

export const useAdminGetClinicVisits = (
  params: PaginationParams
): UseQueryResult<AdminClinicVisitsResponse, Error> => {
  return useQuery({
    queryKey: [...adminKeys.clinicVisits, params.page, params.limit],
    queryFn: () => adminApi.getClinicVisits(params),
    staleTime: 30 * 1000,
  });
};
