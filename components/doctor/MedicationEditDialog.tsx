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
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useUpdateMedication } from '@/lib/api/queries/useMedications';
import { useFormState } from '@/src/hooks/useFormState';
import {
  medicationSchemaWithoutPatient,
  getLocalizedPeriodOptions,
  getLocalizedDosageOptions,
} from '@/lib/schemas/medicationSchema';
import type { MedicationFormDataWithoutPatient } from '@/lib/schemas/medicationSchema';
import type { CreateMedicationDto } from '@/lib/api/types';

interface MedicationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: {
    id: string;
    name: string;
    dosage: number;
    period: number;
    comments?: string;
    commentsAudioUrl?: string;
  };
  onSuccess?: () => void;
}

export function MedicationEditDialog({
  open,
  onOpenChange,
  medication,
  onSuccess,
}: MedicationEditDialogProps) {
  const t = useTranslations('medication');
  const tCommon = useTranslations('common');
  const { mutate: updateMedication } = useUpdateMedication();

  // Helper function to create translation function for medication namespace
  const getMedicationT = (key: string) => t(key);

  const periodOptions = getLocalizedPeriodOptions(getMedicationT);
  const dosageOptions = getLocalizedDosageOptions(getMedicationT);

  const form = useForm<MedicationFormDataWithoutPatient>({
    mode: 'onChange',
    resolver: zodResolver(medicationSchemaWithoutPatient),
    defaultValues: {
      name: medication.name,
      dosage: String(medication.dosage),
      period: String(medication.period),
      comments: medication.comments || '',
    },
  });

  const { isPending, execute } = useFormState({
    onSuccess: () => {
      form.reset();
      setAudioFile(null);
      onSuccess?.();
    },
    successMessage: t('medicationUpdated'),
  });

  const [audioFile, setAudioFile] = React.useState<File | null>(null);

  const onSubmit = (data: MedicationFormDataWithoutPatient) => {
    execute(() => {
      let payload: Partial<CreateMedicationDto> | FormData = data;
      if (audioFile) {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.dosage) formData.append('dosage', data.dosage.toString());
        if (data.period) formData.append('period', data.period.toString());
        if (data.comments) formData.append('comments', data.comments);
        formData.append('audio', audioFile);
        payload = formData;
      }
      return new Promise((resolve, reject) => {
        updateMedication(
          {
            medicationId: medication.id,
            data: payload as Partial<CreateMedicationDto>,
            socialSecurityNumber: '', // not required for invalidation in this context
          },
          {
            onSuccess: resolve,
            onError: reject,
          }
        );
      });
    }, `${data.name} updated successfully`);
  };

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('editMedication')}
      description={t('editMedicationDescription')}
      isPending={isPending}
      submitDisabled={!form.formState.isValid}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={t('updateMedication')}
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
                    <SelectItem
                      key={dosageOption.value}
                      value={dosageOption.value.toString()}
                    >
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
                    <SelectItem
                      key={periodOption.value}
                      value={periodOption.value.toString()}
                    >
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
                {t('notes')} ({tCommon('optional')})
              </FormLabel>
              <FormControl>
                <VoiceFormField
                  field={{ ...field, value: field.value || '' }}
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

        {medication.commentsAudioUrl && (
          <div>
            <p className="text-sm font-medium mb-2">
              {t('existingAudioRecording')}
            </p>
            <AudioPlayer src={medication.commentsAudioUrl} compact />
          </div>
        )}
      </div>
    </BaseFormDialog>
  );
}
