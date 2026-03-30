import { toast as sonnerToast } from 'sonner';

/**
 * Professional toast notification utilities with enhanced UX
 * Provides consistent messaging patterns across the application
 */

export const toast = {
  /**
   * Success toast for successful operations
   */
  success: (message: string, description?: string) => {
    return sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Error toast for failed operations
   */
  error: (message: string, description?: string) => {
    return sonnerToast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * Info toast for informational messages
   */
  info: (message: string, description?: string) => {
    return sonnerToast.info(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * Warning toast for warning messages
   */
  warning: (message: string, description?: string) => {
    return sonnerToast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * Loading toast for async operations
   */
  loading: (message: string, description?: string) => {
    return sonnerToast.loading(message, {
      description,
    });
  },

  /**
   * Promise toast for async operations with automatic state management
   */
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

/**
 * Predefined toast messages for common operations
 */
export const toastMessages = {
  auth: {
    loginSuccess: '✅ Welcome back!',
    loginSuccessDescription: 'You have successfully logged in.',
    loginError: '❌ Login failed',
    loginErrorDescription: 'Please check your credentials and try again.',
    logoutSuccess: '👋 Logged out successfully',
    registerSuccess: '🎉 Account created!',
    registerSuccessDescription: 'Your account has been created successfully.',
    registerError: '❌ Registration failed',
    sessionExpired: '⏱️ Session expired',
    sessionExpiredDescription: 'Please log in again to continue.',
    unauthorized: '🚫 Unauthorized access',
    unauthorizedDescription: 'You do not have permission to perform this action.',
  },
  doctor: {
    createSuccess: '👨‍⚕️ Doctor created successfully!',
    createSuccessDescription: (name: string) => `Dr. ${name} has been added to the system.`,
    createError: '❌ Failed to create doctor',
    updateSuccess: '✅ Doctor updated successfully',
    deleteSuccess: '🗑️ Doctor removed',
    alreadyExists: '⚠️ Doctor already exists',
    alreadyExistsDescription: 'A doctor with this email or National ID already exists in the system.',
  },
  admin: {
    createSuccess: '👤 Admin created successfully!',
    createSuccessDescription: (name: string) => `${name} has been added as an admin.`,
    createError: '❌ Failed to create admin',
    alreadyExists: '⚠️ Admin already exists',
    alreadyExistsDescription: 'An admin with this email or National ID already exists in the system.',
  },
  patient: {
    createSuccess: '🏥 Patient registered successfully!',
    createSuccessDescription: (name: string) => `${name} has been added to the system.`,
    createError: '❌ Failed to register patient',
    updateSuccess: '✅ Patient updated successfully',
    deleteSuccess: '🗑️ Patient removed',
    alreadyExists: '⚠️ Patient already exists',
    alreadyExistsDescription: 'A patient with this National ID already exists in the system.',
    notFound: '❓ Patient not found',
    notFoundDescription: 'No patient found with the provided information.',
  },
  clinic: {
    createSuccess: '🏥 Clinic created successfully',
    updateSuccess: '✅ Clinic updated successfully',
    deleteSuccess: '🗑️ Clinic removed',
  },
  visit: {
    createSuccess: '📋 Visit recorded successfully',
    updateSuccess: '✅ Visit updated',
  },
  network: {
    error: '🌐 Network error',
    errorDescription: 'Please check your internet connection and try again.',
    timeout: '⏱️ Request timeout',
    timeoutDescription: 'The request took too long. Please try again.',
  },
  validation: {
    invalidInput: '⚠️ Invalid input',
    requiredFields: '⚠️ Please fill in all required fields',
  },
};
