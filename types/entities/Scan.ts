export interface Scan {
  id: number;
  global_id: string;
  patient_id: number;
  doctor_id: number;
  type: ScanType;
  scan_date: Date;
  image_url?: string;
  radiology_report?: string;
  is_deleted: boolean;
  created_at: Date;
}

export enum ScanType {
  XRAY = 'X-Ray',
  CT = 'CT Scan',
  MRI = 'MRI',
  ULTRASOUND = 'Ultrasound',
}
