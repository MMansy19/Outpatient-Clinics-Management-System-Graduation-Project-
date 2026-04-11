'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { BaseFormDialog } from '@/components/shared/BaseFormDialog';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { VoiceFormField } from '@/components/shared/VoiceFormField';

import { useCreateVisit } from '@/lib/api/queries/useVisits';
import { useFormState } from '@/src/hooks/useFormState';
import { z } from 'zod';

const visitSchema = z.object({
  diagnoses: z.string().optional(),
});

type VisitFormData = z.infer<typeof visitSchema>;

interface VisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess?: (visitId: string) => void;
}

export function VisitDialog({
  open,
  onOpenChange,
  patientId,
  onSuccess,
}: VisitDialogProps) {
  const t = useTranslations('visit');
  const tCommon = useTranslations('common');
  const { mutate: createVisit } = useCreateVisit();
  const [audioFile, setAudioFile] = React.useState<File | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      diagnoses: '',
    },
  });

  const { isPending, execute } = useFormState({
    onSuccess: (visit) => {
      form.reset();
      setAudioFile(null);
      setValidationError(null);
      onSuccess?.(visit.id);
    },
    successMessage: t('visitCreated'),
  });

  const onSubmit = (data: VisitFormData) => {
    const hasText = data.diagnoses && data.diagnoses.trim().length > 0;
    const hasAudio = !!audioFile;

    if (!hasText && !hasAudio) {
      setValidationError(t('diagnosesOrAudioRequired'));
      return;
    }
    setValidationError(null);

    const formData = new FormData();
    if (hasText) {
      formData.append('diagnoses', data.diagnoses!);
    }
    if (hasAudio) {
      formData.append('audio', audioFile);
    }
    formData.append('patientId', patientId);

    execute(() => {
      return new Promise((resolve, reject) => {
        createVisit(formData, {
          onSuccess: resolve,
          onError: reject,
        });
      });
    });
  };

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setAudioFile(null);
          setValidationError(null);
        }
        onOpenChange(isOpen);
      }}
      title={t('createVisit')}
      description={t('visitDescription')}
      isPending={isPending}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={t('saveVisit')}
      cancelLabel={tCommon('cancel')}
      size="lg"
      form={form}
    >
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="diagnoses"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('diagnosesTreatmentPlan')}</FormLabel>
              <FormControl>
                <VoiceFormField
                  field={field}
                  placeholder={t('enterDiagnosesTreatmentPlan')}
                  className="min-h-[150px]"
                  rows={6}
                  onAudioCaptured={setAudioFile}
                />
              </FormControl>
              <FormMessage />
              {validationError && (
                <p className="text-sm font-medium text-destructive">{validationError}</p>
              )}
            </FormItem>
          )}
        />
      </div>
    </BaseFormDialog>
  );
}
