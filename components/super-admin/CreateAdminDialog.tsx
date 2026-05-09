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
import { useCreateAdmin } from '@/lib/api/hooks/useAuth';
import {
  createAdminSchema,
  type CreateAdminFormData,
} from '@/lib/schemas/auth.schemas';
import { Language } from '@/lib/api/types';
import { NationalIdInfo } from '@/components/shared/NationalIdInfo';
import { superAdminApi } from '@/lib/api/superAdmin.service';
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

interface CreateAdminDialogProps {
  trigger?: React.ReactNode;
}

export function CreateAdminDialog({ trigger }: CreateAdminDialogProps) {
  const t = useTranslations('superAdmin');
  const [open, setOpen] = useState(false);
  const [clinics, setClinics] = useState<ClinicResponse[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const { mutate: createAdmin, isPending } = useCreateAdmin();

  const form = useForm<CreateAdminFormData>({
    mode: 'onChange',
    resolver: zodResolver(createAdminSchema),
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

  const nationalId = form.watch('socialSecurityNumber');

  useEffect(() => {
    if (open) {
      loadClinics();
    }
  }, [open]);

  const loadClinics = async () => {
    try {
      setLoadingClinics(true);
      const data = await superAdminApi.getClinics();
      setClinics(data);
    } catch (error) {
      console.error('Failed to load clinics:', error);
      toast.error('Failed to load clinics', 'Unable to fetch clinic list');
    } finally {
      setLoadingClinics(false);
    }
  };

  const onSubmit = (data: CreateAdminFormData) => {
    createAdmin(data, {
      onSuccess: () => {
        const fullName = `${form.getValues('firstName')} ${form.getValues('lastName')}`;
        toast.success(
          toastMessages.admin.createSuccess,
          toastMessages.admin.createSuccessDescription(fullName)
        );
        form.reset();
        setOpen(false);
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
              toastMessages.admin.alreadyExists,
              toastMessages.admin.alreadyExistsDescription
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
                : 'Please check the form and try again.';
          toast.error(toastMessages.admin.createError, message);
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
          <Button className="gap-2" variant="outline">
            <UserPlus className="h-4 w-4" />
            {t('createAdmin')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('createAdmin')}</DialogTitle>
          <DialogDescription>{t('createAdminDescription')}</DialogDescription>
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
                  {nationalId && nationalId.length === 14 && (
                    <NationalIdInfo nationalId={nationalId} locale="en" />
                  )}
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('adminEmailPlaceholder')}
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
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
                disabled={
                  isPending ||
                  loadingClinics ||
                  !form.formState.isValid
                }
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('creatingAdmin')}
                  </>
                ) : (
                  t('createAdmin')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
