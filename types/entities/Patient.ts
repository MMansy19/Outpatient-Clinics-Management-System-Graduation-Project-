import type { Visit } from './Visit';
import type { Lab } from './Lab';
import type { Scan } from './Scan';
import type { Medication } from './Medication';

export interface Patient {
  id: number;
  global_id: string;
  national_id: number;
  name: string;
  gender: Gender;
  birthdate: Date;
  phone_number?: string;
  email?: string;
  address?: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export interface PatientWithHistory extends Patient {
  visits: Visit[];
  labs: Lab[];
  scans: Scan[];
  medications: Medication[];
}
