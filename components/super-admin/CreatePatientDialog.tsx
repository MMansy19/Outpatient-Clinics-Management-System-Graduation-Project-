'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, UserPlus, ScanLine } from 'lucide-react';

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
import { useCreatePatient } from '@/lib/api/hooks/useAuth';
import { isDuplicateError } from '@/lib/offline/errors';
import {
  createPatientSchema,
  extractGenderFromNationalId,
  extractBirthdateFromNationalId,
  calculateAgeFromNationalId,
  extractGovernorateFromNationalId,
} from '@/lib/schemas/auth.schemas';
import { Language } from '@/lib/api/types';
import { NationalIdScanner } from '@/components/doctor/NationalIdScanner';
import { EnrichedScanData } from '@/types/ocr';

interface CreatePatientDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  prefillData?: {
    socialSecurityNumber?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
  };
}

export function CreatePatientDialog({ trigger, onSuccess, prefillData }: CreatePatientDialogProps) {
  // Ensure form is always prefilled on open
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps

    if (prefillData) {
      form.reset({
        firstName: prefillData.firstName || '',
        lastName: prefillData.lastName || '',
        socialSecurityNumber: prefillData.socialSecurityNumber || '',
        address: prefillData.address || '',
        language: Language.ENGLISH,
        job: '',
      });
    }
  }, [prefillData]);
  const t = useTranslations('admin');
  const tSuperAdmin = useTranslations('superAdmin');
  const tScan = useTranslations('scan');
  const [open, setOpen] = useState(false);
  const [showRegistrationOptions, setShowRegistrationOptions] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { mutate: createPatient, isPending } = useCreatePatient();

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      firstName: prefillData?.firstName || '',
      lastName: prefillData?.lastName || '',
      language: Language.ENGLISH,
      socialSecurityNumber: prefillData?.socialSecurityNumber || '',
      address: prefillData?.address || '',
      job: '',
    },
  });

  const handleScanOption = () => {
    setShowRegistrationOptions(false);
    setIsScannerOpen(true);
  };

  const handleManualOption = () => {
    setShowRegistrationOptions(false);
    setOpen(true);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsScannerOpen(false);
      setShowRegistrationOptions(false);
    }
    setOpen(isOpen);
  };

  const handleScanComplete = (data: EnrichedScanData) => {
    const ssn = data.nationalId || data.socialSecurityNumber || '';
    form.setValue('socialSecurityNumber', ssn, { shouldValidate: true });
    if (data.firstName) form.setValue('firstName', data.firstName, { shouldValidate: true });
    if (data.lastName) form.setValue('lastName', data.lastName, { shouldValidate: true });
    if (data.address || data.location) form.setValue('address', data.address || data.location || '', { shouldValidate: false });
    if (ssn.length === 14) {
      // Gender and birthdate are extracted server-side from the National ID
    }
    setIsScannerOpen(false);
    setOpen(true);
  };

  const nationalId = form.watch('socialSecurityNumber');

  const extractedInfo = nationalId && nationalId.length === 14 ? {
    gender: extractGenderFromNationalId(nationalId),
    birthdate: extractBirthdateFromNationalId(nationalId),
    age: calculateAgeFromNationalId(nationalId),
    governorate: extractGovernorateFromNationalId(nationalId),
  } : null;

  const onSubmit = (data: {
    firstName: string;
    lastName: string;
    language: Language;
    socialSecurityNumber: string;
    address?: string;
    job?: string;
  }) => {
    const payload = {
      ...data,
      address: data.address || undefined,
      job: data.job || undefined,
    };
    const fullName = `${data.firstName} ${data.lastName}`;
    const submittedValues = { ...data };

    createPatient(payload, {
      onSuccess: (response) => {
        if (
          response &&
          typeof response === 'object' &&
          (response as { offline?: boolean }).offline === true
        ) {
          toast.success(t('savedOffline'), {
            description: t('savedOfflineDescription', { name: fullName }),
          });
        } else {
          toast.success(t('patientCreated') || 'Patient created successfully', {
            description: `${fullName} (${data.socialSecurityNumber})`,
          });
        }
        onSuccess?.();
      },
      onError: (error: unknown) => {
        // Re-open dialog with the user's values so they can correct & retry.
        form.reset(submittedValues);
        setOpen(true);

        // Offline duplicate detected by preflightUniqueness before queuing.
        if (isDuplicateError(error)) {
          toast.error(t('patientAlreadyExists') || 'Patient already exists', {
            description: t('patientAlreadyExistsDescription') || 'A patient with this national ID is already registered',
          });
          return;
        }

        const err = error as { response?: { data?: unknown; status?: number } };
        if (err.response?.status === 400) {
          toast.error(t('patientAlreadyExists') || 'Patient already exists', {
            description: t('patientAlreadyExistsDescription') || 'A patient with this national ID is already registered',
          });
        } else {
          toast.error(t('patientCreateError') || 'Failed to create patient', {
            description: t('networkErrorDescription') || 'Please check your connection and try again',
          });
        }
      },
    });

    // Close optimistically — offline / network-failure cases are queued
    // automatically by useOfflineMutation and will fire onSuccess with
    // offline=true; real validation errors re-open the dialog above.
    form.reset();
    setOpen(false);
  };

  return (
    <>
      {trigger || (
        <Button className="gap-2" variant="outline" onClick={() => setShowRegistrationOptions(true)}>
          <UserPlus className="h-4 w-4" />
          {t('registerPatient')}
        </Button>
      )}

      {/* Registration Options Sheet */}
      <Dialog open={showRegistrationOptions} onOpenChange={(isOpen) => {
        if (!isOpen) setShowRegistrationOptions(false);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {t('registerPatient')}
            </DialogTitle>
            <DialogDescription className="text-center">
              {tScan('selectRegistrationMethod')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Primary Option: Scan National ID */}
            <button
              onClick={handleScanOption}
              className="group relative overflow-hidden rounded-lg border-2 border-medical-primary bg-medical-primary/5 p-6 text-left transition-all hover:bg-medical-primary/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-medical-primary p-3">
                    <ScanLine className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold text-medical-primary">
                    {tScan('scanNationalId')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tScan('scanDescription')}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium text-medical-primary">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-medical-primary animate-pulse" />
                    {tScan('recommended')}
                  </div>
                </div>
              </div>
            </button>

            {/* Secondary Option: Manual Entry */}
            <button
              onClick={handleManualOption}
              className="group relative overflow-hidden rounded-lg border-2 border-border bg-background p-6 text-left transition-all hover:bg-accent hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-muted p-3">
                    <UserPlus className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold">
                    {tScan('manualEntry')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tScan('manualDescription')}
                  </p>
                </div>
              </div>
            </button>
          </div>

          <Button type="button" variant="ghost" onClick={() => setShowRegistrationOptions(false)} className="w-full">
            {t('cancel')}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Form Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('registerPatient')}</DialogTitle>
            <DialogDescription>
              {t('registerPatientDescription') || 'Register a new patient in the system. All required fields must be filled.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('firstName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('lastName')}</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* National ID */}
              <FormField
                control={form.control}
                name="socialSecurityNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('nationalIdRequired')}</FormLabel>
                    <div className="flex gap-2">
                      <FormControl className="flex-1">
                        <Input placeholder="30202041234567" maxLength={14} {...field} disabled={isPending} />
                      </FormControl>
                      <Button type="button" variant="outline" size="icon" onClick={() => {
                        setOpen(false);
                        setShowRegistrationOptions(true);
                      }} disabled={isPending} className="border-medical-primary text-medical-primary hover:bg-medical-primary/10" title={tSuperAdmin('scanNationalIdTitle')}>
                        <ScanLine className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                    {extractedInfo && (
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{t('nationalId')}:</span>
                          <span className="font-mono">{nationalId}</span>
                        </div>
                        {extractedInfo.birthdate && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{t('dateOfBirth')}:</span>
                            <span>
                              {extractedInfo.birthdate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              {extractedInfo.age && ` (${extractedInfo.age} ${t('years')})`}
                            </span>
                          </div>
                        )}
                        {extractedInfo.gender && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{t('gender')}:</span>
                            <span>{extractedInfo.gender === 'MALE' ? t('male') : t('female')}</span>
                          </div>
                        )}
                        {extractedInfo.governorate && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Governorate:</span>
                            <span>{extractedInfo.governorate.nameEn}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address')} ({t('optional') || 'Optional'})</FormLabel>
                    <FormControl>
                      <Input placeholder={t('addressPlaceholder') || '123 Main St, Cairo'} {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Job */}
              <FormField
                control={form.control}
                name="job"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('job')} ({t('optional') || 'Optional'})</FormLabel>
                    <FormControl>
                      <Input placeholder={t('jobPlaceholder') || 'Engineer, Teacher, etc.'} {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isPending || !form.formState.isValid}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('creatingPatient') || 'Creating...'}
                    </>
                  ) : (
                    t('registerPatient')
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Scanner Dialog */}
      <NationalIdScanner
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </>
  );
}
