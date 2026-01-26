'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { useCreateVisit } from '@/lib/api/queries/useVisits';
import type { CreateVisitDto } from '@/lib/api/types';
import { z } from 'zod';

const visitSchema = z.object({
  diagnoses: z.string().min(1, 'Diagnoses is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  clinicId: z.string().min(1, 'Clinic ID is required'),
});

type VisitFormData = z.infer<typeof visitSchema>;

interface VisitFormProps {
  patientId: string;
  onSuccess?: (visitId: string) => void;
  onCancel?: () => void;
}

export function VisitForm({ patientId, onSuccess, onCancel }: VisitFormProps) {
  const t = useTranslations('visit');
  const tCommon = useTranslations('common');
  const { mutate: createVisit, isPending } = useCreateVisit();

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      diagnoses: '',
      patientId: patientId,
      clinicId: '',
    },
  });

  const onSubmit = (data: VisitFormData) => {
    const visitData: CreateVisitDto = {
      diagnoses: data.diagnoses,
      patientId: data.patientId,
    };

    createVisit(visitData, {
      onSuccess: (visit) => {
        toast.success(t('visitCreated'));
        form.reset();
        onSuccess?.(visit.id);
      },
      onError: () => {
        toast.error(t('visitCreateError'));
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('createVisit')}</CardTitle>
            <CardDescription>
              {t('visitDescription')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="diagnoses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnoses & Treatment Plan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter diagnoses, treatment plan, and notes..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clinicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter clinic ID"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardContent>
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Patient ID"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardContent className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                {tCommon('cancel')}
              </Button>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? tCommon('saving') : t('saveVisit')}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
