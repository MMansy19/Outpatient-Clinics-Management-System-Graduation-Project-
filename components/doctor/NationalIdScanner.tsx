'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useCamera, isCapacitorNative } from '@/lib/hooks/useCamera';
import { useScanNationalId } from '@/lib/hooks/useScanNationalId';
import { EnrichedScanData } from '@/types/ocr';

interface NationalIdScannerProps {
  open: boolean;
  onClose: () => void;
  onScanComplete: (data: EnrichedScanData) => void;
}

/**
 * NationalIdScanner Component
 * 
 * Fullscreen camera interface for capturing National ID cards
 * Handles camera permissions, image capture, and OCR processing
 * 
 * Features:
 * - Native camera integration via Capacitor
 * - Automatic image compression
 * - OCR processing with loading states
 * - Error handling and retry logic
 */
export function NationalIdScanner({
  open,
  onClose,
  onScanComplete,
}: NationalIdScannerProps) {
  const t = useTranslations('scan');
  const tCommon = useTranslations('common');
  
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isWebCameraActive, setIsWebCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update video srcObject when stream changes
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);
  
  const { takePicture, checkPermissions } = useCamera();
  const { mutate: scanId, isPending: isScanning } = useScanNationalId({
    onSuccess: (data) => {
      console.log('✅ Scan successful:', data);
      onScanComplete(data);
      onClose();
    },
    onError: (err) => {
      console.error('❌ Scan failed:', err);
      setError(err.message || t('scanFailed'));
      setIsCapturing(false);
    },
  });

  const handleWebCameraCapture = async () => {
    try {
      // Use browser's getUserMedia API
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      setVideoStream(stream);
      setIsWebCameraActive(true);
      setError(null);
    } catch (err) {
      console.error('❌ Web camera error:', err);
      setError('Camera access denied. Please allow camera permissions in your browser.');
      setIsCapturing(false);
    }
  };

  const captureFromVideo = () => {
    if (!videoStream) return;

    const video = document.getElementById('web-camera-video') as HTMLVideoElement;
    if (!video) return;

    // Create canvas to capture frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);
    
    // Convert to base64
    const base64String = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    
    // Stop video stream
    videoStream.getTracks().forEach(track => track.stop());
    setVideoStream(null);
    setIsWebCameraActive(false);

    console.log('📸 Image captured from web camera, processing...');
    
    // Send to OCR service
    scanId({ imageBase64: base64String, compress: true });
  };

  const handleCapture = async () => {
    try {
      setError(null);
      setIsCapturing(true);

      // Check if running on native platform
      if (!isCapacitorNative()) {
        // Use web camera
        await handleWebCameraCapture();
        setIsCapturing(false);
        return;
      }

      // Check permissions first
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        setError(t('cameraPermissionDenied'));
        setIsCapturing(false);
        return;
      }

      // Take picture
      const result = await takePicture();
      if (!result || !result.base64String) {
        setError(t('captureFailed'));
        setIsCapturing(false);
        return;
      }

      console.log('📸 Image captured, processing...');
      
      // Send to OCR service
      scanId({ imageBase64: result.base64String, compress: true });
      
    } catch (err) {
      console.error('❌ Capture error:', err);
      setError(err instanceof Error ? err.message : t('captureFailed'));
      setIsCapturing(false);
    }
  };

  const handleClose = () => {
    if (!isScanning && !isCapturing) {
      // Stop video stream if active
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
        setIsWebCameraActive(false);
      }
      setError(null);
      onClose();
    }
  };

  const isProcessing = isCapturing || isScanning;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <VisuallyHidden>
          <DialogTitle>{t('scanNationalId')}</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t('scanNationalId')}</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {isCapacitorNative() 
                ? t('alignIdInstruction')
                : t('webCameraInstruction')
              }
            </p>
          </div>

          {/* Camera Placeholder / Instructions */}
          <div className="relative aspect-[3/2] rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex flex-col items-center justify-center p-8">
            {isWebCameraActive ? (
              <video
                id="web-camera-video"
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain rounded-lg"
              />
            ) : isProcessing ? (
              <div className="text-center space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-medical-primary mx-auto" />
                <div className="space-y-1">
                  <p className="font-medium">
                    {isScanning ? t('processingId') : t('openingCamera')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isScanning ? t('pleaseWait') : t('preparingCamera')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Camera className="h-16 w-16 text-muted-foreground/50 mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">{t('readyToScan')}</p>
                  <p className="text-xs text-muted-foreground max-w-[300px]">
                    {t('captureHint')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {isWebCameraActive ? (
              <Button
                onClick={captureFromVideo}
                disabled={isScanning}
                className="w-full h-12 bg-medical-primary hover:bg-medical-primary/90"
                size="lg"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-5 w-5" />
                    Take Photo
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCapture}
                disabled={isProcessing}
                className="w-full h-12 bg-medical-primary hover:bg-medical-primary/90"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isScanning ? t('processing') : t('opening')}
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-5 w-5" />
                    {t('captureId')}
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
              className="w-full"
            >
              {tCommon('cancel')}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>{t('privacyNote')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
