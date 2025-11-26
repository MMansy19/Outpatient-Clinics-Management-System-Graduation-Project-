import { z } from 'zod';
import { UserRole } from '@/types/entities/User';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username is too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole),
  specialization: z.string().optional(),
  license_number: z.string().optional(),
  clinic_id: z.number().optional(),
  phone_number: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'Invalid phone number')
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === UserRole.DOCTOR) {
    return data.specialization && data.license_number && data.clinic_id;
  }
  return true;
}, {
  message: 'Doctors must provide specialization, license number, and clinic',
  path: ['specialization'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
