'use client';

import { useTranslations } from 'next-intl';
import { User, Calendar, Phone, Mail, Edit, Activity, Clock } from 'lucide-react';

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

import { useGetPatient } from '@/lib/api/queries/usePatients';
import { useGetPatientVisits } from '@/lib/api/queries/useVisits';
import { HistoryTimeline } from '@/components/doctor/HistoryTimeline';
import { calculateAge, formatDate } from '@/lib/utils/formatDate';
import { Gender } from '@/types/entities/Patient';

interface PatientProfileProps {
  patientId: string;
  onEdit?: () => void;
  onNewVisit?: () => void;
}

export function PatientProfile({ patientId, onEdit, onNewVisit }: PatientProfileProps) {
  const t = useTranslations('doctor');
  const tPatient = useTranslations('patient');
  const tVisit = useTranslations('visit');
  const tCommon = useTranslations('common');
  const { data: patient, isLoading: loadingPatient } = useGetPatient(Number(patientId));
  const { data: visits, isLoading: loadingVisits } = useGetPatientVisits(Number(patientId));

  if (loadingPatient) {
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

  const latestVisit = visits?.[0];
  const latestVitals = latestVisit?.vitals;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-medical-primary/10 flex items-center justify-center shrink-0">
          <User className="h-6 w-6 sm:h-8 sm:w-8 text-medical-primary" />
              </div>
              <div className="min-w-0 flex-1">
          <CardTitle className="text-xl sm:text-2xl truncate">{patient.name}</CardTitle>
          <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
            <span className="text-xs sm:text-sm">{tPatient('nationalId')}: {patient.national_id}</span>
            <Badge variant={patient.gender === Gender.MALE ? 'default' : 'secondary'} className="w-fit max-w-full px-2 py-1 text-xs sm:text-sm">
              {patient.gender === Gender.MALE ? tPatient('male') : tPatient('female')}
            </Badge>
          </CardDescription>
              </div>
            </div>
            <div className="flex gap-2 sm:shrink-0">
              {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 sm:flex-none">
            <Edit className="mr-2 h-4 w-4" />
            {tCommon('edit')}
          </Button>
              )}
              {onNewVisit && (
          <Button size="sm" onClick={onNewVisit} className="bg-medical-primary hover:bg-medical-primary/90 flex-1 sm:flex-none">
            <Activity className="mr-2 h-4 w-4" />
            {t('newVisit')}
          </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="max-h-[300px] overflow-y-auto">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{tPatient('age')}</p>
                <p className="font-medium">{calculateAge(patient.birthdate)} {tPatient('years')}</p>
              </div>
            </div>
            {patient.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{tPatient('phone')}</p>
                  <p className="font-medium">{patient.phone_number}</p>
                </div>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{tPatient('email')}</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
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
            <div className="grid gap-4 md:grid-cols-4">
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

      {/* Recent Visits & Timeline Tabs */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="recent">
            <Activity className="mr-2 h-4 w-4" />
            {t('recentVisits')}
          </TabsTrigger>
          <TabsTrigger value="timeline">
            <Clock className="mr-2 h-4 w-4" />
            {tPatient('medicalHistory')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>{t('recentVisits')}</CardTitle>
              <CardDescription>
                {visits ? `${visits.length} ${t('totalVisits')}` : tCommon('loading')}
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {loadingVisits ? (
                <div className="space-y-2">
                  <div className="skeleton h-16 w-full" />
                  <div className="skeleton h-16 w-full" />
                </div>
              ) : visits && visits.length > 0 ? (
                <div className="space-y-3">
                  {visits.slice(0, 5).map((visit) => (
                    <div
                      key={visit.id}
                      className="flex items-start justify-between gap-4 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{visit.chief_complaint}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{visit.diagnosis}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium whitespace-nowrap">{formatDate(visit.created_at)}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                          Dr. {visit.doctor.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t('noVisitsYet')}</p>
                  {onNewVisit && (
                    <Button
                      variant="outline"
                      onClick={onNewVisit}
                      className="mt-4"
                    >
                      {t('createFirstVisit')}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <HistoryTimeline patientId={patientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
