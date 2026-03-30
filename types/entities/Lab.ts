export interface Lab {
  id: number;
  global_id: string;
  patient_id: number;
  doctor_id: number;
  name: string;
  test_date: Date;
  result_url?: string;
  comments?: string;
  is_deleted: boolean;
  created_at: Date;
}
