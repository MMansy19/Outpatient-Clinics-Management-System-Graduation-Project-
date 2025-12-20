'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { CheckCircle2, AlertCircle, Camera, User, Calendar, Hash, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnrichedScanData } from '@/types/ocr';

interface ScannedDataPreviewProps {
  open: boolean;
  onClose: () => void;
  data: EnrichedScanData;
  onConfirm: (data: EnrichedScanData) => void;
  onRetake: () => void;
}

/**
 * ScannedDataPreview Component
 * 
 * Displays extracted National ID data for user review
 * Shows confidence indicators and allows data validation
 * 
 * Features:
 * - Visual confidence indicators (high/medium/low)
 * - Field-by-field breakdown with icons
 * - Thumbnail of captured image (if available)
 * - Confirm/Retake actions
 * - Handles mock data mode
 */
export function ScannedDataPreview({
  open,
  onClose,
  data,
  onConfirm,
  onRetake,
}: ScannedDataPreviewProps) {
  const t = useTranslations('scan');
  const tCommon = useTranslations('common');

  const confidenceLevel = data.confidence >= 0.8 ? 'high' : data.confidence >= 0.6 ? 'medium' : 'low';
  const confidenceColor = {
    high: 'text-green-600 dark:text-green-400',
    medium: 'text-amber-600 dark:text-amber-400',
    low: 'text-red-600 dark:text-red-400',
  }[confidenceLevel];

  const confidenceBg = {
    high: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900',
    medium: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900',
    low: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900',
  }[confidenceLevel];

  const handleConfirm = () => {
    onConfirm(data);
    onClose();
  };

  const handleRetake = () => {
    onRetake();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-medical-primary" />
            {t('scanComplete')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Confidence Indicator */}
          <div className={`p-4 rounded-lg border ${confidenceBg}`}>
            <div className="flex items-start gap-3">
              {confidenceLevel === 'high' ? (
                <CheckCircle2 className={`h-5 w-5 mt-0.5 ${confidenceColor}`} />
              ) : (
                <AlertCircle className={`h-5 w-5 mt-0.5 ${confidenceColor}`} />
              )}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${confidenceColor}`}>
                    {t(`confidence.${confidenceLevel}`)}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(data.confidence * 100)}%
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {confidenceLevel === 'high' 
                    ? t('confidence.highDesc')
                    : confidenceLevel === 'medium'
                    ? t('confidence.mediumDesc')
                    : t('confidence.lowDesc')
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Mock Data Indicator */}
          {data.isMockData && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  {t('mockDataNotice')}
                </p>
              </div>
            </div>
          )}

          {/* Extracted Data */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">{t('extractedData')}</h3>
            
            <div className="space-y-2">
              {/* Full Name */}
              <DataField
                icon={<User className="h-4 w-4" />}
                label={t('fields.fullName')}
                value={data.fullName}
              />

              {/* National ID */}
              <DataField
                icon={<Hash className="h-4 w-4" />}
                label={t('fields.nationalId')}
                value={data.nationalId}
              />

              {/* Date of Birth */}
              <DataField
                icon={<Calendar className="h-4 w-4" />}
                label={t('fields.dateOfBirth')}
                value={data.dateOfBirth.toLocaleDateString()}
              />

              {/* Gender */}
              <DataField
                icon={<User className="h-4 w-4" />}
                label={t('fields.gender')}
                value={data.gender === 'male' ? tCommon('male') : tCommon('female')}
              />

              {/* Address (if available) */}
              {data.address && (
                <DataField
                  icon={<MapPin className="h-4 w-4" />}
                  label={t('fields.address')}
                  value={data.address}
                />
              )}
            </div>
          </div>

          {/* Image Thumbnail (if available) */}
          {data.imageBase64 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t('capturedImage')}</h3>
              <div className="relative aspect-[3/2] rounded-lg overflow-hidden border bg-muted border-muted-foreground/25">
                <Image
                  src={`data:image/jpeg;base64,${data.imageBase64}`}
                  alt={t('capturedIdImage')}
                  className="w-full h-full object-contain px-4"
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleConfirm}
              className="w-full h-11 bg-medical-primary hover:bg-medical-primary/90"
              size="lg"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {t('useThisData')}
            </Button>

            <Button
              variant="outline"
              onClick={handleRetake}
              className="w-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              {t('retake')}
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-muted-foreground text-center">
            {t('reviewDataHint')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * DataField Component
 * Reusable field display with icon, label, and value
 */
function DataField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
