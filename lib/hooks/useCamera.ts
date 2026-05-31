/**
 * useCamera Hook
 *
 * Wrapper for Capacitor Camera API with permission handling
 * Provides easy-to-use camera functionality for National ID scanning
 */

'use client';

import { useState, useCallback } from 'react';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { CameraPermissionError, CameraCaptureResult } from '@/types/ocr';

export interface UseCameraOptions {
  /** Quality of captured image (0-100), default: 90 */
  quality?: number;
  /** Maximum width of captured image, default: 1920 */
  width?: number;
  /** Maximum height of captured image, default: 1080 */
  height?: number;
  /** Allow image editing after capture, default: false */
  allowEditing?: boolean;
}

export interface UseCameraReturn {
  /** Take a picture using the device camera */
  takePicture: () => Promise<CameraCaptureResult>;
  /** Check if camera permissions are granted */
  checkPermissions: () => Promise<boolean>;
  /** Request camera permissions */
  requestPermissions: () => Promise<boolean>;
  /** Whether camera operation is in progress */
  isCapturing: boolean;
  /** Error from last camera operation */
  error: Error | null;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Hook for accessing device camera with Capacitor
 *
 * @param options - Camera configuration options
 * @returns Camera interface with state management
 *
 * @example
 * ```tsx
 * const { takePicture, checkPermissions, isCapturing } = useCamera();
 *
 * const handleScan = async () => {
 *   const hasPermission = await checkPermissions();
 *   if (!hasPermission) {
 *     toast.error('Camera permission required');
 *     return;
 *   }
 *
 *   const result = await takePicture();
 *   console.log('Captured:', result.base64String);
 * };
 * ```
 */
export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    quality = 90,
    width = 1920,
    height = 1080,
    allowEditing = false,
  } = options;

  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Check if camera permissions are granted
   */
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const permissions = await Camera.checkPermissions();
      return permissions.camera === 'granted';
    } catch (err) {
      setError(new CameraPermissionError('Failed to check camera permissions'));
      return false;
    }
  }, []);

  /**
   * Request camera permissions from user
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const permissions = await Camera.requestPermissions();
      const granted = permissions.camera === 'granted';

      if (!granted) {
        const permissionError = new CameraPermissionError(
          'Camera access denied. Please enable camera permissions in Settings.'
        );
        setError(permissionError);
        return false;
      }

      setError(null);
      return true;
    } catch (err) {
      setError(
        new CameraPermissionError('Failed to request camera permissions')
      );
      return false;
    }
  }, []);

  /**
   * Take a picture using the device camera
   * Automatically handles permission checking and errors
   */
  const takePicture = useCallback(async (): Promise<CameraCaptureResult> => {
    setIsCapturing(true);
    setError(null);

    try {
      // Check permissions first
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        // Try to request permissions
        const granted = await requestPermissions();
        if (!granted) {
          throw new CameraPermissionError(
            'Camera permission is required to scan National ID'
          );
        }
      }

      // Capture photo using Capacitor Camera API
      const photo: Photo = await Camera.getPhoto({
        quality,
        allowEditing,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width,
        height,
        saveToGallery: false, // Don't save to gallery (privacy)
        correctOrientation: true, // Auto-rotate to correct orientation
      });

      if (!photo.base64String) {
        throw new Error('Failed to capture image: No image data received');
      }

      const result: CameraCaptureResult = {
        base64String: photo.base64String,
        format: photo.format,
        saved: photo.saved ?? false,
      };

      return result;
    } catch (err) {
      // Handle specific error types
      if (err instanceof CameraPermissionError) {
        setError(err);
        throw err;
      }

      // Check if user cancelled
      if (err instanceof Error) {
        if (
          err.message.includes('cancel') ||
          err.message.includes('User cancelled')
        ) {
          const cancelError = new Error('Photo capture cancelled');
          setError(cancelError);
          throw cancelError;
        }

        if (err.message.includes('permission')) {
          const permError = new CameraPermissionError('Camera access denied');
          setError(permError);
          throw permError;
        }
      }

      // Generic error
      const genericError = new Error(
        'Failed to capture photo. Please try again.'
      );
      setError(genericError);
      throw genericError;
    } finally {
      setIsCapturing(false);
    }
  }, [
    checkPermissions,
    requestPermissions,
    quality,
    width,
    height,
    allowEditing,
  ]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    takePicture,
    checkPermissions,
    requestPermissions,
    isCapturing,
    error,
    clearError,
  };
}

/**
 * Capacitor Window interface extension
 */
interface CapacitorWindow extends Window {
  Capacitor?: {
    isNativePlatform?: () => boolean;
    getPlatform?: () => 'ios' | 'android' | 'web';
  };
}

/**
 * Check if the app is running in a Capacitor native environment
 * Camera is only available in native apps (iOS/Android), not in browser
 */
export function isCapacitorNative(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Capacitor' in window &&
    !!(window as CapacitorWindow).Capacitor?.isNativePlatform?.()
  );
}

/**
 * Get platform name (ios, android, web)
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') {
    return 'web';
  }

  const capacitor = (window as CapacitorWindow).Capacitor;
  if (capacitor?.getPlatform) {
    return capacitor.getPlatform();
  }

  return 'web';
}
