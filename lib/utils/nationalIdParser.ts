/**
 * Egyptian National ID Parser Utility
 * 
 * Egyptian National ID Format: XYYMMDDSSNNNNC (14 digits)
 * - X (1 digit): Century indicator (2 = 1900s, 3 = 2000s)
 * - YY (2 digits): Year of birth
 * - MM (2 digits): Month of birth (01-12)
 * - DD (2 digits): Day of birth (01-31)
 * - SS (2 digits): Governorate code (01-35)
 * - NNNN (4 digits): Sequential number within same day/governorate
 * - C (1 digit): Check digit
 * 
 * Gender: Odd NNNN = Male, Even NNNN = Female
 */

import { InvalidNationalIdError } from '@/types/ocr';

/**
 * Extract birthdate from Egyptian National ID number
 * @param nationalId - 14-digit National ID number
 * @returns Date object or null if invalid
 */
export function extractBirthdateFromNationalId(nationalId: string): Date | null {
  if (!nationalId || nationalId.length !== 14) {
    return null;
  }

  try {
    const centuryDigit = nationalId[0];
    const century = centuryDigit === '2' ? 1900 : centuryDigit === '3' ? 2000 : null;
    
    if (century === null) {
      return null;
    }

    const year = century + parseInt(nationalId.substring(1, 3), 10);
    const month = parseInt(nationalId.substring(3, 5), 10);
    const day = parseInt(nationalId.substring(5, 7), 10);

    // Validate month and day ranges
    if (month < 1 || month > 12) {
      return null;
    }
    if (day < 1 || day > 31) {
      return null;
    }

    const birthdate = new Date(year, month - 1, day);

    // Verify the date is valid (not NaN) and makes sense
    if (isNaN(birthdate.getTime())) {
      return null;
    }

    // Ensure date is not in the future
    if (birthdate > new Date()) {
      return null;
    }

    return birthdate;
  } catch {
    return null;
  }
}

/**
 * Extract gender from Egyptian National ID number
 * @param nationalId - 14-digit National ID number
 * @returns 'male' | 'female' | null if invalid
 */
export function extractGenderFromNationalId(nationalId: string): 'male' | 'female' | null {
  if (!nationalId || nationalId.length !== 14) {
    return null;
  }

  try {
    // Extract the sequential number (positions 9-12, 0-indexed)
    const sequentialNumber = parseInt(nationalId.substring(9, 13), 10);

    if (isNaN(sequentialNumber)) {
      return null;
    }

    // Odd = Male, Even = Female
    return sequentialNumber % 2 === 0 ? 'female' : 'male';
  } catch {
    return null;
  }
}

/**
 * Extract governorate code from Egyptian National ID number
 * @param nationalId - 14-digit National ID number
 * @returns Governorate code (01-35) or null if invalid
 */
export function extractGovernorateCode(nationalId: string): string | null {
  if (!nationalId || nationalId.length !== 14) {
    return null;
  }

  try {
    const governorateCode = nationalId.substring(7, 9);
    const code = parseInt(governorateCode, 10);

    // Valid governorate codes are 01-35
    if (code < 1 || code > 35) {
      return null;
    }

    return governorateCode;
  } catch {
    return null;
  }
}

/**
 * Validate Egyptian National ID format and content
 * @param nationalId - 14-digit National ID number
 * @returns true if valid, false otherwise
 */
export function validateNationalId(nationalId: string): boolean {
  // Check if it's a string and has exactly 14 digits
  if (!nationalId || typeof nationalId !== 'string') {
    return false;
  }

  // Must be exactly 14 digits
  if (!/^\d{14}$/.test(nationalId)) {
    return false;
  }

  // Validate century digit (2 or 3)
  const centuryDigit = nationalId[0];
  if (centuryDigit !== '2' && centuryDigit !== '3') {
    return false;
  }

  // Validate birthdate can be extracted
  const birthdate = extractBirthdateFromNationalId(nationalId);
  if (!birthdate) {
    return false;
  }

  // Validate governorate code
  const governorateCode = extractGovernorateCode(nationalId);
  if (!governorateCode) {
    return false;
  }

  return true;
}

/**
 * Calculate age from Egyptian National ID
 * @param nationalId - 14-digit National ID number
 * @returns Age in years or null if invalid
 */
export function calculateAgeFromNationalId(nationalId: string): number | null {
  const birthdate = extractBirthdateFromNationalId(nationalId);
  if (!birthdate) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();

  // Adjust age if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Format birthdate for display
 * @param nationalId - 14-digit National ID number
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string or null if invalid
 */
export function formatBirthdateFromNationalId(
  nationalId: string,
  locale: string = 'en-US'
): string | null {
  const birthdate = extractBirthdateFromNationalId(nationalId);
  if (!birthdate) {
    return null;
  }

  return birthdate.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Parse and validate National ID with detailed error messages
 * @param nationalId - 14-digit National ID number
 * @throws InvalidNationalIdError with specific reason
 * @returns Parsed data if valid
 */
export function parseNationalId(nationalId: string): {
  birthdate: Date;
  gender: 'male' | 'female';
  governorateCode: string;
  age: number;
} {
  if (!nationalId) {
    throw new InvalidNationalIdError('National ID is required');
  }

  if (!/^\d{14}$/.test(nationalId)) {
    throw new InvalidNationalIdError('National ID must be exactly 14 digits');
  }

  const birthdate = extractBirthdateFromNationalId(nationalId);
  if (!birthdate) {
    throw new InvalidNationalIdError('Invalid birthdate in National ID');
  }

  const gender = extractGenderFromNationalId(nationalId);
  if (!gender) {
    throw new InvalidNationalIdError('Invalid gender code in National ID');
  }

  const governorateCode = extractGovernorateCode(nationalId);
  if (!governorateCode) {
    throw new InvalidNationalIdError('Invalid governorate code in National ID');
  }

  const age = calculateAgeFromNationalId(nationalId);
  if (age === null) {
    throw new InvalidNationalIdError('Could not calculate age from National ID');
  }

  return {
    birthdate,
    gender,
    governorateCode,
    age,
  };
}

/**
 * Governorate code mappings (for reference)
 */
export const GOVERNORATE_NAMES: Record<string, { en: string; ar: string }> = {
  '01': { en: 'Cairo', ar: 'القاهرة' },
  '02': { en: 'Alexandria', ar: 'الإسكندرية' },
  '03': { en: 'Port Said', ar: 'بورسعيد' },
  '04': { en: 'Suez', ar: 'السويس' },
  '11': { en: 'Damietta', ar: 'دمياط' },
  '12': { en: 'Dakahlia', ar: 'الدقهلية' },
  '13': { en: 'Ash Sharqia', ar: 'الشرقية' },
  '14': { en: 'Kaliobeya', ar: 'القليوبية' },
  '15': { en: 'Kafr El Sheikh', ar: 'كفر الشيخ' },
  '16': { en: 'Gharbia', ar: 'الغربية' },
  '17': { en: 'Menoufia', ar: 'المنوفية' },
  '18': { en: 'Beheira', ar: 'البحيرة' },
  '19': { en: 'Ismailia', ar: 'الإسماعيلية' },
  '21': { en: 'Giza', ar: 'الجيزة' },
  '22': { en: 'Beni Suef', ar: 'بني سويف' },
  '23': { en: 'Fayoum', ar: 'الفيوم' },
  '24': { en: 'El Menia', ar: 'المنيا' },
  '25': { en: 'Assiut', ar: 'أسيوط' },
  '26': { en: 'Sohag', ar: 'سوهاج' },
  '27': { en: 'Qena', ar: 'قنا' },
  '28': { en: 'Aswan', ar: 'أسوان' },
  '29': { en: 'Luxor', ar: 'الأقصر' },
  '31': { en: 'Red Sea', ar: 'البحر الأحمر' },
  '32': { en: 'New Valley', ar: 'الوادي الجديد' },
  '33': { en: 'Matrouh', ar: 'مطروح' },
  '34': { en: 'North Sinai', ar: 'شمال سيناء' },
  '35': { en: 'South Sinai', ar: 'جنوب سيناء' },
};

/**
 * Get governorate name from National ID
 * @param nationalId - 14-digit National ID number
 * @param language - 'en' or 'ar'
 * @returns Governorate name or null if invalid
 */
export function getGovernorateNameFromNationalId(
  nationalId: string,
  language: 'en' | 'ar' = 'en'
): string | null {
  const code = extractGovernorateCode(nationalId);
  if (!code) {
    return null;
  }

  const governorate = GOVERNORATE_NAMES[code];
  return governorate ? governorate[language] : null;
}
