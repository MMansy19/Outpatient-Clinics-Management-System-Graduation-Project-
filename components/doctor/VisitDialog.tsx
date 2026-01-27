'use client';

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
import type { CreateVisitDto } from '@/lib/api/types';
import { z } from 'zod';

const visitSchema = z.object({
  diagnoses: z.string().min(1, 'Diagnoses is required'),
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
  // Note: patientId prop is actually the socialSecurityNumber (National ID as string)
  // This naming is for API consistency - the field in CreateVisitDto is called 'patientId'
  // but it represents the socialSecurityNumber
  const t = useTranslations('visit');
  const tCommon = useTranslations('common');
  const { mutate: createVisit } = useCreateVisit();

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      diagnoses: '',
    },
  });

  const { isPending, execute } = useFormState({
    onSuccess: (visit) => {
      form.reset();
      onSuccess?.(visit.id);
    },
    successMessage: t('visitCreated'),
  });

  const onSubmit = (data: VisitFormData) => {
    const visitData: CreateVisitDto = {
      diagnoses: data.diagnoses,
      patientId: patientId,
    };

    execute(() => {
      return new Promise((resolve, reject) => {
        createVisit(visitData, {
          onSuccess: resolve,
          onError: reject,
        });
      });
    });
  };

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
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
              <FormLabel>Diagnoses & Treatment Plan</FormLabel>
              <FormControl>
                <VoiceFormField
                  field={field}
                  placeholder="Enter diagnoses, treatment plan, and notes..."
                  className="min-h-[150px]"
                  rows={6}
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
