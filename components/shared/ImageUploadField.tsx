'use client';

import React from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/src/hooks/useImageUpload';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ImageUploadFieldProps {
  label: string;
  onImageSelect?: (file: File | null) => void;
  maxSizeMB?: number;
  className?: string;
}

export function ImageUploadField({
  label,
  onImageSelect,
  maxSizeMB = 5,
  className = '',
}: ImageUploadFieldProps) {
  const { selectedImage, imagePreview, handleImageChange, removeImage } =
    useImageUpload({
      maxSizeMB,
    });
  const t = useTranslations('doctor');

  React.useEffect(() => {
    onImageSelect?.(selectedImage);
  }, [selectedImage, onImageSelect]);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium">{label}</label>
      {!imagePreview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-medical-primary/50 transition-colors">
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <label htmlFor="image-upload" className="cursor-pointer">
            <span className="text-sm text-gray-600 hover:text-medical-primary">
              {t('uploadScanImage')}
            </span>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      ) : (
        <div className="relative">
          <Image
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
            width={600}
            height={300}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
