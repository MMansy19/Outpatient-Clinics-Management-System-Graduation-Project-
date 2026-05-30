import { useQuery, UseQueryResult, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { VisitWithRelations } from '@/types/entities/Visit';
import type { Lab } from '@/types/entities/Lab';
import type { Scan } from '@/types/entities/Scan';
import type { Medication } from '@/types/entities/Medication';
import { mockMedicalHistoryAPI } from '@/lib/api/mockData';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { upsertVisits, getVisitsByPatient, getPendingVisitCreates } from '@/lib/offline/visitCache';
import { upsertMedications, getMedicationsByPatient, getPendingMedicationCreates } from '@/lib/offline/medicationCache';
import { upsertLabs, getLabsByPatient, getPendingLabCreates } from '@/lib/offline/labCache';
import { upsertScans, getScansByPatient, getPendingScanCreates } from '@/lib/offline/scanCache';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const HISTORY_KEY = ['medical-history'];

export const useGetPatientLabs = (socialSecurityNumber: string): UseQueryResult<Lab[], Error> => {
  const { isOnline } = useNetworkStatus();
  return useQuery({
    queryKey: [...HISTORY_KEY, 'labs', socialSecurityNumber, isOnline ? 'online' : 'offline'],
    queryFn: async () => {
      if (!isOnline) {
        const [cached, pending] = await Promise.all([
          getLabsByPatient(socialSecurityNumber),
          getPendingLabCreates(socialSecurityNumber),
        ]);
        return [...pending, ...cached] as unknown as Lab[];
      }
      if (USE_MOCK_DATA) {
        return await mockMedicalHistoryAPI.getPatientLabs(socialSecurityNumber);
      }
      const response = await apiClient.get<Lab[]>(`/doctor/patient/${socialSecurityNumber}/labs`);
      try {
        await upsertLabs(response.data, socialSecurityNumber);
      } catch (e) {
        console.warn('[useMedicalHistory] upsertLabs failed (non-fatal):', e);
      }
      return response.data;
    },
    enabled: !!socialSecurityNumber,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const useGetPatientScans = (socialSecurityNumber: string): UseQueryResult<Scan[], Error> => {
  const { isOnline } = useNetworkStatus();
  return useQuery({
    queryKey: [...HISTORY_KEY, 'scans', socialSecurityNumber, isOnline ? 'online' : 'offline'],
    queryFn: async () => {
      if (!isOnline) {
        const [cached, pending] = await Promise.all([
          getScansByPatient(socialSecurityNumber),
          getPendingScanCreates(socialSecurityNumber),
        ]);
        return [...pending, ...cached] as unknown as Scan[];
      }
      if (USE_MOCK_DATA) {
        return await mockMedicalHistoryAPI.getPatientScans(socialSecurityNumber);
      }
      const response = await apiClient.get<Scan[]>(`/doctor/patient/${socialSecurityNumber}/scans`);
      try {
        await upsertScans(response.data, socialSecurityNumber);
      } catch (e) {
        console.warn('[useMedicalHistory] upsertScans failed (non-fatal):', e);
      }
      return response.data;
    },
    enabled: !!socialSecurityNumber,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

export const useGetPatientMedications = (socialSecurityNumber: string): UseQueryResult<Medication[], Error> => {
  const { isOnline } = useNetworkStatus();
  return useQuery({
    queryKey: [...HISTORY_KEY, 'medications', socialSecurityNumber, isOnline ? 'online' : 'offline'],
    queryFn: async () => {
      if (!isOnline) {
        const [cached, pending] = await Promise.all([
          getMedicationsByPatient(socialSecurityNumber),
          getPendingMedicationCreates(socialSecurityNumber),
        ]);
        return [...pending, ...cached] as unknown as Medication[];
      }
      if (USE_MOCK_DATA) {
        return await mockMedicalHistoryAPI.getPatientMedications(socialSecurityNumber);
      }
      const response = await apiClient.get<Medication[]>(`/doctor/patient/${socialSecurityNumber}/medications`);
      try {
        await upsertMedications(response.data, socialSecurityNumber);
      } catch (e) {
        console.warn('[useMedicalHistory] upsertMedications failed (non-fatal):', e);
      }
      return response.data;
    },
    enabled: !!socialSecurityNumber,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};

interface MedicalHistoryTimeline {
  visits: Array<{ date: Date; type: 'visit'; data: VisitWithRelations }>;
  labs: Array<{ date: Date; type: 'lab'; data: Lab }>;
  scans: Array<{ date: Date; type: 'scan'; data: Scan }>;
  medications: Array<{ date: Date; type: 'medication'; data: Medication }>;
}

/** Build a synthetic timeline from cached + pending offline rows. */
async function buildOfflineTimeline(socialSecurityNumber: string): Promise<MedicalHistoryTimeline> {
  const [
    visitsCached, visitsPending,
    labsCached, labsPending,
    scansCached, scansPending,
    medsCached, medsPending,
  ] = await Promise.all([
    getVisitsByPatient(socialSecurityNumber),
    getPendingVisitCreates(socialSecurityNumber),
    getLabsByPatient(socialSecurityNumber),
    getPendingLabCreates(socialSecurityNumber),
    getScansByPatient(socialSecurityNumber),
    getPendingScanCreates(socialSecurityNumber),
    getMedicationsByPatient(socialSecurityNumber),
    getPendingMedicationCreates(socialSecurityNumber),
  ]);

  const allVisits = [...visitsPending, ...visitsCached];
  const allLabs = [...labsPending, ...labsCached];
  const allScans = [...scansPending, ...scansCached];
  const allMeds = [...medsPending, ...medsCached];

  return {
    visits: allVisits.map((v) => ({ date: new Date(v.created_at), type: 'visit' as const, data: v as unknown as VisitWithRelations })),
    labs: allLabs.map((l) => ({ date: new Date(l.created_at), type: 'lab' as const, data: l as unknown as Lab })),
    scans: allScans.map((s) => ({ date: new Date(s.created_at), type: 'scan' as const, data: s as unknown as Scan })),
    medications: allMeds.map((m) => ({ date: new Date(m.created_at), type: 'medication' as const, data: m as unknown as Medication })),
  };
}

export const useGetMedicalHistoryTimeline = (socialSecurityNumber: string): UseQueryResult<MedicalHistoryTimeline, Error> => {
  const { isOnline } = useNetworkStatus();
  return useQuery({
    queryKey: [...HISTORY_KEY, 'timeline', socialSecurityNumber, isOnline ? 'online' : 'offline'],
    queryFn: async () => {
      if (!isOnline) {
        return buildOfflineTimeline(socialSecurityNumber);
      }
      const response = await apiClient.get<MedicalHistoryTimeline>(`/doctor/patient/${socialSecurityNumber}/timeline`);
      try {
        await Promise.all([
          upsertVisits(response.data?.visits?.map((x) => x.data) ?? [], socialSecurityNumber),
          upsertLabs(response.data?.labs?.map((x) => x.data) ?? [], socialSecurityNumber),
          upsertScans(response.data?.scans?.map((x) => x.data) ?? [], socialSecurityNumber),
          upsertMedications(response.data?.medications?.map((x) => x.data) ?? [], socialSecurityNumber),
        ]);
      } catch (e) {
        console.warn('[useMedicalHistory] timeline write-through failed (non-fatal):', e);
      }
      return response.data;
    },
    enabled: !!socialSecurityNumber,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};
