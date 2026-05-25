'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  User,
  Calendar,
  Activity,
  Pill,
  TestTube2,
  ScanLine,
  Plus,
  MapPin,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Gender } from '@/lib/api/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { superAdminApi } from '@/lib/api/superAdmin.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AudioPlayer } from '@/components/shared/AudioPlayer';

import { SuperAdminVisitDialog } from './SuperAdminVisitDialog';
import { SuperAdminMedicationDialog } from './SuperAdminMedicationDialog';
import { SuperAdminLabDialog } from './SuperAdminLabDialog';
import { SuperAdminScanDialog } from './SuperAdminScanDialog';

interface SuperAdminPatientProfileProps {
  patientId: string;
  onBack: () => void;
  selectedClinicId?: string;
  selectedPatient?: {
    id: string;
    name: string;
    socialSecurityNumber: string;
    dateOfBirth?: string;
    gender?: Gender;
    address?: string | null;
    job?: string | null;
  };
}

interface VisitData {
  visits: {
    id: string;
    diagnoses: string;
    diagnosesAudioUrl: string | null;
    patient: { id: string; name: string };
    doctor: { id: string; name: string };
    clinic: { id: string; name: string };
    audio?: string | null;
    createdAt: string;
  }[];
}

interface MedicationsData {
  medications: {
    name: string;
    dosage: string;
    period: string;
    comments: string | null;
    commentsAudioUrl: string | null;
    doctor: { id?: string; name: string; speciality: string | null };
    createdAt: string;
  }[];
}

interface LabsData {
  labs: {
    name: string;
    photoUrl: string;
    comments: string | null;
    commentsAudioUrl: string | null;
    doctor: { id: string; name: string; speciality: string };
    createdAt: string;
  }[];
}

interface ScansData {
  scans: {
    name: string;
    type: string;
    photoUrl: string;
    comments: string | null;
    commentsAudioUrl: string | null;
    doctor: { id: string; name: string; speciality: string };
    createdAt: string;
  }[];
}

export function SuperAdminPatientProfile({
  patientId,
  onBack,
  selectedClinicId,
  selectedPatient,
}: SuperAdminPatientProfileProps) {
  const t = useTranslations('superAdmin');
  const tCommon = useTranslations('common');
  const tTable = useTranslations('table');

  const [currentTab, setCurrentTab] = useState('profile');
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [isLabDialogOpen, setIsLabDialogOpen] = useState(false);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);

  const { data: visitData, isLoading: loadingVisits } = useQuery<VisitData>({
    queryKey: ['super-admin-patient-visits', patientId],
    queryFn: () => superAdminApi.getPatientVisits(patientId) as Promise<VisitData>,
    enabled: !!patientId,
  });

  const { data: medicationsData, isLoading: loadingMedications } = useQuery<MedicationsData>({
    queryKey: ['super-admin-patient-medications', patientId],
    queryFn: () => superAdminApi.getPatientMedications(patientId) as Promise<MedicationsData>,
    enabled: !!patientId,
  });

  const { data: labsData, isLoading: loadingLabs } = useQuery<LabsData>({
    queryKey: ['super-admin-patient-labs', patientId],
    queryFn: () => superAdminApi.getPatientLabs(patientId) as Promise<LabsData>,
    enabled: !!patientId,
  });

  const { data: scansData, isLoading: loadingScans } = useQuery<ScansData>({
    queryKey: ['super-admin-patient-scans', patientId],
    queryFn: () => superAdminApi.getPatientScans(patientId) as Promise<ScansData>,
    enabled: !!patientId,
  });

  const patient = selectedPatient;
  const visits = visitData?.visits || [];
  const medications = medicationsData?.medications || [];
  const labs = labsData?.labs || [];
  const scans = scansData?.scans || [];

  const formatDate = (date: string | null | undefined) => {
    if (!date) return tCommon('unknown');
    return new Date(date).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth: string | null | undefined) => {
    if (!dateOfBirth) return tCommon('unknown');
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getScanTypeLabel = (typeValue: string | number | undefined | null): string => {
    if (!typeValue && typeValue !== 0) return '-';
    const typeMap: Record<string, string> = {
      '0': 'MRI',
      '1': 'CT',
      '2': 'X-Ray',
      '3': 'Ultrasound',
      '4': 'PET-CT',
      '5': 'Mammography',
    };
    return typeMap[String(typeValue)] || String(typeValue);
  };

  const queryClient = useQueryClient();

  const handleVisitSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['super-admin-patient-visits', patientId] });
  };

  const handleMedicationSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['super-admin-patient-medications', patientId] });
  };

  const handleLabSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['super-admin-patient-labs', patientId] });
  };

  const handleScanSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['super-admin-patient-scans', patientId] });
  };

  if (loadingVisits) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToPatients')}
        </Button>
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-48 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToPatients')}
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('patientNotFound')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <Button variant="outline" onClick={onBack} className="text-sm sm:text-base">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('backToPatients')}
      </Button>

      {/* Patient Header */}
      <Card className="bg-gradient-to-r from-medical-primary/10 to-medical-secondary/10 border-medical-primary/20">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-medical-primary/20 flex items-center justify-center">
                <User className="h-6 w-6 sm:h-8 sm:w-8 text-medical-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">{patient.name}</CardTitle>
                <CardDescription className="mt-1 text-xs sm:text-sm">
                  <span className="font-mono">{patient.socialSecurityNumber || patientId}</span>
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {calculateAge(patient.dateOfBirth)} {t('years')}
              </span>
              <span className="text-muted-foreground">
                ({formatDate(patient.dateOfBirth)})
              </span>
            </div>
            {patient.gender !== undefined && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Badge variant={patient.gender === Gender.MALE ? 'default' : 'secondary'}>
                  {patient.gender === Gender.MALE ? t('male') : t('female')}
                </Badge>
              </div>
            )}
            {patient.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{patient.address}</span>
              </div>
            )}
            {patient.job && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{patient.job}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical Data Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full overflow-x-auto">
          <TabsTrigger value="profile" className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
            <span className="hidden sm:inline"><Activity className="h-4 w-4" /></span>
            {t('visits')}
            <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 h-4">
              {visits.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="medications" className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
            <span className="hidden sm:inline"><Pill className="h-4 w-4" /></span>
            Med.
            <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 h-4">
              {medications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="labs" className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
            <span className="hidden sm:inline"><TestTube2 className="h-4 w-4" /></span>
            Labs
            <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 h-4">
              {labs.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="scans" className="gap-1 sm:gap-2 text-xs sm:text-sm px-1 sm:px-3">
            <span className="hidden sm:inline"><ScanLine className="h-4 w-4" /></span>
            Scans
            <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0 h-4">
              {scans.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Visits Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader className="pb-2 sm:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">{t('visits')}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {visits.length} {t('totalVisits')}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsVisitDialogOpen(true)}
                  disabled={!selectedClinicId}
                  className="bg-medical-primary hover:bg-medical-primary/90 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addVisit')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingVisits ? (
                <div className="space-y-2">
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                </div>
              ) : visits.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tTable('date')}</TableHead>
                        <TableHead>{tTable('diagnoses')}</TableHead>
                        <TableHead>{t('doctor')}</TableHead>
                        <TableHead>{t('clinic')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell>{formatDate(visit.createdAt)}</TableCell>
                          <TableCell className="max-w-[300px]">
                            <div className="truncate">{visit.diagnoses || '-'}</div>
                            {visit.diagnosesAudioUrl && (
                              <div className="mt-1">
                                <AudioPlayer src={visit.diagnosesAudioUrl} compact />
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {visit.doctor?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {visit.clinic?.name || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noVisitsYet')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications">
          <Card>
            <CardHeader className="pb-2 sm:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">{t('medications')}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {medications.length} {t('totalMedications')}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsMedicationDialogOpen(true)}
                  disabled={!selectedClinicId}
                  className="bg-medical-primary hover:bg-medical-primary/90 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addMedication')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMedications ? (
                <div className="space-y-2">
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                </div>
              ) : medications.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tTable('date')}</TableHead>
                        <TableHead>{t('medicationName')}</TableHead>
                        <TableHead>{t('dosage')}</TableHead>
                        <TableHead>{t('period')}</TableHead>
                        <TableHead>{t('doctor')}</TableHead>
                        <TableHead>{tTable('comments')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medications.map((med) => (
                        <TableRow key={med.doctor?.id ?? med.createdAt}>
                          <TableCell>{formatDate(med.createdAt)}</TableCell>
                          <TableCell className="font-medium">{med.name}</TableCell>
                          <TableCell>{med.dosage}</TableCell>
                          <TableCell>{med.period}</TableCell>
                          <TableCell>Dr. {med.doctor?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {med.comments || '-'}
                            {med.commentsAudioUrl && (
                              <AudioPlayer src={med.commentsAudioUrl} compact />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noMedicationsYet')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Labs Tab */}
        <TabsContent value="labs">
          <Card>
            <CardHeader className="pb-2 sm:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">{t('labs')}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {labs.length} {t('totalLabs')}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsLabDialogOpen(true)}
                  disabled={!selectedClinicId}
                  className="bg-medical-primary hover:bg-medical-primary/90 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addLab')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingLabs ? (
                <div className="space-y-2">
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                </div>
              ) : labs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tTable('date')}</TableHead>
                        <TableHead>{t('labName')}</TableHead>
                        <TableHead>{t('doctor')}</TableHead>
                        <TableHead>{tTable('image')}</TableHead>
                        <TableHead>{tTable('comments')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {labs.map((lab) => (
                        <TableRow key={lab.doctor?.id ?? lab.createdAt}>
                          <TableCell>{formatDate(lab.createdAt)}</TableCell>
                          <TableCell className="font-medium">{lab.name}</TableCell>
                          <TableCell>Dr. {lab.doctor?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {lab.photoUrl && (
                              <a
                                href={lab.photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-medical-primary hover:underline"
                              >
                                {tCommon('viewImage')}
                              </a>
                            )}
                          </TableCell>
                          <TableCell>
                            {lab.comments || '-'}
                            {lab.commentsAudioUrl && (
                              <AudioPlayer src={lab.commentsAudioUrl} compact />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noLabsYet')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scans Tab */}
        <TabsContent value="scans">
          <Card>
            <CardHeader className="pb-2 sm:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base sm:text-lg">{t('scans')}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {scans.length} {t('totalScans')}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsScanDialogOpen(true)}
                  disabled={!selectedClinicId}
                  className="bg-medical-primary hover:bg-medical-primary/90 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('addScan')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingScans ? (
                <div className="space-y-2">
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                </div>
              ) : scans.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tTable('date')}</TableHead>
                        <TableHead>{t('scanName')}</TableHead>
                        <TableHead>{t('scanType')}</TableHead>
                        <TableHead>{t('doctor')}</TableHead>
                        <TableHead>{tTable('image')}</TableHead>
                        <TableHead>{tTable('comments')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scans.map((scan) => (
                        <TableRow key={scan.doctor?.id ?? scan.createdAt}>
                          <TableCell>{formatDate(scan.createdAt)}</TableCell>
                          <TableCell className="font-medium">{scan.name}</TableCell>
                          <TableCell>{getScanTypeLabel(scan.type)}</TableCell>
                          <TableCell>Dr. {scan.doctor?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {scan.photoUrl && (
                              <a
                                href={scan.photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-medical-primary hover:underline"
                              >
                                {tCommon('viewImage')}
                              </a>
                            )}
                          </TableCell>
                          <TableCell>
                            {scan.comments || '-'}
                            {scan.commentsAudioUrl && (
                              <AudioPlayer src={scan.commentsAudioUrl} compact />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t('noScansYet')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedClinicId && (
        <>
          <SuperAdminVisitDialog
            open={isVisitDialogOpen}
            onOpenChange={setIsVisitDialogOpen}
            patientId={patientId}
            clinicId={selectedClinicId}
            onSuccess={handleVisitSuccess}
          />

          <SuperAdminMedicationDialog
            open={isMedicationDialogOpen}
            onOpenChange={setIsMedicationDialogOpen}
            patientId={patientId}
            clinicId={selectedClinicId}
            onSuccess={handleMedicationSuccess}
          />

          <SuperAdminLabDialog
            open={isLabDialogOpen}
            onOpenChange={setIsLabDialogOpen}
            patientId={patientId}
            clinicId={selectedClinicId}
            onSuccess={handleLabSuccess}
          />

          <SuperAdminScanDialog
            open={isScanDialogOpen}
            onOpenChange={setIsScanDialogOpen}
            patientId={patientId}
            clinicId={selectedClinicId}
            onSuccess={handleScanSuccess}
          />
        </>
      )}
    </div>
  );
}