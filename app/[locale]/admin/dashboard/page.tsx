'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Building2, Calendar, QrCode } from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { UserRole } from '@/types/entities/User';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClinicTable } from '@/components/admin/ClinicTable';
import { DoctorTable } from '@/components/admin/DoctorTable';
import { PatientTable } from '@/components/admin/PatientTable';
import { QRCodeGenerator } from '@/components/admin/QRCodeGenerator';

interface AdminDashboardProps {
  params: Promise<{ locale: string }>;
}

export default function AdminDashboard({ params }: AdminDashboardProps) {
  const { locale } = use(params);
  const t = useTranslations('admin');
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]} locale={locale}>
      <div className="container mx-auto space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-medical-primary">{t('dashboard')}</h1>
            <p className="text-muted-foreground">{t('dashboardSubtitle')}</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="medical-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('totalClinics')}</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Building2 className="h-8 w-8 text-medical-primary" />
            </div>
          </div>

          <div className="medical-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('totalDoctors')}</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Users className="h-8 w-8 text-medical-secondary" />
            </div>
          </div>

          <div className="medical-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('totalPatients')}</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Users className="h-8 w-8 text-medical-info" />
            </div>
          </div>

          <div className="medical-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('todayVisits')}</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Calendar className="h-8 w-8 text-medical-success" />
            </div>
          </div>
        </div>

        {/* Management Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('systemManagement')}</h2>
            <Button
              onClick={() => setIsQRDialogOpen(true)}
              variant="outline"
              className="border-medical-primary text-medical-primary hover:bg-medical-primary/10"
            >
              <QrCode className="mr-2 h-4 w-4" />
              {t('generateQRCode')}
            </Button>
          </div>

          <Tabs defaultValue="clinics" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="clinics">{t('clinics')}</TabsTrigger>
              <TabsTrigger value="doctors">{t('doctors')}</TabsTrigger>
              <TabsTrigger value="patients">{t('patients')}</TabsTrigger>
            </TabsList>

            <TabsContent value="clinics" className="space-y-4">
              <ClinicTable />
            </TabsContent>

            <TabsContent value="doctors" className="space-y-4">
              <DoctorTable />
            </TabsContent>

            <TabsContent value="patients" className="space-y-4">
              <PatientTable />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <QRCodeGenerator open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen} />
    </AuthGuard>
  );
}
