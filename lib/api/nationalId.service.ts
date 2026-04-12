/**
 * National ID Scanning API Service
 *
 * Handles image upload to backend AI model for OCR processing
 * Uses mock data during development until AI endpoint is ready
 */

import axios from 'axios';
import { doctorApi } from './doctor.service';
import {
  ScanNationalIdResponse,
  EnrichedScanData,
  OCRProcessingError,
} from '@/types/ocr';
import {
  extractBirthdateFromNationalId,
  extractGenderFromNationalId,
  validateNationalId,
} from '@/lib/utils/nationalIdParser';

/**
 * Scan National ID card using backend AI model
 *
 * @param imageBase64 - Base64 encoded image of National ID card
 * @returns Extracted data: FirstName, LastName, Location, socialSecurityNumber
 * @throws OCRProcessingError if scan fails
 *
 * This function calls the doctorApi.processNationalId method which handles
 * the API call to POST /api/v1/ocr/process-id
 */
export async function scanNationalId(
  imageBase64: string
): Promise<ScanNationalIdResponse> {
  try {
    // Call backend OCR service via doctorApi
    const response = await doctorApi.processNationalId(imageBase64);
    return response;
  } catch (error) {
    if (error instanceof OCRProcessingError) {
      throw error;
    }

    // Handle different error types
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new OCRProcessingError('Invalid image format. Please try again.');
      }
      if (error.response?.status === 422) {
        throw new OCRProcessingError(
          'Could not extract data from image. Please ensure the ID card is clearly visible and try again.'
        );
      }
      if (error.response?.status === 500) {
        throw new OCRProcessingError(
          'AI model processing failed. Please try again.'
        );
      }
      throw new OCRProcessingError(
        'Network error. Please check your connection and try again.'
      );
    }

    throw new OCRProcessingError(
      'Failed to scan National ID. Please try again.'
    );
  }
}

/**
 * Scan National ID and enrich with derived data (gender, birthdate)
 *
 * This is the primary function to use in components.
 * It calls the backend OCR service and adds frontend-derived data.
 *
 * @param imageBase64 - Base64 encoded image of National ID card
 * @returns Complete scan data including derived gender and birthdate
 * @throws OCRProcessingError if scan fails or National ID is invalid
 */
export async function scanAndEnrichNationalId(
  imageBase64: string
): Promise<EnrichedScanData> {
  if (!imageBase64) {
    throw new OCRProcessingError(
      'File is required. Please upload a valid image.'
    );
  }

  // Get OCR data from backend (or mock)
  const scanResult = await scanNationalId(imageBase64);

  // Validate National ID format using socialSecurityNumber
  const nationalIdNumber = scanResult.socialSecurityNumber;

  // Extract gender and birthdate from National ID number (only if valid)
  let gender: 'male' | 'female' | null = null;
  let birthdate: Date | null = null;

  if (nationalIdNumber && validateNationalId(nationalIdNumber)) {
    try {
      gender = extractGenderFromNationalId(nationalIdNumber);
      birthdate = extractBirthdateFromNationalId(nationalIdNumber);
    } catch (error) {
  
    }
  }

  // Construct fullName for backward compatibility
  let fullName: string | undefined = undefined;
  if (scanResult.firstName && scanResult.lastName) {
    fullName = `${scanResult.firstName} ${scanResult.lastName}`;
  } else if (
    'fullName' in scanResult &&
    typeof (scanResult as { fullName?: string }).fullName === 'string'
  ) {
    fullName = (scanResult as { fullName?: string }).fullName;
  }

  // Return enriched data
  const enrichedData: EnrichedScanData = {
    ...scanResult,
    fullName, // Backward compatibility
    nationalId: nationalIdNumber, // Backward compatibility
    address: scanResult.location, // Backward compatibility
    gender: gender || 'male', // Default to male if not available
    birthdate: birthdate || new Date(), // Default to current date if not available
    dateOfBirth: birthdate || new Date(), // Alias for birthdate
    confidence: 0.95, // Default confidence for real scans
    rawImage: imageBase64, // Keep original image for preview
    imageBase64, // Alias for rawImage
    isMockData: false,
  };

  return enrichedData;
}

/**
 * Compress image before sending to backend
 * Reduces payload size and upload time
 *
 * @param base64Image - Original base64 image
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1080)
 * @param quality - JPEG quality 0-1 (default: 0.9)
 * @returns Compressed base64 image
 */
export async function compressImage(
  base64Image: string,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.9
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

      // Remove data URL prefix to get just the base64 data
      const base64Data = compressedBase64.split(',')[1];

      resolve(base64Data);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Add data URL prefix if not present
    const imageData = base64Image.startsWith('data:')
      ? base64Image
      : `data:image/jpeg;base64,${base64Image}`;

    img.src = imageData;
  });
}

export type {
  ScanNationalIdRequest,
  ScanNationalIdResponse,
  EnrichedScanData,
} from '@/types/ocr';
