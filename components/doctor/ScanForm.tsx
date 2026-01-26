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
import { useCreateScan } from '@/lib/api/queries/useScans';
import { useFormState } from '@/src/hooks/useFormState';

const scanTypes = [
  'X-Ray',
  'MRI',
  'CT Scan',
  'Ultrasound',
  'Mammography',
  'Bone Scan',
  'Nuclear Scan',
  'Other',
];

const scanSchema = z.object({
  name: z.string().min(1, 'Scan name is required'),
  type: z.string().min(1, 'Scan type is required'),
  comments: z.string().optional(),
  image: z.instanceof(File).optional(),
});

type ScanFormData = z.infer<typeof scanSchema>;

interface ScanFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  socialSecurityNumber: string;
  onSuccess?: () => void;
}

export function ScanForm({ open, onOpenChange, socialSecurityNumber, onSuccess }: ScanFormProps) {
  const t = useTranslations('doctor');
  const tCommon = useTranslations('common');
  const form = useForm<ScanFormData>({
    resolver: zodResolver(scanSchema),
    defaultValues: {
      name: '',
      type: '',
      comments: '',
    },
  });

  const createScanMutation = useCreateScan();
  const { isPending, execute } = useFormState({
    onSuccess: () => {
      form.reset();
      onSuccess?.();
    },
    successMessage: 'Scan created successfully',
  });

  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);

  const handleSubmit = (data: ScanFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('type', data.type);
    if (data.comments) {
      formData.append('comments', data.comments);
    }
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    execute(() => {
      return new Promise((resolve, reject) => {
        createScanMutation.mutate(
          {
            socialSecurityNumber,
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
      title={t('createNewScan')}
      description={t('createScanDescription')}
      isPending={isPending}
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
              <FormLabel>{t('scanName')}</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chest X-Ray, Brain MRI" {...field} />
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
              <FormLabel>{t('scanType')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectScanType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {scanTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
          label="Scan Image"
          onImageSelect={setSelectedImage}
          maxSizeMB={5}
        />
      </div>
    </BaseFormDialog>
  );
}
