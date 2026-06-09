import type { PatientByIdResponse } from './types';

export interface PatientVisit {
  id: string;
  diagnoses: string;
  diagnosesAudioUrl: string | null;
  doctorName: string;
  doctorSpeciality: string;
  clinicName: string;
  createdAt: string;
}

export interface PatientMedication {
  id: string;
  name: string;
  dosage: string;
  period: string;
  comments: string | null;
  commentsAudioUrl: string | null;
  doctorName: string;
  doctorSpeciality: string;
  createdAt: string;
}

export interface PatientLab {
  id: string;
  name: string;
  photoUrl: string;
  comments: string | null;
  commentsAudioUrl: string | null;
  doctorName: string;
  doctorSpeciality: string;
  createdAt: string;
}

export interface PatientScan {
  id: string;
  name: string;
  type: string;
  photoUrl: string;
  comments: string | null;
  commentsAudioUrl: string | null;
  doctorName: string;
  doctorSpeciality: string;
  createdAt: string;
}

export interface PatientMedicalHistory {
  visits: PatientVisit[];
  medications: PatientMedication[];
  labs: PatientLab[];
  scans: PatientScan[];
}

export interface PatientQRToken {
  token: string;
  patientId: string;
  patientName: string;
  expiresAt: number;
  patientData: PatientByIdResponse;
  medicalHistory: PatientMedicalHistory;
}

export interface PatientStats {
  totalVisits: number;
  totalMedications: number;
  totalLabs: number;
  totalScans: number;
  lastVisitDate: string | null;
  lastVisitDoctor: string | null;
}

export interface PatientAppointment {
  id: string;
  date: string;
  time: string;
  doctorName: string;
  doctorSpeciality: string;
  clinicName: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export type HistoryFilterType = 'visits' | 'medications' | 'labs' | 'scans';

export interface HistoryFilter {
  type: HistoryFilterType;
}
