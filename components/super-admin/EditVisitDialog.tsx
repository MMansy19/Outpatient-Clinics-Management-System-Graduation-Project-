'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useSuperAdminUpdateVisit } from '@/lib/api/queries/useSuperAdminMutations';
import { showOfflineAwareSuccess } from '@/lib/utils/offlineToast';
import type { SuperAdminVisitItem } from '@/lib/api/types';

interface EditVisitDialogProps {
  visit: SuperAdminVisitItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditVisitDialog({
  visit,
  open,
  onOpenChange,
  onSuccess,
}: EditVisitDialogProps) {
  const t = useTranslations('visit');
  const tAdmin = useTranslations('admin');
  const [loading, setLoading] = useState(false);
  const [diagnoses, setDiagnoses] = useState('');
  const { mutate: updateVisit } = useSuperAdminUpdateVisit();

  useEffect(() => {
    if (visit) {
      setDiagnoses(visit.diagnoses || '');
    }
  }, [visit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!visit) return;

    setLoading(true);
    updateVisit(
      { id: visit.id, data: { diagnoses }, patientId: visit.patient?.id },  
      {
        onSuccess: (result) => {
          showOfflineAwareSuccess(result, {
            onlineMessage: t('visitUpdated'),
          });
          onSuccess();
          onOpenChange(false);
        },
        onError: (error) => {
          console.error('Failed to update visit:', error);
          toast.error(tAdmin('visitUpdateFailed') ?? 'Failed to update visit');
        },
        onSettled: () => setLoading(false),
      },
    );
  };

  if (!visit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editVisit')}</DialogTitle>
          <DialogDescription>{t('editVisitDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="diagnoses">{tAdmin('diagnoses')}</Label>
              <Textarea
                id="diagnoses"
                value={diagnoses}
                onChange={(e) => setDiagnoses(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {tAdmin('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? tAdmin('saving') : t('updateVisit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
