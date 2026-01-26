'use client';

import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Activity, Calendar, Search, Mic } from 'lucide-react';
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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

import { PatientSearch } from '@/components/doctor/PatientSearch';
import { PatientProfile } from '@/components/doctor/PatientProfile';
import { PatientRegistrationSheet } from '@/components/doctor/PatientRegistrationSheet';
import { NationalIdScanner } from '@/components/doctor/NationalIdScanner';
import { AddPatientDialog } from '@/components/doctor/AddPatientDialog';
import { VisitForm } from '@/components/doctor/VisitForm';
import { VoiceRecorderDialog } from '@/components/doctor/VoiceRecorderDialog';
import { useGetAllVisits, useGetAllPatients } from '@/lib/api/queries/useVisits';
import { EnrichedScanData } from '@/types/ocr';
import { toast } from 'sonner';

interface DoctorDashboardProps {
  params: Promise<{ locale: string }>;
}

type View = 'search' | 'profile' | 'newVisit' | 'visits' | 'patients';

export default function DoctorDashboard({ params }: DoctorDashboardProps) {
  const { locale } = use(params);
  const t = useTranslations('doctor');
  const [currentView, setCurrentView] = useState<View>('visits');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    null
  );
  const [selectedPatientNationalId, setSelectedPatientNationalId] = useState<string | undefined>(
    undefined
  );
  const [isRegistrationSheetOpen, setIsRegistrationSheetOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [scannedData, setScannedData] = useState<EnrichedScanData | null>(null);
  const [registrationSource, setRegistrationSource] = useState<
    'scan' | 'manual'
  >('manual');

  const { data: allVisits, isLoading: loadingAllVisits } = useGetAllVisits({ page: 1, limit: 50 });
  const { data: allPatients, isLoading: loadingAllPatients } = useGetAllPatients();

  // Calculate statistics
  const calculateStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of this week (Sunday)

    // Today's patients (registered today)
    const todaysPatients = Array.isArray(allPatients)
      ? allPatients.filter((p: any) => {
          const patientDate = new Date(p.createdAt || p.dateOfBirth);
          return patientDate >= today;
        }).length
      : allPatients && typeof allPatients === 'object' && 'items' in allPatients && Array.isArray((allPatients as any).items)
        ? (allPatients as { items: any[] }).items.filter((p: any) => {
            const patientDate = new Date(p.createdAt || p.dateOfBirth);
            return patientDate >= today;
          }).length
        : 0;

    // Pending visits (visits without diagnosis or recent visits)
    const pendingVisits = allVisits?.items?.filter((visit: any) => {
      const visitDate = new Date(visit.createdAt);
      // Consider visits from last 7 days as "pending documentation"
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return visitDate >= weekAgo;
    }).length || 0;

    // This week's visits
    const thisWeeksVisits = allVisits?.items?.filter((visit: any) => {
      const visitDate = new Date(visit.createdAt);
      return visitDate >= thisWeekStart;
    }).length || 0;

    return {
      todaysPatients,
      pendingVisits,
      thisWeeksVisits,
    };
  };

  const stats = calculateStats();

  const handleSelectPatient = (patientId: number, socialSecurityNumber?: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientNationalId(socialSecurityNumber);
    setCurrentView('profile');
  };

  const handleNewPatientCreated = (patientId: number, socialSecurityNumber?: string) => {
    setSelectedPatientId(patientId);
    setSelectedPatientNationalId(socialSecurityNumber);
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
    setRegistrationSource('scan');
    setIsScannerOpen(false);
    setIsAddPatientOpen(true);
  };

  // Voice Recorder Handler
  const handleVoiceTranscription = (transcription: string) => {
    toast.success('Transcription copied to clipboard!');
    // Copy to clipboard
    navigator.clipboard.writeText(transcription);

    // You can also show a modal or use the transcription in a form
    console.log('Transcription:', transcription);
  };

  return (
    <AuthGuard allowedRoles={[Role.DOCTOR]} locale={locale}>
      <div className="container mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-medical-primary">
              {t('dashboard')}
            </h1>
            <p className="text-muted-foreground">{t('dashboardSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsVoiceRecorderOpen(true)}
              variant="outline"
              className="border-medical-primary text-medical-primary hover:bg-medical-primary/10"
            >
              <Mic className="md:mr-2 h-5 w-5" />
              <span className='hidden md:inline'>Voice to Text</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>

          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('todayPatients')}
                  </CardTitle>
                  <Users className="h-4 w-4 text-medical-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todaysPatients}</div>
                  <p className="text-xs text-muted-foreground">
                    Patients registered today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('pendingVisits')}
                  </CardTitle>
                  <Activity className="h-4 w-4 text-medical-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingVisits}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('awaitingDocumentation')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('thisWeek')}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-medical-info" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.thisWeeksVisits}</div>
                  <p className="text-xs text-muted-foreground">
                    {t('totalThisWeek')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
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
                <Button
                  onClick={() => setIsVoiceRecorderOpen(true)}
                  variant="outline"
                  className="h-20 border-medical-secondary text-medical-secondary hover:bg-medical-secondary/10"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Voice Notes
                </Button>
              </CardContent>
            </Card>
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={currentView === 'visits' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('visits')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary"
          >
            {t('allVisits')}
          </Button>
          <Button
            variant={currentView === 'patients' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('patients')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary"
          >
            {t('allPatients')}
          </Button>
          <Button
            variant={currentView === 'search' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('search')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary"
          >
            {t('searchPatients')}
          </Button>
        </div>

            {/* Recent Visits */}
            <Card>
           {currentView === 'visits' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('allVisits')}</CardTitle>
              <CardDescription>
                {t('allVisitsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAllVisits ? (
                <div className="space-y-2">
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                </div>
              ) : allVisits && allVisits.items && allVisits.items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Diagnoses</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Visit Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allVisits?.items?.map((visit: any) => (
                      <TableRow
                        key={visit.id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium">
                          {visit?.patient?.name}
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          <div className="truncate" title={visit?.diagnoses}>
                            {visit?.diagnoses}
                          </div>
                        </TableCell>
                        <TableCell>{visit?.doctor?.name}</TableCell>
                        <TableCell>
                          {new Date(visit?.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {t('noVisitsFound')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentView === 'patients' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('allPatients')}</CardTitle>
              <CardDescription>
                {t('allPatientsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAllPatients ? (
                <div className="space-y-2">
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                </div>
              ) : allPatients ? (
                (() => {
                  const patientsList = Array.isArray(allPatients) ? allPatients : (allPatients as any)?.items;
                  return patientsList && patientsList.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Date of Birth</TableHead>
                          <TableHead>Social Security Number</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Job</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {patientsList.map((patient: any) => (
                          <TableRow
                            key={patient.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleSelectPatient(patient.id, patient.socialSecurityNumber)}
                          >
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>
                              {patient.gender === 0 ? 'Male' : 'Female'}
                            </TableCell>
                            <TableCell>
                              {new Date(patient.dateOfBirth).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="font-mono text-sm">
                                {patient.socialSecurityNumber}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[250px]">
                              <div className="truncate" title={patient.address}>
                                {patient.address}
                              </div>
                            </TableCell>
                            <TableCell>{patient.job}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {t('noPatientsFound')}
                      </p>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {t('noPatientsFound')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
            </Card>
          </>

        {currentView === 'search' && (
          <PatientSearch
            onSelectPatient={handleSelectPatient}
            onAddNew={() => setIsRegistrationSheetOpen(true)}
          />
        )}


        {currentView === 'profile' && selectedPatientId && (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setCurrentView('patients')}
            >
              ← {t('backToDashboard')}
            </Button>
            <PatientProfile
              patientId={String(selectedPatientId)}
              patient={
                (Array.isArray(allPatients)
                  ? allPatients
                  : (allPatients as any)?.items
                )?.find(
                  (p: any) =>
                    p.id === selectedPatientId ||
                    p.national_id === selectedPatientNationalId ||
                    p.socialSecurityNumber === selectedPatientNationalId
                )
              }
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
              patientId={String(selectedPatientId)}
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

          <VoiceRecorderDialog
            open={isVoiceRecorderOpen}
            onOpenChange={setIsVoiceRecorderOpen}
            onTranscriptionComplete={handleVoiceTranscription}
          />
          </div>
    </AuthGuard>
  );
}
