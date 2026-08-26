import { AxiosError, isAxiosError } from 'axios';
import type { ApiError } from './types';

/**
 * API Error Handling Utilities
 * 
 * Centralized error handling for consistent user experience.
 * Transforms backend errors into user-friendly messages.
 * 
 * @module apiErrorHandler
 */

/**
 * Custom API Error Class
 * 
 * Extends the native Error class with additional context.
 */
export class ApiException extends Error {
  public statusCode: number;
  public errorCode?: string;
  public originalError?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode?: string,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.originalError = originalError;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiException);
    }
  }
}

/**
 * Error Status Code Categories
 */
export enum ErrorCategory {
  CLIENT_ERROR = 'client_error', // 4xx
  SERVER_ERROR = 'server_error', // 5xx
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * Get Error Category from Status Code
 */
export const getErrorCategory = (statusCode?: number): ErrorCategory => {
  if (!statusCode) return ErrorCategory.NETWORK_ERROR;
  if (statusCode >= 400 && statusCode < 500) return ErrorCategory.CLIENT_ERROR;
  if (statusCode >= 500) return ErrorCategory.SERVER_ERROR;
  return ErrorCategory.UNKNOWN_ERROR;
};

/**
 * Parse Axios Error
 * 
 * Extracts meaningful error information from Axios error objects.
 * 
 * @param {unknown} error - Error object (typically from catch block)
 * @returns {ApiException} Parsed and structured error
 */
export const parseApiError = (error: unknown): ApiException => {
  // Handle Axios errors
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    const statusCode = axiosError.response?.status || 500;
    const responseData = axiosError.response?.data;

    // Backend sent a structured error response
    if (responseData && typeof responseData === 'object') {
      const message =
        responseData.message ||
        axiosError.message ||
        'An error occurred while communicating with the server';
      const errorCode = responseData.error;

      return new ApiException(message, statusCode, errorCode, error);
    }

    // Network error (no response received)
    if (!axiosError.response) {
      return new ApiException(
        'Network error. Please check your internet connection.',
        0,
        'NETWORK_ERROR',
        error
      );
    }

    // Timeout error
    if (axiosError.code === 'ECONNABORTED') {
      return new ApiException(
        'Request timeout. Please try again.',
        0,
        'TIMEOUT_ERROR',
        error
      );
    }

    // Generic Axios error
    return new ApiException(
      axiosError.message || 'An unexpected error occurred',
      statusCode,
      undefined,
      error
    );
  }

  // Handle custom ApiException
  if (error instanceof ApiException) {
    return error;
  }

  // Handle native Error objects
  if (error instanceof Error) {
    return new ApiException(error.message, 500, undefined, error);
  }

  // Handle unknown error types
  return new ApiException(
    'An unknown error occurred',
    500,
    'UNKNOWN_ERROR',
    error
  );
};

/**
 * Get User-Friendly Error Message
 * 
 * Converts technical errors into messages suitable for end users.
 * 
 * @param {unknown} error - Error object
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  const apiError = parseApiError(error);

  // Map status codes to user-friendly messages
  switch (apiError.statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred. The resource may already exist.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please slow down and try again later.';
    case 500:
      return 'Server error. Our team has been notified. Please try again later.';
    case 502:
      return 'Server is temporarily unavailable. Please try again in a moment.';
    case 503:
      return 'Service is currently undergoing maintenance. Please try again later.';
    default:
      // For specific error codes, use backend message
      if (apiError.errorCode) {
        return apiError.message;
      }
      return 'Something went wrong. Please try again.';
  }
};

/**
 * Log Error for Debugging
 * 
 * Logs error details in development mode.
 * In production, this would send to error tracking service (Sentry, LogRocket, etc.)
 * 
 * @param {unknown} error - Error to log
 * @param {string} [context] - Additional context (e.g., "Create Visit")
 */
export const logError = (_error: unknown, _context?: string): void => {
  // Reserved for future error-tracking integration (e.g. Sentry)
};

/**
 * Handle API Error with Toast Notification
 * 
 * Convenience function that parses error, logs it, and shows user notification.
 * 
 * @param {unknown} error - Error to handle
 * @param {string} [context] - Context for logging
 * @param {(message: string) => void} [toastError] - Toast notification function
 * @returns {ApiException} Parsed error
 * 
 * @example
 * ```typescript
 * import { toast } from 'sonner';
 * 
 * try {
 *   await createVisit(data);
 * } catch (error) {
 *   handleApiError(error, 'Create Visit', toast.error);
 * }
 * ```
 */
export const handleApiError = (
  error: unknown,
  context?: string,
  toastError?: (message: string) => void
): ApiException => {
  const apiError = parseApiError(error);
  logError(error, context);

  if (toastError) {
    const message = getUserFriendlyMessage(error);
    toastError(message);
  }

  return apiError;
};

/**
 * Retry Strategy for Failed Requests
 * 
 * Determines if a request should be retried based on error type.
 * 
 * @param {number} failureCount - Number of previous failures
 * @param {unknown} error - Error that occurred
 * @returns {boolean} True if should retry
 */
export const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= 3) return false; // Max 3 retries

  const apiError = parseApiError(error);

  // Retry on network errors
  if (apiError.statusCode === 0) return true;

  // Retry on server errors (5xx)
  if (apiError.statusCode >= 500) return true;

  // Retry on rate limiting (with exponential backoff)
  if (apiError.statusCode === 429) return true;

  // Don't retry on client errors (4xx)
  return false;
};

/**
 * Calculate Retry Delay (Exponential Backoff)
 * 
 * @param {number} attemptIndex - Current attempt number (0-based)
 * @returns {number} Delay in milliseconds
 */
export const getRetryDelay = (attemptIndex: number): number => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 180000; // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);
  
  // Add random jitter (±25%) to prevent thundering herd
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.floor(delay + jitter);
};

/**
 * Validation Error Helper
 * 
 * Extracts field-specific validation errors from backend response.
 * Useful for displaying errors next to form fields.
 * 
 * @param {unknown} error - Error object
 * @returns {Record<string, string>} Field errors map
 */
export const getValidationErrors = (
  error: unknown
): Record<string, string> => {
  if (!isAxiosError(error)) return {};

  const responseData = error.response?.data as Record<string, unknown>;
  if (!responseData?.errors) return {};

  // Backend may return errors in different formats
  // Adapt based on your backend's error response structure
  const errors: Record<string, string> = {};

  if (Array.isArray(responseData.errors)) {
    responseData.errors.forEach((err: unknown) => {
      const error = err as { field?: string; message?: string };
      if (error.field && error.message) {
        errors[error.field] = error.message;
      }
    });
  } else if (typeof responseData.errors === 'object') {
    Object.entries(responseData.errors).forEach(([field, message]) => {
      errors[field] = String(message);
    });
  }

  return errors;
};

/**
 * Type guard for API errors
 */
export const isApiException = (error: unknown): error is ApiException => {
  return error instanceof ApiException;
};
