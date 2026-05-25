'use client';

import React from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface ImageUploadFieldProps {
  label: string;
  /** Controlled value (preferred). When provided, parent owns the file state. */
  value?: File | null;
  /** Controlled onChange. Called with the new File or null when cleared. */
  onChange?: (file: File | null) => void;
  /** Legacy uncontrolled callback. Still supported for back-compat. */
  onImageSelect?: (file: File | null) => void;
  required?: boolean;
  error?: string;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  onImageSelect,
  required = false,
  error,
  maxSizeMB = 5,
  className = '',
}: ImageUploadFieldProps) {
  const t = useTranslations('doctor');
  const isControlled = value !== undefined;
  const [internalFile, setInternalFile] = React.useState<File | null>(null);
  const file = isControlled ? value ?? null : internalFile;

  const [preview, setPreview] = React.useState<string | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Generate preview whenever the file changes
  React.useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  const updateFile = React.useCallback(
    (next: File | null) => {
      if (!isControlled) setInternalFile(next);
      onChange?.(next);
      onImageSelect?.(next);
    },
    [isControlled, onChange, onImageSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    // Always reset the input so the same file can be picked again
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
    updateFile(f);
  };

  const handleRemove = () => updateFile(null);

  const borderClass = error
    ? 'border-red-400'
    : 'border-gray-300 hover:border-medical-primary/50';

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${borderClass}`}
        >
          <div className="flex flex-col items-center gap-3">
            <Button
              type="button"
              className="h-24 w-full flex flex-col items-center justify-center gap-1"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="h-6 w-6" />
              <span className="text-sm font-semibold">{t('takePhoto')}</span>
            </Button>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-medical-primary underline-offset-2 hover:underline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              {t('selectFile')}
            </button>
          </div>

          {/* Hidden inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
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
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
