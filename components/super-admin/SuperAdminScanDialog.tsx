'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { superAdminApi } from '@/lib/api/superAdmin.service';
import { toast } from 'sonner';

interface SuperAdminScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  clinicId: string;
  onSuccess?: () => void;
}

const scanSchema = z.object({
  name: z.string().min(1, 'Scan name is required'),
  type: z.string().min(1, 'Scan type is required'),
  photoUrl: z.string().optional(),
  comments: z.string().optional(),
});

type ScanFormData = z.infer<typeof scanSchema>;

const SCAN_TYPES = [
  { value: '0', label: 'MRI' },
  { value: '1', label: 'CT' },
  { value: '2', label: 'X-Ray' },
  { value: '3', label: 'Ultrasound' },
  { value: '4', label: 'PET-CT' },
  { value: '5', label: 'Mammography' },
];

export function SuperAdminScanDialog({
  open,
  onOpenChange,
  patientId,
  clinicId,
  onSuccess,
}: SuperAdminScanDialogProps) {
  const t = useTranslations('superAdmin');
  const tCommon = useTranslations('common');

  const [isPending, setIsPending] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<ScanFormData>({
    mode: 'onChange',
    resolver: zodResolver(scanSchema),
    defaultValues: {
      name: '',
      type: '',
      photoUrl: '',
      comments: '',
    },
  });

  const onSubmit = async (data: ScanFormData) => {
    setIsPending(true);
    try {
      await superAdminApi.createScan({
        name: data.name,
        type: parseInt(data.type),
        photoUrl: data.photoUrl || photoPreview || undefined,
        comments: data.comments,
        patientId,
        clinicId,
      });

      toast.success(t('scanCreatedSuccess'));
      form.reset();
      setPhotoPreview(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create scan:', error);
      toast.error(t('scanCreateError'));
    } finally {
      setIsPending(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addScan')}</DialogTitle>
          <DialogDescription>{t('addScanDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('scanName')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('scanNamePlaceholder')}
                      disabled={isPending}
                    />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectScanType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SCAN_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="photoUrl"
              render={() => (
                <FormItem>
                  <FormLabel>{t('scanPhoto')}</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        disabled={isPending}
                      />
                      {photoPreview && (
                        <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                          <img
                            src={photoPreview}
                            alt="Scan preview"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </div>
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
                      {...field}
                      placeholder={t('commentsPlaceholder')}
                      disabled={isPending}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
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
                disabled={isPending || !form.formState.isValid}
                className="bg-medical-primary hover:bg-medical-primary/90"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('creating')}
                  </>
                ) : (
                  t('create')
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}