'use client';

import { use, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Building2, Calendar, QrCode } from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Role } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClinicTable } from '@/components/admin/ClinicTable';
import { DoctorTable } from '@/components/admin/DoctorTable';
import { PatientTable } from '@/components/admin/PatientTable';
import { QRCodeGenerator } from '@/components/admin/QRCodeGenerator';
import { CreateDoctorDialog } from '@/components/admin/CreateDoctorDialog';
import { adminApi } from '@/lib/api/admin.service';
import { toast } from 'sonner';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        // Fetch data from backend with pagination (page 1, limit high to get totals)
        const [doctorsData, patientsData, visitsData] = await Promise.all([
          adminApi.getDoctors({ page: 1, limit: 1 }), // Just get totals
          adminApi.getPatients({ page: 1, limit: 1 }),
          adminApi.getVisits({ page: 1, limit: 1 }),
        ]);

        setStats({
          totalClinics: 0, // TODO: Add clinics endpoint when available
          totalDoctors: doctorsData.totalItems,
          totalPatients: patientsData.totalItems,
          todayVisits: visitsData.totalItems,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN]} locale={locale}>
      <div className="container mx-auto space-y-8 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-medical-primary">
              {t('dashboard')}
            </h1>
            <p className="text-muted-foreground">{t('dashboardSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <CreateDoctorDialog />
            <ThemeToggle />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="medical-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t('totalClinics')}
                </p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.totalClinics}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-medical-primary" />
            </div>
          </div>

          <div className="medical-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t('totalDoctors')}
                </p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.totalDoctors}
                </p>
              </div>
              <Users className="h-8 w-8 text-medical-secondary" />
            </div>
          </div>

          <div className="medical-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t('totalPatients')}
                </p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.totalPatients}
                </p>
              </div>
              <Users className="h-8 w-8 text-medical-info" />
            </div>
          </div>

          <div className="medical-card">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t('todayVisits')}
                </p>
                <p className="text-2xl font-bold">
                  {loading ? '...' : stats.todayVisits}
                </p>
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
