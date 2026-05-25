'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCamera, isCapacitorNative } from '@/lib/hooks/useCamera';

interface SuperAdminImageUploadFieldProps {
  label: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  required?: boolean;
  error?: string;
  maxSizeMB?: number;
  className?: string;
  field?: {
    value: File | undefined;
    onChange: (value: File | undefined) => void;
    name: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue?: (name: any, value: any, options?: { shouldValidate?: boolean }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trigger?: (name: any) => Promise<boolean>;
  fieldName?: string;
}

export function SuperAdminImageUploadField({
  label,
  value,
  onChange,
  required = false,
  error,
  maxSizeMB = 5,
  className = '',
  field,
  setValue,
  trigger,
  fieldName = 'image',
}: SuperAdminImageUploadFieldProps) {
  const t = useTranslations('superAdmin');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { takePicture } = useCamera();

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(value);
  }, [value]);

  const updateValue = (f: File | null) => {
    onChange?.(f);
    if (field) {
      field.onChange(f ?? undefined);
    }
    if (setValue) {
      setValue(fieldName, f ?? undefined, { shouldValidate: true });
      trigger?.(fieldName);
    }
  };

  const base64ToFile = async (base64: string, mimeType = 'image/jpeg'): Promise<File> => {
    const res = await fetch(base64);
    const blob = await res.blob();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return new File([blob], `capture-${timestamp}.jpg`, { type: mimeType });
  };

  const stopVideoStream = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setVideoStream(null);
    }
    setIsCameraActive(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (f.size > maxBytes) {
      toast.error(t('fileTooLarge'));
      return;
    }
    if (!f.type.startsWith('image/')) {
      toast.error(t('invalidFileType'));
      return;
    }
    updateValue(f);
  };

  const handleRemove = () => {
    setPreview(null);
    updateValue(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    stopVideoStream();
  };

  const handleOpenCamera = async () => {
    if (isCapacitorNative()) {
      try {
        setIsCapturing(true);
        const result = await takePicture();
        if (result?.base64String) {
          const dataUrl = `data:image/jpeg;base64,${result.base64String}`;
          const file = await base64ToFile(dataUrl, `image/${result.format || 'jpeg'}`);
          const maxBytes = maxSizeMB * 1024 * 1024;
          if (file.size > maxBytes) {
            toast.error(t('fileTooLarge'));
            return;
          }
          updateValue(file);
        }
      } catch (err) {
        console.error('Camera error:', err);
      } finally {
        setIsCapturing(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1280 } },
        });
        setVideoStream(stream);
        setIsCameraActive(true);
      } catch (err) {
        toast.error(t('cameraAccessDenied'));
      }
    }
  };

  const handleCaptureFrame = () => {
    if (!videoStream) return;
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopVideoStream();

    base64ToFile(dataUrl).then((file) => {
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        toast.error(t('fileTooLarge'));
        return;
      }
      updateValue(file);
    });
  };

  if (isCameraActive && videoStream) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative rounded-lg overflow-hidden border-2 border-medical-primary/40 bg-black aspect-video flex flex-col items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={stopVideoStream}
              className="bg-white/20 border-white/40 text-white hover:bg-white/30"
            >
              {t('cancel')}
            </Button>
            <Button
              size="sm"
              onClick={handleCaptureFrame}
              className="bg-medical-primary hover:bg-medical-primary/90"
            >
              <Camera className="mr-1.5 h-4 w-4" />
              {t('takePhoto')}
            </Button>
          </div>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {!preview ? (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleOpenCamera}
            disabled={isCapturing}
            className="flex-1 flex items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-medical-primary/40 bg-medical-primary/5 hover:bg-medical-primary/10 hover:border-medical-primary/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCapturing ? (
              <div className="flex flex-col items-center gap-1.5">
                <Loader2 className="h-10 w-10 text-medical-primary animate-spin" />
                <span className="text-xs font-semibold text-medical-primary">{t('opening')}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-10 w-10 rounded-full bg-medical-primary flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-semibold text-medical-primary">{t('takePhoto')}</span>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/50 transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-10 w-10 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{t('selectFile')}</span>
            </div>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="relative">
          <Image
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
            width={600}
            height={300}
            unoptimized
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive flex items-center justify-center text-white hover:bg-destructive/90 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}