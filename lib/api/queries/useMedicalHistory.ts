import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { VisitWithRelations } from '@/types/entities/Visit';
import type { Lab } from '@/types/entities/Lab';
import type { Scan } from '@/types/entities/Scan';
import type { Medication } from '@/types/entities/Medication';
import { mockMedicalHistoryAPI } from '@/lib/api/mockData';

const USE_MOCK_DATA = true;
const HISTORY_KEY = ['medical-history'];

export const useGetPatientLabs = (patientId: number): UseQueryResult<Lab[], Error> => {
  return useQuery({
    queryKey: [...HISTORY_KEY, 'labs', patientId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockMedicalHistoryAPI.getPatientLabs(patientId);
      }
      const response = await apiClient.get<Lab[]>(`/doctor/medical-history/labs/${patientId}`);
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetPatientScans = (patientId: number): UseQueryResult<Scan[], Error> => {
  return useQuery({
    queryKey: [...HISTORY_KEY, 'scans', patientId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockMedicalHistoryAPI.getPatientScans(patientId);
      }
      const response = await apiClient.get<Scan[]>(`/doctor/medical-history/scans/${patientId}`);
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetPatientMedications = (patientId: number): UseQueryResult<Medication[], Error> => {
  return useQuery({
    queryKey: [...HISTORY_KEY, 'medications', patientId],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        return await mockMedicalHistoryAPI.getPatientMedications(patientId);
      }
      const response = await apiClient.get<Medication[]>(`/doctor/medical-history/medications/${patientId}`);
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

interface MedicalHistoryTimeline {
  visits: Array<{ date: Date; type: 'visit'; data: VisitWithRelations }>;
  labs: Array<{ date: Date; type: 'lab'; data: Lab }>;
  scans: Array<{ date: Date; type: 'scan'; data: Scan }>;
  medications: Array<{ date: Date; type: 'medication'; data: Medication }>;
}

export const useGetMedicalHistoryTimeline = (patientId: number): UseQueryResult<MedicalHistoryTimeline, Error> => {
  return useQuery({
    queryKey: [...HISTORY_KEY, 'timeline', patientId],
    queryFn: async () => {
      const response = await apiClient.get<MedicalHistoryTimeline>(`/doctor/medical-history/timeline/${patientId}`);
      return response.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};
