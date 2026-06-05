'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Camera, Loader2, AlertCircle, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  // Utility to reset all internal state
  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsWebCameraActive(false);
    setActiveTab('camera');
    setIsCapturing(false);
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
      videoTrackRef.current = null;
    }
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }
    setFocusPoint(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Always clear state when the dialog is (re)opened
  useEffect(() => {
    if (open) {
      resetState();
    }
    // eslint-disable-next-line
  }, [open]);

  const t = useTranslations('scan');
  const tCommon = useTranslations('common');
  
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isWebCameraActive, setIsWebCameraActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update video srcObject when stream changes
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  // Cleanup focus timeout on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, []);

  const applyFocusSettings = async (track: MediaStreamTrack): Promise<void> => {
    try {
      const supported = navigator.mediaDevices.getSupportedConstraints() as Record<string, boolean>;
      if (!supported['focusMode']) return;
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & { focusMode?: string[] };
      if (!capabilities.focusMode) return;
      await track.applyConstraints({
        advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet],
      });
      console.log('📷 Continuous autofocus applied');
    } catch {
      // Focus not supported on this device — silently ignore
    }
  };

  const handleVideoTap = async (e: React.MouseEvent<HTMLVideoElement>): Promise<void> => {
    if (!isWebCameraActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFocusPoint({ x, y });
    if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    focusTimeoutRef.current = setTimeout(() => setFocusPoint(null), 1500);
    if (videoTrackRef.current) {
      await applyFocusSettings(videoTrackRef.current);
    }
  };
  
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
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1280 }, aspectRatio: { ideal: 1.5 } } 
      });
      setVideoStream(stream);
      setIsWebCameraActive(true);
      setError(null);
      // Apply continuous autofocus on the rear camera track
      const track = stream.getVideoTracks()[0];
      if (track) {
        videoTrackRef.current = track;
        await applyFocusSettings(track);
      }
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

    // Convert to JPEG Blob
    canvas.toBlob(
      (blob) => {
        // Stop video stream regardless of outcome
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
        setIsWebCameraActive(false);
        videoTrackRef.current = null;

        if (!blob) {
          setError(t('captureFailed'));
          setIsCapturing(false);
          return;
        }

        console.log('📸 Image captured from web camera, processing...');
        // Send to OCR service
        scanId({ file: blob, compress: true });
      },
      'image/jpeg',
      0.9
    );
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

      // Capacitor returns base64; convert to a Blob and send to OCR service
      const dataUrl = `data:image/jpeg;base64,${result.base64String}`;
      const blob = await fetch(dataUrl).then((r) => r.blob());
      scanId({ file: blob, compress: true });
      
    } catch (err) {
      console.error('❌ Capture error:', err);
      setError(err instanceof Error ? err.message : t('captureFailed'));
      setIsCapturing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setError(t('invalidFileType'));
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(t('fileTooLarge'));
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsCapturing(true);
      setError(null);

      console.log('📤 Image uploaded, processing...', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
      });

      // Send original File directly to OCR service (matches scans/labs pattern)
      scanId({ file: selectedFile, compress: true });
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError(err instanceof Error ? err.message : t('uploadFailed'));
      setIsCapturing(false);
    }
  };

  const handleRemoveFile = () => {
    
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = (forceClose = false) => {
    resetState();
    // Only close if not processing or if forced
    if (!isScanning && !isCapturing || forceClose) {
      onClose();
    }
  };

  const isProcessing = isCapturing || isScanning;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose(true);
        }
      }}
    >
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
          {/* Mode Selection Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'camera' | 'upload')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera" className="gap-2">
                <Camera className="h-4 w-4" />
                {t('cameraTab')}
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                {t('uploadTab')}
              </TabsTrigger>
            </TabsList>

            {/* Camera Tab */}
            <TabsContent value="camera" className="space-y-6 mt-6">
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
              <div className="relative aspect-[3/2] rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex flex-col items-center justify-center overflow-hidden">
            {isWebCameraActive ? (
              <video
                id="web-camera-video"
                ref={videoRef}
                autoPlay
                playsInline
                onClick={handleVideoTap}
                style={{ cursor: 'crosshair' }}
                className="absolute inset-0 relative aspect-[3/2] w-full object-cover rounded-lg"
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

            {/* Tap-to-focus ring */}
            {isWebCameraActive && focusPoint && (
              <div
                className="pointer-events-none absolute z-20 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded border-2 border-white animate-ping"
                style={{ left: `${focusPoint.x}%`, top: `${focusPoint.y}%` }}
              />
            )}

            {/* Card alignment guide overlay */}
            {isWebCameraActive && (
              <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
                <div className="relative h-[58%] w-[84%] rounded border border-white/60">
                  <span className="absolute -left-0.5 -top-0.5 h-4 w-4 border-l-[3px] border-t-[3px] border-white rounded-tl" />
                  <span className="absolute -right-0.5 -top-0.5 h-4 w-4 border-r-[3px] border-t-[3px] border-white rounded-tr" />
                  <span className="absolute -bottom-0.5 -left-0.5 h-4 w-4 border-b-[3px] border-l-[3px] border-white rounded-bl" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 border-b-[3px] border-r-[3px] border-white rounded-br" />
                </div>
                <p className="mt-2 text-xs font-medium text-white drop-shadow-md">
                  {t('alignCard')}
                </p>
              </div>
            )}
              </div>

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
                        {t('takePhoto')}
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
                  onClick={() => handleClose()}
                  className="w-full"
                >
                  {tCommon('cancel')}
                </Button>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>{t('privacyNote')}</p>
              </div>
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6 mt-6">
              {/* Instructions */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t('uploadInstruction')}
                </p>
              </div>

              {/* Upload Area */}
              <div className="space-y-4">
                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative aspect-[3/2] rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 hover:bg-muted/20 cursor-pointer transition-colors flex flex-col items-center justify-center p-6"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium">{t('clickToUpload')}</p>
                      <p className="text-xs text-muted-foreground">{t('uploadHint')}</p>
                      <p className="text-xs text-muted-foreground/70">{t('supportedFormats')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[3/2] rounded-lg border-2 border-muted-foreground/25 overflow-hidden">
                    {previewUrl && (
                      <Image
                        src={previewUrl}
                        alt="Selected ID"
                        fill
                        className="object-contain bg-muted/10"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveFile}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {selectedFile ? (
                  <Button
                    onClick={handleFileUpload}
                    disabled={isProcessing}
                    className="w-full h-12 bg-medical-primary hover:bg-medical-primary/90"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t('processing')}
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-5 w-5" />
                        {t('processImage')}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full h-12"
                    size="lg"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    {t('selectFile')}
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => handleClose()}
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
            </TabsContent>
          </Tabs>

          {/* Error Message - Shown for both tabs */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
