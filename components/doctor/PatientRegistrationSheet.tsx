'use client';

import { useTranslations } from 'next-intl';
import { Camera, Pencil, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PatientRegistrationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectScanId: () => void;
  onSelectManualEntry: () => void;
}

/**
 * PatientRegistrationSheet Component
 * 
 * Bottom sheet that presents two options for adding a patient:
 * 1. Scan National ID (using camera) - Recommended
 * 2. Manual Entry (fill form yourself) - Fallback
 * 
 * Mobile-first design with large touch targets and clear visual hierarchy
 */
export function PatientRegistrationSheet({
  open,
  onOpenChange,
  onSelectScanId,
  onSelectManualEntry,
}: PatientRegistrationSheetProps) {
  const t = useTranslations('doctor');
  const tScan = useTranslations('scan');
  const tCommon = useTranslations('common');

  const handleScanId = () => {
    onOpenChange(false);
    onSelectScanId();
  };

  const handleManualEntry = () => {
    onOpenChange(false);
    onSelectManualEntry();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {t('addNewPatient')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {tScan('selectRegistrationMethod')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Primary Option: Scan National ID */}
          <button
            onClick={handleScanId}
            className="group relative overflow-hidden rounded-lg border-2 border-medical-primary bg-medical-primary/5 p-6 text-left transition-all hover:bg-medical-primary/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-medical-primary p-3">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold text-medical-primary">
                  {tScan('scanNationalId')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tScan('scanDescription')}
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-medical-primary">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-medical-primary animate-pulse" />
                  {tScan('recommended')}
                </div>
              </div>
            </div>
          </button>

          {/* Secondary Option: Manual Entry */}
          <button
            onClick={handleManualEntry}
            className="group relative overflow-hidden rounded-lg border-2 border-border bg-background p-6 text-left transition-all hover:bg-accent hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-muted p-3">
                  <Pencil className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-semibold">
                  {tScan('manualEntry')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tScan('manualDescription')}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          {tCommon('cancel')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
