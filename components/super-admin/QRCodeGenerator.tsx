'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { QrCode, Download } from 'lucide-react';
import QRCodeLib from 'qrcode';
import Image from 'next/image';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { useGetClinics } from '@/lib/api/queries/useClinics';

interface QRCodeGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeGenerator({ open, onOpenChange }: QRCodeGeneratorProps) {
  const t = useTranslations('admin');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const { data: clinics } = useGetClinics();

  useEffect(() => {
    if (selectedClinicId && open) {
      generateQRCode(selectedClinicId);
    } else {
      setQrCodeUrl('');
    }
  }, [selectedClinicId, open]);

  const generateQRCode = async (clinicId: string) => {
    try {
      // Generate registration URL with clinic ID
      const registrationUrl = `${window.location.origin}/register?clinic_id=${clinicId}&role=patient`;

      // Generate QR code as data URL
      const qrDataUrl = await QRCodeLib.toDataURL(registrationUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1E3A8A', // Medical secondary color
          light: '#FFFFFF',
        },
      });

      setQrCodeUrl(qrDataUrl);
    } catch (error) {}
  };

  const handleDownload = () => {
    if (!qrCodeUrl || !selectedClinicId) return;

    const selectedClinic = clinics?.find(
      (c) => c.id.toString() === selectedClinicId
    );
    const filename = `qr-code-${selectedClinic?.name.replace(/\s+/g, '-').toLowerCase()}.png`;

    // Create download link
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-medical-primary" />
            {t('qrCodeGenerator')}
          </DialogTitle>
          <DialogDescription>{t('qrCodeDescription')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clinic-select">{t('selectClinic')}</Label>
            <Select
              value={selectedClinicId}
              onValueChange={setSelectedClinicId}
            >
              <SelectTrigger id="clinic-select">
                <SelectValue placeholder={t('selectClinicPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {clinics?.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id.toString()}>
                    {clinic.name} - {clinic.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {qrCodeUrl && (
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-lg border-2 border-medical-primary/20 p-4 bg-white">
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={300}
                  height={300}
                  className="h-[300px] w-[300px]"
                  unoptimized
                />
              </div>

              <div className="text-center space-y-1">
                <p className="text-sm font-medium">
                  {
                    clinics?.find((c) => c.id.toString() === selectedClinicId)
                      ?.name
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('scanToRegister')}
                </p>
              </div>

              <Button
                onClick={handleDownload}
                className="w-full bg-medical-primary hover:bg-medical-primary/90"
              >
                <Download className="mr-2 h-4 w-4" />
                {t('downloadQRCode')}
              </Button>
            </div>
          )}

          {!selectedClinicId && (
            <div className="flex items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
              <div className="text-center space-y-2">
                <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('selectClinicToGenerate')}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
