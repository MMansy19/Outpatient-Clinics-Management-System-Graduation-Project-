'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { BaseFormDialog } from '@/components/shared/BaseFormDialog';
import { ImageUploadField } from '@/components/shared/ImageUploadField';
import { VoiceFormField } from '@/components/shared/VoiceFormField';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateLab } from '@/lib/api/queries/useLabs';
import { useFormState } from '@/src/hooks/useFormState';

const labSchema = z.object({
  name: z.string().min(1, 'Lab name is required'),
  comments: z.string().optional(),
  image: z.instanceof(File).optional(),
});

type LabFormData = z.infer<typeof labSchema>;

interface LabFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  onSuccess?: () => void;
}

export function LabForm({ open, onOpenChange, patientId, onSuccess }: LabFormProps) {
  const t = useTranslations('doctor');
  const tCommon = useTranslations('common');
  const form = useForm<LabFormData>({
    mode: 'onChange',
    resolver: zodResolver(labSchema),
    defaultValues: {
      name: '',
      comments: '',
    },
  });

  const createLabMutation = useCreateLab();
  const { isPending, execute } = useFormState({
    onSuccess: () => {
      form.reset();
      setAudioFile(null);
      onSuccess?.();
    },
    successMessage: 'Lab created successfully',
  });

  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [audioFile, setAudioFile] = React.useState<File | null>(null);

  const handleSubmit = (data: LabFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.comments) {
      formData.append('comments', data.comments);
    }
    if (selectedImage) {
      formData.append('image', selectedImage);
    }
    if (audioFile) {
      formData.append('audio', audioFile);
    }

    execute(() => {
      return new Promise((resolve, reject) => {
        createLabMutation.mutate(
          {
            patientId: patientId || '',
            data: formData,
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
      title={t('createNewLab')}
      description={t('createLabDescription')}
      isPending={isPending}
      submitDisabled={!form.formState.isValid}
      onSubmit={form.handleSubmit(handleSubmit)}
      submitLabel={t('createLab')}
      cancelLabel={tCommon('cancel')}
      size="lg"
      form={form}
    >
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('labName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('labNamePlaceholder')} {...field} />
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
                <VoiceFormField
                  field={field}
                  placeholder={t('optionalComments')}
                  className="min-h-[100px]"
                  rows={4}
                  onAudioCaptured={setAudioFile}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ImageUploadField
          label="Lab Image"
          onImageSelect={setSelectedImage}
          maxSizeMB={5}
        />
      </div>
    </BaseFormDialog>
  );
}
