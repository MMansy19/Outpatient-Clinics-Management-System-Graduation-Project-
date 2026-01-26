'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { User, Calendar, Activity, Pill, TestTube2, ScanLine, Plus } from 'lucide-react';

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

import { calculateAge, formatDate } from '@/lib/utils/formatDate';
import { Gender } from '@/types/entities/Patient';

interface PatientProfileProps {
  patient: {
    id: number | string | null;
    name: string;
    gender: Gender;
    dateOfBirth: string;
    socialSecurityNumber: string;
    address?: string;
    job?: string;
    isNewPatient?: boolean;
    scannedData?: any;
  };
  onEdit?: () => void;
}

export function PatientProfile({
  patient,
  onEdit,
}: PatientProfileProps) {
  const t = useTranslations('doctor');
  const tPatient = useTranslations('patient');
  const tVisit = useTranslations('visit');
  const tCommon = useTranslations('common');

  // Debug logging
  console.log('🔍 PatientProfile - Received patient prop:', patient);

  const { data: visitsResponse, isLoading: loadingVisits } = useGetPatientVisits(String(patient.socialSecurityNumber));

  // Debug logging
  console.log('🔍 PatientProfile - Visits Query:', {
    patientId: patient.id,
    nationalId: patient.socialSecurityNumber,
    visitsResponse,
    isLoading: loadingVisits
  });

  // Extract visits from the wrapped response structure
  const visits = (visitsResponse as any)?.clinics?.flatMap((clinic: any) => clinic.visits || []) || [];

  // Dialog states
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [isLabFormOpen, setIsLabFormOpen] = useState(false);
  const [isScanFormOpen, setIsScanFormOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('visits');

  // Fetch additional data
  const { data: medications, isLoading: loadingMedications } = useGetPatientMedications(String(patient.socialSecurityNumber));
  const { data: labs, isLoading: loadingLabs } = useGetPatientLabs(String(patient.socialSecurityNumber));
  const { data: scans, isLoading: loadingScans } = useGetPatientScans(String(patient.socialSecurityNumber));

  // Debug logging
  console.log('🔍 PatientProfile - Other Queries:', {
    medications,
    labs,
    scans,
    loadingMedications,
    loadingLabs,
    loadingScans
  });

  // Extract data from wrapped response structures
  const medicationsList = (medications as any)?.medications || [];
  const labsList = (labs as any)?.labs || [];
  const scansList = (scans as any)?.scans || [];

  if (loadingVisits) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{t('patientNotFound')}</p>
        </CardContent>
      </Card>
    );
  }

  // Check if this is a scanned but unregistered patient
  const isNewScannedPatient = patient.isNewPatient && (patient.id === null || patient.id === undefined);

  if (isNewScannedPatient) {
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
                  Patient Not Registered
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  This National ID was scanned but the patient is not yet registered in the system. You can register them now or view the scanned information below.
                </p>
                <Button
                  onClick={onEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Register New Patient
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scanned Information */}
        <Card>
          <CardHeader>
            <CardTitle>Scanned Information</CardTitle>
            <CardDescription>
              Information extracted from National ID card
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg">{patient.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">National ID</p>
                <p className="text-lg font-mono">{patient.socialSecurityNumber}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="text-lg">
                  {String(patient.gender) === '0' || patient.gender === 'male' ? 'Male' :
                   String(patient.gender) === '1' || patient.gender === 'female' ? 'Female' : 'Other'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Age</p>
                <p className="text-lg">{calculateAge(patient.dateOfBirth)} years</p>
              </div>
              {patient.address && (
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="text-lg">{patient.address}</p>
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
    { value: 'visits', label: t('visits'), icon: Activity, count: visits?.length || 0 },
    { value: 'medications', label: tPatient('medications'), icon: Pill, count: medicationsList?.length || 0 },
    { value: 'labs', label: tPatient('labs'), icon: TestTube2, count: labsList?.length || 0 },
    { value: 'scans', label: tPatient('scans'), icon: ScanLine, count: scansList?.length || 0 },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Scanned Patient Notification */}
      {patient.scannedData && (
        <Card className="border border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <ScanLine className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                <span className="font-medium">Patient found via National ID scan</span> - Information verified from ID card
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header Card */}
      <Card className="sticky top-0 z-10 md:static md:top-auto">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-medical-primary/10 flex items-center justify-center shrink-0">
                <User className="h-7 w-7 md:h-8 md:w-8 text-medical-primary" />
              </div>
               <div className="min-w-0 flex-1">
                <CardTitle className="text-xl md:text-2xl truncate">{patient.name}</CardTitle>
                <CardDescription className="flex flex-row justify-between items-center gap-2 sm:gap-4">
                <div className="flex flex-col gap-1 sm:gap-2 mt-1 ">
                  <span className="text-xs sm:text-sm">{tPatient('nationalId')}: {patient.socialSecurityNumber}</span>
                  <Badge variant={String(patient.gender) === '0' || patient.gender === 'male' ? 'default' : 'secondary'} className="w-fit max-w-40 px-2 py-1 text-xs sm:text-sm">
                    {String(patient.gender) === '0' || patient.gender === 'male' ? tPatient('male') : tPatient('female')}
                  </Badge>

                </div>  
              <div className="min-w-16">
                <div className='flex flex-row gap-2 items-center'>
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground">{tPatient('age')}</p>
                </div>
                         <p className="font-medium truncate">{calculateAge(patient.dateOfBirth)} {tPatient('years')}</p>
           </div>
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
                <p className="text-sm text-muted-foreground">{tVisit('weight')}</p>
                <p className="text-2xl font-bold text-medical-primary">{latestVitals.weight} kg</p>
              </div>
              {latestVitals.height && (
                <div className="medical-card">
                  <p className="text-sm text-muted-foreground">{tVisit('height')}</p>
                  <p className="text-2xl font-bold">{latestVitals.height} cm</p>
                </div>
              )}
              {latestVitals.blood_pressure_systolic && latestVitals.blood_pressure_diastolic && (
                <div className="medical-card">
                  <p className="text-sm text-muted-foreground">{tVisit('bloodPressure')}</p>
                  <p className="text-2xl font-bold">
                    {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}
                  </p>
                </div>
              )}
              {latestVitals.heart_rate && (
                <div className="medical-card">
                  <p className="text-sm text-muted-foreground">{tVisit('heartRate')}</p>
                  <p className="text-2xl font-bold">{latestVitals.heart_rate} bpm</p>
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
                      {visits ? `${visits.length} ${t('totalVisits')}` : tCommon('loading')}
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
                        <TableHead>Date</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Speciality</TableHead>
                        <TableHead>Diagnoses</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visits.map((visit: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(visit.createdAt)}</TableCell>
                          <TableCell>Dr. {visit.doctor?.name || 'N/A'}</TableCell>
                          <TableCell>{visit.doctor?.speciality || 'N/A'}</TableCell>
                          <TableCell>{visit.diagnoses || 'N/A'}</TableCell>
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
                      {medicationsList ? `${medicationsList.length} ${t('totalMedications')}` : tCommon('loading')}
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
                        <TableHead>Name</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Comments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicationsList.map((medication: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{medication.name}</TableCell>
                          <TableCell>{medication.dosage}</TableCell>
                          <TableCell>{medication.period} days</TableCell>
                          <TableCell>Dr. {medication.doctor?.name || 'N/A'}</TableCell>
                          <TableCell>{medication.comments || '-'}</TableCell>
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
                      {labsList ? `${labsList.length} ${t('totalLabs')}` : tCommon('loading')}
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
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labsList.map((lab: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(lab.createdAt)}</TableCell>
                          <TableCell className="font-medium">{lab.name}</TableCell>
                          <TableCell>Dr. {lab.doctor?.name || 'N/A'}</TableCell>
                          <TableCell>{lab.comments || '-'}</TableCell>
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
                      {scansList ? `${scansList.length} ${t('totalScans')}` : tCommon('loading')}
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
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Comments</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scansList.map((scan: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(scan.createdAt)}</TableCell>
                          <TableCell className="font-medium">{scan.name || '-'}</TableCell>
                          <TableCell>{scan.type || '-'}</TableCell>
                          <TableCell>Dr. {scan.doctor?.name || 'N/A'}</TableCell>
                          <TableCell>{scan.comments || '-'}</TableCell>
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
                                <p className="font-medium truncate">{visit.diagnoses || 'Visit'}</p>
                                <p className="text-sm text-muted-foreground">Dr. {visit.doctor?.name || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(visit.createdAt)}</p>
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
                        {medicationsList.map((medication: any, index: number) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <Pill className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{medication.name}</p>
                                <p className="text-sm text-muted-foreground">{medication.dosage} - {medication.period} days</p>
                                <p className="text-xs text-muted-foreground">Dr. {medication.doctor?.name || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        ))}
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
                                <p className="font-medium truncate">{lab.name}</p>
                                <p className="text-sm text-muted-foreground">{lab.comments || '-'}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(lab.createdAt)} - Dr. {lab.doctor?.name || 'N/A'}</p>
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
                                <p className="font-medium truncate">{scan.name || scan.type || 'Scan'}</p>
                                <p className="text-sm text-muted-foreground">{scan.comments || '-'}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(scan.createdAt)} - Dr. {scan.doctor?.name || 'N/A'}</p>
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
        patientId={String(patient.id)}
        onSuccess={() => {
          setIsVisitDialogOpen(false);
        }}
      />

      <MedicationDialog
        open={isMedicationDialogOpen}
        onOpenChange={setIsMedicationDialogOpen}
        socialSecurityNumber={String(patient.socialSecurityNumber)}
        onSuccess={() => {
          setIsMedicationDialogOpen(false);
        }}
      />

      <LabForm
        open={isLabFormOpen}
        onOpenChange={setIsLabFormOpen}
        socialSecurityNumber={String(patient?.socialSecurityNumber || '')}
      />

      <ScanForm
        open={isScanFormOpen}
        onOpenChange={setIsScanFormOpen}
        socialSecurityNumber={String(patient?.socialSecurityNumber || '')}
      />

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-20 right-4 md:hidden z-50">
        <Button
          size="lg"
          onClick={() => setIsVisitDialogOpen(true)}
          className="h-14 w-12 rounded-full shadow-lg bg-medical-primary hover:bg-medical-primary/90"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
