'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGenerateQRToken } from '@/lib/api/hooks/usePatient';
import { QrCode, Download, Copy, Share2, RefreshCw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface PatientQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientQRCodeDialog({
  open,
  onOpenChange,
}: PatientQRCodeDialogProps) {
  const tQR = useTranslations('patient.qrCode');
  const { mutate: generateQR, data: qrData, isPending, reset } = useGenerateQRToken();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (qrData && canvasRef.current) {
      const url = `${window.location.origin}/scan-patient?token=${qrData.token}`;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    }
  }, [qrData]);

  useEffect(() => {
    if (qrData) {
      const expiresIn = Math.max(0, Math.floor((qrData.expiresAt - Date.now()) / 1000));
      setTimeLeft(expiresIn);
    }
  }, [qrData]);

  useEffect(() => {
    if (!qrData || timeLeft === null) return;

    if (timeLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData, timeLeft]);

  const handleGenerate = () => {
    generateQR();
  };

  const handleCopyLink = async () => {
    if (!qrData) return;
    const url = `${window.location.origin}/scan-patient?token=${qrData.token}`;
    await navigator.clipboard.writeText(url);
    toast.success(tQR('copied'));
  };

  const handleDownload = () => {
    if (!qrData || !canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `patient-qr-${qrData.patientId}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    if (!qrData) return;
    const url = `${window.location.origin}/scan-patient?token=${qrData.token}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: tQR('title'),
          text: tQR('scanInstructions'),
          url: url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
      setTimeLeft(null);
    }
    onOpenChange(newOpen);
  };

  const renderQRCode = () => {
    if (isPending) {
      return (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-medical-primary" />
        </div>
      );
    }

    if (!qrData) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <QrCode className="h-16 w-16 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            {tQR('description')}
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <canvas ref={canvasRef} className="w-64 h-64 rounded-lg" />
          {timeLeft !== null && timeLeft > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {Math.floor(timeLeft / 3600)}h {(Math.floor(timeLeft / 60) % 60)}m
            </div>
          )}
        </div>

        {timeLeft === 0 && (
          <p className="text-sm text-red-500 font-medium">
            QR Code expired. Generate a new one.
          </p>
        )}

        <div className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            {tQR('scanInstructions')}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            {tQR('theyWillSee')}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-medical-primary" />
            {tQR('title')}
          </DialogTitle>
          <DialogDescription>{tQR('description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {renderQRCode()}

          <div className="flex flex-col gap-2">
            {!qrData || timeLeft === 0 ? (
              <Button
                onClick={handleGenerate}
                disabled={isPending}
                className="w-full bg-medical-primary hover:bg-medical-primary/90"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : timeLeft === 0 ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {tQR('regenerate')}
                  </>
                ) : (
                  <>
                    <QrCode className="mr-2 h-4 w-4" />
                    {tQR('generate')}
                  </>
                )}
              </Button>
            ) : (
              <div className="flex flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={!qrData}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span className="truncate">{tQR('download')}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  disabled={!qrData}
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  <span className="truncate">{tQR('copyLink')}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  disabled={!qrData}
                  className="flex-1"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  <span className="truncate">{tQR('share')}</span>
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Shield className="h-4 w-4 text-medical-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              {tQR('notShared')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
