/**
 * Validation utilities for forms and data
 */

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validate file type
 */
export function validateFileType(file: File, acceptedFormats: string[]): boolean {
  return acceptedFormats.some((format) => {
    if (format === 'image/*') return file.type.startsWith('image/');
    return file.type === format;
  });
}

/**
 * Validate National ID format (14 digits)
 */
export function validateNationalId(id: string): boolean {
  const nationalIdRegex = /^\d{14}$/;
  return nationalIdRegex.test(id);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Egyptian format)
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+20|0)?1[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate required field
 */
export function validateRequired(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Validate minimum length
 */
export function validateMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Validate maximum length
 */
export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Validate numeric range
 */
export function validateNumericRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}

/**
 * Validate date is not in the future
 */
export function validatePastDate(date: string | Date): boolean {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return inputDate <= today;
}

/**
 * Validate date is not in the past (for appointments, etc.)
 */
export function validateFutureDate(date: string | Date): boolean {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  return inputDate >= today;
}

/**
 * Comprehensive form validation
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export function validateForm(data: Record<string, any>, schema: ValidationSchema): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];

    // Required validation
    if (rule.required && !validateRequired(value)) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rule.required) continue;

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && !validateMinLength(value, rule.minLength)) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`;
        continue;
      }

      if (rule.maxLength && !validateMaxLength(value, rule.maxLength)) {
        errors[field] = `${field} must not exceed ${rule.maxLength} characters`;
        continue;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = `${field} format is invalid`;
        continue;
      }
    }

    // Custom validation
    if (rule.custom) {
      const result = rule.custom(value);
      if (result !== true) {
        errors[field] = typeof result === 'string' ? result : `${field} is invalid`;
      }
    }
  }

  return errors;
}
