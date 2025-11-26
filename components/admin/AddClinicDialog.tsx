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
import { Textarea } from '@/components/ui/textarea';

import { useCreateClinic } from '@/lib/api/queries/useClinics';
import { clinicSchema, type ClinicFormData } from '@/lib/schemas/clinicSchema';

interface AddClinicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddClinicDialog({ open, onOpenChange }: AddClinicDialogProps) {
  const t = useTranslations('admin');
  const { mutate: createClinic, isPending } = useCreateClinic();

  const form = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: '',
      department: '',
      description: '',
      location: '',
      phone_number: '',
    },
  });

  const onSubmit = (data: ClinicFormData) => {
    createClinic(data, {
      onSuccess: () => {
        toast.success(t('clinicCreated'));
        form.reset();
        onOpenChange(false);
      },
      onError: () => {
        toast.error(t('clinicCreateError'));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addClinic')}</DialogTitle>
          <DialogDescription>{t('addClinicDescription')}</DialogDescription>
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
                    <Input placeholder={t('clinicNamePlaceholder')} disabled={isPending} {...field} />
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
                    <Input placeholder={t('departmentPlaceholder')} disabled={isPending} {...field} />
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
                    <Input placeholder={t('locationPlaceholder')} disabled={isPending} {...field} />
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
                    <Input type="tel" placeholder="01234567890" disabled={isPending} {...field} />
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
                    <Textarea
                      placeholder={t('descriptionPlaceholder')}
                      rows={3}
                      disabled={isPending}
                      {...field}
                    />
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
                    {t('creating')}
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
