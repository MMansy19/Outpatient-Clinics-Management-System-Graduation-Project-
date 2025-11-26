import { z } from 'zod';

export const clinicSchema = z.object({
  name: z
    .string()
    .min(3, 'Clinic name must be at least 3 characters')
    .max(100, 'Clinic name is too long'),
  department: z
    .string()
    .min(3, 'Department name must be at least 3 characters')
    .max(100, 'Department name is too long'),
  description: z
    .string()
    .max(500, 'Description is too long')
    .optional(),
  location: z
    .string()
    .max(255, 'Location is too long')
    .optional(),
  phone_number: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Invalid phone number')
    .optional(),
});

export type ClinicFormData = z.infer<typeof clinicSchema>;
