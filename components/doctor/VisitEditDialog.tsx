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
import { Textarea } from '@/components/ui/textarea';

import { useUpdateVisit } from '@/lib/api/queries/useVisits';
import { useFormState } from '@/src/hooks/useFormState';
import { z } from 'zod';

const visitSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  treatment_plan: z.string().optional(),
  notes: z.string().optional(),
});

type VisitEditFormData = z.infer<typeof visitSchema>;

interface VisitEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: {
    id: string;
    diagnosis: string;
    treatment_plan?: string;
    notes?: string;
  };
  onSuccess?: () => void;
}

export function VisitEditDialog({
  open,
  onOpenChange,
  visit,
  onSuccess,
}: VisitEditDialogProps) {
  const t = useTranslations('visit');
  const tCommon = useTranslations('common');
  const { mutate: updateVisit } = useUpdateVisit();

  const form = useForm<VisitEditFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      diagnosis: visit.diagnosis || '',
      treatment_plan: visit.treatment_plan || '',
      notes: visit.notes || '',
    },
  });

  const { isPending, execute } = useFormState({
    onSuccess: () => {
      form.reset();
      onSuccess?.();
    },
    successMessage: t('visitUpdated'),
  });

  const onSubmit = (data: VisitEditFormData) => {
    const visitData: Partial<VisitEditFormData> = {
      diagnosis: data.diagnosis,
      treatment_plan: data.treatment_plan,
      notes: data.notes,
    };

    execute(() => {
      return new Promise((resolve, reject) => {
        updateVisit(
          { id: Number(visit.id), data: visitData },
          {
            onSuccess: resolve,
            onError: reject,
          }
        );
      });
    });
  };

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('editVisit')}
      description={t('editVisitDescription')}
      isPending={isPending}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={t('updateVisit')}
      cancelLabel={tCommon('cancel')}
      size="lg"
    >
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter diagnosis..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatment_plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment Plan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter treatment plan..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter additional notes..."
                  className="min-h-[100px]"
                  {...field}
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
