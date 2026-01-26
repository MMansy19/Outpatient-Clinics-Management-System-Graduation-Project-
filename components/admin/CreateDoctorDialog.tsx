'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { toast, toastMessages } from '@/lib/utils/toast';
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
import { useCreateDoctor } from '@/lib/api/hooks/useAuth';
import {
  createDoctorSchema,
  type CreateDoctorFormData,
} from '@/lib/schemas/auth.schemas';
import { Language } from '@/lib/api/types';
import { NationalIdInfo } from '@/components/shared/NationalIdInfo';
import { adminApi } from '@/lib/api/admin.service';
import type { ClinicResponse } from '@/lib/api/types';

const MEDICAL_SPECIALITIES = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'General Practice',
  'General Surgery',
  'Hematology',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Obstetrics & Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology (ENT)',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Urology',
] as const;

interface CreateDoctorDialogProps {
  trigger?: React.ReactNode;
}

export function CreateDoctorDialog({ trigger }: CreateDoctorDialogProps) {
  const t = useTranslations('admin');
  const [open, setOpen] = useState(false);
  const [clinics, setClinics] = useState<ClinicResponse[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const { mutate: createDoctor, isPending } = useCreateDoctor();

  const form = useForm<CreateDoctorFormData>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      language: Language.ENGLISH,
      socialSecurityNumber: '',
      email: '',
      phone: '',
      password: '',
      speciality: '',
      clinicId: '',
    },
  });

  // Watch the national ID field to show extracted info
  const nationalId = form.watch('socialSecurityNumber');

  // Load clinics when dialog opens
  useEffect(() => {
    if (open) {
      loadClinics();
    }
  }, [open]);

  const loadClinics = async () => {
    try {
      setLoadingClinics(true);
      const data = await adminApi.getClinics();
      setClinics(data);
    } catch (error) {
      console.error('Failed to load clinics:', error);
      toast.error('Failed to load clinics', 'Unable to fetch clinic list');
    } finally {
      setLoadingClinics(false);
    }
  };

  const onSubmit = (data: CreateDoctorFormData) => {
    console.log('🔍 Creating doctor with data:', data);

    createDoctor(data, {
      onSuccess: (response) => {
        console.log('✅ Doctor created successfully:', response);
        const fullName = `${form.getValues('firstName')} ${form.getValues('lastName')}`;
        toast.success(
          toastMessages.doctor.createSuccess,
          toastMessages.doctor.createSuccessDescription(fullName)
        );
        form.reset();
        setOpen(false);
      },
      onError: (error: unknown) => {
        console.error('❌ Create doctor error:', error);

        // Handle different error cases
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
          console.error('Response data:', response.data);
          console.error('Response status:', response.status);

          // Check if it's a "User already exists" error
          if (
            response.status === 400 &&
            typeof response.data === 'string' &&
            response.data.includes('already exists')
          ) {
            toast.error(
              toastMessages.doctor.alreadyExists,
              toastMessages.doctor.alreadyExistsDescription
            );
            return;
          }

          // Get error message from response
          const message =
            typeof response.data === 'string'
              ? response.data
              : response.data &&
                  typeof response.data === 'object' &&
                  'message' in response.data &&
                  typeof response.data.message === 'string'
                ? response.data.message
                : 'Please check the form and try again.';
          toast.error(toastMessages.doctor.createError, message);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            {t('createDoctor')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('createDoctor')}</DialogTitle>
          <DialogDescription>{t('createDoctorDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
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

            {/* National ID with extracted info */}
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
                  {nationalId && nationalId.length === 14 && (
                    <NationalIdInfo nationalId={nationalId} locale="en" />
                  )}
                </FormItem>
              )}
            />

            {/* Contact Information */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('emailPlaceholder')}
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phoneNumber')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('phonePlaceholder')}
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {t('phoneFormat')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Clinic Selection */}
            <FormField
              control={form.control}
              name="clinicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('clinic')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending || loadingClinics}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loadingClinics
                              ? t('loadingClinics')
                              : t('selectClinicRequired')
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clinics.length === 0 && !loadingClinics ? (
                        <SelectItem value="no-clinics" disabled>
                          {t('noClinicsAvailable')}
                        </SelectItem>
                      ) : (
                        clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name} - {clinic.speciality}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Speciality */}
            <FormField
              control={form.control}
              name="speciality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('medicalSpeciality')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectSpeciality')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MEDICAL_SPECIALITIES.map((speciality) => (
                        <SelectItem key={speciality} value={speciality}>
                          {speciality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('passwordPlaceholder')}
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {t('passwordRequirements')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Language */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('preferredLanguage')}</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('preferredLanguage')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">{t('arabic')}</SelectItem>
                      <SelectItem value="1">{t('english')}</SelectItem>
                    </SelectContent>
                  </Select>
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
              <Button type="submit" disabled={isPending || loadingClinics}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('creatingDoctor')}
                  </>
                ) : (
                  t('createDoctor')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
