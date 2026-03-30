'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { BaseFormDialog } from '@/components/shared/BaseFormDialog';
import { ImageUploadField } from '@/components/shared/ImageUploadField';
import {
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
import { useUpdateLab } from '@/lib/api/queries/useLabs';
import { useFormState } from '@/src/hooks/useFormState';

const labSchema = z.object({
  name: z.string().min(1, 'Lab name is required'),
  comments: z.string().optional(),
});

type LabFormData = z.infer<typeof labSchema>;

interface LabEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lab: {
    id: string;
    name: string;
    comments?: string;
    result_url?: string;
  };
  onSuccess?: () => void;
}

export function LabEditDialog({ open, onOpenChange, lab, onSuccess }: LabEditDialogProps) {
  const t = useTranslations('doctor');
  const tCommon = useTranslations('common');
  const form = useForm<LabFormData>({
    resolver: zodResolver(labSchema),
    defaultValues: {
      name: lab.name || '',
      comments: lab.comments || '',
    },
  });

  const updateLabMutation = useUpdateLab();
  const { isPending, execute } = useFormState({
    onSuccess: () => {
      form.reset();
      onSuccess?.();
    },
    successMessage: 'Lab updated successfully',
  });

  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);

  const handleSubmit = (data: LabFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.comments) {
      formData.append('comments', data.comments);
    }
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    execute(() => {
      return new Promise((resolve, reject) => {
        updateLabMutation.mutate(
          {
            labId: lab.id,
            data: formData as any,
            patientId: '',
          },
          {
            onSuccess: resolve,
            onError: reject,
          }
        );
      });
    });
  };

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('editLab')}
      description={t('editLabDescription')}
      isPending={isPending}
      onSubmit={form.handleSubmit(handleSubmit)}
      submitLabel={t('updateLab')}
      cancelLabel={tCommon('cancel')}
      size="lg"
    >
      <div className="space-y-6">
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

        <ImageUploadField
          label="Lab Image (Optional)"
          onImageSelect={setSelectedImage}
          maxSizeMB={5}
        />
      </div>
    </BaseFormDialog>
  );
}
