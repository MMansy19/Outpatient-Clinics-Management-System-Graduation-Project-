import type { Patient } from './Patient';
import type { Doctor } from './Doctor';

export interface Vitals {
  weight: number; // Mandatory for dosage calculations
  height?: number;
  temperature?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  respiratory_rate?: number;
  oxygen_saturation?: number;
}

export interface Visit {
  id: number;
  global_id: string;
  patient_id: number;
  doctor_id: number;
  clinic_id: number;
  chief_complaint: string;
  history_present_illness?: string;
  vitals: Vitals;
  physical_examination?: string;
  diagnosis: string;
  diagnosesAudioUrl?: string; 
  treatment_plan?: string;
  notes?: string;
  follow_up_date?: Date;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface VisitWithRelations extends Visit {
  patient: Patient;
  doctor: Doctor;
  clinic: {
    id: number;
    name: string;
    department: string;
  };
}

export interface VisitFormData {
  patient_id: number;
  chief_complaint: string;
  history_present_illness?: string;
  vitals: Vitals;
  physical_examination?: string;
  diagnosis: string;
  treatment_plan?: string;
  notes?: string;
  follow_up_date?: Date;
}

export interface SearchFilters {
  query?: string; // Searches name, national_id, email, phone
  period?: 'today' | 'week' | 'month' | 'custom';
  startDate?: Date;
  endDate?: Date;
  clinicId?: number;
  // Advanced filters
  gender?: 'male' | 'female';
  minAge?: number;
  maxAge?: number;
  nationalId?: string; // Specific national ID search
}