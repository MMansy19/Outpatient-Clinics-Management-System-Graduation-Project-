import { z } from 'zod';
import { Gender } from '@/types/entities/Patient';

// Form input schema (what the form fields actually contain - strings)
export const patientFormSchema = z.object({
  national_id: z
    .string()
    .regex(/^[0-9]{14}$/, 'National ID must be exactly 14 digits'),
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name is too long'),
  gender: z.nativeEnum(Gender),
  birthdate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  phone_number: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Invalid phone number')
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  address: z.string().max(255).optional(),
});

// API payload schema (what gets sent to the API - transformed types)
export const patientSchema = patientFormSchema.transform((data) => ({
  ...data,
  national_id: parseInt(data.national_id, 10),
  birthdate: new Date(data.birthdate),
}));

export type PatientFormInput = z.infer<typeof patientFormSchema>;
export type PatientFormData = z.output<typeof patientSchema>;
