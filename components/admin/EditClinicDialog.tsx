'use client';

import { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';

import { useUpdateClinic } from '@/lib/api/queries/useClinics';
import { clinicSchema, type ClinicFormData } from '@/lib/schemas/clinicSchema';
import type { Clinic } from '@/types/entities/Clinic';

interface EditClinicDialogProps {
  clinic: Clinic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditClinicDialog({ clinic, open, onOpenChange }: EditClinicDialogProps) {
  const t = useTranslations('admin');
  const { mutate: updateClinic, isPending } = useUpdateClinic();

  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: clinic.name,
      department: clinic.department,
      description: clinic.description || '',
      location: clinic.location || '',
      phone_number: clinic.phone_number || '',
    },
  });

  useEffect(() => {
    form.reset({
      name: clinic.name,
      department: clinic.department,
      description: clinic.description || '',
      location: clinic.location || '',
      phone_number: clinic.phone_number || '',
    });
  }, [clinic, form]);

  const onSubmit = (data: ClinicFormData) => {
    updateClinic(
      { id: clinic.id, data },
      {
        onSuccess: () => {
          toast.success(t('clinicUpdated'));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(t('clinicUpdateError'));
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('editClinic')}</DialogTitle>
          <DialogDescription>{t('editClinicDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('clinicName')}</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('department')}</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('location')}</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} {...field} />
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
                  <FormLabel>{t('phoneNumber')}</FormLabel>
                  <FormControl>
                    <Input type="tel" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isPending} className="bg-medical-primary hover:bg-medical-primary/90">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('updating')}
                  </>
                ) : (
                  t('update')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
