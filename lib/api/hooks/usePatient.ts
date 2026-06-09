import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientApi } from '../patient.service';
import {
  mockPatientProfile,
  mockPatientHistory,
  mockPatientStats,
  mockPatientAppointments,
  generateMockQRToken,
} from '../mock/patient.mock';
import type { PatientByIdResponse } from '../types';

const USE_MOCK_DATA = true;

export function useGetPatientProfile() {
  return useQuery({
    queryKey: ['patient', 'profile'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockPatientProfile;
      }
      return patientApi.getProfile();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdatePatientProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<PatientByIdResponse>) => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { message: 'Profile updated successfully' };
      }
      return patientApi.updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', 'profile'] });
    },
  });
}

export function useGetMedicalHistory() {
  return useQuery({
    queryKey: ['patient', 'history'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockPatientHistory;
      }
      return patientApi.getMedicalHistory();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetPatientVisits() {
  return useQuery({
    queryKey: ['patient', 'visits'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockPatientHistory.visits;
      }
      return patientApi.getVisits();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetPatientMedications() {
  return useQuery({
    queryKey: ['patient', 'medications'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockPatientHistory.medications;
      }
      return patientApi.getMedications();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetPatientLabs() {
  return useQuery({
    queryKey: ['patient', 'labs'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockPatientHistory.labs;
      }
      return patientApi.getLabs();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetPatientScans() {
  return useQuery({
    queryKey: ['patient', 'scans'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockPatientHistory.scans;
      }
      return patientApi.getScans();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetPatientStats() {
  return useQuery({
    queryKey: ['patient', 'stats'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockPatientStats;
      }
      return patientApi.getStats();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetPatientAppointments() {
  return useQuery({
    queryKey: ['patient', 'appointments'],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockPatientAppointments;
      }
      return patientApi.getAppointments();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenerateQRToken() {
  return useMutation({
    mutationFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return generateMockQRToken(mockPatientProfile.id, `${mockPatientProfile.firstName} ${mockPatientProfile.lastName}`);
      }
      return patientApi.generateQRToken();
    },
  });
}

export function useValidateQRToken(token: string) {
  return useQuery({
    queryKey: ['patient', 'qr', token],
    queryFn: async () => {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockPatientHistory;
      }
      return patientApi.validateQRToken(token);
    },
    enabled: !!token,
  });
}
