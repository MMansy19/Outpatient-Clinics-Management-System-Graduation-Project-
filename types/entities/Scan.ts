export interface Scan {
  id: number;
  global_id: string;
  patient_id: number;
  doctor_id: number;
  name: string;
  type: ScanType;
  photoUrl?: string;
  comments?: string | null;
  commentsAudioUrl?: string | null;
  is_deleted: boolean;
  created_at: Date;
}

export enum ScanType {
  MRI = '0',
  CT = '1',
  X_RAY = '2',
  ULTRA_SOUND = '3',
  PET_CT = '4',
  MAMOGRAPHY = '5',
}
