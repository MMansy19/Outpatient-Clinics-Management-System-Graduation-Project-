'use client';

import React, { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Users, Activity, Calendar, Mic, Plus } from 'lucide-react';
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
// import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

import { NationalIdSearch } from '@/components/doctor/NationalIdSearch';
import { PatientRegistrationSheet } from '@/components/doctor/PatientRegistrationSheet';
import { NationalIdScanner } from '@/components/doctor/NationalIdScanner';
import { AddPatientDialog } from '@/components/doctor/AddPatientDialog';
import { PatientProfile } from '@/components/doctor/PatientProfile';
import { VoiceRecorderDialog } from '@/components/doctor/VoiceRecorderDialog';
import {
  useGetAllVisits,
  useGetAllPatients,
} from '@/lib/api/queries/useVisits';
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
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isRegistrationSheetOpen, setIsRegistrationSheetOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [scannedData, setScannedData] = useState<EnrichedScanData | null>(null);
  const [registrationSource, setRegistrationSource] = useState<
    'scan' | 'manual'
  >('manual');
  const {
    data: allVisits,
    isLoading: loadingAllVisits,
    error: visitsError,
    refetch: refetchVisits,
  } = useGetAllVisits({ page: 1, limit: 50 });

  const {
    data: allPatients,
    isLoading: loadingAllPatients,
    error: patientsError,
    refetch: refetchPatients,
  } = useGetAllPatients();

  // Debug logging
  console.log('🔍 Patients Query State:', {
    data: allPatients,
    isLoading: loadingAllPatients,
    error: patientsError,
    hasData: !!allPatients,
  });

  console.log('🔍 Visits Query State:', {
    data: allVisits,
    isLoading: loadingAllVisits,
    error: visitsError,
    hasData: !!allVisits,
  });

  // Calculate statistics
  const calculateStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of this week (Sunday)

    // Get patients list (handle both paginated and non-paginated)
    const patientsList = Array.isArray(allPatients)
      ? allPatients
      : (allPatients as any)?.items || [];

    // Today's patients (using dateOfBirth as fallback since createdAt might not exist)
    const todaysPatients = patientsList.filter((p: any) => {
      // Check if patient was created today (using dateOfBirth as proxy if createdAt doesn't exist)
      const patientDate = new Date(p.createdAt || p.dateOfBirth);
      patientDate.setHours(0, 0, 0, 0);
      return patientDate.getTime() === today.getTime();
    }).length;

    // Get visits list
    const visitsList = allVisits?.items || [];

    // Pending visits (visits from last 7 days)
    const pendingVisits = visitsList.filter((visit: any) => {
      const visitDate = new Date(visit.created_at || visit.createdAt);
      // Consider visits from last 7 days as "pending documentation"
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return visitDate >= weekAgo;
    }).length;

    // This week's visits
    const thisWeeksVisits = visitsList.filter((visit: any) => {
      const visitDate = new Date(visit.created_at || visit.createdAt);
      return visitDate >= thisWeekStart;
    }).length;

    return {
      todaysPatients,
      pendingVisits,
      thisWeeksVisits,
    };
  };

  const stats = calculateStats();

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setCurrentView('profile');
  };

  const handleNewPatientCreated = (patient: any) => {
    setSelectedPatient(patient);
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

  // Force refetch on mount
  React.useEffect(() => {
    console.log('🔄 Dashboard mounted, refetching data...');
    refetchPatients();
    refetchVisits();
  }, [ refetchPatients, refetchVisits]);

  return (
    <AuthGuard allowedRoles={[Role.DOCTOR]} locale={locale}>
      <div className="container mx-auto space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-medical-primary">
              {t('dashboard')}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {t('dashboardSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setIsVoiceRecorderOpen(true)}
              variant="outline"
              className="sm:flex-none border-medical-primary text-medical-primary hover:bg-medical-primary/10"
            >
              <Mic className="sm:mr-2 h-5 w-5" />
              <span className="hidden sm:inline">{t('title')}</span>
            </Button>
            <Button
              onClick={() => {
                setIsRegistrationSheetOpen(true);
              }}
              variant="outline"
              className="sm:flex-none "
            >
              <Plus className="sm:mr-2 h-5 w-5" />
              <span className="hidden sm:inline">Add Patient</span>
            </Button>
            <LanguageToggle locale={locale} variant="outline" size="icon" />
            {/* <ThemeToggle /> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
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
                {loadingAllPatients ? 'Loading...' : 'Total patients'}
              </p>
              {patientsError && (
                <p className="text-xs text-red-500 mt-1">
                  Error: {String(patientsError.message)}
                </p>
              )}
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
              {visitsError && (
                <p className="text-xs text-red-500 mt-1">
                  Error: {String(visitsError.message)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 md:col-span-1">
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

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b overflow-x-auto scrollbar-hide ">
          <Button
            variant={currentView === 'visits' ? 'default' : 'outline'}
            onClick={() => setCurrentView('visits')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary whitespace-nowrap"
          >
            {t('allVisits')}
          </Button>
          <Button
            variant={currentView === 'patients' ? 'default' : 'outline'}
            onClick={() => setCurrentView('patients')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary whitespace-nowrap"
          >
            {t('allPatients')}
          </Button>
          <Button
            variant={currentView === 'search' ? 'default' : 'outline'}
            onClick={() => setCurrentView('search')}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary whitespace-nowrap"
          >
            {t('searchPatients')}
          </Button>
        </div>

        {/* Recent Visits */}
        {currentView === 'visits' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('allVisits')}</CardTitle>
              <CardDescription>{t('allVisitsDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAllVisits ? (
                <div className="space-y-2">
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                </div>
              ) : allVisits && allVisits.items && allVisits.items.length > 0 ? (
                <div className="overflow-x-auto">
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
                      {(allVisits?.items || []).map((visit: any) => (
                        <TableRow
                          key={visit.id}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell className="font-medium">
                            {visit?.patient?.name ||
                              visit?.patient_name ||
                              'N/A'}
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <div
                              className="truncate"
                              title={visit?.diagnoses || visit?.diagnosis}
                            >
                              {visit?.diagnoses ||
                                visit?.diagnosis ||
                                'No diagnosis'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {visit?.doctor?.name ||
                              visit?.doctor_name ||
                              'Dr. Unknown'}
                          </TableCell>
                          <TableCell>
                            {visit?.created_at
                              ? new Date(visit.created_at).toLocaleDateString()
                              : visit?.createdAt
                                ? new Date(visit.createdAt).toLocaleDateString()
                                : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('noVisitsFound')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentView === 'patients' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('allPatients')}</CardTitle>
              <CardDescription>{t('allPatientsDescription')}</CardDescription>
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
                  const patientsList = Array.isArray(allPatients)
                    ? allPatients
                    : (allPatients as any)?.items || [];

                  return patientsList && patientsList.length > 0 ? (
                    <div className="overflow-x-auto">
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
                              onClick={() => handleSelectPatient(patient)}
                            >
                              <TableCell className="font-medium">
                                {patient.name || 'Unknown'}
                              </TableCell>
                              <TableCell>
                                {patient.gender === 0
                                  ? 'Male'
                                  : patient.gender === 1
                                    ? 'Female'
                                    : 'Other'}
                              </TableCell>
                              <TableCell>
                                {patient.dateOfBirth
                                  ? new Date(
                                      patient.dateOfBirth
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className="font-mono text-sm">
                                  {patient.socialSecurityNumber || 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[250px]">
                                <div
                                  className="truncate"
                                  title={patient.address}
                                >
                                  {patient.address || 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell>{patient.job || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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
        {currentView === 'search' && (
          <NationalIdSearch
            onSelectPatient={handleSelectPatient}
            onAddNew={() => setIsRegistrationSheetOpen(true)}
          />
        )}

        {currentView === 'profile' && selectedPatient && (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setCurrentView('patients')}
              className=""
            >
              ← {t('backToPatients')}
            </Button>
            <PatientProfile
              patient={selectedPatient}
              onEdit={() => {
                // If it's a new scanned patient, open registration dialog
                if (selectedPatient?.isNewPatient) {
                  setScannedData(selectedPatient.scannedData || null);
                  setRegistrationSource('scan');
                  setIsAddPatientOpen(true);
                } else {
                  // If it's an existing patient, open edit dialog (if available)
                  // For now, just show a toast or navigate to edit view
                  toast.info('Edit patient feature coming soon');
                }
              }}
            />
          </div>
        )}

        {currentView === 'newVisit' && selectedPatient && (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setCurrentView('profile')}
              className=""
            >
              ← {t('backToProfile')}
            </Button>
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
