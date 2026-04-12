'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  Camera,
  Loader2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
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
  const t = useTranslations('scan');
  const tCommon = useTranslations('common');

  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isWebCameraActive, setIsWebCameraActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update video srcObject when stream changes
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const { takePicture, checkPermissions } = useCamera();
  const { mutate: scanId, isPending: isScanning } = useScanNationalId({
    onSuccess: (data) => {
      onScanComplete(data);
      onClose();
    },
    onError: (err) => {
      setError(err.message || t('scanFailed'));
      setIsCapturing(false);
    },
  });

  const handleWebCameraCapture = async () => {
    try {
      // Use browser's getUserMedia API
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1280 },
          aspectRatio: { ideal: 1.5 },
        },
      });
      setVideoStream(stream);
      setIsWebCameraActive(true);
      setError(null);
    } catch (err) {
      setError(
        'Camera access denied. Please allow camera permissions in your browser.'
      );
      setIsCapturing(false);
    }
  };

  const captureFromVideo = () => {
    if (!videoStream) return;

    const video = document.getElementById(
      'web-camera-video'
    ) as HTMLVideoElement;
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
    videoStream.getTracks().forEach((track) => track.stop());
    setVideoStream(null);
    setIsWebCameraActive(false);

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

      // Send to OCR service
      scanId({ imageBase64: result.base64String, compress: true });
    } catch (err) {
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

      // Convert file to base64
      const base64String = await fileToBase64(selectedFile);

      // Send to OCR service
      scanId({ imageBase64: base64String, compress: true });
    } catch (err) {
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix (data:image/jpeg;base64,)
        const base64String = base64.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleClose = (forceClose = false) => {
    // Always clean up resources, regardless of processing state
    // Stop video stream if active
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
      setIsWebCameraActive(false);
    }
    // Clean up file preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setActiveTab('camera');
    setIsCapturing(false);

    // Only close if not processing or if forced
    if ((!isScanning && !isCapturing) || forceClose) {
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
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'camera' | 'upload')}
            className="w-full"
          >
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
                    : t('webCameraInstruction')}
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
                      <p className="text-sm font-medium">
                        {t('clickToUpload')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('uploadHint')}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {t('supportedFormats')}
                      </p>
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
