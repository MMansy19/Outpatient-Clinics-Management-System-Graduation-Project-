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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { superAdminApi } from '@/lib/api/superAdmin.service';
import { toast } from 'sonner';

interface SuperAdminMedicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  clinicId: string;
  onSuccess?: () => void;
}

const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.number({ required_error: 'Dosage is required' }),
  period: z.number({ required_error: 'Period is required' }),
  comments: z.string().optional(),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

export function SuperAdminMedicationDialog({
  open,
  onOpenChange,
  patientId,
  clinicId,
  onSuccess,
}: SuperAdminMedicationDialogProps) {
  const t = useTranslations('superAdmin');
  const tCommon = useTranslations('common');

  const [isPending, setIsPending] = useState(false);

  const form = useForm<MedicationFormData>({
    mode: 'onChange',
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      dosage: undefined,
      period: undefined,
      comments: '',
    },
  });

  const onSubmit = async (data: MedicationFormData) => {
    console.log('[Medication Dialog] Submitting:', {
      name: data.name,
      dosage: data.dosage,
      period: data.period,
      comments: data.comments,
      patientId,
      clinicId,
      types: {
        dosage: typeof data.dosage,
        period: typeof data.period,
      },
    });
    setIsPending(true);
    try {
      await superAdminApi.createMedication({
        name: data.name,
        dosage: data.dosage,
        period: data.period,
        comments: data.comments || undefined,
        patientId,
        clinicId,
      });

      toast.success(t('medicationCreatedSuccess'));
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create medication:', error);
      toast.error(t('medicationCreateError'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addMedication')}</DialogTitle>
          <DialogDescription>{t('addMedicationDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('medicationName')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('medicationNamePlaceholder')}
                      disabled={isPending}
                    />
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
                  <FormLabel>{t('dosage')}</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() ?? ''} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('dosagePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">500mg</SelectItem>
                      <SelectItem value="2">250mg</SelectItem>
                      <SelectItem value="3">100mg</SelectItem>
                      <SelectItem value="4">50mg</SelectItem>
                      <SelectItem value="5">25mg</SelectItem>
                      <SelectItem value="6">125mg</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('period')}</FormLabel>
                  <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString() ?? ''} disabled={isPending}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('periodPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">0 days</SelectItem>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="4">4 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="6">6 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="8">8 days</SelectItem>
                      <SelectItem value="9">9 days</SelectItem>
                      <SelectItem value="10">10 days</SelectItem>
                      <SelectItem value="11">11 days</SelectItem>
                      <SelectItem value="12">12 days</SelectItem>
                      <SelectItem value="13">13 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="15">15 days</SelectItem>
                      <SelectItem value="16">16 days</SelectItem>
                      <SelectItem value="17">17 days</SelectItem>
                      <SelectItem value="18">18 days</SelectItem>
                      <SelectItem value="19">19 days</SelectItem>
                      <SelectItem value="20">20 days</SelectItem>
                      <SelectItem value="21">21 days</SelectItem>
                      <SelectItem value="22">22 days</SelectItem>
                      <SelectItem value="23">23 days</SelectItem>
                      <SelectItem value="24">24 days</SelectItem>
                      <SelectItem value="25">25 days</SelectItem>
                      <SelectItem value="26">26 days</SelectItem>
                      <SelectItem value="27">27 days</SelectItem>
                      <SelectItem value="28">28 days</SelectItem>
                      <SelectItem value="29">29 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="35">35 days</SelectItem>
                      <SelectItem value="42">42 days</SelectItem>
                      <SelectItem value="49">49 days</SelectItem>
                      <SelectItem value="56">56 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="63">63 days</SelectItem>
                      <SelectItem value="70">70 days</SelectItem>
                      <SelectItem value="77">77 days</SelectItem>
                      <SelectItem value="84">84 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="120">120 days</SelectItem>
                      <SelectItem value="150">150 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="210">210 days</SelectItem>
                      <SelectItem value="240">240 days</SelectItem>
                      <SelectItem value="270">270 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('comments')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t('commentsPlaceholder')}
                      disabled={isPending}
                      rows={3}
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
                    {t('creating')}
                  </>
                ) : (
                  t('create')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}