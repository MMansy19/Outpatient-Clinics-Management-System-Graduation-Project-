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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { superAdminApi } from '@/lib/api/superAdmin.service';
import type { PatientResponse } from '@/lib/api/types';

interface EditPatientDialogProps {
  patient: PatientResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditPatientDialog({
  patient,
  open,
  onOpenChange,
  onSuccess,
}: EditPatientDialogProps) {
  const t = useTranslations('admin');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    job: '',
    address: '',
  });

  // Update form data when patient changes
  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.user.firstName,
        lastName: patient.user.lastName,
        job: patient.job,
        address: patient.address,
      });
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patient) return;

    try {
      setLoading(true);
      await superAdminApi.updatePatient(patient.id, formData);
      toast.success(t('patientUpdatedSuccess'));
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(t('patientUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editPatient')}</DialogTitle>
          <DialogDescription>
            {t('updatePatientInformation')} (ID: {patient.id.substring(0, 8)}
            ...)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('firstName')}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">{t('lastName')}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job">{t('job')}</Label>
            <Input
              id="job"
              value={formData.job}
              onChange={(e) =>
                setFormData({ ...formData, job: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('address')}</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('updating') : t('updatePatient')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
