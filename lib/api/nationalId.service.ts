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
 * Extract a human-readable message from an axios error response body.
 * Backend (NestJS) typically returns `{ message: string | string[], ... }`.
 */
function extractUpstreamMessage(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const obj = data as { message?: unknown; error?: unknown };
    const msg = obj.message ?? obj.error;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg) && msg.every((m) => typeof m === 'string')) {
      return msg.join(', ');
    }
  }
  return null;
}

/** Backend constraints — keep in sync with apps/api-gateway/src/ocr/ocr.controller.ts */
const OCR_MAX_BYTES = 5 * 1024 * 1024;
const OCR_ALLOWED_MIME = /^(image\/jpeg|image\/jpg|image\/png|application\/pdf)$/;

/**
 * Validate an image client-side against the same rules the backend enforces,
 * so we never round-trip a guaranteed 400.
 */
function assertOcrUploadable(image: Blob | File): void {
  if (!image || !(image instanceof Blob)) {
    throw new OCRProcessingError('File is required. Please upload a valid image.');
  }
  if (image.size === 0) {
    throw new OCRProcessingError('Selected file is empty. Please choose another image.');
  }
  if (image.size > OCR_MAX_BYTES) {
    throw new OCRProcessingError(
      `Image is too large (${(image.size / 1024 / 1024).toFixed(2)} MB). Maximum is 5 MB.`
    );
  }
  // Compressed blobs always have a type; original Files usually do too. If the
  // browser couldn't determine a type, allow it through and let the backend's
  // magic-byte check decide.
  if (image.type && !OCR_ALLOWED_MIME.test(image.type)) {
    throw new OCRProcessingError(
      `Unsupported file type "${image.type}". Please upload JPEG, PNG, or PDF.`
    );
  }
}

/**
 * Scan National ID card using backend AI model
 *
 * @param image - The National ID image as a Blob or File
 * @returns Extracted data: FirstName, LastName, Location, socialSecurityNumber
 * @throws OCRProcessingError if scan fails
 *
 * This function calls the doctorApi.processNationalId method which handles
 * the API call to POST /api/v1/ocr/process-id
 */
export async function scanNationalId(
  image: Blob | File
): Promise<ScanNationalIdResponse> {
  assertOcrUploadable(image);

  try {
    // Call backend OCR service via doctorApi
    const response = await doctorApi.processNationalId(image);

    return response;
  } catch (error) {

    if (error instanceof OCRProcessingError) {
      throw error;
    }

    // Handle different error types
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const upstream = extractUpstreamMessage(error.response?.data);

      // Suffix the HTTP status so the toast is diagnosable even when the
      // backend body is empty or non-JSON.
      const withStatus = (msg: string) => (status ? `${msg} (HTTP ${status})` : msg);

      if (status === 400) {
        throw new OCRProcessingError(
          upstream || withStatus('Invalid image format. Please try again.')
        );
      }
      if (status === 401 || status === 403) {
        throw new OCRProcessingError(
          upstream || withStatus('You are not authorized to use the OCR service.')
        );
      }
      if (status === 413) {
        throw new OCRProcessingError(
          upstream || withStatus('Image is too large. Maximum is 5 MB.')
        );
      }
      if (status === 422) {
        throw new OCRProcessingError(
          upstream ||
            withStatus(
              'Could not extract data from image. Please ensure the ID card is clearly visible and try again.'
            )
        );
      }
      if (status === 500 || status === 502 || status === 503 || status === 504) {
        throw new OCRProcessingError(
          upstream || withStatus('AI model processing failed. Please try again.')
        );
      }
      throw new OCRProcessingError(
        upstream || withStatus('Network error. Please check your connection and try again.')
      );
    }

    throw new OCRProcessingError('Failed to scan National ID. Please try again.');
  }
}

/**
 * Read a Blob as a base64 data URL (used only to populate `rawImage` for the
 * preview shown in the patient registration sheet). Errors are non-fatal.
 */
async function blobToDataUrl(blob: Blob): Promise<string | undefined> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined);
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(blob);
    } catch {
      resolve(undefined);
    }
  });
}

/**
 * Scan National ID and enrich with derived data (gender, birthdate)
 *
 * This is the primary function to use in components.
 * It calls the backend OCR service and adds frontend-derived data.
 *
 * @param image - The National ID image as a Blob or File
 * @returns Complete scan data including derived gender and birthdate
 * @throws OCRProcessingError if scan fails or National ID is invalid
 */
export async function scanAndEnrichNationalId(
  image: Blob | File
): Promise<EnrichedScanData> {
  assertOcrUploadable(image);

  // Get OCR data from backend
  const scanResult = await scanNationalId(image);

  // Validate National ID format using socialSecurityNumber
  const nationalIdNumber = scanResult.socialSecurityNumber;

  // Extract gender and birthdate from National ID number (only if valid)
  let gender: 'male' | 'female' | null = null;
  let birthdate: Date | null = null;

  if (nationalIdNumber && validateNationalId(nationalIdNumber)) {
    try {
      gender = extractGenderFromNationalId(nationalIdNumber);
      birthdate = extractBirthdateFromNationalId(nationalIdNumber);
    } catch {
      // Parsing failed despite passing validateNationalId; fall back to defaults below
    }
  }

  // Construct fullName for backward compatibility
    let fullName: string | undefined = undefined;
    if (scanResult.firstName && scanResult.lastName) {
      fullName = `${scanResult.firstName} ${scanResult.lastName}`;
    } else if ('fullName' in scanResult && typeof (scanResult as { fullName?: string }).fullName === 'string') {
      fullName = (scanResult as { fullName?: string }).fullName;
    }

  // Read the image as a data URL for preview (best-effort).
  const rawImageDataUrl = await blobToDataUrl(image);

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
    rawImage: rawImageDataUrl, // Keep original image for preview
    imageBase64: rawImageDataUrl, // Alias for rawImage
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

/**
 * Compress and re-encode an image Blob/File as a JPEG Blob.
 * Mirrors `compressImage` but returns a Blob instead of base64, so it can be
 * posted directly via FormData with the correct MIME type.
 */
export async function compressImageToJpegBlob(
  source: Blob | File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.9
): Promise<Blob> {
  const objectUrl = URL.createObjectURL(source);
  try {
    const blob: Blob = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to create canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (out) => {
            if (!out) {
              reject(new Error('Failed to encode compressed image'));
              return;
            }
            resolve(out);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = objectUrl;
    });
    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export type {
  ScanNationalIdRequest,
  ScanNationalIdResponse,
  EnrichedScanData,
} from '@/types/ocr';
