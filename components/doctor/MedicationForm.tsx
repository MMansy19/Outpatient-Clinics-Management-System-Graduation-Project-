'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { VoiceFormField } from '@/components/shared/VoiceFormField';

import { useCreateMedication } from '@/lib/api/queries/useMedications';
import { medicationSchema, getLocalizedPeriodOptions, getLocalizedDosageOptions } from '@/lib/schemas/medicationSchema';
import type { CreateMedicationDto } from '@/lib/api/types';

interface MedicationFormProps {
  patientId: string; // UUID format
  onSuccess?: (medicationId: string) => void;
  onCancel?: () => void;
}

export function MedicationForm({ 
  patientId, 
  onSuccess, 
  onCancel 
}: MedicationFormProps) {
  const t = useTranslations('medication');
  const tCommon = useTranslations('common');
  const { mutate: createMedication, isPending } = useCreateMedication();
  const [audioFile, setAudioFile] = React.useState<File | null>(null);

  // Helper function to create translation function for medication namespace
  const getMedicationT = (key: string) => t(key);

  const periodOptions = getLocalizedPeriodOptions(getMedicationT);
  const dosageOptions = getLocalizedDosageOptions(getMedicationT);

  const form = useForm<CreateMedicationDto>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      patientId,
      name: '',
      dosage: '1',
      period: '7',
      comments: '',
    },
  });

  const onSubmit = (data: CreateMedicationDto) => {
    console.log('🔵 Creating medication:', data);

    let submitData: CreateMedicationDto | FormData;
    if (audioFile) {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('dosage', data.dosage);
      formData.append('period', data.period);
      formData.append('patientId', data.patientId);
      if (data.comments) formData.append('comments', data.comments);
      formData.append('audio', audioFile);
      submitData = formData;
    } else {
      submitData = data;
    }
    
    createMedication(submitData, {
      onSuccess: (response) => {
        console.log('✅ Medication created:', response);
        const dosageUnit = data.dosage === '1' ? 'tablet' : 'tablets';
        toast.success(t('medicationCreated'), {
          description: `${data.name} - ${data.dosage} ${dosageUnit} for ${data.period} days`,
        });
        form.reset();
        setAudioFile(null);
        onSuccess?.(response.id);
      },
      onError: (error) => {
        console.error('❌ Medication creation failed:', error);
        toast.error(t('medicationCreateError'), {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('addMedication')}</CardTitle>
            <CardDescription>
              {t('medicationDescription')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Medication Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('namePlaceholder')}
                      {...field} 
                    />
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
                    onValueChange={field.onChange} 
                    value={field.value}
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
                  <FormDescription>
                    {t('dosageDescription')}
                  </FormDescription>
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
                  <FormDescription>
                    {t('durationDescription')}
                  </FormDescription>
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
          </CardContent>

          <CardFooter className="flex gap-2">
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
              {isPending ? tCommon('saving') : t('addMedication')}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

