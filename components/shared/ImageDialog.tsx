'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageDialogProps {
  src: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

export function ImageDialog({
  src,
  open,
  onOpenChange,
  title,
}: ImageDialogProps) {
  const handleDownload = () => {
    if (!src) return;
    const link = document.createElement('a');
    link.href = src;
    link.download = src.split('/').pop() || 'image';
    link.target = '_blank';
    link.click();
  };

  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="relative flex items-center justify-between p-4 border-b bg-background">
          {title && (
            <DialogTitle className="text-lg font-medium">{title}</DialogTitle>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="ml-auto"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative w-full h-[70vh] bg-muted flex items-center justify-center">
          <img
            src={src}
            alt={title || 'Image'}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
