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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdminCreateScan } from '@/lib/api/queries/useAdmin';
import { useFormState } from '@/src/hooks/useFormState';

const scanTypes = [
  { labelKey: 'scanTypes.mri', value: '0' },
  { labelKey: 'scanTypes.ct', value: '1' },
  { labelKey: 'scanTypes.xray', value: '2' },
  { labelKey: 'scanTypes.ultrasound', value: '3' },
  { labelKey: 'scanTypes.petct', value: '4' },
  { labelKey: 'scanTypes.mammography', value: '5' },
];

const scanSchema = z.object({
  name: z.string().min(1, 'Scan name is required'),
  type: z.string().min(1, 'Scan type is required'),
  comments: z.string().optional(),
  image: z.instanceof(File).optional(),
});

type ScanFormData = z.infer<typeof scanSchema>;

interface AdminScanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess?: () => void;
}

export function AdminScanForm({
  open,
  onOpenChange,
  patientId,
  onSuccess,
}: AdminScanFormProps) {
  const t = useTranslations('doctor');
  const tCommon = useTranslations('common');
  const form = useForm<ScanFormData>({
    mode: 'onChange',
    resolver: zodResolver(scanSchema),
    defaultValues: {
      name: '',
      type: '',
      comments: '',
    },
  });

  const createScanMutation = useAdminCreateScan();
  const { isPending, execute } = useFormState({
    onSuccess: () => {
      form.reset();
      setAudioFile(null);
      onSuccess?.();
    },
    successMessage: 'Scan created successfully',
  });

  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [audioFile, setAudioFile] = React.useState<File | null>(null);

  const handleSubmit = (data: ScanFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', data.type);
    formData.append('patientId', patientId);
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
        createScanMutation.mutate(formData, {
          onSuccess: resolve,
          onError: reject,
        });
      });
    });
  };

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('createNewScan')}
      description={t('createScanDescription')}
      isPending={isPending}
      submitDisabled={!form.formState.isValid}
      onSubmit={form.handleSubmit(handleSubmit)}
      submitLabel={t('createScan')}
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
              <FormLabel required>{t('scanName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('scanNamePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>{t('scanType')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectScanType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {scanTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(type.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          label={t('uploadScanImage')}
          onImageSelect={setSelectedImage}
          maxSizeMB={5}
        />
      </div>
    </BaseFormDialog>
  );
}
