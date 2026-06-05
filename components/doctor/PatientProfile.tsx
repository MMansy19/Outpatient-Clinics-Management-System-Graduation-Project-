'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  User,
  Calendar,
  Activity,
  Pill,
  TestTube2,
  ScanLine,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useGetPatientByNationalId } from '@/lib/api/queries/usePatients';
import { useGetPatientVisits } from '@/lib/api/queries/useVisits';
import { useGetPatientMedications } from '@/lib/api/queries/useMedications';
import { useGetPatientLabs } from '@/lib/api/queries/useLabs';
import { useGetPatientScans } from '@/lib/api/queries/useScans';

import { VisitDialog } from '@/components/doctor/VisitDialog';
import { MedicationDialog } from '@/components/doctor/MedicationDialog';
import { LabForm } from '@/components/doctor/LabForm';
import { ScanForm } from '@/components/doctor/ScanForm';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared/EmptyState';
import { MobileTabNavigation } from '@/components/shared/MobileTabNavigation';
import { QuickActionCard } from '@/components/shared/QuickActionCard';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import { InlineProgressBar } from '@/components/shared/InlineProgressBar';
import { OfflinePill } from '@/components/shared/OfflinePill';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

import { calculateAge, formatDate } from '@/lib/utils/formatDate';

interface PatientProfileProps {
  socialSecurityNumber: string;
  isNewPatient?: boolean;
  scannedData?: any;
  onEdit?: () => void;
}

export function PatientProfile({
  socialSecurityNumber,
  isNewPatient,
  scannedData,
  onEdit,
}: PatientProfileProps) {
  const t = useTranslations('doctor');
  const tPatient = useTranslations('patient');
  const tVisit = useTranslations('visit');
  const tCommon = useTranslations('common');
  const tTable = useTranslations('table');
  const tVitals = useTranslations('vitals');
  const { isOnline } = useNetworkStatus();

  const getScanTypeLabel = (
    typeValue: string | number | undefined | null
  ): string => {
    if (!typeValue && typeValue !== 0) return '-';
    const typeMap: Record<string, string> = {
      '0': t('scanTypes.mri'),
      '1': t('scanTypes.ct'),
      '2': t('scanTypes.xray'),
      '3': t('scanTypes.ultrasound'),
      '4': t('scanTypes.petct'),
      '5': t('scanTypes.mammography'),
    };
    return typeMap[String(typeValue)] || String(typeValue);
  };

  // Fetch patient data by national ID
  const {
    data: patient,
    isLoading: loadingPatient,
    error: patientError,
    refetch: refetchPatient,
    isFetching: isRefetchingPatient,
  } = useGetPatientByNationalId(socialSecurityNumber);

  // Get patient ID (UUID/global_id) for subsequent queries
  // Handle both admin (nested user.id) and doctor (flat id/global_id) patient structures
  // IMPORTANT: For admin API (PatientResponse), `id` is the patient entity ID, NOT the user UUID.
  // The visits/meds/labs/scans endpoints expect the user UUID, so prefer user.id over id.
  const patientAny = patient as any;
  const patientId =
    patientAny?.global_id || patientAny?.user?.id || patientAny?.id || null;

  // Combine API patient data with scanned data (scanned data serves as fallback)
  // Handle both admin (nested user) and doctor (flat) patient structures
  const patientUser = patientAny?.user || patientAny;
  const patientName =
    patientAny?.name ||
    (patientUser?.firstName && patientUser?.lastName
      ? `${patientUser.firstName} ${patientUser.lastName}`
      : '') ||
    scannedData?.name ||
    (scannedData?.firstName && scannedData?.lastName
      ? `${scannedData.firstName} ${scannedData.lastName}`
      : '');

  const patientGender =
    patientAny?.gender ?? patientUser?.gender ?? scannedData?.gender;
  const patientDateOfBirth =
    patientAny?.dateOfBirth ||
    patientAny?.birthdate ||
    patientUser?.dateOfBirth ||
    patientUser?.birthdate ||
    scannedData?.birthdate ||
    scannedData?.dateOfBirth;

  // If this is a new patient (scanned but not registered yet), show registration UI
  const isScannedNewPatient = isNewPatient && !patient;

  // For newly registered patients, show loading while fetching
  // If patient is null and we're loading or fetching, show skeleton
  const showLoading = loadingPatient || (isRefetchingPatient && !patient);

  const { data: visitsResponse, isLoading: loadingVisits } =
    useGetPatientVisits(patientId || '');

  // Extract visits from the wrapped response structure
  const visits =
    (visitsResponse as any)?.clinics?.flatMap(
      (clinic: any) => clinic.visits || []
    ) || [];

  // Dialog states
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [isLabFormOpen, setIsLabFormOpen] = useState(false);
  const [isScanFormOpen, setIsScanFormOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('visits');

  // Fetch additional data
  const { data: medications, isLoading: loadingMedications } =
    useGetPatientMedications(patientId || '');
  const { data: labs, isLoading: loadingLabs } = useGetPatientLabs(
    patientId || ''
  );
  const { data: scans, isLoading: loadingScans } = useGetPatientScans(
    patientId || ''
  );

  // Extract data from wrapped response structures
  const medicationsList = (medications as any)?.medications || [];
  const labsList = (labs as any)?.labs || [];
  const scansList = (scans as any)?.scans || [];

  // Background loading: we no longer block the whole page on a spinner.
  // The header / tabs render immediately; an inline progress bar communicates
  // that data is still being fetched. Hard error / not-found states still
  // short-circuit below, but only after the initial load has settled.
  const isBackgroundLoading =
    loadingPatient ||
    isRefetchingPatient ||
    loadingVisits ||
    loadingMedications ||
    loadingLabs ||
    loadingScans;

  // Hard error path: only when the request actually failed.
  if (patientError && !isScannedNewPatient && !patient) {
    const errorMessage =
      (patientError as any)?.response?.data?.message || patientError.message;
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive mb-2 font-medium">{errorMessage}</p>
          <p className="text-muted-foreground mb-4">{t('patientNotFound')}</p>
          <Button variant="outline" onClick={() => refetchPatient()}>
            {t('tryAgain')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // True "no data" path: nothing in cache, nothing from network, not a new
  // scanned patient, and we are no longer loading. This avoids flashing the
  // empty state on initial mount.
  if (!patient && !isScannedNewPatient && !showLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">{t('patientNotFound')}</p>
          <Button variant="outline" onClick={() => refetchPatient()}>
            {t('tryAgain')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // If this is a scanned but unregistered patient, show registration UI
  if (isScannedNewPatient) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        {/* New Patient Alert */}
        <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0">
                <ScanLine className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-blue-900 dark:text-blue-100">
                  {tPatient('notRegistered')}
                </h3>
                <Button
                  onClick={onEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {tPatient('registerNew')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scanned Information */}
        <Card>
          <CardHeader>
            <CardTitle>{tPatient('scannedInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scannedData?.name && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {tPatient('name')}
                  </p>
                  <p className="text-lg">{scannedData.name}</p>
                </div>
              )}
              {socialSecurityNumber && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {tPatient('nationalId')}
                  </p>
                  <p className="text-lg font-mono">{socialSecurityNumber}</p>
                </div>
              )}
              {scannedData?.gender !== undefined && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {tPatient('gender')}
                  </p>
                  <p className="text-lg">
                    {String(scannedData.gender) === '0' ||
                    scannedData.gender === 'male'
                      ? tPatient('male')
                      : String(scannedData.gender) === '1' ||
                          scannedData.gender === 'female'
                        ? tPatient('female')
                        : tCommon('other')}
                  </p>
                </div>
              )}
              {scannedData?.dateOfBirth &&
                calculateAge(scannedData.dateOfBirth) >= 1 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {tPatient('age')}
                    </p>
                    <p className="text-lg">
                      {calculateAge(scannedData.dateOfBirth)}{' '}
                      {tPatient('years')}
                    </p>
                  </div>
                )}
              {scannedData?.address && (
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {tPatient('address')}
                  </p>
                  <p className="text-lg">{scannedData.address}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestVisit = visits?.[0];
  const latestVitals = latestVisit?.vitals;

  // Tabs configuration
  const tabs = [
    {
      value: 'visits',
      label: t('visits'),
      icon: Activity,
      count: visits?.length || 0,
    },
    {
      value: 'medications',
      label: tPatient('medications'),
      icon: Pill,
      count: medicationsList?.length || 0,
    },
    {
      value: 'labs',
      label: tPatient('labs'),
      icon: TestTube2,
      count: labsList?.length || 0,
    },
    {
      value: 'scans',
      label: tPatient('scans'),
      icon: ScanLine,
      count: scansList?.length || 0,
    },
  ];

  return (
    <div className="relative space-y-6 pb-20 md:pb-6">
      {/* Background-fetch indicator. Sits above all content but never blocks
          interaction. Hidden when nothing is in flight. */}
      <InlineProgressBar active={isBackgroundLoading} />

      {/* Offline source pill: shown when we are offline and the user is
          looking at cached data. */}
      {!isOnline && patient && (
        <OfflinePill source="offline" className="mt-1" />
      )}

      {/* Scanned Patient Notification */}
      {scannedData && (
        <Card className="border border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <ScanLine className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                <span className="font-medium">{tPatient('foundViaScan')}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Card */}
      <Card className="sticky top-0 z-30 bg-background md:static md:top-auto">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-medical-primary/10 flex items-center justify-center shrink-0">
                <User className="h-7 w-7 md:h-8 md:w-8 text-medical-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl md:text-2xl truncate">
                  {patientName}
                </CardTitle>
                <CardDescription className="flex flex-row justify-between items-center gap-2 sm:gap-4">
                  <div className="flex flex-col gap-1 sm:gap-2 mt-1 ">
                    <span className="text-xs sm:text-sm">
                      {tPatient('nationalId')}:{' '}
                      {socialSecurityNumber ||
                        patient?.socialSecurityNumber ||
                        patient?.national_id}
                    </span>
                    <Badge
                      variant={
                        String(patientGender) === '0' ||
                        patientGender === 'male'
                          ? 'default'
                          : 'secondary'
                      }
                      className="w-fit max-w-40 px-2 py-1 text-xs sm:text-sm"
                    >
                      {String(patientGender) === '0' || patientGender === 'male'
                        ? tPatient('male')
                        : tPatient('female')}
                    </Badge>
                  </div>
                  {patientDateOfBirth && (
                    <div className="min-w-16">
                      <div className="flex flex-row gap-2 items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          {tPatient('age')}
                        </p>
                      </div>
                      <p className="font-medium truncate">
                        {calculateAge(patientDateOfBirth)} {tPatient('years')}
                      </p>
                    </div>
                  )}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2 sm:shrink-0">
              {/* {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 sm:flex-none min-h-[44px]">
                  <Edit className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{tCommon('edit')}</span>
                </Button>
              )} */}
              <Button
                size="sm"
                onClick={() => setIsVisitDialogOpen(true)}
                className="bg-medical-primary hover:bg-medical-primary/90 hidden sm:flex-none min-h-[44px]"
              >
                <Activity className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t('newVisit')}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Latest Vitals */}
      {latestVitals && (
        <Card>
          <CardHeader>
            <CardTitle>{t('latestVitals')}</CardTitle>
            <CardDescription>
              {latestVisit && formatDate(latestVisit.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div className="medical-card">
                <p className="text-sm text-muted-foreground">
                  {tVisit('weight')}
                </p>
                <p className="text-2xl font-bold text-medical-primary">
                  {latestVitals.weight} {tVitals('kg')}
                </p>
              </div>
              {latestVitals.height && (
                <div className="medical-card">
                  <p className="text-sm text-muted-foreground">
                    {tVisit('height')}
                  </p>
                  <p className="text-2xl font-bold">
                    {latestVitals.height} {tVitals('cm')}
                  </p>
                </div>
              )}
              {latestVitals.blood_pressure_systolic &&
                latestVitals.blood_pressure_diastolic && (
                  <div className="medical-card">
                    <p className="text-sm text-muted-foreground">
                      {tVisit('bloodPressure')}
                    </p>
                    <p className="text-2xl font-bold">
                      {latestVitals.blood_pressure_systolic}/
                      {latestVitals.blood_pressure_diastolic} {tVitals('mmHg')}
                    </p>
                  </div>
                )}
              {latestVitals.heart_rate && (
                <div className="medical-card">
                  <p className="text-sm text-muted-foreground">
                    {tVisit('heartRate')}
                  </p>
                  <p className="text-2xl font-bold">
                    {latestVitals.heart_rate} bpm
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Data Tabs */}
      <div className="w-full min-h-[400px]">
        {/* Desktop Tabs */}
        <Tabs defaultValue="visits" className="w-full hidden md:block">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="visits">
              <Activity className="mr-2 h-4 w-4" />
              {t('visits')}
            </TabsTrigger>
            <TabsTrigger value="medications">
              <Pill className="mr-2 h-4 w-4" />
              {tPatient('medications')}
            </TabsTrigger>
            <TabsTrigger value="labs">
              <TestTube2 className="mr-2 h-4 w-4" />
              {tPatient('labs')}
            </TabsTrigger>
            <TabsTrigger value="scans">
              <ScanLine className="mr-2 h-4 w-4" />
              {tPatient('scans')}
            </TabsTrigger>
          </TabsList>

          {/* Visits Tab */}
          <TabsContent value="visits" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('visits')}</CardTitle>
                    <CardDescription>
                      {visits
                        ? `${visits.length} ${t('totalVisits')}`
                        : tCommon('loading')}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsVisitDialogOpen(true)}
                    className="bg-medical-primary hover:bg-medical-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createVisit')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {loadingVisits ? (
                  <div className="space-y-2">
                    <div className="skeleton h-16 w-full" />
                    <div className="skeleton h-16 w-full" />
                  </div>
                ) : visits && visits.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tTable('date')}</TableHead>
                        <TableHead>{tTable('doctor')}</TableHead>
                        <TableHead>{tTable('speciality')}</TableHead>
                        <TableHead>{tTable('diagnoses')}</TableHead>
                        <TableHead>{tTable('audio')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visits.map((visit: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(visit.createdAt)}</TableCell>
                          <TableCell>
                            {visit.doctor?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {visit.doctor?.speciality || 'N/A'}
                          </TableCell>
                          <TableCell>{visit.diagnoses || 'N/A'}</TableCell>
                          <TableCell>
                            {visit.diagnosesAudioUrl && (
                              <AudioPlayer
                                src={visit.diagnosesAudioUrl}
                                compact
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    icon={Activity}
                    title={t('noVisitsYet')}
                    description={t('noVisitsDescription')}
                    action={{
                      label: t('createFirstVisit'),
                      onClick: () => setIsVisitDialogOpen(true),
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{tPatient('medications')}</CardTitle>
                    <CardDescription>
                      {medicationsList
                        ? `${medicationsList.length} ${t('totalMedications')}`
                        : tCommon('loading')}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsMedicationDialogOpen(true)}
                    className="bg-medical-primary hover:bg-medical-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addMedication')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {loadingMedications ? (
                  <div className="space-y-2">
                    <div className="skeleton h-16 w-full" />
                    <div className="skeleton h-16 w-full" />
                  </div>
                ) : medicationsList && medicationsList.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tTable('name')}</TableHead>
                        <TableHead>{tTable('dosage')}</TableHead>
                        <TableHead>{tTable('duration')}</TableHead>
                        <TableHead>{tTable('doctor')}</TableHead>
                        <TableHead>{tTable('comments')}</TableHead>
                        <TableHead>{tTable('audio')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicationsList.map((medication: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {medication.name}
                          </TableCell>
                          <TableCell>{medication.dosage}</TableCell>
                          <TableCell>{medication.period} days</TableCell>
                          <TableCell>
                            {medication.doctor?.name || 'N/A'}
                          </TableCell>
                          <TableCell>{medication.comments || '-'}</TableCell>
                          <TableCell>
                            {medication.commentsAudioUrl && (
                              <AudioPlayer
                                src={medication.commentsAudioUrl}
                                compact
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    icon={Pill}
                    title={t('noMedicationsYet')}
                    action={{
                      label: t('addFirstMedication'),
                      onClick: () => setIsMedicationDialogOpen(true),
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Labs Tab */}
          <TabsContent value="labs" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{tPatient('labs')}</CardTitle>
                    <CardDescription>
                      {labsList
                        ? `${labsList.length} ${t('totalLabs')}`
                        : tCommon('loading')}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsLabFormOpen(true)}
                    className="bg-medical-primary hover:bg-medical-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addLab')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {loadingLabs ? (
                  <div className="space-y-2">
                    <div className="skeleton h-16 w-full" />
                    <div className="skeleton h-16 w-full" />
                  </div>
                ) : labsList && labsList.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tTable('date')}</TableHead>
                        <TableHead>{tTable('name')}</TableHead>
                        <TableHead>{tTable('doctor')}</TableHead>
                        <TableHead>{tTable('comments')}</TableHead>
                        <TableHead>{tTable('audio')}</TableHead>
                        <TableHead>{tTable('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labsList.map((lab: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(lab.createdAt)}</TableCell>
                          <TableCell className="font-medium">
                            {lab.name}
                          </TableCell>
                          <TableCell>{lab.doctor?.name || 'N/A'}</TableCell>
                          <TableCell>{lab.comments || '-'}</TableCell>
                          <TableCell>
                            {lab.commentsAudioUrl && (
                              <AudioPlayer src={lab.commentsAudioUrl} compact />
                            )}
                          </TableCell>
                          <TableCell>
                            {lab.photoUrl && (
                              <a
                                href={lab.photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-medical-primary hover:underline"
                              >
                                {tCommon('viewImage')}
                              </a>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    icon={TestTube2}
                    title={t('noLabsYet')}
                    action={{
                      label: t('addFirstLab'),
                      onClick: () => setIsLabFormOpen(true),
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scans Tab */}
          <TabsContent value="scans" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{tPatient('scans')}</CardTitle>
                    <CardDescription>
                      {scansList
                        ? `${scansList.length} ${t('totalScans')}`
                        : tCommon('loading')}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsScanFormOpen(true)}
                    className="bg-medical-primary hover:bg-medical-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addScan')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {loadingScans ? (
                  <div className="space-y-2">
                    <div className="skeleton h-16 w-full" />
                    <div className="skeleton h-16 w-full" />
                  </div>
                ) : scansList && scansList.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tTable('date')}</TableHead>
                        <TableHead>{tTable('name')}</TableHead>
                        <TableHead>{tTable('type')}</TableHead>
                        <TableHead>{tTable('doctor')}</TableHead>
                        <TableHead>{tTable('comments')}</TableHead>
                        <TableHead>{tTable('audio')}</TableHead>
                        <TableHead>{tTable('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scansList.map((scan: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(scan.createdAt)}</TableCell>
                          <TableCell className="font-medium">
                            {scan.name || '-'}
                          </TableCell>
                          <TableCell>{getScanTypeLabel(scan.type)}</TableCell>
                          <TableCell>
                            {scan.doctor?.name || 'N/A'}
                          </TableCell>
                          <TableCell>{scan.comments || '-'}</TableCell>
                          <TableCell>
                            {scan.commentsAudioUrl && (
                              <AudioPlayer
                                src={scan.commentsAudioUrl}
                                compact
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {scan.photoUrl && (
                              <a
                                href={scan.photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-medical-primary hover:underline"
                              >
                                {tCommon('viewImage')}
                              </a>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    icon={ScanLine}
                    title={t('noScansYet')}
                    action={{
                      label: t('addFirstScan'),
                      onClick: () => setIsScanFormOpen(true),
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden">
          <MobileTabNavigation
            tabs={tabs}
            currentTab={currentTab}
            onTabChange={setCurrentTab}
          />
          <div className="mt-6">
            {currentTab === 'visits' && (
              <div className="space-y-4">
                <QuickActionCard
                  icon={Plus}
                  title={t('newVisit')}
                  onClick={() => setIsVisitDialogOpen(true)}
                  variant="primary"
                  size="lg"
                />
                <Card>
                  <CardContent className="p-4">
                    {loadingVisits ? (
                      <div className="space-y-2">
                        <div className="skeleton h-16 w-full" />
                        <div className="skeleton h-16 w-full" />
                      </div>
                    ) : visits && visits.length > 0 ? (
                      <div className="space-y-3">
                        {visits.map((visit: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-medical-primary/10 flex items-center justify-center shrink-0">
                                <Activity className="h-5 w-5 text-medical-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="mt-1 space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                      {tTable('doctor')}:
                                    </span>{' '}
                                    {' '}
                                    {visit.doctor?.name || tCommon('unknown')}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                      {tTable('speciality')}:
                                    </span>{' '}
                                    {visit.doctor?.speciality ||
                                      tCommon('unknown')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(visit.createdAt)}
                                  </p>
                                  {visit.diagnosesAudioUrl && (
                                    <div className="mt-1">
                                      <AudioPlayer
                                        src={visit.diagnosesAudioUrl}
                                        compact
                                      />
                                    </div>
                                  )}
                                  <p className="font-medium truncate md:hidden mt-2">
                                    {visit.diagnoses || tVisit('diagnosis')}
                                  </p>
                                </div>
                                <p className="font-medium truncate hidden md:block">
                                  {visit.diagnoses || tVisit('diagnosis')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Activity}
                        title={t('noVisitsYet')}
                        action={{
                          label: t('createFirstVisit'),
                          onClick: () => setIsVisitDialogOpen(true),
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {currentTab === 'medications' && (
              <div className="space-y-4">
                <QuickActionCard
                  icon={Plus}
                  title={t('addMedication')}
                  onClick={() => setIsMedicationDialogOpen(true)}
                  variant="primary"
                  size="lg"
                />
                <Card>
                  <CardContent className="p-4">
                    {loadingMedications ? (
                      <div className="space-y-2">
                        <div className="skeleton h-16 w-full" />
                        <div className="skeleton h-16 w-full" />
                      </div>
                    ) : medicationsList && medicationsList.length > 0 ? (
                      <div className="space-y-3">
                        {medicationsList.map(
                          (medication: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                  <Pill className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {medication.name}
                                  </p>
                                  <div className="mt-1 space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">
                                        {tTable('dosage')}:
                                      </span>{' '}
                                      {medication.dosage}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">
                                        {tTable('duration')}:
                                      </span>{' '}
                                      {medication.period} {tPatient('days')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">
                                        {tTable('doctor')}:
                                      </span>{' '}
                                      {' '}
                                      {medication.doctor?.name ||
                                        tCommon('unknown')}
                                    </p>
                                    {medication.comments && (
                                      <p className="text-sm text-muted-foreground">
                                        <span className="font-medium">
                                          {tTable('comments')}:
                                        </span>{' '}
                                        {medication.comments}
                                      </p>
                                    )}
                                    {medication.commentsAudioUrl && (
                                      <div className="mt-2">
                                        <AudioPlayer
                                          src={medication.commentsAudioUrl}
                                          compact
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Pill}
                        title={t('noMedicationsYet')}
                        action={{
                          label: t('addFirstMedication'),
                          onClick: () => setIsMedicationDialogOpen(true),
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {currentTab === 'labs' && (
              <div className="space-y-4">
                <QuickActionCard
                  icon={Plus}
                  title={t('addLab')}
                  onClick={() => setIsLabFormOpen(true)}
                  variant="primary"
                  size="lg"
                />
                <Card>
                  <CardContent className="p-4">
                    {loadingLabs ? (
                      <div className="space-y-2">
                        <div className="skeleton h-16 w-full" />
                        <div className="skeleton h-16 w-full" />
                      </div>
                    ) : labsList && labsList.length > 0 ? (
                      <div className="space-y-3">
                        {labsList.map((lab: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <TestTube2 className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {lab.name}
                                </p>
                                <div className="mt-1 space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                      {tTable('date')}:
                                    </span>{' '}
                                    {formatDate(lab.createdAt)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                      {tTable('doctor')}:
                                    </span>{' '}
                                     {lab.doctor?.name || tCommon('unknown')}
                                  </p>
                                  {lab.comments && (
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">
                                        {tTable('comments')}:
                                      </span>{' '}
                                      {lab.comments}
                                    </p>
                                  )}
                                  {lab.photoUrl && (
                                    <a
                                      href={lab.photoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-medical-primary hover:underline inline-block mt-1"
                                    >
                                      {tCommon('viewImage')}
                                    </a>
                                  )}
                                  {lab.commentsAudioUrl && (
                                    <div className="mt-2">
                                      <AudioPlayer
                                        src={lab.commentsAudioUrl}
                                        compact
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={TestTube2}
                        title={t('noLabsYet')}
                        action={{
                          label: t('addFirstLab'),
                          onClick: () => setIsLabFormOpen(true),
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {currentTab === 'scans' && (
              <div className="space-y-4">
                <QuickActionCard
                  icon={Plus}
                  title={t('addScan')}
                  onClick={() => setIsScanFormOpen(true)}
                  variant="primary"
                  size="lg"
                />
                <Card>
                  <CardContent className="p-4">
                    {loadingScans ? (
                      <div className="space-y-2">
                        <div className="skeleton h-16 w-full" />
                        <div className="skeleton h-16 w-full" />
                      </div>
                    ) : scansList && scansList.length > 0 ? (
                      <div className="space-y-3">
                        {scansList.map((scan: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                <ScanLine className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {scan.name ||
                                    getScanTypeLabel(scan.type) ||
                                    tPatient('scans')}
                                </p>
                                <div className="mt-1 space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                      {tTable('date')}:
                                    </span>{' '}
                                    {formatDate(scan.createdAt)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                      {tTable('type')}:
                                    </span>{' '}
                                    {getScanTypeLabel(scan.type)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    <span className="font-medium">
                                      {tTable('doctor')}:
                                    </span>{' '}
                                    {' '}
                                    {scan.doctor?.name || tCommon('unknown')}
                                  </p>
                                  {scan.comments && (
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">
                                        {tTable('comments')}:
                                      </span>{' '}
                                      {scan.comments}
                                    </p>
                                  )}
                                  {scan.photoUrl && (
                                    <a
                                      href={scan.photoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-medical-primary hover:underline inline-block mt-1"
                                    >
                                      {tCommon('viewImage')}
                                    </a>
                                  )}
                                  {scan.commentsAudioUrl && (
                                    <div className="mt-2">
                                      <AudioPlayer
                                        src={scan.commentsAudioUrl}
                                        compact
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={ScanLine}
                        title={t('noScansYet')}
                        action={{
                          label: t('addFirstScan'),
                          onClick: () => setIsScanFormOpen(true),
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <VisitDialog
        open={isVisitDialogOpen}
        onOpenChange={setIsVisitDialogOpen}
        patientId={patientId || ''}
        onSuccess={() => {
          setIsVisitDialogOpen(false);
        }}
      />

      <MedicationDialog
        open={isMedicationDialogOpen}
        onOpenChange={setIsMedicationDialogOpen}
        patientId={patientId || ''}
        onSuccess={() => {
          setIsMedicationDialogOpen(false);
        }}
      />

      <LabForm
        open={isLabFormOpen}
        onOpenChange={setIsLabFormOpen}
        patientId={patientId || ''}
      />

      <ScanForm
        open={isScanFormOpen}
        onOpenChange={setIsScanFormOpen}
        patientId={patientId || ''}
      />
    </div>
  );
}
