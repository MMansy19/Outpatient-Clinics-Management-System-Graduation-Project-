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
import { VoiceFormField } from '@/components/shared/VoiceFormField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreateMedication } from '@/lib/api/queries/useMedications';
import { useFormState } from '@/src/hooks/useFormState';
import { medicationSchema, getLocalizedPeriodOptions, getLocalizedDosageOptions } from '@/lib/schemas/medicationSchema';
import type { CreateMedicationDto } from '@/lib/api/types';

interface MedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess?: (medicationId: string) => void;
}

export function MedicationDialog({
  open,
  onOpenChange,
  patientId,
  onSuccess,
}: MedicationDialogProps) {
  const t = useTranslations('medication');
  const tCommon = useTranslations('common');
  const { mutate: createMedication } = useCreateMedication();
  const [audioFile, setAudioFile] = React.useState<File | null>(null);

  // Helper function to create translation function for medication namespace
  const getMedicationT = (key: string) => t(key);

  const periodOptions = getLocalizedPeriodOptions(getMedicationT);
  const dosageOptions = getLocalizedDosageOptions(getMedicationT);

  const form = useForm<CreateMedicationDto>({
    mode: 'onChange',
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      patientId: patientId,
      name: '',
      dosage: '1',
      period: '7',
      comments: '',
    },
  });

  const { isPending, execute } = useFormState({
    onSuccess: (response) => {
      form.reset();
      setAudioFile(null);
      onSuccess?.(response.id);
    },
    successMessage: t('medicationCreated'),
  });

  const onSubmit = (data: CreateMedicationDto) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('dosage', data.dosage);
    formData.append('period', data.period);
    formData.append('patientId', data.patientId);
    if (data.comments) {
      formData.append('comments', data.comments);
    }
    if (audioFile) {
      formData.append('audio', audioFile);
    }

    execute(
      () => {
        return new Promise((resolve, reject) => {
          createMedication(formData, {
            onSuccess: resolve,
            onError: reject,
          });
        });
      },
      `${data.name} - ${data.dosage} ${Number(data.dosage) === 1 ? 'tablet' : 'tablets'} for ${data.period} days`
    );
  };

  return (
    <BaseFormDialog 
      open={open}
      onOpenChange={onOpenChange}
      title={t('addMedication')}
      description={t('medicationDescription')}
      isPending={isPending}
      submitDisabled={!form.formState.isValid}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={t('addMedication')}
      cancelLabel={tCommon('cancel')}
      size="lg"
      form={form}
    >
      <div className="space-y-6">
        {/* Medication Name */}
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

        {/* Dosage */}
        <FormField
          control={form.control}
          name="dosage"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('dosage')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('dosagePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dosageOptions.map((dosageOption) => (
                    <SelectItem key={dosageOption.value} value={dosageOption.value.toString()}>
                      {dosageOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t('dosageDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Period (Duration in days) */}
        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('duration')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('durationPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {periodOptions.map((periodOption) => (
                    <SelectItem key={periodOption.value} value={periodOption.value.toString()}>
                      {periodOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>{t('durationDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Comments (Optional instructions) */}
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('notes')}
              </FormLabel>
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
