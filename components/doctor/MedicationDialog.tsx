'use client';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreateMedication } from '@/lib/api/queries/useMedications';
import { useFormState } from '@/src/hooks/useFormState';
import { medicationSchema, COMMON_PERIODS, COMMON_DOSAGES } from '@/lib/schemas/medicationSchema';
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

  const form = useForm<CreateMedicationDto>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      patientId,
      name: '',
      dosage: 1,
      period: 7,
      comments: '',
    },
  });

  const { isPending, execute } = useFormState({
    onSuccess: (response) => {
      form.reset();
      onSuccess?.(response.id);
    },
    successMessage: t('medicationCreated'),
  });

  const onSubmit = (data: CreateMedicationDto) => {
    execute(
      () => {
        return new Promise((resolve, reject) => {
          createMedication(data, {
            onSuccess: resolve,
            onError: reject,
          });
        });
      },
      `${data.name} - ${data.dosage} ${data.dosage === 1 ? 'tablet' : 'tablets'} for ${data.period} days`
    );
  };

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('addMedication')}
      description={t('medicationDescription')}
      isPending={isPending}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={t('addMedication')}
      cancelLabel={tCommon('cancel')}
      size="lg"
    >
      <div className="space-y-6">
        {/* Medication Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
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
              <FormLabel>{t('dosage')}</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('dosagePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMMON_DOSAGES.map((dosageOption) => (
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
              <FormLabel>{t('duration')}</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('durationPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMMON_PERIODS.map((periodOption) => (
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
                {t('notes')} ({tCommon('optional')})
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('notesPlaceholder')}
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>{t('frequencyDescription')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </BaseFormDialog>
  );
}
