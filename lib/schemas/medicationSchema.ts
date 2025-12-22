import { z } from 'zod';

/**
 * Medication Validation Schema
 * 
 * Zod schema for client-side validation of medication forms.
 * Matches the CreateMedicationDto from the backend API.
 * 
 * @see {@link docs/API/doctor.json} - Backend API specification
 */

export const medicationSchema = z.object({
  /**
   * Medication Name
   * 
   * Must be at least 2 characters.
   * Examples: "Panadol", "Aspirin", "Amoxicillin"
   */
  name: z
    .string()
    .min(2, 'Medication name must be at least 2 characters')
    .max(100, 'Medication name cannot exceed 100 characters')
    .trim(),

  /**
   * Dosage Amount
   * 
   * Number of pills/units per administration.
   * Must be a positive integer.
   * Examples: 1, 2, 3
   */
  dosage: z
    .number()
    .int('Dosage must be a whole number')
    .positive('Dosage must be greater than 0')
    .min(1, 'Dosage must be at least 1')
    .max(100, 'Dosage seems unusually high, please verify'),

  /**
   * Treatment Period
   * 
   * Number of days the medication should be taken.
   * Must be a positive integer.
   * Examples: 3 (short term), 7 (one week), 30 (one month)
   */
  period: z
    .number()
    .int('Period must be a whole number')
    .positive('Period must be greater than 0')
    .min(1, 'Period must be at least 1 day')
    .max(365, 'Period cannot exceed 365 days'),

  /**
   * Additional Comments/Instructions (Optional)
   * 
   * Special instructions, warnings, or notes.
   * Examples:
   * - "Take with food"
   * - "Can't be taken with an empty stomach"
   * - "Avoid alcohol during treatment"
   */
  comments: z
    .string()
    .max(500, 'Comments cannot exceed 500 characters')
    .trim()
    .optional()
    .or(z.literal('')), // Allow empty string

  /**
   * Patient ID
   * 
   * UUID of the patient receiving the medication.
   * Validated to ensure it's a valid UUID format.
   */
  patientId: z
    .string()
    .uuid('Invalid patient ID format')
    .min(1, 'Patient ID is required'),
});

/**
 * TypeScript Type from Zod Schema
 * 
 * Use this type for form data and component props.
 */
export type MedicationFormData = z.infer<typeof medicationSchema>;

/**
 * Medication Schema without Patient ID
 * 
 * Useful for forms where patient is already selected in context.
 */
export const medicationSchemaWithoutPatient = medicationSchema.omit({
  patientId: true,
});

export type MedicationFormDataWithoutPatient = z.infer<
  typeof medicationSchemaWithoutPatient
>;

/**
 * Default Form Values
 * 
 * Use these as initial values for react-hook-form.
 */
export const medicationDefaultValues: Partial<MedicationFormData> = {
  name: '',
  dosage: 1,
  period: 7, // Default to 1 week
  comments: '',
  patientId: '',
};

/**
 * Medication Update Schema
 * 
 * All fields are optional for partial updates.
 */
export const medicationUpdateSchema = medicationSchema.partial();

export type MedicationUpdateData = z.infer<typeof medicationUpdateSchema>;

/**
 * Common Medication Periods (for UI dropdowns)
 */
export const COMMON_PERIODS = [
  { label: '3 days', value: 3 },
  { label: '5 days', value: 5 },
  { label: '7 days (1 week)', value: 7 },
  { label: '10 days', value: 10 },
  { label: '14 days (2 weeks)', value: 14 },
  { label: '21 days (3 weeks)', value: 21 },
  { label: '30 days (1 month)', value: 30 },
  { label: 'Custom', value: 0 }, // User can input custom value
] as const;

/**
 * Common Dosages (for UI suggestions)
 */
export const COMMON_DOSAGES = [
  { label: '1 tablet', value: 1 },
  { label: '2 tablets', value: 2 },
  { label: '3 tablets', value: 3 },
  { label: '4 tablets', value: 4 },
  { label: 'Custom', value: 0 },
] as const;

/**
 * Validation Helper Functions
 */

/**
 * Check if dosage is within safe range for common medications.
 * This is a basic safety check - NOT a substitute for medical knowledge!
 * 
 * @param {number} dosage - Dosage amount
 * @param {string} medicationName - Name of medication (optional)
 * @returns {boolean} True if dosage seems reasonable
 */
export const isSafeDosage = (
  dosage: number,
  medicationName?: string
): boolean => {
  // Basic safety check
  if (dosage > 10) {
    console.warn(
      `High dosage detected: ${dosage} for ${medicationName || 'medication'}`
    );
    return false;
  }
  return true;
};

/**
 * Check if period is reasonable for typical treatments.
 * 
 * @param {number} period - Treatment period in days
 * @returns {boolean} True if period seems reasonable
 */
export const isReasonablePeriod = (period: number): boolean => {
  // Warn for very short or very long periods
  if (period < 1 || period > 90) {
    console.warn(`Unusual period detected: ${period} days`);
    return false;
  }
  return true;
};

/**
 * Format medication for display
 * 
 * @param {MedicationFormData} medication - Medication data
 * @returns {string} Formatted string for display
 * 
 * @example
 * formatMedication({ name: "Panadol", dosage: 2, period: 7 })
 * // Returns: "Panadol - 2 tablets for 7 days"
 */
export const formatMedication = (medication: MedicationFormData): string => {
  const unit = medication.dosage === 1 ? 'tablet' : 'tablets';
  const duration = medication.period === 1 ? 'day' : 'days';
  return `${medication.name} - ${medication.dosage} ${unit} for ${medication.period} ${duration}`;
};

/**
 * Calculate end date based on start date and period
 * 
 * @param {Date} startDate - Treatment start date
 * @param {number} period - Treatment period in days
 * @returns {Date} Calculated end date
 */
export const calculateEndDate = (startDate: Date, period: number): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + period);
  return endDate;
};
