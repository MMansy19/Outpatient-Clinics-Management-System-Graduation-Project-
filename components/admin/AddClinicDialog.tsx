'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

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

import { superAdminApi } from '@/lib/api/superAdmin.service';
import { z } from 'zod';

const clinicSchema = z.object({
  name: z.string().min(1, 'Clinic name is required'),
  speciality: z.string().min(1, 'Speciality is required'),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

interface AddClinicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddClinicDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddClinicDialogProps) {
  const t = useTranslations('admin');
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: '',
      speciality: '',
    },
  });

  const onSubmit = async (data: ClinicFormData) => {
    try {
      setIsPending(true);
      await superAdminApi.createClinic({
        name: data.name,
        speciality: data.speciality,
      });

      toast.success(t('clinicCreated') || 'Clinic created successfully');
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create clinic:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message ||
          t('clinicCreateError') ||
          'Failed to create clinic'
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addClinic')}</DialogTitle>
          <DialogDescription>
            {t('addClinicDescription') || 'Create a new clinic in the system'}
          </DialogDescription>
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
                    <Input
                      placeholder={
                        t('clinicNamePlaceholder') || 'Enter clinic name'
                      }
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
              name="speciality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('speciality')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        t('specialityPlaceholder') ||
                        'Enter speciality (e.g., Dermatology)'
                      }
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('creating') || 'Creating...'}
                  </>
                ) : (
                  t('create')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
