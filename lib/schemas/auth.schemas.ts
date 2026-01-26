import { z } from 'zod';
import { Language } from '../api/types';

/**
 * Zod Validation Schemas
 * 
 * These schemas mirror the backend DTOs and enforce the same validation rules.
 * They can be used with React Hook Form or other form libraries.
 */

// ============================================================================
// Helper Schemas
// ============================================================================

/**
 * Egyptian National ID (Social Security Number) Validation
 * 
 * Format: 14 digits
 * Structure:
 * - Digit 1: Century (2=1900s, 3=2000s)
 * - Digits 2-3: Year of birth
 * - Digits 4-5: Month of birth (01-12)
 * - Digits 6-7: Day of birth (01-31)
 * - Digits 8-11: Governorate code
 * - Digit 12: Sequence number
 * - Digit 13: Gender (odd=male, even=female)
 * - Digit 14: Check digit
 */
export const socialSecurityNumberSchema = z
  .string()
  .length(14, 'National ID must be exactly 14 digits')
  .regex(/^[23]\d{13}$/, 'Invalid National ID format')
  .refine((val) => {
    // Validate century digit
    const century = val[0];
    if (century !== '2' && century !== '3') return false;

    // Validate month (01-12)
    const month = parseInt(val.substring(3, 5));
    if (month < 1 || month > 12) return false;

    // Validate day (01-31)
    const day = parseInt(val.substring(5, 7));
    if (day < 1 || day > 31) return false;

    return true;
  }, 'Invalid National ID: check birth date digits');

/**
 * Egyptian Phone Number Validation
 * 
 * Format: +201XXXXXXXXX (starts with +20, then 1, then 9 digits)
 * Examples: +201012345678, +201234567890
 */
export const phoneNumberSchema = z
  .string()
  .regex(/^\+201[0-9]{9}$/, 'Phone must be in format +201XXXXXXXXX');

/**
 * Email Validation
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .toLowerCase()
  .trim();

/**
 * Password Validation
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Name Validation (First/Last Name)
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(128, 'Name must not exceed 128 characters')
  .regex(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'Name can only contain letters and spaces');

// ============================================================================
// Authentication Schemas
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'), // Don't validate format on login
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// User Creation Schemas
// ============================================================================

export const createAdminSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  language: z.nativeEnum(Language),
  socialSecurityNumber: socialSecurityNumberSchema,
  email: emailSchema,
  phone: phoneNumberSchema,
  password: passwordSchema,
});

export type CreateAdminFormData = z.infer<typeof createAdminSchema>;

export const createDoctorSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  language: z.nativeEnum(Language),
  socialSecurityNumber: socialSecurityNumberSchema,
  email: emailSchema,
  phone: phoneNumberSchema,
  password: passwordSchema,
  speciality: z
    .string()
    .min(2, 'Speciality must be at least 2 characters')
    .max(128, 'Speciality must not exceed 128 characters'),
      clinicId: z.string().uuid('Please select a valid clinic'), 

});

export type CreateDoctorFormData = z.infer<typeof createDoctorSchema>;

export const createPatientSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  language: z.nativeEnum(Language),
  socialSecurityNumber: socialSecurityNumberSchema,
  address: z.string().min(1, 'Address is required').max(500, 'Address must not exceed 500 characters'),
  job: z.string().min(1, 'Job is required').max(128, 'Job must not exceed 128 characters'),
});

export type CreatePatientFormData = z.infer<typeof createPatientSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Extract gender from National ID
 * 
 * @param nationalId - 14-digit National ID
 * @returns 'MALE' | 'FEMALE' | null
 */
export function extractGenderFromNationalId(nationalId: string): 'MALE' | 'FEMALE' | null {
  if (nationalId.length !== 14) return null;
  
  const genderDigit = parseInt(nationalId[12]);
  return genderDigit % 2 === 0 ? 'FEMALE' : 'MALE';
}

/**
 * Extract birthdate from National ID
 * 
 * @param nationalId - 14-digit National ID
 * @returns Date | null
 */
export function extractBirthdateFromNationalId(nationalId: string): Date | null {
  if (nationalId.length !== 14) return null;

  const centuryDigit = nationalId[0];
  const baseYear = centuryDigit === '2' ? 1900 : centuryDigit === '3' ? 2000 : null;
  
  if (!baseYear) return null;

  const yy = nationalId.substring(1, 3);
  const mm = nationalId.substring(3, 5);
  const dd = nationalId.substring(5, 7);

  const fullYear = baseYear + parseInt(yy);
  const month = parseInt(mm);
  const day = parseInt(dd);

  // Validate date components
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  return new Date(`${fullYear}-${mm}-${dd}`);
}

/**
 * Calculate age from National ID
 * 
 * @param nationalId - 14-digit National ID
 * @returns number (age in years) | null
 */
export function calculateAgeFromNationalId(nationalId: string): number | null {
  const birthdate = extractBirthdateFromNationalId(nationalId);
  if (!birthdate) return null;

  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Extract governorate (place of birth) from National ID
 * 
 * @param nationalId - 14-digit National ID
 * @returns Governorate name in Arabic | null
 */
export function extractGovernorateFromNationalId(nationalId: string): { code: string; nameAr: string; nameEn: string } | null {
  if (nationalId.length !== 14) return null;

  const govCode = nationalId.substring(7, 9);
  
  const governorateMap: Record<string, { nameAr: string; nameEn: string }> = {
    '01': { nameAr: 'القاهرة', nameEn: 'Cairo' },
    '02': { nameAr: 'الإسكندرية', nameEn: 'Alexandria' },
    '03': { nameAr: 'بورسعيد', nameEn: 'Port Said' },
    '04': { nameAr: 'السويس', nameEn: 'Suez' },
    '11': { nameAr: 'دمياط', nameEn: 'Damietta' },
    '12': { nameAr: 'الدقهلية', nameEn: 'Dakahlia' },
    '13': { nameAr: 'الشرقية', nameEn: 'Sharqia' },
    '14': { nameAr: 'القليوبية', nameEn: 'Qalyubia' },
    '15': { nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh' },
    '16': { nameAr: 'الغربية', nameEn: 'Gharbia' },
    '17': { nameAr: 'المنوفية', nameEn: 'Monufia' },
    '18': { nameAr: 'البحيرة', nameEn: 'Beheira' },
    '19': { nameAr: 'الإسماعيلية', nameEn: 'Ismailia' },
    '21': { nameAr: 'الجيزة', nameEn: 'Giza' },
    '22': { nameAr: 'بني سويف', nameEn: 'Beni Suef' },
    '23': { nameAr: 'الفيوم', nameEn: 'Fayoum' },
    '24': { nameAr: 'المنيا', nameEn: 'Minya' },
    '25': { nameAr: 'أسيوط', nameEn: 'Asyut' },
    '26': { nameAr: 'سوهاج', nameEn: 'Sohag' },
    '27': { nameAr: 'قنا', nameEn: 'Qena' },
    '28': { nameAr: 'أسوان', nameEn: 'Aswan' },
    '29': { nameAr: 'الأقصر', nameEn: 'Luxor' },
    '31': { nameAr: 'البحر الأحمر', nameEn: 'Red Sea' },
    '32': { nameAr: 'الوادي الجديد', nameEn: 'New Valley' },
    '33': { nameAr: 'مطروح', nameEn: 'Matrouh' },
    '34': { nameAr: 'شمال سيناء', nameEn: 'North Sinai' },
    '35': { nameAr: 'جنوب سيناء', nameEn: 'South Sinai' },
  };

  const governorate = governorateMap[govCode];
  if (!governorate) {
    return { code: govCode, nameAr: 'خارج الجمهورية', nameEn: 'Outside Egypt' };
  }

  return { code: govCode, ...governorate };
}
