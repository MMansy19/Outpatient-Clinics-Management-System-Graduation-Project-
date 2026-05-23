'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { Loader2, Upload } from 'lucide-react';

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
import { superAdminApi } from '@/lib/api/superAdmin.service';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<LabFormData>({
    mode: 'onChange',
    resolver: zodResolver(labSchema),
    defaultValues: {
      name: '',
      comments: '',
    },
  });

  const queryClient = useQueryClient();

  const onSubmit = async (data: LabFormData) => {
    setIsPending(true);
    try {
      await superAdminApi.createLab({
        name: data.name,
        image: imageFile || undefined,
        comments: data.comments || undefined,
        patientId,
        clinicId,
      });

      toast.success(t('labCreatedSuccess'));
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ['super-admin-patient-labs', patientId] });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create lab:', error);
      toast.error(t('labCreateError'));
    } finally {
      setIsPending(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
                  <FormLabel>{t('labName')}</FormLabel>
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

            <FormItem>
              <FormLabel>{t('labPhoto')}</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>{t('chooseFile')}</span>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isPending}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Lab preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
            </FormItem>

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