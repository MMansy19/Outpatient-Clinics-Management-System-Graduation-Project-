'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
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

import { useCreatePatient } from '@/lib/api/hooks/useAuth';
import { createPatientSchema, type CreatePatientFormData } from '@/lib/schemas/auth.schemas';
import { Language } from '@/lib/api/types';
import { NationalIdInfo } from '@/components/shared/NationalIdInfo';
import { extractGenderFromNationalId, extractBirthdateFromNationalId } from '@/lib/schemas/auth.schemas';

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (patientId: number) => void;
}

export function AddPatientDialog({ open, onOpenChange, onSuccess }: AddPatientDialogProps) {
  const t = useTranslations('doctor');
  const tPatient = useTranslations('patient');
  const tCommon = useTranslations('common');
  const { mutate: createPatient, isPending } = useCreatePatient();

  const form = useForm<CreatePatientFormData>({
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

  // Watch the national ID field to show extracted info
  const nationalId = form.watch('socialSecurityNumber');

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
    
    createPatient(data, {
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
          <DialogTitle>{t('addNewPatient')}</DialogTitle>
          <DialogDescription>
            {tPatient('fillPatientDetails') || 'Fill in the patient details below to register them in the system.'}
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
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" disabled={isPending} {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" disabled={isPending} {...field} />
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
                    <FormLabel>{tPatient('nationalId')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="30202041234567"
                        maxLength={14}
                        disabled={isPending}
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
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Main Street, Cairo"
                        disabled={isPending}
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
                    <FormLabel>Job/Occupation</FormLabel>
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
