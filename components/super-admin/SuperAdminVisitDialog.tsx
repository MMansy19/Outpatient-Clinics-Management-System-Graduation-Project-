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
import { superAdminApi } from '@/lib/api/superAdmin.service';
import { VoiceFormField } from '@/components/shared/VoiceFormField';
import { useQueryClient } from '@tanstack/react-query';
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
  diagnoses: z.string().min(1, 'Diagnoses is required'),
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
  const queryClient = useQueryClient();

  const form = useForm<VisitFormData>({
    mode: 'onChange',
    resolver: zodResolver(visitSchema),
    defaultValues: {
      diagnoses: '',
    },
  });

  const onSubmit = async (data: VisitFormData) => {
    setIsPending(true);
    try {
      await superAdminApi.createVisit({
        diagnoses: data.diagnoses,
        patientId,
        clinicId,
        audio: audioFile || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['super-admin-patient-visits', patientId] });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    <VoiceFormField
                      field={field}
                      placeholder={tVisit('enterDiagnosesTreatmentPlan')}
                      label=""
                      description=""
                      disabled={isPending}
                      multiline
                      rows={6}
                      onAudioCaptured={(file) => setAudioFile(file)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
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