'use client';

import React from 'react';
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
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import { useCreateScan } from '@/lib/api/queries/useScans';

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
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    form.setValue('image', undefined);
  };

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

    createScanMutation.mutate(
      {
        socialSecurityNumber,
        data: formData,
      },
      {
        onSuccess: () => {
          toast.success('Scan created successfully');
          form.reset();
          setSelectedImage(null);
          setImagePreview(null);
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error) => {
          console.error('Error creating scan:', error);
          toast.error('Failed to create scan');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('createNewScan')}</DialogTitle>
          <DialogDescription>
            {t('createScanDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

            <FormItem>
              <FormLabel>Scan Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {!imagePreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <label htmlFor="scan-image-upload" className="cursor-pointer">
                        <span className="text-sm text-gray-600">
                          Click to upload scan image
                        </span>
                        <Input
                          id="scan-image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Scan preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createScanMutation.isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createScanMutation.isPending}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                {createScanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('createScan')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
