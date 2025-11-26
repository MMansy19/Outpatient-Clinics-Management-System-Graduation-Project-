import type { UserPublic } from './User';

export interface Doctor extends UserPublic {
  specialization: string;
  license_number: string;
  clinic_id: number;
  phone_number: string;
  years_of_experience?: number;
}

export interface DoctorWithClinic extends Doctor {
  clinic: {
    id: number;
    name: string;
    department: string;
  };
}
