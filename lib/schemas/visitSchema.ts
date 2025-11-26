import { z } from 'zod';

export const vitalsSchema = z.object({
  weight: z
    .number()
    .positive('Weight must be positive')
    .max(500, 'Weight value is unrealistic'),
  height: z.number().positive().max(300).optional(),
  blood_pressure_systolic: z.number().int().min(50).max(250).optional(),
  blood_pressure_diastolic: z.number().int().min(30).max(150).optional(),
  heart_rate: z.number().int().min(30).max(250).optional(),
  temperature: z.number().min(30).max(45).optional(),
  respiratory_rate: z.number().int().min(5).max(60).optional(),
  oxygen_saturation: z.number().int().min(50).max(100).optional(),
});

export const visitSchema = z.object({
  patient_id: z.number().int().positive(),
  chief_complaint: z.string().min(10, 'Please provide more details'),
  history_present_illness: z.string().optional(),
  physical_examination: z.string().optional(),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  treatment_plan: z.string().optional(),
  notes: z.string().optional(),
  vitals: vitalsSchema,
});

export type VisitFormData = z.infer<typeof visitSchema>;
