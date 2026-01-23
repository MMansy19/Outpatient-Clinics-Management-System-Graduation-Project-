'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Activity, Calendar, Search } from 'lucide-react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Role } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

import { PatientSearch } from '@/components/doctor/PatientSearch';
import { PatientProfile } from '@/components/doctor/PatientProfile';
import { PatientRegistrationSheet } from '@/components/doctor/PatientRegistrationSheet';
import { NationalIdScanner } from '@/components/doctor/NationalIdScanner';
import { ScannedDataPreview } from '@/components/doctor/ScannedDataPreview';
import { AddPatientDialog } from '@/components/doctor/AddPatientDialog';
import { VisitForm } from '@/components/doctor/VisitForm';
import { useGetRecentVisits } from '@/lib/api/queries/useVisits';
import { formatDate } from '@/lib/utils/formatDate';
import { EnrichedScanData } from '@/types/ocr';

interface DoctorDashboardProps {
  params: Promise<{ locale: string }>;
}

type View = 'dashboard' | 'search' | 'profile' | 'newVisit';

export default function DoctorDashboard({ params }: DoctorDashboardProps) {
  const { locale } = use(params);
  const t = useTranslations('doctor');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isRegistrationSheetOpen, setIsRegistrationSheetOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [scannedData, setScannedData] = useState<EnrichedScanData | null>(null);
  const [registrationSource, setRegistrationSource] = useState<'scan' | 'manual'>('manual');
  const [patientsCreated, setPatientsCreated] = useState(0);

  const { data: recentVisits, isLoading } = useGetRecentVisits(5);

  const handleSelectPatient = (patientId: number) => {
    setSelectedPatientId(patientId);
    setCurrentView('profile');
  };

  const handleNewPatientCreated = (patientId: number) => {
    setPatientsCreated(prev => prev + 1);
    setSelectedPatientId(patientId);
    setCurrentView('profile');
  };

  const handleNewVisit = () => {
    setCurrentView('newVisit');
  };

  const handleVisitCreated = () => {
    setCurrentView('profile');
  };

  // National ID Scanning Flow
  const handleScanOption = () => {
    setIsRegistrationSheetOpen(false);
    setIsScannerOpen(true);
  };

  const handleManualOption = () => {
    setIsRegistrationSheetOpen(false);
    setRegistrationSource('manual');
    setScannedData(null);
    setIsAddPatientOpen(true);
  };

  const handleScanComplete = (data: EnrichedScanData) => {
    setScannedData(data);
    setIsScannerOpen(false);
    setIsPreviewOpen(true);
  };

  const handleConfirmScannedData = (data: EnrichedScanData) => {
    setScannedData(data);
    setRegistrationSource('scan');
    setIsPreviewOpen(false);
    setIsAddPatientOpen(true);
  };

  const handleRetakeScan = () => {
    setIsPreviewOpen(false);
    setIsScannerOpen(true);
  };

  return (
    <AuthGuard allowedRoles={[Role.DOCTOR]} locale={locale}>
      <div className="container mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-medical-primary">{t('dashboard')}</h1>
            <p className="text-muted-foreground">{t('dashboardSubtitle')}</p>
          </div>
          <ThemeToggle />
        </div>

        {currentView === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t('todayPatients')}</CardTitle>
                  <Users className="h-4 w-4 text-medical-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{patientsCreated}</div>
                  <p className="text-xs text-muted-foreground">Patients registered this session</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t('pendingVisits')}</CardTitle>
                  <Activity className="h-4 w-4 text-medical-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentVisits?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">{t('awaitingDocumentation')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t('thisWeek')}</CardTitle>
                  <Calendar className="h-4 w-4 text-medical-info" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{recentVisits?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">{t('totalThisWeek')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Button
                  onClick={() => setCurrentView('search')}
                  className="h-20 bg-medical-primary hover:bg-medical-primary/90"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {t('searchPatients')}
                </Button>
                <Button
                  onClick={() => setIsRegistrationSheetOpen(true)}
                  variant="outline"
                  className="h-20 border-medical-primary text-medical-primary"
                >
                  <Users className="mr-2 h-5 w-5" />
                  {t('addNewPatient')}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Visits */}
            <Card>
              <CardHeader>
                <CardTitle>{t('recentVisits')}</CardTitle>
                <CardDescription>{t('recentVisitsDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="skeleton h-16 w-full" />
                    <div className="skeleton h-16 w-full" />
                  </div>
                ) : recentVisits && recentVisits.length > 0 ? (
                  <div className="space-y-3">
                    {recentVisits.map((visit) => (
                      <div
                        key={visit.id}
                        className="flex items-start justify-between gap-4 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                        onClick={() => handleSelectPatient(visit.patient_id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{visit.patient.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{visit.chief_complaint}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium whitespace-nowrap">{formatDate(visit.created_at)}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 max-w-[180px]">{visit.diagnosis}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">{t('noRecentVisits')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {currentView === 'search' && (
          <PatientSearch
            onSelectPatient={handleSelectPatient}
            onAddNew={() => setIsRegistrationSheetOpen(true)}
          />
        )}

        {currentView === 'profile' && selectedPatientId && (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
              ← {t('backToDashboard')}
            </Button>
            <PatientProfile
              patientId={String(selectedPatientId)}
              onNewVisit={handleNewVisit}
            />
          </div>
        )}

        {currentView === 'newVisit' && selectedPatientId && (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setCurrentView('profile')}>
              ← {t('backToProfile')}
            </Button>
            <VisitForm
              patientId={selectedPatientId}
              onSuccess={handleVisitCreated}
              onCancel={() => setCurrentView('profile')}
            />
          </div>
        )}

        <AddPatientDialog
          open={isAddPatientOpen}
          onOpenChange={setIsAddPatientOpen}
          onSuccess={handleNewPatientCreated}
          prefilledData={scannedData}
          dataSource={registrationSource}
        />

        <PatientRegistrationSheet
          open={isRegistrationSheetOpen}
          onOpenChange={setIsRegistrationSheetOpen}
          onSelectScanId={handleScanOption}
          onSelectManualEntry={handleManualOption}
        />

        <NationalIdScanner
          open={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanComplete={handleScanComplete}
        />

        {scannedData && (
          <ScannedDataPreview
            open={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            data={scannedData}
            onConfirm={handleConfirmScannedData}
            onRetake={handleRetakeScan}
          />
        )}
      </div>
    </AuthGuard>
  );
}
