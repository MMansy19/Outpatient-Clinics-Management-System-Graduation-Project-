export interface Medication {
  id: number;
  global_id: string;
  patient_id: number;
  doctor_id: number;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  start_date: Date;
  end_date?: Date;
  is_deleted: boolean;
  created_at: Date;
}

export enum MedicationFrequency {
  DAILY = 'Daily',
  TWICE_DAILY = 'Twice Daily',
  THREE_TIMES_DAILY = 'Three Times Daily',
  WEEKLY = 'Weekly',
  AS_NEEDED = 'As Needed',
}
