'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useOfflineMutation } from '@/lib/offline/useOfflineMutation';
import { superAdminApi } from '@/lib/api/superAdmin.service';
import type {
  CreateClinicDto,
  UpdateClinicDto,
} from '@/lib/api/types';

// ============================================================================
// Super-Admin Offline-Aware Mutations
//
// Every super-admin create/update/delete call goes through
// `useOfflineMutation` so that, when offline, the action is queued in the
// IndexedDB mutation queue and replayed by `processSyncQueue` on reconnect.
//
// Online behaviour is identical to calling `superAdminApi.*` directly.
// Offline behaviour: the hook returns `{ offline: true, clientTempId }` and
// the relevant query keys are invalidated so optimistic updates can paint.
//
// Patient create / doctor create live in `useAuth.ts` since they hit the
// /auth/* endpoints; this file covers everything under /super-admin/*.
// ============================================================================

// ─── Clinic ──────────────────────────────────────────────────────────────────

export function useCreateClinic() {
  return useOfflineMutation<{ message: string; id: string }, CreateClinicDto>({
    mutationFn: (data) => superAdminApi.createClinic(data),
    offlineConfig: {
      type: 'createClinic',
      endpoint: '/super-admin/clinic',
      method: 'POST',
      getPayload: (data) => ({ ...data }),
    },
    invalidateKeys: [['clinics'], ['clinics-all']],
  });
}

export function useUpdateClinic() {
  return useOfflineMutation<
    { message: string },
    { id: string; data: UpdateClinicDto }
  >({
    mutationFn: ({ id, data }) => superAdminApi.updateClinic(id, data),
    offlineConfig: {
      type: 'updateClinic',
      endpoint: ({ id }) => `/super-admin/clinic/${id}`,
      method: 'PATCH',
      getPayload: ({ data }) => ({ ...data }),
    },
    invalidateKeys: [['clinics'], ['clinics-all']],
  });
}

export function useDeleteClinic() {
  return useOfflineMutation<{ message: string }, { id: string }>({
    mutationFn: ({ id }) => superAdminApi.deleteClinic(id),
    offlineConfig: {
      type: 'deleteClinic',
      endpoint: ({ id }) => `/super-admin/clinic/${id}`,
      method: 'DELETE',
      getPayload: () => ({}),
    },
    invalidateKeys: [['clinics'], ['clinics-all']],
  });
}

// ─── Doctor (update/delete only — create lives in /auth) ─────────────────────

export function useUpdateDoctor() {
  return useOfflineMutation<
    { message: string },
    {
      id: string;
      data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        speciality?: string;
      };
    }
  >({
    mutationFn: ({ id, data }) => superAdminApi.updateDoctor(id, data),
    offlineConfig: {
      type: 'updateDoctor',
      endpoint: ({ id }) => `/super-admin/doctor/${id}`,
      method: 'PATCH',
      getPayload: ({ data }) => ({ ...data }),
    },
    invalidateKeys: [['doctors-all']],
  });
}

export function useDeleteDoctor() {
  return useOfflineMutation<{ message: string }, { id: string }>({
    mutationFn: ({ id }) => superAdminApi.deleteDoctor(id),
    offlineConfig: {
      type: 'deleteDoctor',
      endpoint: ({ id }) => `/super-admin/doctor/${id}`,
      method: 'DELETE',
      getPayload: () => ({}),
    },
    invalidateKeys: [['doctors-all']],
  });
}

// ─── Patient (update only — create lives in /auth) ───────────────────────────

export function useSuperAdminUpdatePatient() {
  return useOfflineMutation<
    { message: string },
    {
      id: string;
      data: {
        firstName?: string;
        lastName?: string;
        job?: string;
        address?: string;
      };
    }
  >({
    mutationFn: ({ id, data }) => superAdminApi.updatePatient(id, data),
    offlineConfig: {
      type: 'updatePatient',
      endpoint: ({ id }) => `/super-admin/patient/${id}`,
      method: 'PATCH',
      getPayload: ({ data }) => ({ ...data }),
      getPatientId: ({ id }) => id,
    },
    invalidateKeys: [['patients-all']],
  });
}

// ─── Visit ───────────────────────────────────────────────────────────────────

interface CreateVisitVars {
  diagnoses?: string;
  patientId: string;
  clinicId: string;
  audio?: File;
}

export function useSuperAdminCreateVisit() {
  return useOfflineMutation<void, CreateVisitVars>({
    mutationFn: (data) => superAdminApi.createVisit(data),
    offlineConfig: {
      type: 'superAdminCreateVisit',
      endpoint: '/super-admin/visit',
      method: 'POST',
      getPayload: ({ diagnoses, patientId, clinicId }) => ({
        ...(diagnoses ? { diagnoses } : {}),
        patientId,
        clinicId,
      }),
      getBlobs: ({ audio }) =>
        audio
          ? [
              {
                fieldName: 'audio',
                blob: audio,
                fileName: audio.name,
                mimeType: audio.type || 'audio/webm',
              },
            ]
          : [],
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [['visits-all']],
  });
}

/** Specialised hook that also invalidates patient-scoped visit queries. */
export function useSuperAdminCreateVisitForPatient(patientId: string) {
  const queryClient = useQueryClient();
  const mutation = useSuperAdminCreateVisit();
  return {
    ...mutation,
    mutate: (vars: CreateVisitVars, opts?: Parameters<typeof mutation.mutate>[1]) => {
      mutation.mutate(vars, {
        ...opts,
        onSuccess: (data, variables, onMutateResult, context) => {
          queryClient.invalidateQueries({
            queryKey: ['super-admin-patient-visits', patientId],
          });
          opts?.onSuccess?.(data, variables, onMutateResult, context);
        },
      });
    },
  };
}

export function useSuperAdminUpdateVisit() {
  return useOfflineMutation<
    { message: string },
    { id: string; data: { diagnoses?: string }; patientId?: string }
  >({
    mutationFn: ({ id, data }) => superAdminApi.updateVisit(id, data),
    offlineConfig: {
      type: 'superAdminUpdateVisit',
      endpoint: ({ id }) => `/super-admin/visit/${id}`,
      method: 'PATCH',
      getPayload: ({ data }) => ({ ...data }),
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [['visits-all']],
  });
}

// ─── Medication ──────────────────────────────────────────────────────────────

interface CreateMedicationVars {
  name: string;
  dosage: number;
  period: number;
  comments?: string;
  audio?: File;
  patientId: string;
  clinicId: string;
}

export function useSuperAdminCreateMedication() {
  return useOfflineMutation<void, CreateMedicationVars>({
    mutationFn: (data) => superAdminApi.createMedication(data),
    offlineConfig: {
      type: 'superAdminCreateMedication',
      endpoint: '/super-admin/medication',
      method: 'POST',
      getPayload: ({ name, dosage, period, comments, patientId, clinicId }) => ({
        name,
        dosage: String(dosage),
        period: String(period),
        patientId,
        clinicId,
        ...(comments ? { comments } : {}),
      }),
      getBlobs: ({ audio }) =>
        audio
          ? [
              {
                fieldName: 'audio',
                blob: audio,
                fileName: audio.name,
                mimeType: audio.type || 'audio/webm',
              },
            ]
          : [],
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [],
  });
}

export function useSuperAdminUpdateMedication() {
  return useOfflineMutation<
    { message: string },
    {
      id: string;
      data: { name?: string; dosage?: string; period?: string; comments?: string };
      patientId?: string;
    }
  >({
    mutationFn: ({ id, data }) => superAdminApi.updateMedication(id, data),
    offlineConfig: {
      type: 'superAdminUpdateMedication',
      endpoint: ({ id }) => `/super-admin/medication/${id}`,
      method: 'PATCH',
      getPayload: ({ data }) => ({ ...data }),
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [],
  });
}

// ─── Lab ─────────────────────────────────────────────────────────────────────

interface CreateLabVars {
  name: string;
  image?: File;
  audio?: File;
  comments?: string;
  patientId: string;
  clinicId: string;
}

export function useSuperAdminCreateLab() {
  return useOfflineMutation<void, CreateLabVars>({
    mutationFn: (data) => superAdminApi.createLab(data),
    offlineConfig: {
      type: 'superAdminCreateLab',
      endpoint: '/super-admin/lab',
      method: 'POST',
      getPayload: ({ name, patientId, clinicId, comments }) => ({
        name,
        patientId,
        clinicId,
        ...(comments ? { comments } : {}),
      }),
      getBlobs: ({ image, audio }) => {
        const blobs: Array<{
          fieldName: string;
          blob: Blob;
          fileName: string;
          mimeType: string;
        }> = [];
        if (image) {
          blobs.push({
            fieldName: 'image',
            blob: image,
            fileName: image.name,
            mimeType: image.type || 'image/jpeg',
          });
        }
        if (audio) {
          blobs.push({
            fieldName: 'audio',
            blob: audio,
            fileName: audio.name,
            mimeType: audio.type || 'audio/webm',
          });
        }
        return blobs;
      },
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [],
  });
}

export function useSuperAdminUpdateLab() {
  return useOfflineMutation<
    { message: string },
    {
      id: string;
      data: { name?: string; photoUrl?: string; comments?: string };
      patientId?: string;
    }
  >({
    mutationFn: ({ id, data }) => superAdminApi.updateLab(id, data),
    offlineConfig: {
      type: 'superAdminUpdateLab',
      endpoint: ({ id }) => `/super-admin/lab/${id}`,
      method: 'PATCH',
      getPayload: ({ data }) => ({ ...data }),
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [],
  });
}

// ─── Scan ────────────────────────────────────────────────────────────────────

interface CreateScanVars {
  name: string;
  type: number;
  image?: File;
  audio?: File;
  comments?: string;
  patientId: string;
  clinicId: string;
}

export function useSuperAdminCreateScan() {
  return useOfflineMutation<void, CreateScanVars>({
    mutationFn: (data) => superAdminApi.createScan(data),
    offlineConfig: {
      type: 'superAdminCreateScan',
      endpoint: '/super-admin/scan',
      method: 'POST',
      getPayload: ({ name, type, patientId, clinicId, comments }) => ({
        name,
        type: String(type),
        patientId,
        clinicId,
        ...(comments ? { comments } : {}),
      }),
      getBlobs: ({ image, audio }) => {
        const blobs: Array<{
          fieldName: string;
          blob: Blob;
          fileName: string;
          mimeType: string;
        }> = [];
        if (image) {
          blobs.push({
            fieldName: 'image',
            blob: image,
            fileName: image.name,
            mimeType: image.type || 'image/jpeg',
          });
        }
        if (audio) {
          blobs.push({
            fieldName: 'audio',
            blob: audio,
            fileName: audio.name,
            mimeType: audio.type || 'audio/webm',
          });
        }
        return blobs;
      },
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [],
  });
}

export function useSuperAdminUpdateScan() {
  return useOfflineMutation<
    { message: string },
    {
      id: string;
      data: { name?: string; type?: number; photoUrl?: string; comments?: string };
      patientId?: string;
    }
  >({
    mutationFn: ({ id, data }) => superAdminApi.updateScan(id, data),
    offlineConfig: {
      type: 'superAdminUpdateScan',
      endpoint: ({ id }) => `/super-admin/scan/${id}`,
      method: 'PATCH',
      getPayload: ({ data }) => ({ ...data }),
      getPatientId: ({ patientId }) => patientId,
    },
    invalidateKeys: [],
  });
}

// ─── Helper: detect offline-queued result ────────────────────────────────────

export function isOfflineQueued<T>(
  result: T | { offline: true; clientTempId: string },
): result is { offline: true; clientTempId: string } {
  return (
    typeof result === 'object' &&
    result !== null &&
    (result as { offline?: boolean }).offline === true
  );
}
