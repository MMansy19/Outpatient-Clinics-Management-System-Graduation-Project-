'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2, Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAdminGetPatientVisits,
  useAdminGetPatientMedications,
  useAdminGetPatientLabs,
  useAdminGetPatientScans,
} from '@/lib/api/queries/useAdmin';
import { AdminVisitDialog } from '@/components/admin/AdminVisitDialog';
import { AdminMedicationDialog } from '@/components/admin/AdminMedicationDialog';
import { AdminLabForm } from '@/components/admin/AdminLabForm';
import { AdminScanForm } from '@/components/admin/AdminScanForm';
import type { AdminPatientSearchResponse } from '@/lib/api/types';

interface AdminPatientProfileProps {
  patient: AdminPatientSearchResponse;
  onBack: () => void;
}

export function AdminPatientProfile({ patient, onBack }: AdminPatientProfileProps) {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState('visits');
  const [showVisitDialog, setShowVisitDialog] = useState(false);
  const [showMedicationDialog, setShowMedicationDialog] = useState(false);
  const [showLabDialog, setShowLabDialog] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);

  const { data: visitsData, isLoading: visitsLoading } = useAdminGetPatientVisits(patient.id);
  const { data: medsData, isLoading: medsLoading } = useAdminGetPatientMedications(patient.id);
  const { data: labsData, isLoading: labsLoading } = useAdminGetPatientLabs(patient.id);
  const { data: scansData, isLoading: scansLoading } = useAdminGetPatientScans(patient.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{patient.name}</h2>
          <p className="text-sm text-muted-foreground">
            {t('ssn')}: {patient.socialSecurityNumber} • {patient.gender === 0 ? t('male') : t('female')} • {new Date(patient.dateOfBirth).toLocaleDateString()}
          </p>
          {(patient.job || patient.address) && (
            <p className="text-xs text-muted-foreground mt-1">
              {patient.job && `${t('job')}: ${patient.job}`}
              {patient.job && patient.address && ' • '}
              {patient.address && `${t('address')}: ${patient.address}`}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto scrollbar-hide">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-4">
            <TabsTrigger value="visits" className="text-xs sm:text-sm">
              {t('visits')} {visitsData?.clinics ? `(${visitsData.clinics.reduce((acc, c) => acc + c.visits.length, 0)})` : ''}
            </TabsTrigger>
            <TabsTrigger value="medications" className="text-xs sm:text-sm">
              {t('medications')} {medsData?.medications ? `(${medsData.medications.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="labs" className="text-xs sm:text-sm">
              {t('labs')} {labsData?.labs ? `(${labsData.labs.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="scans" className="text-xs sm:text-sm">
              {t('scans')} {scansData?.scans ? `(${scansData.scans.length})` : ''}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowVisitDialog(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t('createVisit')}
            </Button>
          </div>
          {visitsLoading ? (
            <LoadingState />
          ) : visitsData?.clinics && visitsData.clinics.length > 0 ? (
            visitsData.clinics.map((clinic) => (
              <div key={clinic.id} className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-medical-primary">{clinic.name}</h3>
                {clinic.visits.map((visit, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-medical-primary/20 space-y-1">
                    <p className="text-sm font-medium">{visit.diagnoses}</p>
                    <p className="text-xs text-muted-foreground">
                      {visit.doctor.name} ({visit.doctor.speciality}) • {new Date(visit.createdAt).toLocaleDateString()}
                    </p>
                    {visit.diagnosesAudioUrl && (
                      <AudioLink url={visit.diagnosesAudioUrl} />
                    )}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <EmptyState message={t('noVisitsFound')} />
          )}
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowMedicationDialog(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t('addMedication')}
            </Button>
          </div>
          {medsLoading ? (
            <LoadingState />
          ) : medsData?.medications && medsData.medications.length > 0 ? (
            medsData.medications.map((med, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{med.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {new Date(med.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('dosage')}: {med.dosage}x/{t('day')} • {t('period')}: {med.period} {t('days')}
                </p>
                {med.comments && <p className="text-sm">{med.comments}</p>}
                <p className="text-xs text-muted-foreground">
                  {med.doctor.name} ({med.doctor.speciality})
                </p>
                {med.commentsAudioUrl && <AudioLink url={med.commentsAudioUrl} />}
              </div>
            ))
          ) : (
            <EmptyState message={t('noMedicationsFound')} />
          )}
        </TabsContent>

        {/* Labs Tab */}
        <TabsContent value="labs" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowLabDialog(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t('createLab')}
            </Button>
          </div>
          {labsLoading ? (
            <LoadingState />
          ) : labsData?.labs && labsData.labs.length > 0 ? (
            labsData.labs.map((lab, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{lab.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {new Date(lab.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {lab.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={lab.photoUrl} alt={lab.name} className="max-w-xs rounded-md border" />
                )}
                {lab.comments && <p className="text-sm">{lab.comments}</p>}
                <p className="text-xs text-muted-foreground">
                  {lab.doctor.name} ({lab.doctor.speciality})
                </p>
                {lab.commentsAudioUrl && <AudioLink url={lab.commentsAudioUrl} />}
              </div>
            ))
          ) : (
            <EmptyState message={t('noLabsFound')} />
          )}
        </TabsContent>

        {/* Scans Tab */}
        <TabsContent value="scans" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowScanDialog(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t('createScan')}
            </Button>
          </div>
          {scansLoading ? (
            <LoadingState />
          ) : scansData?.scans && scansData.scans.length > 0 ? (
            scansData.scans.map((scan, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{scan.name}</h4>
                    <span className="text-xs text-medical-primary">{scan.type}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {scan.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={scan.photoUrl} alt={scan.name} className="max-w-xs rounded-md border" />
                )}
                {scan.comments && <p className="text-sm">{scan.comments}</p>}
                <p className="text-xs text-muted-foreground">
                  {scan.doctor.name} ({scan.doctor.speciality})
                </p>
                {scan.commentsAudioUrl && <AudioLink url={scan.commentsAudioUrl} />}
              </div>
            ))
          ) : (
            <EmptyState message={t('noScansFound')} />
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialogs */}
      <AdminVisitDialog
        open={showVisitDialog}
        onOpenChange={setShowVisitDialog}
        patientId={patient.id}
        onSuccess={() => setShowVisitDialog(false)}
      />
      <AdminMedicationDialog
        open={showMedicationDialog}
        onOpenChange={setShowMedicationDialog}
        patientId={patient.id}
        onSuccess={() => setShowMedicationDialog(false)}
      />
      <AdminLabForm
        open={showLabDialog}
        onOpenChange={setShowLabDialog}
        patientId={patient.id}
        onSuccess={() => setShowLabDialog(false)}
      />
      <AdminScanForm
        open={showScanDialog}
        onOpenChange={setShowScanDialog}
        patientId={patient.id}
        onSuccess={() => setShowScanDialog(false)}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-medical-primary" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      {message}
    </div>
  );
}

function AudioLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-medical-primary hover:underline"
    >
      <Play className="h-3 w-3" />
      Audio
    </a>
  );
}
