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
    .string()
    .min(1, 'Dosage is required'),

  /**
   * Treatment Period
   * 
   * Number of days the medication should be taken.
   * Examples: "3" (short term), "7" (one week), "30" (one month)
   */
  period: z
    .string()
    .min(1, 'Period is required'),

  /**
   * Additional Comments/Instructions
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
  dosage: '1',
  period: '7', // Default to 1 week
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
 * Medication Period Enum
 * Represents the treatment duration in days
 */
export enum MedicationPeriod {
  CHRONIC = 0,
  ONE_DAY = 1,
  TWO_DAYS = 2,
  THREE_DAYS = 3,
  FOUR_DAYS = 4,
  FIVE_DAYS = 5,
  SIX_DAYS = 6,
  ONE_WEEK = 7,
  EIGHT_DAYS = 8,
  NINE_DAYS = 9,
  TEN_DAYS = 10,
  ELEVEN_DAYS = 11,
  TWELVE_DAYS = 12,
  THIRTEEN_DAYS = 13,
  TWO_WEEKS = 14,
  FIFTEEN_DAYS = 15,
  SIXTEEN_DAYS = 16,
  SEVENTEEN_DAYS = 17,
  EIGHTEEN_DAYS = 18,
  NINETEEN_DAYS = 19,
  TWENTY_DAYS = 20,
  THREE_WEEKS = 21,
  TWENTY_TWO_DAYS = 22,
  TWENTY_THREE_DAYS = 23,
  TWENTY_FOUR_DAYS = 24,
  TWENTY_FIVE_DAYS = 25,
  TWENTY_SIX_DAYS = 26,
  TWENTY_SEVEN_DAYS = 27,
  FOUR_WEEKS = 28,
  TWENTY_NINE_DAYS = 29,
  THIRTY_DAYS = 30,
  FIVE_WEEKS = 35,
  SIX_WEEKS = 42,
  SEVEN_WEEKS = 49,
  EIGHT_WEEKS = 56,
  NINE_WEEKS = 63,
  TEN_WEEKS = 70,
  ELEVEN_WEEKS = 77,
  TWELVE_WEEKS = 84,
}

/**
 * Localized Period Options
 * Generates translated period options for dropdowns
 */
export const getLocalizedPeriodOptions = (t: (key: string) => string) => {
  return [
    { label: t('periods.oneDay'), value: '1' },
    { label: t('periods.twoDays'), value: '2' },
    { label: t('periods.threeDays'), value: '3' },
    { label: t('periods.fiveDays'), value: '5' },
    { label: t('periods.oneWeek'), value: '7' },
    { label: t('periods.tenDays'), value: '10' },
    { label: t('periods.twoWeeks'), value: '14' },
    { label: t('periods.threeWeeks'), value: '21' },
    { label: t('periods.fourWeeks'), value: '28' },
    { label: t('periods.chronic'), value: '0' },
  ];
};

/**
 * Localized Dosage Options
 * Generates translated dosage options for dropdowns
 */
export const getLocalizedDosageOptions = (t: (key: string) => string) => {
  return [
    { label: t('dosages.oneTablet'), value: '1' },
    { label: t('dosages.twoTablets'), value: '2' },
    { label: t('dosages.threeTablets'), value: '3' },
    { label: t('dosages.fourTablets'), value: '4' },
    { label: t('dosages.fiveTablets'), value: '5' },
    { label: t('dosages.sixTablets'), value: '6' },
  ];
};

/**
 * Legacy Common Medication Periods (deprecated - use getLocalizedPeriodOptions instead)
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
 * Legacy Common Dosages (deprecated - use getLocalizedDosageOptions instead)
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
  const unit = Number(medication.dosage) === 1 ? 'tablet' : 'tablets';
  const duration = Number(medication.period) === 1 ? 'day' : 'days';
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
