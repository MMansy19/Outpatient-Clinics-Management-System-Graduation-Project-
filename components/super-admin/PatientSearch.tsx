'use client';

import { useState, useEffect } from 'react';
import { NationalIdScanner } from '@/components/doctor/NationalIdScanner';
import { useTranslations } from 'next-intl';
import { Search, Loader2, User, Calendar, ScanLine, UserPlus } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { superAdminApi } from '@/lib/api/superAdmin.service';
import { Gender } from '@/lib/api/types';

// Converts 'MALE'/'FEMALE'/null/undefined to Gender enum
function toGenderEnum(gender: 'MALE' | 'FEMALE' | Gender | null | undefined): Gender | undefined {
  if (gender === 'MALE' || gender === Gender.MALE) return Gender.MALE;
  if (gender === 'FEMALE' || gender === Gender.FEMALE) return Gender.FEMALE;
  return undefined;
}

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { searchPatientByNationalId } from '@/lib/offline/offlineSearch';
import { upsertPatients } from '@/lib/offline/patientCache';
import { EnrichedScanData } from '@/types/ocr';
import { Language } from '@/lib/api/types';
import { createPatientSchema, extractGenderFromNationalId, extractBirthdateFromNationalId, calculateAgeFromNationalId, extractGovernorateFromNationalId } from '@/lib/schemas/auth.schemas';
import { useCreatePatient } from '@/lib/api/hooks/useAuth';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface SuperAdminPatientSearchProps {
  onSelectPatient: (patient: {
    id: string;
    name: string;
    gender?: Gender;
    dateOfBirth?: string;
    socialSecurityNumber: string;
    address?: string | null;
    job?: string | null;
  }) => void;
}

export function SuperAdminPatientSearch({
  onSelectPatient,
}: SuperAdminPatientSearchProps) {
  const t = useTranslations('superAdmin');
  const tValidation = useTranslations('validation');
  const tSearch = useTranslations('search');
  const { isOnline } = useNetworkStatus();

  const [nationalId, setNationalId] = useState('');
  const [nationalIdError, setNationalIdError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultSource, setResultSource] = useState<'online' | 'offline' | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState<EnrichedScanData | null>(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  const isValidNationalId = (id: string): boolean => {
    const trimmedId = id.trim();
    return /^\d{14}$/.test(trimmedId);
  };

  const validateNationalId = (id: string): boolean => {
    if (!id.trim()) {
      setNationalIdError('');
      return false;
    }
    if (!isValidNationalId(id)) {
      setNationalIdError(tValidation('nationalIdLength'));
      return false;
    }
    setNationalIdError('');
    return true;
  };

  const handleNationalIdChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setNationalId(digitsOnly);
    validateNationalId(digitsOnly);
  };

  const handleSearch = async () => {
    if (!nationalId || !isValidNationalId(nationalId)) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setResultSource(null);

    if (!isOnline) {
      try {
        const cached = await searchPatientByNationalId(nationalId);
        if (!cached) {
          setError(t('patientNotFound'));
        } else {
          setResultSource('offline');
          onSelectPatient({
            id: String(cached.id),
            name: cached.name,
            gender: cached.gender as Gender | undefined,
            dateOfBirth: cached.dateOfBirth,
            socialSecurityNumber: cached.socialSecurityNumber ?? nationalId,
            address: cached.address ?? null,
            job: cached.job ?? null,
          });
        }
      } catch (err) {
        setError(t('searchError'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const patient = await superAdminApi.searchPatientBySSN(nationalId);
      try {
        await upsertPatients(patient);
      } catch (e) {
        // non-fatal write-through failure
      }
      setResultSource('online');
      onSelectPatient({
        id: patient.id,
        name: patient.name,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        socialSecurityNumber: patient.socialSecurityNumber,
        address: patient.address,
        job: patient.job,
      });
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(t('patientNotFound'));
      } else {
        setError(t('searchError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (
      e.key === 'Enter' &&
      nationalId &&
      isValidNationalId(nationalId) &&
      !isLoading
    ) {
      handleSearch();
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-medical-primary" />
            {t('searchPatients')}
          </CardTitle>
          <CardDescription>{t('searchPatientsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <div className="w-full">
              <Input
                type="text"
                placeholder={t('nationalIdPlaceholder')}
                value={nationalId}
                onChange={(e) => handleNationalIdChange(e.target.value)}
                onKeyDown={handleKeyPress}
                maxLength={14}
                className="font-mono text-lg tracking-widest"
              />
              {nationalIdError && (
                <p className="text-sm text-destructive mt-1">{nationalIdError}</p>
              )}
              {error === t('patientNotFound') && scannedData && (
                <div className="mt-2 flex items-center gap-2 p-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{t('patientNotFound')}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      {(scannedData.firstName || scannedData.lastName
                        ? `${scannedData.firstName || ''} ${scannedData.lastName || ''}`.trim()
                        : '')} — {scannedData.nationalId || scannedData.socialSecurityNumber}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowRegisterDialog(true)}
                    className="bg-medical-primary hover:bg-medical-primary/90"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    {t('registerPatientWithScannedId')}
                  </Button>
                </div>
              )}
              {error === t('patientNotFound') && !scannedData && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
              {error && error !== t('patientNotFound') && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                disabled={!nationalId || !isValidNationalId(nationalId) || isLoading}
                className="flex-1 sm:flex-initial bg-medical-primary hover:bg-medical-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {t('search')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-initial border-medical-primary text-medical-primary hover:bg-medical-primary/10"
                title={t('scanNationalIdTitle') || 'Scan National ID'}
                onClick={() => setIsScannerOpen(true)}
              >
                <ScanLine className="mr-1 h-5 w-5" />
                {t('scanNationalId') || 'Scan ID'}
              </Button>
            </div>
          </div>

          {hasSearched && !isLoading && !error && (
            <div className="text-sm text-muted-foreground">{t('enterNationalIdPrompt')}</div>
          )}

          {resultSource === 'offline' && !isLoading && !error && (
            <div className="rounded-md border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
              {tSearch('showingOfflineResults')}
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-3">{t('searchTips')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-medical-primary" />
                <span>{t('tip1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-medical-secondary" />
                <span>{t('tip2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-medical-info" />
                <span>{t('tip3')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <NationalIdScanner
        open={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={(data) => {
          if (data && (data.nationalId || data.socialSecurityNumber)) {
            const id = data.nationalId || data.socialSecurityNumber;
            setNationalId(id);
            setScannedData(data);
            setIsScannerOpen(false);
          }
        }}
      />

      <RegisterPatientDialog
        open={showRegisterDialog}
        onOpenChange={(open) => {
          setShowRegisterDialog(open);
          if (!open) {
            setScannedData(null);
            setNationalId('');
            setError(null);
          }
        }}
        prefillData={scannedData && error ? {
          socialSecurityNumber: scannedData.nationalId || scannedData.socialSecurityNumber || '',
          firstName: scannedData.firstName || '',
          lastName: scannedData.lastName || '',
          address: scannedData.address || scannedData.location || '',
        } : undefined}
        onRegistered={(patient) => {
          setShowRegisterDialog(false);
          setScannedData(null);
          setNationalId('');
          setError(null);
          onSelectPatient(patient);
        }}
      />


    </>
  );
}

// ── Inline registration dialog with controlled open ───────────────────────────
interface RegisterPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefillData?: {
    socialSecurityNumber?: string;
    firstName?: string;
    lastName?: string;
    address?: string;
  };
  onRegistered: (patient: { id: string; name: string; gender?: Gender; dateOfBirth?: string; socialSecurityNumber: string; address?: string | null; job?: string | null }) => void;
}

const registerSchema = createPatientSchema;

function RegisterPatientDialog({ open, onOpenChange, prefillData, onRegistered }: RegisterPatientDialogProps) {
  // Ensure form is always prefilled on open
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps

    if (open && prefillData) {
      form.reset({
        firstName: prefillData.firstName || '',
        lastName: prefillData.lastName || '',
        socialSecurityNumber: prefillData.socialSecurityNumber || '',
        address: prefillData.address || '',
        language: Language.ENGLISH,
        job: '',
      });
    }
  }, [open, prefillData]);
  const t = useTranslations('admin');
  const [isPending, setIsPending] = useState(false);
  const { mutate: createPatient } = useCreatePatient();

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: prefillData?.firstName || '',
      lastName: prefillData?.lastName || '',
      language: Language.ENGLISH,
      socialSecurityNumber: prefillData?.socialSecurityNumber || '',
      address: prefillData?.address || '',
      job: '',
    },
  });

  const nationalId = form.watch('socialSecurityNumber');
  const extractedInfo = nationalId && nationalId.length === 14 ? {
    gender: toGenderEnum(extractGenderFromNationalId(nationalId)),
    birthdate: extractBirthdateFromNationalId(nationalId),
    age: calculateAgeFromNationalId(nationalId),
    governorate: extractGovernorateFromNationalId(nationalId),
  } : null;

  const onSubmit = (data: z.infer<typeof registerSchema> & { address?: string; job?: string }) => {
    const payload = {
      ...data,
      address: data.address || undefined,
      job: data.job || undefined,
    };
    const fullName = `${data.firstName} ${data.lastName}`;

    setIsPending(true);
    createPatient(payload, {
      onSuccess: (response) => {
        if (response && typeof response === 'object' && (response as { offline?: boolean }).offline === true) {
          toast.success(t('savedOffline'), { description: t('savedOfflineDescription', { name: fullName }) });
        } else {
          toast.success(t('patientCreated') || 'Patient created successfully', {
            description: `${fullName} (${data.socialSecurityNumber})`,
          });
        }
        form.reset();
        onOpenChange(false);
        onRegistered({
          id: 'new',
          name: fullName,
          gender: toGenderEnum(extractedInfo?.gender),
          dateOfBirth: extractedInfo?.birthdate?.toISOString(),
          socialSecurityNumber: data.socialSecurityNumber,
          address: data.address ?? null,
          job: data.job ?? null,
        });
      },
      onError: (error: unknown) => {
        form.reset();
        const err = error as { response?: { status?: number } };
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
      onSettled: () => setIsPending(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('registerPatient')}</DialogTitle>
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

            <FormField
              control={form.control}
              name="socialSecurityNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('nationalIdRequired')}</FormLabel>
                  <FormControl>
                    <Input placeholder="30202041234567" maxLength={14} {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                  {extractedInfo && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                      {extractedInfo.birthdate && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{t('dateOfBirth')}:</span>
                          <span>{extractedInfo.birthdate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      )}
                      {extractedInfo.gender && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{t('gender')}:</span>
                          {(() => {
  const g: Gender | undefined = extractedInfo.gender;
  return Number(g) === 0 ? t('male') : Number(g) === 1 ? t('female') : '';
})()}

                        </div>
                      )}
                    </div>
                  )}
                </FormItem>
              )}
            />

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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isPending || !form.formState.isValid} className="bg-medical-primary hover:bg-medical-primary/90">
                {isPending ? t('creatingPatient') || 'Creating...' : t('registerPatient')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ── SuperAdminQuickSearch (unchanged) ─────────────────────────────────────────
interface SuperAdminQuickSearchProps {
  onSelectPatient: (patient: {
    id: string;
    name: string;
    gender?: Gender;
    dateOfBirth?: string;
    socialSecurityNumber: string;
    address?: string | null;
    job?: string | null;
  }) => void;
}

export function SuperAdminQuickSearch({ onSelectPatient }: SuperAdminQuickSearchProps) {
  const t = useTranslations('superAdmin');
  const [nationalId, setNationalId] = useState('');
  const [error, setError] = useState('');

  const isValidNationalId = (id: string): boolean => /^\d{14}$/.test(id.trim());

  const handleSearch = async () => {
    if (!nationalId || !isValidNationalId(nationalId)) return;
    try {
      const patient = await superAdminApi.searchPatientBySSN(nationalId);
      onSelectPatient({ id: patient.id, name: patient.name, gender: patient.gender, dateOfBirth: patient.dateOfBirth, socialSecurityNumber: patient.socialSecurityNumber, address: patient.address, job: patient.job });
      setNationalId('');
      setError('');
    } catch (err: any) {
      if (err.response?.status === 404) setError(t('patientNotFound'));
      else setError(t('searchError'));
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder={t('searchByNationalId')}
        value={nationalId}
        onChange={(e) => { setNationalId(e.target.value.replace(/\D/g, '').slice(0, 14)); setError(''); }}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
        className="h-9 text-sm"
      />
      <Button size="sm" onClick={handleSearch} disabled={!isValidNationalId(nationalId)} variant="outline" className="border-medical-primary text-medical-primary hover:bg-medical-primary/10">
        <Search className="h-4 w-4" />
      </Button>
      {error && <p className="text-xs text-destructive absolute -bottom-5">{error}</p>}
    </div>
  );
}