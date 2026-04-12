import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.service';
import { useAuthStore } from '@/stores/authStore';
import type {
  AdminClinicInfoResponse,
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
  clinic: ['admin', 'clinic'] as const,
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

/** Fetch the admin's clinic name and id (GET /admin/clinic) */
export const useAdminGetClinic = (
  enabled = true
): UseQueryResult<AdminClinicInfoResponse, Error> => {
  return useQuery({
    queryKey: adminKeys.clinic,
    queryFn: () => adminApi.getClinic(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};

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
        return await adminApi.getPatientBySSN(socialSecurityNumber);
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

      const diagnoses =
        variables instanceof FormData
          ? (variables.get('diagnoses') as string)
          : variables.diagnoses;

      const adminName = useAuthStore.getState().user?.name ?? '';
      const clinicInfo = queryClient.getQueryData<AdminClinicInfoResponse>(adminKeys.clinic);

      const newVisit = {
        doctor: { name: adminName, speciality: '' },
        diagnosesAudioUrl: null,
        diagnoses,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<AdminPatientVisitsResponse>(
        adminKeys.patientVisits(patientId),
        (old) => {
          if (!old) return old;
          const clinicId = clinicInfo?.id ?? 'unknown';
          const clinicName = clinicInfo?.name ?? '';
          const clinics = old.clinics.map((c) => ({ ...c, visits: [...c.visits] }));
          const existing = clinics.find((c) => c.id === clinicId);
          if (existing) {
            existing.visits.unshift(newVisit);
          } else {
            clinics.unshift({ id: clinicId, name: clinicName, visits: [newVisit] });
          }
          return { ...old, clinics };
        },
      );
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
    onSuccess: (_response, variables) => {
      const isFormData = variables instanceof FormData;
      const patientId = isFormData
        ? (variables.get('patientId') as string)
        : variables.patientId;
      const name = isFormData ? (variables.get('name') as string) : variables.name;
      const dosage = isFormData ? (variables.get('dosage') as string) : variables.dosage;
      const period = isFormData ? (variables.get('period') as string) : variables.period;
      const comments = isFormData
        ? (variables.get('comments') as string | null)
        : variables.comments ?? null;

      const adminName = useAuthStore.getState().user?.name ?? '';

      const newMedication = {
        name,
        dosage,
        period,
        comments,
        commentsAudioUrl: null,
        doctor: { id: '', name: adminName, speciality: '' },
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<AdminPatientMedicationsResponse>(
        adminKeys.patientMedications(patientId),
        (old) => {
          if (!old) return old;
          return { ...old, medications: [newMedication, ...old.medications] };
        },
      );
    },
  });
};

export const useAdminCreateLab = (): UseMutationResult<unknown, Error, FormData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      const patientId = data.get('patientId') as string;
      return adminApi.createLab(patientId, data);
    },
    onSuccess: (_response, variables) => {
      const patientId = variables.get('patientId') as string;
      const name = variables.get('name') as string;
      const comments = variables.get('comments') as string | null;
      const adminName = useAuthStore.getState().user?.name ?? '';

      const newLab = {
        name,
        photoUrl: '',
        comments,
        commentsAudioUrl: null,
        doctor: { id: '', name: adminName, speciality: '' },
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<AdminPatientLabsResponse>(
        adminKeys.patientLabs(patientId),
        (old) => {
          if (!old) return old;
          return { ...old, labs: [newLab, ...old.labs] };
        },
      );
    },
  });
};

export const useAdminCreateScan = (): UseMutationResult<unknown, Error, FormData> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => {
      const patientId = data.get('patientId') as string;
      return adminApi.createScan(patientId, data);
    },
    onSuccess: (_response, variables) => {
      const patientId = variables.get('patientId') as string;
      const name = variables.get('name') as string;
      const type = variables.get('type') as string;
      const comments = variables.get('comments') as string | null;
      const adminName = useAuthStore.getState().user?.name ?? '';

      const newScan = {
        name,
        type,
        photoUrl: '',
        comments,
        commentsAudioUrl: null,
        doctor: { id: '', name: adminName, speciality: '' },
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<AdminPatientScansResponse>(
        adminKeys.patientScans(patientId),
        (old) => {
          if (!old) return old;
          return { ...old, scans: [newScan, ...old.scans] };
        },
      );
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
