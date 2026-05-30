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
import { useSuperAdminCreateLab } from '@/lib/api/queries/useSuperAdminMutations';
import { showOfflineAwareSuccess } from '@/lib/utils/offlineToast';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { VoiceFormField } from '@/components/shared/VoiceFormField';
import { SuperAdminImageUploadField } from './SuperAdminImageUploadField';

interface SuperAdminLabDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  clinicId: string;
  onSuccess?: () => void;
}

const labSchema = z.object({
  name: z.string().min(1, 'Lab name is required'),
  comments: z.string().optional(),
  image: z.instanceof(File, { message: 'Lab image is required' }).refine((f) => f.size > 0, { message: 'Lab image is required' }),
});

type LabFormData = z.infer<typeof labSchema>;

export function SuperAdminLabDialog({
  open,
  onOpenChange,
  patientId,
  clinicId,
  onSuccess,
}: SuperAdminLabDialogProps) {
  const t = useTranslations('superAdmin');
  const tCommon = useTranslations('common');

  const [isPending, setIsPending] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const form = useForm<LabFormData>({
    mode: 'onChange',
    resolver: zodResolver(labSchema),
    defaultValues: {
      name: '',
      comments: '',
      image: undefined as unknown as File,
    },
  });

  const [imageFile, setImageFile] = useState<File | undefined>();

  const queryClient = useQueryClient();
  const { mutate: createLab } = useSuperAdminCreateLab();

  const onSubmit = async (data: LabFormData) => {
    setIsPending(true);
    createLab(
      {
        name: data.name,
        image: data.image,
        audio: audioFile || undefined,
        comments: data.comments || undefined,
        patientId,
        clinicId,
      },
      {
        onSuccess: async (result) => {
          showOfflineAwareSuccess(result, { onlineMessage: t('labCreatedSuccess') });
          form.reset();
          setImageFile(undefined);
          setAudioFile(null);
          onOpenChange(false);
          await queryClient.invalidateQueries({ queryKey: ['super-admin-patient-labs', patientId] });
          onSuccess?.();
        },
        onError: (error) => {
          console.error('Failed to create lab:', error);
          toast.error(t('labCreateError'));
        },
        onSettled: () => setIsPending(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('addLab')}</DialogTitle>
          <DialogDescription>{t('addLabDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('labName')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('labNamePlaceholder')}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SuperAdminImageUploadField
              label={t('labPhoto')}
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