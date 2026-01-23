import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { VisitWithRelations } from '@/types/entities/Visit';
import type { Lab } from '@/types/entities/Lab';
import type { Scan } from '@/types/entities/Scan';
import type { Medication } from '@/types/entities/Medication';
import { mockMedicalHistoryAPI } from '@/lib/api/mockData';

const USE_MOCK_DATA = true;
const HISTORY_KEY = ['medical-history'];

export const useGetPatientLabs = (socialSecurityNumber: string): UseQueryResult<Lab[], Error> => {
  return useQuery({
    queryKey: [...HISTORY_KEY, 'labs', socialSecurityNumber],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // For mock data, we'll use a mock ID (number)
        const mockPatientId = 1;
        return await mockMedicalHistoryAPI.getPatientLabs(mockPatientId);
      }
      // Backend endpoint: /doctor/patient/{socialSecurityNumber}/labs
      const response = await apiClient.get<Lab[]>(`/doctor/patient/${socialSecurityNumber}/labs`);
      return response.data;
    },
    enabled: !!socialSecurityNumber,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetPatientScans = (socialSecurityNumber: string): UseQueryResult<Scan[], Error> => {
  return useQuery({
    queryKey: [...HISTORY_KEY, 'scans', socialSecurityNumber],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // For mock data, we'll use a mock ID (number)
        const mockPatientId = 1;
        return await mockMedicalHistoryAPI.getPatientScans(mockPatientId);
      }
      // Backend endpoint: /doctor/patient/{socialSecurityNumber}/scans
      const response = await apiClient.get<Scan[]>(`/doctor/patient/${socialSecurityNumber}/scans`);
      return response.data;
    },
    enabled: !!socialSecurityNumber,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetPatientMedications = (socialSecurityNumber: string): UseQueryResult<Medication[], Error> => {
  return useQuery({
    queryKey: [...HISTORY_KEY, 'medications', socialSecurityNumber],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        // For mock data, we'll use a mock ID (number)
        const mockPatientId = 1;
        return await mockMedicalHistoryAPI.getPatientMedications(mockPatientId);
      }
      // Backend endpoint: /doctor/patient/{socialSecurityNumber}/medications
      const response = await apiClient.get<Medication[]>(`/doctor/patient/${socialSecurityNumber}/medications`);
      return response.data;
    },
    enabled: !!socialSecurityNumber,
    staleTime: 5 * 60 * 1000,
  });
};

interface MedicalHistoryTimeline {
  visits: Array<{ date: Date; type: 'visit'; data: VisitWithRelations }>;
  labs: Array<{ date: Date; type: 'lab'; data: Lab }>;
  scans: Array<{ date: Date; type: 'scan'; data: Scan }>;
  medications: Array<{ date: Date; type: 'medication'; data: Medication }>;
}

export const useGetMedicalHistoryTimeline = (socialSecurityNumber: string): UseQueryResult<MedicalHistoryTimeline, Error> => {
  return useQuery({
    queryKey: [...HISTORY_KEY, 'timeline', socialSecurityNumber],
    queryFn: async () => {
      // Backend endpoint: /doctor/patient/{socialSecurityNumber}/timeline
      const response = await apiClient.get<MedicalHistoryTimeline>(`/doctor/patient/${socialSecurityNumber}/timeline`);
      return response.data;
    },
    enabled: !!socialSecurityNumber,
    staleTime: 5 * 60 * 1000,
  });
};
