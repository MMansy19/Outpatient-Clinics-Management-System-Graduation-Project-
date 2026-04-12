'use client';

import React, { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Users,
  Activity,
  Calendar,
  Plus,
  LogOut,
  Stethoscope,
  ClipboardList,
} from 'lucide-react';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Role } from '@/lib/api/types';
import { useAuthStore } from '@/stores/authStore';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { NationalIdSearch } from '@/components/doctor/NationalIdSearch';
import { PatientRegistrationSheet } from '@/components/doctor/PatientRegistrationSheet';
import { NationalIdScanner } from '@/components/doctor/NationalIdScanner';
import { AddPatientDialog } from '@/components/doctor/AddPatientDialog';
import { PatientProfile } from '@/components/doctor/PatientProfile';
import { VoiceRecorderDialog } from '@/components/doctor/VoiceRecorderDialog';
import { CreateDoctorDialog } from '@/components/admin/CreateDoctorDialog';
import {
  useGetAllVisits,
  useGetAllPatients,
} from '@/lib/api/queries/useVisits';
import { useGetClinicDoctors } from '@/lib/api/queries/useUsers';
import { useAdminGetClinic } from '@/lib/api/queries/useAdmin';
import { useLogout } from '@/lib/api/queries/useAuth';
import { EnrichedScanData } from '@/types/ocr';
import { toast } from 'sonner';

interface DoctorDashboardProps {
  params: Promise<{ locale: string }>;
}

type View =
  | 'search'
  | 'profile'
  | 'newVisit'
  | 'visits'
  | 'patients'
  | 'doctors'
  | 'clinics';

export default function DoctorDashboard({ params }: DoctorDashboardProps) {
  const { locale } = use(params);
  const t = useTranslations('doctor');
  const tPatient = useTranslations('patient');
  const tTable = useTranslations('table');
  const tCommon = useTranslations('common');
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

  // Get user role and clinicId from auth store
  const { user } = useAuthStore();
  const userRole = user?.role;
  const isAdmin = userRole === Role.ADMIN;

  // For ADMIN (clinic manager): fetch own clinic info
  const { data: adminClinic } = useAdminGetClinic(isAdmin);

  const { mutate: logout, isPending: loggingOut } = useLogout();
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

  // Admin-specific: Get doctors in admin's clinic (backend reads clinic from JWT)
  const { data: clinicDoctors, isLoading: loadingClinicDoctors } =
    useGetClinicDoctors(1, 50);

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

    // Admin-specific: Doctors in clinic
    const doctorsInClinic = clinicDoctors?.items?.length || 0;

    // Admin-specific: Total patients and visits in clinic
    const clinicPatients = patientsList.length;
    const clinicVisits = visitsList.length;

    // Admin-specific: Clinic name (from GET /admin/clinic)
    const clinicName = adminClinic?.name || '';

    return {
      todaysPatients,
      pendingVisits,
      thisWeeksVisits,
      doctorsInClinic,
      clinicPatients,
      clinicVisits,
      clinicName,
    };
  };

  const stats = calculateStats();

  const handleSelectPatient = (patient: any) => {
    // Normalize patient data: handle both flat (doctor) and nested (admin) patient structures
    const ssn =
      patient.socialSecurityNumber ||
      patient.user?.socialSecurityNumber ||
      (patient.national_id ? String(patient.national_id) : undefined);
    const name =
      patient.name ||
      (patient.user
        ? `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim()
        : '');
    setSelectedPatient({
      ...patient,
      socialSecurityNumber: ssn,
      name,
    });
    setCurrentView('profile');
  };

  const handleNewPatientCreated = (data: {
    id: number;
    socialSecurityNumber: string;
  }) => {
    console.log('🔍 handleNewPatientCreated - data:', data);
    setSelectedPatient({
      id: data.id,
      socialSecurityNumber: data.socialSecurityNumber,
    });
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

  // Logout Handler
  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();

      await new Promise<void>((resolve) => {
        logout(undefined, {
          onSettled: () => resolve(),
        });
      });

      window.location.replace(`/${locale}/login`);
    } catch (error) {
      console.error('Logout error:', error);
      window.location.replace(`/${locale}/login`);
    }
  };

  // Force refetch on mount
  React.useEffect(() => {
    console.log('🔄 Dashboard mounted, refetching data...');
    refetchPatients();
    refetchVisits();
  }, [refetchPatients, refetchVisits]);

  return (
    <AuthGuard
      allowedRoles={[Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN]}
      locale={locale}
    >
      <div className="container mx-auto space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-medical-primary">
              {isAdmin && stats.clinicName
                ? t('clinicDashboardTitle', { clinicName: stats.clinicName })
                : t('dashboard')}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {isAdmin && stats.clinicName
                ? t('clinicManagerSubtitle', { clinicName: stats.clinicName })
                : t('dashboardSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Add Doctor button - only for ADMIN */}
            {isAdmin && (
              <CreateDoctorDialog
                autoFetchClinic
                trigger={
                  <Button variant="outline" className="sm:flex-none">
                    <Plus className="mr-2 h-5 w-5" />
                    <span className="md:inline hidden">{t('addDoctor')}</span>
                    <span className="inline md:hidden">
                      {t('addDoctorMobile')}
                    </span>
                  </Button>
                }
              />
            )}
            <Button
              onClick={() => {
                setIsRegistrationSheetOpen(true);
              }}
              variant="outline"
              className="sm:flex-none "
            >
              <Plus className="mr-2 h-5 w-5" />
              <span className="md:inline hidden">{t('addNewPatient')}</span>
              <span className="inline md:hidden">
                {t('addNewPatientMobile')}
              </span>
            </Button>
            <LanguageToggle locale={locale} variant="outline" size="icon" />

            {/* Logout Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <ThemeToggle /> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isAdmin ? (
            /* Admin Stats: Clinic-level overview */
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('doctorsInClinic', { clinicName: stats.clinicName })}
                  </CardTitle>
                  <Stethoscope className="h-4 w-4 text-medical-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingClinicDoctors ? '...' : stats.doctorsInClinic}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('doctorsInClinicDescription', {
                      clinicName: stats.clinicName,
                    })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('patientsInClinic', { clinicName: stats.clinicName })}
                  </CardTitle>
                  <Users className="h-4 w-4 text-medical-info" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingAllPatients ? '...' : stats.clinicPatients}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('patientsInClinicDescription', {
                      clinicName: stats.clinicName,
                    })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('visitsInClinic', { clinicName: stats.clinicName })}
                  </CardTitle>
                  <ClipboardList className="h-4 w-4 text-medical-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loadingAllVisits ? '...' : stats.clinicVisits}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('visitsInClinicDescription', {
                      clinicName: stats.clinicName,
                    })}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('thisWeek')}
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-medical-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.thisWeeksVisits}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('thisWeekDescription')}
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Doctor Stats: Personal activity */
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('todayPatients')}
                  </CardTitle>
                  <Users className="h-4 w-4 text-medical-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.todaysPatients}
                  </div>
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
                  <div className="text-2xl font-bold">
                    {stats.pendingVisits}
                  </div>
                  {visitsError && (
                    <p className="text-xs text-red-500 mt-1">
                      Error: {String(visitsError.message)}
                    </p>
                  )}
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
                  <div className="text-2xl font-bold">
                    {stats.thisWeeksVisits}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
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
          {/* Admin-specific tabs */}
          {isAdmin && (
            <>
              <Button
                variant={currentView === 'doctors' ? 'default' : 'outline'}
                onClick={() => setCurrentView('doctors')}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-medical-primary whitespace-nowrap"
              >
                {t('doctors') || 'Doctors'}
              </Button>
            </>
          )}
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
                        <TableHead>{tTable('patientName')}</TableHead>
                        <TableHead>{tTable('diagnoses')}</TableHead>
                        <TableHead>{tTable('doctor')}</TableHead>
                        <TableHead>{tTable('visitDate')}</TableHead>
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
                              tCommon('unknown')}
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <div
                              className="truncate"
                              title={visit?.diagnoses || visit?.diagnosis}
                            >
                              {visit?.diagnoses ||
                                visit?.diagnosis ||
                                tTable('noDiagnosis')}
                            </div>
                            {visit?.diagnosesAudioUrl && (
                              <div className="mt-2">
                                <AudioPlayer
                                  src={visit.diagnosesAudioUrl}
                                  compact
                                />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {visit?.doctor?.name ||
                              visit?.doctor_name ||
                              tCommon('unknown')}
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
                            <TableHead>{tTable('name')}</TableHead>
                            <TableHead>{tTable('gender')}</TableHead>
                            <TableHead>{tTable('dateOfBirth')}</TableHead>
                            <TableHead>
                              {tTable('socialSecurityNumber')}
                            </TableHead>
                            <TableHead>{tPatient('address')}</TableHead>
                            <TableHead>{tTable('job')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patientsList.map((patient: any) => {
                            // Handle both admin (nested user) and doctor (flat) patient structures
                            const patientName =
                              patient.name ||
                              (patient.user
                                ? `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim()
                                : '') ||
                              tCommon('unknown');
                            const patientGender =
                              patient.gender ?? patient.user?.gender;
                            const patientDOB =
                              patient.dateOfBirth || patient.user?.dateOfBirth;
                            const patientSSN =
                              patient.socialSecurityNumber ||
                              patient.user?.socialSecurityNumber;
                            const patientAddress =
                              patient.address || patient.user?.address;
                            const patientJob = patient.job || patient.user?.job;

                            return (
                              <TableRow
                                key={patient.id}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() => handleSelectPatient(patient)}
                              >
                                <TableCell className="font-medium">
                                  {patientName}
                                </TableCell>
                                <TableCell>
                                  {patientGender === 0
                                    ? tPatient('male')
                                    : patientGender === 1
                                      ? tPatient('female')
                                      : tCommon('other')}
                                </TableCell>
                                <TableCell>
                                  {patientDOB
                                    ? new Date(patientDOB).toLocaleDateString()
                                    : tCommon('unknown')}
                                </TableCell>
                                <TableCell>
                                  <div className="font-mono text-sm">
                                    {patientSSN || tCommon('unknown')}
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[250px]">
                                  <div
                                    className="truncate"
                                    title={patientAddress}
                                  >
                                    {patientAddress || tCommon('unknown')}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {patientJob || tCommon('unknown')}
                                </TableCell>
                              </TableRow>
                            );
                          })}
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

        {currentView === 'profile' && selectedPatient?.socialSecurityNumber && (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setCurrentView('patients')}
              className=""
            >
              ← {t('backToPatients')}
            </Button>
            <PatientProfile
              key={selectedPatient.socialSecurityNumber}
              socialSecurityNumber={selectedPatient.socialSecurityNumber}
              isNewPatient={selectedPatient.isNewPatient}
              scannedData={selectedPatient.scannedData}
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

        {/* Admin: Doctors View */}
        {currentView === 'doctors' && isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>{t('doctors') || 'Doctors'}</CardTitle>
              <CardDescription>
                {t('doctorsInClinicDescription', {
                  clinicName: stats.clinicName,
                }) || 'Doctors in your clinic'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClinicDoctors ? (
                <div className="space-y-2">
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                </div>
              ) : clinicDoctors &&
                clinicDoctors.items &&
                clinicDoctors.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tTable('name')}</TableHead>
                        <TableHead>{tTable('email')}</TableHead>
                        <TableHead>{tTable('phone')}</TableHead>
                        <TableHead>{tTable('speciality')}</TableHead>
                        <TableHead>{tTable('status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clinicDoctors.items.map((doctor: any) => (
                        <TableRow key={doctor.id}>
                          <TableCell className="font-medium">
                            {doctor.name}
                          </TableCell>
                          <TableCell>{doctor.email}</TableCell>
                          <TableCell>{doctor.phone}</TableCell>
                          <TableCell>{doctor.speciality}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                doctor.isApproved
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}
                            >
                              {doctor.isApproved
                                ? tTable('approved')
                                : tTable('pending')}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {t('noDoctorsFound') || 'No doctors found in your clinic'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin: Clinics View — no dedicated endpoint exists for ADMIN to fetch clinic info */}

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
