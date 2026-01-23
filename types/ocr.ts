/**
 * OCR and National ID Scanning Types
 * For Egyptian National ID card scanning feature
 */

/**
 * Response from backend AI model when scanning National ID
 */
export interface ScanNationalIdResponse {
  /** First name as extracted from ID card */
  firstName: string;
  /** Last name as extracted from ID card */
  lastName: string;
  /** Location as written on the ID card */
  location: string;
  /** 14-digit Egyptian National ID number (Social Security Number) */
  socialSecurityNumber: string;
}

/**
 * Request payload for National ID scanning API
 */
export interface ScanNationalIdRequest {
  /** Base64 encoded image of the National ID card */
  image: string;
}

/**
 * Enriched scan data with additional derived information
 * Gender and birthdate are extracted from the National ID number on frontend
 */
export interface EnrichedScanData extends ScanNationalIdResponse {
  /** Gender derived from National ID number (odd = male, even = female) */
  gender: 'male' | 'female';
  /** Birthdate extracted from National ID number */
  birthdate: Date;
  /** Date of birth as Date object (alias for birthdate) */
  dateOfBirth: Date;
  /** OCR confidence score (0-1) */
  confidence: number;
  /** Original captured image in base64 format (for preview) */
  rawImage?: string;
  /** Base64 image (alias for rawImage) */
  imageBase64?: string;
  /** Flag indicating if this is mock data for testing */
  isMockData?: boolean;
  /** Backward compatibility - full name constructed from firstName + lastName */
  fullName?: string;
  /** Backward compatibility - national ID (alias for socialSecurityNumber) */
  nationalId?: string;
  /** Backward compatibility - address (alias for location) */
  address?: string;
}

/**
 * Scanned ID data structure used throughout the application
 */
export interface ScannedIdData {
  /** First name from ID card */
  firstName: string;
  /** Last name from ID card */
  lastName: string;
  /** Location from ID card */
  location: string;
  /** 14-digit National ID number (Social Security Number) */
  socialSecurityNumber: string;
  /** Auto-derived gender from ID number */
  gender: 'male' | 'female';
  /** Auto-derived birthdate from ID number */
  birthdate: Date;
  /** OCR confidence score (0-1) if available */
  confidence?: number;
  /** Base64 image for preview */
  rawImage?: string;
  /** Backward compatibility - full name */
  fullName?: string;
  /** Backward compatibility - national ID */
  nationalId?: string;
  /** Backward compatibility - address */
  address?: string;
}

/**
 * Error types for camera and scanning operations
 */
export class CameraPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CameraPermissionError';
  }
}

export class OCRProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OCRProcessingError';
  }
}

export class InvalidNationalIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidNationalIdError';
  }
}

/**
 * Camera capture result
 */
export interface CameraCaptureResult {
  /** Base64 encoded image */
  base64String: string;
  /** Image format (e.g., 'jpeg', 'png') */
  format?: string;
  /** Whether the image was saved to device */
  saved?: boolean;
}
