'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  createPatientSchema,
  extractGenderFromNationalId,
  extractBirthdateFromNationalId,
  calculateAgeFromNationalId,
  extractGovernorateFromNationalId,
} from '@/lib/schemas/auth.schemas';
import { Language } from '@/lib/api/types';
import { Gender } from '@/lib/api/types';

interface CreatePatientDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreatePatientDialog({ trigger, onSuccess }: CreatePatientDialogProps) {
  const t = useTranslations('admin');
  const [open, setOpen] = useState(false);
  const { mutate: createPatient, isPending } = useCreatePatient();

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(createPatientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      language: Language.ENGLISH,
      socialSecurityNumber: '',
      address: '',
      job: '',
    },
  });

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

    createPatient(payload, {
      onSuccess: () => {
        const fullName = `${data.firstName} ${data.lastName}`;
        toast.success(t('patientCreated') || 'Patient created successfully', {
          description: `${fullName} (${data.socialSecurityNumber})`,
        });
        form.reset();
        setOpen(false);
        onSuccess?.();
      },
      onError: (error: unknown) => {
        console.error('Create patient error:', error);
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            {t('registerPatient')}
          </Button>
        )}
      </DialogTrigger>
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
                    <FormLabel>{t('firstName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        disabled={isPending}
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
                    <FormLabel>{t('lastName')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        disabled={isPending}
                      />
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
                  <FormLabel>{t('nationalIdRequired')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="30202041234567"
                      maxLength={14}
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                  {extractedInfo && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {t('nationalId')}:
                        </span>
                        <span className="font-mono">{nationalId}</span>
                      </div>
                      {extractedInfo.birthdate && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {t('dateOfBirth')}:
                          </span>
                          <span>
                            {extractedInfo.birthdate.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                            {extractedInfo.age && ` (${extractedInfo.age} ${t('years')})`}
                          </span>
                        </div>
                      )}
                      {extractedInfo.gender && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {t('gender')}:
                          </span>
                          <span>
                            {extractedInfo.gender === Gender.MALE
                              ? t('male')
                              : t('female')}
                          </span>
                        </div>
                      )}
                      {extractedInfo.governorate && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Governorate:
                          </span>
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
                  <FormLabel>
                    {t('address')} ({t('optional') || 'Optional'})
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('addressPlaceholder') || '123 Main St, Cairo'}
                      {...field}
                      disabled={isPending}
                    />
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
                  <FormLabel>
                    {t('job')} ({t('optional') || 'Optional'})
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('jobPlaceholder') || 'Engineer, Teacher, etc.'}
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
              >
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
  );
}