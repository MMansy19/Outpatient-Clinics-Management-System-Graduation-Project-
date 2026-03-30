'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetPatientAppointments } from '@/lib/api/hooks/usePatient';
import { Calendar, Clock, MapPin } from 'lucide-react';

export function PatientAppointments() {
  const t = useTranslations('patient');
  const { data: appointments, isLoading } = useGetPatientAppointments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('upcomingAppointments')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('upcomingAppointments')}</CardTitle>
        <CardDescription>Your scheduled appointments</CardDescription>
      </CardHeader>
      <CardContent>
        {!appointments || appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">{t('noAppointments')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-medical-primary/10">
                  <Calendar className="h-5 w-5 text-medical-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium">{appointment.doctorName}</h4>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {appointment.doctorSpeciality}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(appointment.date), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {appointment.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {appointment.clinicName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
