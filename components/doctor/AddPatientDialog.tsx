'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2, Sparkles } from 'lucide-react';
import { toast, toastMessages } from '@/lib/utils/toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from '@/components/ui/badge';

import { useCreatePatient } from '@/lib/api/hooks/useAuth';
import {
  createPatientSchema,
  type CreatePatientFormData,
} from '@/lib/schemas/auth.schemas';
import { Language } from '@/lib/api/types';
import { NationalIdInfo } from '@/components/shared/NationalIdInfo';
import { EnrichedScanData } from '@/types/ocr';

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: { id: number; socialSecurityNumber: string }) => void;
  prefilledData?: EnrichedScanData | null;
  dataSource?: 'scan' | 'manual';
}

export function AddPatientDialog({
  open,
  onOpenChange,
  onSuccess,
  prefilledData = null,
  dataSource = 'manual',
}: AddPatientDialogProps) {
  const t = useTranslations('doctor');
  const tPatient = useTranslations('patient');
  const tCommon = useTranslations('common');
  const tScan = useTranslations('scan');
  const tValidation = useTranslations('validation');
  const { mutate: createPatient, isPending } = useCreatePatient();

  const form = useForm<CreatePatientFormData>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: prefilledData
      ? {
          firstName: prefilledData.firstName || '',
          lastName: prefilledData.lastName || '',
          language: Language.ENGLISH,
          socialSecurityNumber:
            prefilledData.socialSecurityNumber ||
            prefilledData.nationalId ||
            '',
          address: prefilledData.address ?? prefilledData.location ?? '',
          job: '',
        }
      : {
          firstName: '',
          lastName: '',
          language: Language.ENGLISH,
          socialSecurityNumber: '',
          address: '',
          job: '',
        },
  });

  // Watch the national ID field to show extracted info
  const nationalId = form.watch('socialSecurityNumber');

  // Populate form with scanned data when available
  useEffect(() => {
    if (prefilledData && dataSource === 'scan') {
      form.reset({
        firstName: prefilledData.firstName || '',
        lastName: prefilledData.lastName || '',
        language: Language.ENGLISH,
        socialSecurityNumber:
          prefilledData.socialSecurityNumber || prefilledData.nationalId || '',
        address: prefilledData.address ?? prefilledData.location ?? '',
        job: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledData, dataSource]);

  // Auto-populate gender and birthdate when valid National ID is entered
  // Note: Backend extracts these from National ID, no need to send separately
  useEffect(() => {
    if (nationalId && nationalId.length === 14) {
      // Extraction is handled server-side; keep this hook as a placeholder for
      // future client-side previews of the derived values.
    }
  }, [nationalId]);

  const onSubmit = (data: CreatePatientFormData) => {
    const submitData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      language: data.language,
      socialSecurityNumber: data.socialSecurityNumber,
    };

    if (data.address?.trim()) {
      submitData.address = data.address.trim();
    }

    if (data.job?.trim()) {
      submitData.job = data.job.trim();
    }

    // Include scanned data if available (gender and birthdate from National ID)
    if (prefilledData) {
      if (prefilledData.gender) {
        submitData.gender = prefilledData.gender;
      }
      if (prefilledData.birthdate) {
        submitData.birthdate =
          prefilledData.birthdate instanceof Date
            ? prefilledData.birthdate.toISOString().split('T')[0]
            : prefilledData.birthdate;
      }
      if (prefilledData.address || prefilledData.location) {
        submitData.address =
          submitData.address || prefilledData.address || prefilledData.location;
      }
    }

    createPatient(submitData, {
      onSuccess: (response) => {
        const fullName = `${form.getValues('firstName')} ${form.getValues('lastName')}`;
        const socialSecurityNumber = form.getValues('socialSecurityNumber');
        toast.success(
          toastMessages.patient.createSuccess,
          toastMessages.patient.createSuccessDescription(fullName)
        );
        form.reset();
        onOpenChange(false);
        const numericId = parseInt(response.id) || 0;
        onSuccess?.({ id: numericId, socialSecurityNumber });
      },
      onError: (error: unknown) => {
        if (
          error &&
          typeof error === 'object' &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object'
        ) {
          const response = error.response as {
            data?: unknown;
            status?: number;
          };
          if (
            response.status === 400 &&
            typeof response.data === 'string' &&
            response.data.includes('already exists')
          ) {
            toast.error(
              toastMessages.patient.alreadyExists,
              toastMessages.patient.alreadyExistsDescription
            );
            return;
          }
          const message =
            typeof response.data === 'string'
              ? response.data
              : response.data &&
                  typeof response.data === 'object' &&
                  'message' in response.data &&
                  typeof response.data.message === 'string'
                ? response.data.message
                : tValidation('checkFormAndRetry');
          toast.error(toastMessages.patient.createError, message);
        } else {
          toast.error(
            toastMessages.network.error,
            toastMessages.network.errorDescription
          );
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {dataSource === 'scan' && (
              <Sparkles className="h-5 w-5 text-medical-primary" />
            )}
            {t('addNewPatient')}
          </DialogTitle>
          <DialogDescription>
            {dataSource === 'scan' ? (
              <span className="flex items-center gap-2">
                {tScan('autoFilledFromScan')}
                {prefilledData?.isMockData && (
                  <Badge variant="outline" className="text-xs">
                    {tScan('mockData')}
                  </Badge>
                )}
              </span>
            ) : (
              tPatient('fillPatientDetails')
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Name Fields */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required className="flex items-center gap-2">
                      {tPatient('firstName')}
                      {dataSource === 'scan' && prefilledData && (
                        <Badge variant="secondary" className="text-xs">
                          {tScan('autoFilled')}
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={tPatient('firstNamePlaceholder')}
                        disabled={isPending}
                        className={
                          dataSource === 'scan'
                            ? 'border-medical-primary/50'
                            : ''
                        }
                        {...field}
                      />
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
                    <FormLabel required className="flex items-center gap-2">
                      {tPatient('lastName')}
                      {dataSource === 'scan' && prefilledData && (
                        <Badge variant="secondary" className="text-xs">
                          {tScan('autoFilled')}
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={tPatient('lastNamePlaceholder')}
                        disabled={isPending}
                        className={
                          dataSource === 'scan'
                            ? 'border-medical-primary/50'
                            : ''
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* National ID */}
              <FormField
                control={form.control}
                name="socialSecurityNumber"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel required className="flex items-center gap-2">
                      {tPatient('nationalId')}
                      {dataSource === 'scan' && prefilledData && (
                        <Badge variant="secondary" className="text-xs">
                          {tScan('autoFilled')}
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="30202041234567"
                        maxLength={14}
                        disabled={isPending}
                        className={
                          dataSource === 'scan'
                            ? 'border-medical-primary/50'
                            : ''
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {nationalId && nationalId.length === 14 && (
                      <NationalIdInfo nationalId={nationalId} locale="en" />
                    )}
                  </FormItem>
                )}
              />

              {/* Address (optional) */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      {tPatient('address')}
                      <span className="text-xs text-gray-400">
                        ({tCommon('optional')})
                      </span>
                      {dataSource === 'scan' && prefilledData?.address && (
                        <Badge variant="secondary" className="text-xs">
                          {tScan('autoFilled')}
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={tPatient('addressPlaceholder')}
                        disabled={isPending}
                        className={
                          dataSource === 'scan' && prefilledData?.address
                            ? 'border-medical-primary/50'
                            : ''
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Job (optional) */}
              <FormField
                control={form.control}
                name="job"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tPatient('job')}{' '}
                      <span className="text-xs text-gray-400">
                        ({tCommon('optional')})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={tPatient('jobPlaceholder')}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {tPatient('registering')}
                  </>
                ) : (
                  tPatient('registerPatient')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
