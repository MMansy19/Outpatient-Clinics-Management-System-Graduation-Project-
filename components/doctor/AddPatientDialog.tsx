'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

import { useCreatePatient } from '@/lib/api/queries/usePatients';
import { patientSchema, type PatientFormInput } from '@/lib/schemas/patientSchema';
import { Gender } from '@/types/entities/Patient';

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

  const form = useForm<PatientFormInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      national_id: '',
      gender: Gender.MALE,
      birthdate: '',
      phone_number: '',
      email: '',
    },
  });

  const onSubmit = (data: PatientFormInput) => {
    const transformedData = patientSchema.parse(data);
    createPatient(transformedData, {
      onSuccess: (patient) => {
        toast.success(tPatient('patientCreated'));
        form.reset();
        onOpenChange(false);
        onSuccess?.(patient.id);
      },
      onError: () => {
        toast.error(tPatient('patientCreateError'));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addNewPatient')}</DialogTitle>
          <DialogDescription>{t('searchSubtitle')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tPatient('name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('namePlaceholder')} disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="national_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tPatient('nationalId')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="12345678901234"
                        maxLength={14}
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tPatient('gender')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Gender.MALE}>{tPatient('male')}</SelectItem>
                        <SelectItem value={Gender.FEMALE}>{tPatient('female')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthdate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tPatient('birthdate')}</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tPatient('phone')}</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="01234567890"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tPatient('email')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="patient@example.com"
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
              <Button
                type="submit"
                disabled={isPending}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
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
