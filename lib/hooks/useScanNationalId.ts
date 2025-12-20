/**
 * useScanNationalId Hook
 * 
 * React Query mutation hook for scanning National ID cards
 * Handles API calls, image processing, and data enrichment
 */

'use client';

import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import {
  scanAndEnrichNationalId,
  compressImage,
} from '@/lib/api/nationalId.service';
import { EnrichedScanData, OCRProcessingError } from '@/types/ocr';

export interface ScanNationalIdVariables {
  /** Base64 encoded image of National ID card */
  imageBase64: string;
  /** Whether to compress image before sending (default: true) */
  compress?: boolean;
}

export interface UseScanNationalIdOptions
  extends Omit<
    UseMutationOptions<EnrichedScanData, Error, ScanNationalIdVariables>,
    'mutationFn'
  > {
  /** Callback when scan succeeds */
  onScanSuccess?: (data: EnrichedScanData) => void;
  /** Callback when scan fails */
  onScanError?: (error: Error) => void;
}

/**
 * Hook for scanning National ID cards with React Query
 * 
 * Features:
 * - Automatic image compression
 * - Backend OCR processing (or mock data in dev)
 * - Frontend data enrichment (gender, birthdate)
 * - Error handling and retry logic
 * - Loading states
 * 
 * @param options - Configuration and callbacks
 * @returns React Query mutation result
 * 
 * @example
 * ```tsx
 * const { mutate: scanId, isPending, error } = useScanNationalId({
 *   onSuccess: (data) => {
 *     console.log('Scanned:', data);
 *     setScannedData(data);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   },
 * });
 * 
 * // Usage
 * const handleCapture = async (image: string) => {
 *   scanId({ imageBase64: image });
 * };
 * ```
 */
export function useScanNationalId(
  options?: UseScanNationalIdOptions
): UseMutationResult<EnrichedScanData, Error, ScanNationalIdVariables> {
  const { onScanSuccess, onScanError, ...mutationOptions } = options || {};

  const mutation = useMutation<EnrichedScanData, Error, ScanNationalIdVariables>({
    mutationKey: ['scanNationalId'],
    
    mutationFn: async ({ imageBase64, compress = true }): Promise<EnrichedScanData> => {
      console.log('🔍 Starting National ID scan...');

      // Compress image if requested (default: true)
      let processedImage = imageBase64;
      if (compress) {
        try {
          processedImage = await compressImage(imageBase64, 1920, 1080, 0.9);
          console.log('✅ Image compressed successfully');
        } catch (compressionError) {
          console.warn('⚠️ Image compression failed, using original:', compressionError);
          // Continue with original image if compression fails
        }
      }

      // Send to backend AI model (or use mock data)
      try {
        const enrichedData = await scanAndEnrichNationalId(processedImage);
        console.log('✅ National ID scan completed successfully');
        return enrichedData;
      } catch (error) {
        console.error('❌ National ID scan failed:', error);
        throw error;
      }
    },

    onSuccess: (data) => {
      console.log('📋 Scan result:', {
        name: data.fullName,
        nationalId: data.nationalId,
        gender: data.gender,
        birthdate: data.birthdate.toISOString(),
      });

      // Call custom success handler
      if (onScanSuccess) {
        onScanSuccess(data);
      }
    },

    onError: (error) => {
      console.error('❌ Scan error:', error);

      // Provide user-friendly error messages
      let userMessage = 'Failed to scan National ID. Please try again.';

      if (error instanceof OCRProcessingError) {
        userMessage = error.message;
      } else if (error.message.includes('Network')) {
        userMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.';
      }

      // Create new error with user-friendly message
      const userError = new Error(userMessage);
      
      // Call custom error handler
      if (onScanError) {
        onScanError(userError);
      }
    },

    // Retry configuration
    retry: 2, // Retry twice on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

    ...mutationOptions,
  });

  return mutation;
}

/**
 * Type guard to check if error is an OCR processing error
 */
export function isOCRError(error: unknown): error is OCRProcessingError {
  return error instanceof OCRProcessingError;
}

/**
 * Get user-friendly error message for scanning errors
 */
export function getScanErrorMessage(error: unknown): string {
  if (error instanceof OCRProcessingError) {
    return error.message;
  }

  if (error instanceof Error) {
    if (error.message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    if (error.message.includes('permission')) {
      return 'Camera permission is required to scan National ID.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
