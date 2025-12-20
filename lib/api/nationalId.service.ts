/**
 * National ID Scanning API Service
 * 
 * Handles image upload to backend AI model for OCR processing
 * Uses mock data during development until AI endpoint is ready
 */

import axios from 'axios';
import { apiClient } from './client';
import { mockScanNationalId, isMockModeEnabled } from './mockNationalIdData';
import {
  ScanNationalIdRequest,
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
 * @returns Extracted data: full name, national ID number, address
 * @throws OCRProcessingError if scan fails
 * 
 * Note: This function automatically uses mock data if NEXT_PUBLIC_USE_MOCK_SCAN=true
 * 
 * TODO: Update endpoint URL when backend AI service is deployed
 * Expected endpoint: POST /api/v1/national-id/scan
 */
export async function scanNationalId(
  imageBase64: string
): Promise<ScanNationalIdResponse> {
  // Use mock data in development until backend AI endpoint is ready
  if (isMockModeEnabled()) {
    console.log('🔧 Using mock National ID scan data (AI endpoint not ready)');
    return mockScanNationalId(imageBase64);
  }

  try {
    const requestPayload: ScanNationalIdRequest = {
      image: imageBase64,
    };

    // TODO: Replace with actual backend AI endpoint when deployed
    const response = await apiClient.post<ScanNationalIdResponse>(
      '/api/v1/national-id/scan',
      requestPayload
    );

    // Validate the response
    if (!response.data.nationalId || !response.data.fullName) {
      throw new OCRProcessingError('Invalid response from OCR service');
    }

    console.log('✅ National ID scanned successfully:', {
      name: response.data.fullName,
      idLength: response.data.nationalId.length,
    });

    return response.data;
  } catch (error) {
    console.error('❌ National ID scan failed:', error);

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
        throw new OCRProcessingError('AI model processing failed. Please try again.');
      }
      throw new OCRProcessingError('Network error. Please check your connection and try again.');
    }

    throw new OCRProcessingError('Failed to scan National ID. Please try again.');
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
  // Get OCR data from backend (or mock)
  const scanResult = await scanNationalId(imageBase64);

  // Validate National ID format
  if (!validateNationalId(scanResult.nationalId)) {
    throw new OCRProcessingError(
      'Invalid National ID format detected. Please verify the ID card and try again.'
    );
  }

  // Extract gender and birthdate from National ID number
  const gender = extractGenderFromNationalId(scanResult.nationalId);
  const birthdate = extractBirthdateFromNationalId(scanResult.nationalId);

  if (!gender || !birthdate) {
    throw new OCRProcessingError(
      'Could not extract information from National ID number. Please check the ID format.'
    );
  }

  // Return enriched data
  const enrichedData: EnrichedScanData = {
    ...scanResult,
    gender,
    birthdate,
    dateOfBirth: birthdate, // Alias for birthdate
    confidence: 0.95, // Default confidence for real scans
    rawImage: imageBase64, // Keep original image for preview
    imageBase64, // Alias for rawImage
    isMockData: false,
  };

  console.log('📋 Enriched scan data:', {
    name: enrichedData.fullName,
    nationalId: enrichedData.nationalId,
    gender: enrichedData.gender,
    birthdate: enrichedData.birthdate.toLocaleDateString(),
  });

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
      
      console.log('🗜️ Image compressed:', {
        original: `${(base64Image.length / 1024).toFixed(2)} KB`,
        compressed: `${(base64Data.length / 1024).toFixed(2)} KB`,
        dimensions: `${width}x${height}`,
      });

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

// Re-export for convenience
export { isMockModeEnabled } from './mockNationalIdData';
export type {
  ScanNationalIdRequest,
  ScanNationalIdResponse,
  EnrichedScanData,
} from '@/types/ocr';
