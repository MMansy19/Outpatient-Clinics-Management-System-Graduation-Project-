'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, Mic, Sparkles } from 'lucide-react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

import { useCreateVisit } from '@/lib/api/queries/useVisits';
import { visitSchema, type VisitFormData } from '@/lib/schemas/visitSchema';

interface VisitFormProps {
  patientId: number;
  onSuccess?: (visitId: number) => void;
  onCancel?: () => void;
}

export function VisitForm({ patientId, onSuccess, onCancel }: VisitFormProps) {
  const t = useTranslations('doctor');
  const { mutate: createVisit, isPending } = useCreateVisit();

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      patient_id: patientId,
      chief_complaint: '',
      history_present_illness: '',
      vitals: {
        weight: 0,
        height: undefined,
        temperature: undefined,
        blood_pressure_systolic: undefined,
        blood_pressure_diastolic: undefined,
        heart_rate: undefined,
        respiratory_rate: undefined,
        oxygen_saturation: undefined,
      },
      physical_examination: '',
      diagnosis: '',
      treatment_plan: '',
      notes: '',
    },
  });

  const onSubmit = (data: VisitFormData) => {
    createVisit(data, {
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

  const handleVoiceInput = () => {
    // Stub for future voice-to-text implementation
    toast.info(t('voiceFeatureComingSoon'));
  };

  const handleAIDiagnosis = () => {
    // Stub for future AI diagnosis implementation
    toast.info(t('aiFeatureComingSoon'));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Chief Complaint & History */}
        <Card>
          <CardHeader>
            <CardTitle>{t('chiefComplaintHistory')}</CardTitle>
            <CardDescription>{t('chiefComplaintDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="chief_complaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('chiefComplaint')} *</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        placeholder={t('chiefComplaintPlaceholder')}
                        disabled={isPending}
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleVoiceInput}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="history_present_illness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('historyPresentIllness')}</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        placeholder={t('historyPlaceholder')}
                        disabled={isPending}
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleVoiceInput}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Vitals */}
        <Card>
          <CardHeader>
            <CardTitle>{t('vitals')}</CardTitle>
            <CardDescription>{t('vitalsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="vitals.weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('weight')} * (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="75.5"
                        disabled={isPending}
                        {...field}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-medical-error">
                      {t('weightMandatory')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vitals.height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('height')} (cm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="175"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vitals.temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('temperature')} (°C)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="37.0"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vitals.heart_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('heartRate')} (bpm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="72"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vitals.blood_pressure_systolic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('systolicBP')} (mmHg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="120"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vitals.blood_pressure_diastolic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('diastolicBP')} (mmHg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="80"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vitals.respiratory_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('respiratoryRate')} (/min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="16"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vitals.oxygen_saturation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('oxygenSaturation')} (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="98"
                        disabled={isPending}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Examination */}
        <Card>
          <CardHeader>
            <CardTitle>{t('physicalExamination')}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="physical_examination"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        placeholder={t('physicalExaminationPlaceholder')}
                        disabled={isPending}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleVoiceInput}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Diagnosis & Treatment */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('diagnosisTreatment')}</CardTitle>
                <CardDescription>{t('diagnosisTreatmentDescription')}</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAIDiagnosis}
                className="border-medical-primary text-medical-primary"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t('aiSuggestions')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>{t('aiDisclaimer')}</AlertTitle>
              <AlertDescription>{t('aiDisclaimerText')}</AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('diagnosis')} *</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        placeholder={t('diagnosisPlaceholder')}
                        disabled={isPending}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleVoiceInput}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="treatment_plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('treatmentPlan')}</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Textarea
                        placeholder={t('treatmentPlanPlaceholder')}
                        disabled={isPending}
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleVoiceInput}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('additionalNotes')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('notesPlaceholder')}
                      disabled={isPending}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              {t('cancel')}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="bg-medical-primary hover:bg-medical-primary/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              t('saveVisit')
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
