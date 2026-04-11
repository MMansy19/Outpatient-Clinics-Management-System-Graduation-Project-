'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { BaseFormDialog } from '@/components/shared/BaseFormDialog';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VoiceFormField } from '@/components/shared/VoiceFormField';
import { useAdminCreateMedication } from '@/lib/api/queries/useAdmin';
import { useFormState } from '@/src/hooks/useFormState';
import {
  medicationSchemaWithoutPatient,
  getLocalizedPeriodOptions,
  getLocalizedDosageOptions,
} from '@/lib/schemas/medicationSchema';
import type { MedicationFormDataWithoutPatient } from '@/lib/schemas/medicationSchema';

interface AdminMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess?: () => void;
}

export function AdminMedicationDialog({
  open,
  onOpenChange,
  patientId,
  onSuccess,
}: AdminMedicationDialogProps) {
  const t = useTranslations('medication');
  const tCommon = useTranslations('common');
  const { mutate: createMedication } = useAdminCreateMedication();
  const [audioFile, setAudioFile] = React.useState<File | null>(null);

  const getMedicationT = (key: string) => t(key);
  const periodOptions = getLocalizedPeriodOptions(getMedicationT);
  const dosageOptions = getLocalizedDosageOptions(getMedicationT);

  const form = useForm<MedicationFormDataWithoutPatient>({
    resolver: zodResolver(medicationSchemaWithoutPatient),
    defaultValues: {
      name: '',
      dosage: '1',
      period: '7',
      comments: '',
    },
  });

  const { isPending, execute } = useFormState({
    onSuccess: () => {
      form.reset();
      setAudioFile(null);
      onSuccess?.();
    },
    successMessage: t('medicationCreated'),
  });

  const onSubmit = (data: MedicationFormDataWithoutPatient) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('dosage', data.dosage);
    formData.append('period', data.period);
    formData.append('patientId', patientId);
    if (data.comments) formData.append('comments', data.comments);
    if (audioFile) formData.append('audio', audioFile);

    execute(() => {
      return new Promise((resolve, reject) => {
        createMedication(formData, {
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
        if (!isOpen) setAudioFile(null);
        onOpenChange(isOpen);
      }}
      title={t('addMedication')}
      description={t('medicationDescription')}
      isPending={isPending}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={t('addMedication')}
      cancelLabel={tCommon('cancel')}
      size="lg"
      form={form}
    >
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('dosage')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('dosagePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dosageOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t('dosageDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('duration')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('durationPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {periodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t('durationDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('notes')} ({tCommon('optional')})</FormLabel>
              <FormControl>
                <VoiceFormField
                  field={field}
                  placeholder={t('notesPlaceholder')}
                  className="min-h-[100px]"
                  rows={4}
                  onAudioCaptured={setAudioFile}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </BaseFormDialog>
  );
}
