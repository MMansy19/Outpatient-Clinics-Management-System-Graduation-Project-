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
import { Loader2 } from 'lucide-react';
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

  const handleSubmit = (data: ScanFormData) => {
    createScanMutation.mutate(
      {
        socialSecurityNumber,
        data: {
          name: data.name,
          type: data.type,
          comments: data.comments || '',
        },
      },
      {
        onSuccess: () => {
          toast.success('Scan created successfully');
          form.reset();
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
