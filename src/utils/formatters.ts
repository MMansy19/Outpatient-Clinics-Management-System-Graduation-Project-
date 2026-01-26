/**
 * Formatting utilities for displaying data
 */

import { format, parseISO } from 'date-fns';

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date, pattern: string = 'MMM dd, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, pattern);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  try {
    const now = new Date();
    const inputDate = typeof date === 'string' ? parseISO(date) : date;
    const diffInSeconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format phone number with formatting
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }

  if (cleaned.length === 13 && cleaned.startsWith('20')) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
  }

  return phone;
}

/**
 * Format National ID with masking
 */
export function formatNationalId(id: string, maskLastDigits: number = 4): string {
  if (id.length !== 14) return id;

  const visible = id.slice(0, -maskLastDigits);
  const masked = '*'.repeat(maskLastDigits);

  return `${visible}${masked}`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'EGP'): string {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = Math.round((value / total) * 100);
  return `${percentage}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format patient name
 */
export function formatPatientName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Format medication dosage
 */
export function formatDosage(dosage: number, unit: string = 'tablet'): string {
  const pluralUnit = dosage === 1 ? unit : `${unit}s`;
  return `${dosage} ${pluralUnit}`;
}

/**
 * Format vital sign value with unit
 */
export function formatVitalSign(value: number, unit: string): string {
  return `${value} ${unit}`;
}

/**
 * Format blood pressure
 */
export function formatBloodPressure(systolic: number, diastolic: number): string {
  return `${systolic}/${diastolic}`;
}

/**
 * Format age from birthdate
 */
export function formatAge(birthdate: string | Date): string {
  try {
    const birth = typeof birthdate === 'string' ? parseISO(birthdate) : birthdate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return `${age} years`;
  } catch {
    return 'Invalid Age';
  }
}

/**
 * Format BMI value with category
 */
export function formatBMI(bmi: number): string {
  let category = '';

  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  return `${bmi.toFixed(1)} (${category})`;
}
