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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSuperAdminCreateScan } from '@/lib/api/queries/useSuperAdminMutations';
import { showOfflineAwareSuccess } from '@/lib/utils/offlineToast';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { VoiceFormField } from '@/components/shared/VoiceFormField';
import { SuperAdminImageUploadField } from './SuperAdminImageUploadField';

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
  comments: z.string().optional(),
  image: z.instanceof(File, { message: 'Scan image is required' }).refine((f) => f.size > 0, { message: 'Scan image is required' }),
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
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const form = useForm<ScanFormData>({
    mode: 'onChange',
    resolver: zodResolver(scanSchema),
    defaultValues: {
      name: '',
      type: '',
      comments: '',
      image: undefined as unknown as File,
    },
  });

  const [imageFile, setImageFile] = useState<File | undefined>();

  const queryClient = useQueryClient();
  const { mutate: createScan } = useSuperAdminCreateScan();

  const onSubmit = async (data: ScanFormData) => {
    setIsPending(true);
    createScan(
      {
        name: data.name,
        type: parseInt(data.type),
        image: data.image,
        audio: audioFile || undefined,
        comments: data.comments || undefined,
        patientId,
        clinicId,
      },
      {
        onSuccess: async (result) => {
          showOfflineAwareSuccess(result, { onlineMessage: t('scanCreatedSuccess') });
          form.reset();
          setImageFile(undefined);
          setAudioFile(null);
          onOpenChange(false);
          await queryClient.invalidateQueries({ queryKey: ['super-admin-patient-scans', patientId] });
          onSuccess?.();
        },
        onError: () => {
          toast.error(t('scanCreateError'));
        },
        onSettled: () => setIsPending(false),
      },
    );
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
                  <FormLabel required>{t('scanName')}</FormLabel>
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
                  <FormLabel required>{t('scanType')}</FormLabel>
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

            <SuperAdminImageUploadField
              label={t('scanPhoto')}
              required
              value={imageFile ?? null}
              onChange={(file) => setImageFile(file ?? undefined)}
              error={form.formState.errors.image?.message as string | undefined}
              maxSizeMB={5}
              setValue={form.setValue}
              trigger={form.trigger}
              fieldName="image"
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('comments')} ({tCommon('optional')})</FormLabel>
                  <FormControl>
                    <VoiceFormField
                      field={field}
                      placeholder={t('commentsPlaceholder')}
                      className="min-h-[100px]"
                      rows={4}
                      disabled={isPending}
                      onAudioCaptured={setAudioFile}
                      isSuperAdminVoiceEnabled
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