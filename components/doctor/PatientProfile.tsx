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
  patientId: number;
  onEdit?: () => void;
  onNewVisit?: () => void;
}

export function PatientProfile({ patientId, onEdit, onNewVisit }: PatientProfileProps) {
  const t = useTranslations('doctor');
  const { data: patient, isLoading: loadingPatient } = useGetPatient(patientId);
  const { data: visits, isLoading: loadingVisits } = useGetPatientVisits(patientId);

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
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-medical-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-medical-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{patient.name}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span>{t('nationalId')}: {patient.national_id}</span>
                  <Badge variant={patient.gender === Gender.MALE ? 'default' : 'secondary'}>
                    {patient.gender === Gender.MALE ? t('male') : t('female')}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t('edit')}
                </Button>
              )}
              {onNewVisit && (
                <Button size="sm" onClick={onNewVisit} className="bg-medical-primary hover:bg-medical-primary/90">
                  <Activity className="mr-2 h-4 w-4" />
                  {t('newVisit')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t('age')}</p>
                <p className="font-medium">{calculateAge(patient.birthdate)} {t('years')}</p>
              </div>
            </div>
            {patient.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('phone')}</p>
                  <p className="font-medium">{patient.phone_number}</p>
                </div>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('email')}</p>
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
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="medical-card">
                <p className="text-sm text-muted-foreground">{t('weight')}</p>
                <p className="text-2xl font-bold text-medical-primary">{latestVitals.weight} kg</p>
              </div>
              {latestVitals.height && (
                <div className="medical-card">
                  <p className="text-sm text-muted-foreground">{t('height')}</p>
                  <p className="text-2xl font-bold">{latestVitals.height} cm</p>
                </div>
              )}
              {latestVitals.blood_pressure_systolic && latestVitals.blood_pressure_diastolic && (
                <div className="medical-card">
                  <p className="text-sm text-muted-foreground">{t('bloodPressure')}</p>
                  <p className="text-2xl font-bold">
                    {latestVitals.blood_pressure_systolic}/{latestVitals.blood_pressure_diastolic}
                  </p>
                </div>
              )}
              {latestVitals.heart_rate && (
                <div className="medical-card">
                  <p className="text-sm text-muted-foreground">{t('heartRate')}</p>
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
            {t('medicalHistory')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>{t('recentVisits')}</CardTitle>
              <CardDescription>
                {visits ? `${visits.length} ${t('totalVisits')}` : t('loading')}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                    >
                      <div>
                        <p className="font-medium">{visit.chief_complaint}</p>
                        <p className="text-sm text-muted-foreground">{visit.diagnosis}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDate(visit.created_at)}</p>
                        <p className="text-xs text-muted-foreground">
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
