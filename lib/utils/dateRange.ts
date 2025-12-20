/**
 * Date Range Utility Functions
 * Converts period filters to actual date ranges for backend API calls
 */

/**
 * Get the start of the day (00:00:00)
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the day (23:59:59)
 */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get the start of the week (Monday 00:00:00)
 */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the week (Sunday 23:59:59)
 */
export function endOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get the start of the month (1st day 00:00:00)
 */
export function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the month (last day 23:59:59)
 */
export function endOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Calculate date range based on period filter
 * Used to convert UI period selections to actual start/end dates for API calls
 */
export function calculateDateRange(
  period: 'today' | 'week' | 'month' | 'custom',
  customStart?: Date,
  customEnd?: Date
): { startDate?: Date; endDate?: Date } {
  const now = new Date();

  switch (period) {
    case 'today':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      };

    case 'week':
      return {
        startDate: startOfWeek(now),
        endDate: endOfWeek(now),
      };

    case 'month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      };

    case 'custom':
      return {
        startDate: customStart,
        endDate: customEnd,
      };

    default:
      return {
        startDate: undefined,
        endDate: undefined,
      };
  }
}

/**
 * Format date for API (ISO 8601)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString();
}
