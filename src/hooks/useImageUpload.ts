'use client';

import { useState, useCallback } from 'react';

interface UseImageUploadOptions {
  maxSizeMB?: number;
  acceptedFormats?: string[];
  onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { maxSizeMB = 5, acceptedFormats = ['image/*'], onError } = options;

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) {
        return;
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const errorMsg = `File size must be less than ${maxSizeMB}MB`;
        onError?.(errorMsg);
        return;
      }

      // Validate file type
      const isValidType = acceptedFormats.some(format => {
        if (format === 'image/*') return file.type.startsWith('image/');
        return file.type === format;
      });

      if (!isValidType) {
        const errorMsg = 'Please select a valid image file';
        onError?.(errorMsg);
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMB, acceptedFormats, onError]
  );

  const removeImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  const clear = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  return {
    selectedImage,
    imagePreview,
    handleImageChange,
    removeImage,
    clear,
  };
}
