import { apiClient } from './client';
import type { PatientByIdResponse } from './types';
import type {
  PatientMedicalHistory,
  PatientStats,
  PatientQRToken,
  PatientAppointment,
  PatientVisit,
  PatientMedication,
  PatientLab,
  PatientScan,
} from './patient.types';

export const patientApi = {
  getProfile: async (): Promise<PatientByIdResponse> => {
    const response = await apiClient.get<PatientByIdResponse>('/patient/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<PatientByIdResponse>): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>('/patient/profile', data);
    return response.data;
  },

  getMedicalHistory: async (): Promise<PatientMedicalHistory> => {
    const response = await apiClient.get<PatientMedicalHistory>('/patient/history');
    return response.data;
  },

  getVisits: async (): Promise<PatientVisit[]> => {
    const response = await apiClient.get<PatientVisit[]>('/patient/visits');
    return response.data;
  },

  getMedications: async (): Promise<PatientMedication[]> => {
    const response = await apiClient.get<PatientMedication[]>('/patient/medications');
    return response.data;
  },

  getLabs: async (): Promise<PatientLab[]> => {
    const response = await apiClient.get<PatientLab[]>('/patient/labs');
    return response.data;
  },

  getScans: async (): Promise<PatientScan[]> => {
    const response = await apiClient.get<PatientScan[]>('/patient/scans');
    return response.data;
  },

  getStats: async (): Promise<PatientStats> => {
    const response = await apiClient.get<PatientStats>('/patient/stats');
    return response.data;
  },

  getAppointments: async (): Promise<PatientAppointment[]> => {
    const response = await apiClient.get<PatientAppointment[]>('/patient/appointments');
    return response.data;
  },

  generateQRToken: async (): Promise<PatientQRToken> => {
    const response = await apiClient.post<PatientQRToken>('/patient/generate-qr');
    return response.data;
  },

  validateQRToken: async (token: string): Promise<PatientMedicalHistory> => {
    const response = await apiClient.get<PatientMedicalHistory>(`/patient/qr/${token}`);
    return response.data;
  },
};
