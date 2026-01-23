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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { useCreatePatient } from '@/lib/api/hooks/useAuth';
import { createPatientSchema, type CreatePatientFormData } from '@/lib/schemas/auth.schemas';
import { Language } from '@/lib/api/types';
import { NationalIdInfo } from '@/components/shared/NationalIdInfo';
import { extractGenderFromNationalId, extractBirthdateFromNationalId } from '@/lib/schemas/auth.schemas';
import { EnrichedScanData } from '@/types/ocr';

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (patientId: number) => void;
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
  const { mutate: createPatient, isPending } = useCreatePatient();

  // Split full name into first and last name
  const splitName = (fullName: string): { firstName: string; lastName: string } => {
    console.log('🔤 Splitting name:', fullName);
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    console.log('📝 Split result:', { firstName, lastName, parts });
    return { firstName, lastName };
  };

  const form = useForm<CreatePatientFormData>({
    resolver: zodResolver(createPatientSchema),
    defaultValues: prefilledData ? {
      firstName: prefilledData.firstName || '',
      lastName: prefilledData.lastName || '',
      language: Language.ENGLISH,
      socialSecurityNumber: prefilledData.socialSecurityNumber || prefilledData.nationalId || '',
      address: prefilledData.address ?? prefilledData.location ?? '',
      job: '',
    } : {
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
      console.log('🔍 Prefilling form with scanned data:', {
        firstName: prefilledData.firstName,
        lastName: prefilledData.lastName,
        socialSecurityNumber: prefilledData.socialSecurityNumber || prefilledData.nationalId,
      });
      form.reset({
        firstName: prefilledData.firstName || '',
        lastName: prefilledData.lastName || '',
        language: Language.ENGLISH,
        socialSecurityNumber: prefilledData.socialSecurityNumber || prefilledData.nationalId || '',
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
      const gender = extractGenderFromNationalId(nationalId);
      const birthdate = extractBirthdateFromNationalId(nationalId);
      
      // Just for validation and display - backend extracts from National ID
      if (gender && birthdate) {
        console.log('📋 Extracted from National ID:', {
          gender,
          birthdate: birthdate.toLocaleDateString(),
        });
      }
    }
  }, [nationalId]);

  const onSubmit = (data: CreatePatientFormData) => {
    console.log('📝 Creating patient with data:', data);
    
    createPatient({
      ...data,
      job: data.job || '',
    }, {
      onSuccess: (response) => {
        console.log('✅ Patient created successfully:', response);
        const fullName = `${form.getValues('firstName')} ${form.getValues('lastName')}`;
        toast.success(
          toastMessages.patient.createSuccess,
          toastMessages.patient.createSuccessDescription(fullName)
        );
        form.reset();
        onOpenChange(false);
        
        // Extract the numeric ID from globalId if needed
        const numericId = parseInt(response.id) || 0;
        onSuccess?.(numericId);
      },
      onError: (error: unknown) => {
        console.error('❌ Create patient error:', error);
        
        // Handle different error cases
        if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object') {
          const response = error.response as { data?: unknown; status?: number };
          console.error('Response data:', response.data);
          console.error('Response status:', response.status);
          
          // Check if it's a "User already exists" error
          if (response.status === 400 && typeof response.data === 'string' && response.data.includes('already exists')) {
            toast.error(
              toastMessages.patient.alreadyExists,
              toastMessages.patient.alreadyExistsDescription
            );
            return;
          }
          
          // Get error message from response
          const message = typeof response.data === 'string' 
            ? response.data 
            : (response.data && typeof response.data === 'object' && 'message' in response.data && typeof response.data.message === 'string' 
                ? response.data.message 
                : 'Please check the form and try again.');
          toast.error(
            toastMessages.patient.createError,
            message
          );
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
            {dataSource === 'scan' && <Sparkles className="h-5 w-5 text-medical-primary" />}
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
              tPatient('fillPatientDetails') || 'Fill in the patient details below to register them in the system.'
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
                    <FormLabel className="flex items-center gap-2">
                      First Name
                      {dataSource === 'scan' && prefilledData && (
                        <Badge variant="secondary" className="text-xs">
                          {tScan('autoFilled')}
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John" 
                        disabled={isPending} 
                        className={dataSource === 'scan' ? 'border-medical-primary/50' : ''}
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
                    <FormLabel className="flex items-center gap-2">
                      Last Name
                      {dataSource === 'scan' && prefilledData && (
                        <Badge variant="secondary" className="text-xs">
                          {tScan('autoFilled')}
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Doe" 
                        disabled={isPending} 
                        className={dataSource === 'scan' ? 'border-medical-primary/50' : ''}
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
                    <FormLabel className="flex items-center gap-2">
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
                        className={dataSource === 'scan' ? 'border-medical-primary/50' : ''}
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

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      Address
                      {dataSource === 'scan' && prefilledData?.address && (
                        <Badge variant="secondary" className="text-xs">
                          {tScan('autoFilled')}
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main Street, Cairo"
                        disabled={isPending}
                        className={dataSource === 'scan' && prefilledData?.address ? 'border-medical-primary/50' : ''}
                        {...field}
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
                    <FormLabel>Job/Occupation (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Engineer"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
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
                    <FormLabel>Preferred Language</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Arabic (العربية)</SelectItem>
                        <SelectItem value="1">English</SelectItem>
                      </SelectContent>
                    </Select>
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
