export interface Clinic {
  id: number;
  global_id: string;
  name: string;
  department: string;
  description?: string;
  location?: string;
  phone_number?: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ClinicWithStats extends Clinic {
  doctor_count: number;
  patient_count: number;
  today_visits: number;
}

export type ClinicFormData = Pick<Clinic, 'name' | 'department' | 'description' | 'location' | 'phone_number'>;
