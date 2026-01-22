'use client';

import { use, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { QrCode } from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Role } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClinicTable } from '@/components/admin/ClinicTable';
import { DoctorTable } from '@/components/admin/DoctorTable';
import { PatientTable } from '@/components/admin/PatientTable';
import { VisitTable } from '@/components/admin/VisitTable';
import { QRCodeGenerator } from '@/components/admin/QRCodeGenerator';
import { CreateDoctorDialog } from '@/components/admin/CreateDoctorDialog';
import { StatsCards } from '@/components/admin/StatsCards';
import { adminApi } from '@/lib/api/admin.service';
import {
  mockDoctorsAPI,
  mockPatientsAPI,
  mockVisitsAPI,
} from '@/lib/api/mockData';

interface AdminDashboardProps {
  params: Promise<{ locale: string }>;
}

export default function AdminDashboard({ params }: AdminDashboardProps) {
  const { locale } = use(params);
  const t = useTranslations('admin');
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalClinics: 0,
    totalDoctors: 0,
    totalPatients: 0,
    todayVisits: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [clinics, doctors, patientsData, visits] = await Promise.all([
          adminApi.getClinics(), // Use adminApi instead of mockClinicsAPI
          mockDoctorsAPI.getDoctors(),
          mockPatientsAPI.searchPatients(),
          mockVisitsAPI.getTodayVisits(),
        ]);

        setStats({
          totalClinics: clinics.length,
          totalDoctors: doctors.length,
          totalPatients: patientsData.total,
          todayVisits: visits.length,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]} locale={locale}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-medical-primary">
                {t('dashboard')}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('dashboardSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CreateDoctorDialog />
              <ThemeToggle />
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Management Tabs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                {t('systemManagement')}
              </h2>
              <Button
                onClick={() => setIsQRDialogOpen(true)}
                variant="outline"
                size="sm"
                className="border-medical-primary text-medical-primary hover:bg-medical-primary/10 w-full sm:w-auto"
              >
                <QrCode className="mr-2 h-4 w-4" />
                <span className="text-sm">{t('generateQRCode')}</span>
              </Button>
            </div>

            <Tabs defaultValue="clinics" className="space-y-4">
              {/* Responsive Tabs List */}
              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="grid w-full grid-cols-4 min-w-[400px] sm:min-w-0 sm:w-full lg:w-[550px]">
                  <TabsTrigger value="clinics" className="text-xs sm:text-sm">
                    {t('clinics')}
                  </TabsTrigger>
                  <TabsTrigger value="doctors" className="text-xs sm:text-sm">
                    {t('doctors')}
                  </TabsTrigger>
                  <TabsTrigger value="patients" className="text-xs sm:text-sm">
                    {t('patients')}
                  </TabsTrigger>
                  <TabsTrigger value="visits" className="text-xs sm:text-sm">
                    {t('visits')}
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="clinics" className="space-y-4 mt-4">
                <ClinicTable />
              </TabsContent>

              <TabsContent value="doctors" className="space-y-4 mt-4">
                <DoctorTable />
              </TabsContent>

              <TabsContent value="patients" className="space-y-4 mt-4">
                <PatientTable />
              </TabsContent>

              <TabsContent value="visits" className="space-y-4 mt-4">
                <VisitTable />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <QRCodeGenerator open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen} />
    </AuthGuard>
  );
}
