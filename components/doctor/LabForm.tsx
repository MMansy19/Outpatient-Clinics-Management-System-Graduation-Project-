'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useCreateLab } from '@/lib/api/queries/useLabs';

const labSchema = z.object({
  name: z.string().min(1, 'Lab name is required'),
  comments: z.string().optional(),
});

type LabFormData = z.infer<typeof labSchema>;

interface LabFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  socialSecurityNumber: string;
  onSuccess?: () => void;
}

export function LabForm({ open, onOpenChange, socialSecurityNumber, onSuccess }: LabFormProps) {
  const t = useTranslations('doctor');
  const tCommon = useTranslations('common');
  const form = useForm<LabFormData>({
    resolver: zodResolver(labSchema),
    defaultValues: {
      name: '',
      comments: '',
    },
  });

  const createLabMutation = useCreateLab();

  const handleSubmit = (data: LabFormData) => {
    createLabMutation.mutate(
      {
        socialSecurityNumber,
        data: {
          name: data.name,
          comments: data.comments || '',
        },
      },
      {
        onSuccess: () => {
          toast.success('Lab created successfully');
          form.reset();
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          console.error('Error creating lab:', error);
          toast.error('Failed to create lab');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('createNewLab')}</DialogTitle>
          <DialogDescription>
            {t('createLabDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('labName')}</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Blood Test, X-Ray, MRI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('comments')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('optionalComments')}
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createLabMutation.isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createLabMutation.isPending}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                {createLabMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('createLab')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
