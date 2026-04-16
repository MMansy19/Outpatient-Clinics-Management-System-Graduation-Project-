'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { superAdminApi } from '@/lib/api/superAdmin.service';
import { toast } from 'sonner';

interface SuperAdminVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  clinicId: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const visitSchema = z.object({
  diagnoses: z.string().optional(),
});

type VisitFormData = z.infer<typeof visitSchema>;

export function SuperAdminVisitDialog({
  open,
  onOpenChange,
  patientId,
  clinicId,
  onSuccess,
  trigger,
}: SuperAdminVisitDialogProps) {
  const tVisit = useTranslations('visit');
  const tCommon = useTranslations('common');

  const [isPending, setIsPending] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const form = useForm<VisitFormData>({
    mode: 'onChange',
    resolver: zodResolver(visitSchema),
    defaultValues: {
      diagnoses: '',
    },
  });

  const diagnosesValue = form.watch('diagnoses');
  const visitContentReady =
    (diagnosesValue?.trim()?.length ?? 0) > 0 || !!audioFile;

  const onSubmit = async (data: VisitFormData) => {
    const hasText = data.diagnoses && data.diagnoses.trim().length > 0;
    const hasAudio = !!audioFile;

    if (!hasText && !hasAudio) {
      setValidationError(tVisit('diagnosesOrAudioRequired'));
      return;
    }
    setValidationError(null);
    setIsPending(true);

    try {
      if (hasAudio && audioFile) {
        const formData = new FormData();
        formData.append('diagnoses', data.diagnoses || '');
        formData.append('audio', audioFile);
        formData.append('patientId', patientId);
        formData.append('clinicId', clinicId);
        
        await superAdminApi.createVisit({
          diagnoses: data.diagnoses,
          patientId,
          clinicId,
        } as any);
      } else {
        await superAdminApi.createVisit({
          diagnoses: data.diagnoses,
          patientId,
          clinicId,
        });
      }

      toast.success(tVisit('visitCreated'));
      form.reset();
      setAudioFile(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create visit:', error);
      toast.error(tVisit('visitCreateError'));
    } finally {
      setIsPending(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setAudioFile(null);
      setValidationError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tVisit('createVisit')}</DialogTitle>
          <DialogDescription>{tVisit('visitDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="diagnoses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{tVisit('diagnosesTreatmentPlan')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={tVisit('enterDiagnosesTreatmentPlan')}
                      className="min-h-[150px]"
                      rows={6}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {validationError && (
              <p className="text-sm font-medium text-destructive">{validationError}</p>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isPending || !visitContentReady}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tVisit('creating')}
                  </>
                ) : (
                  tVisit('saveVisit')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}