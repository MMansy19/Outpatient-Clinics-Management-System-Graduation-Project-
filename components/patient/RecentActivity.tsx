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
import { useGetPatientVisits } from '@/lib/api/hooks/usePatient';
import { Activity, Calendar, User, Stethoscope } from 'lucide-react';

export function RecentActivity() {
  const t = useTranslations('patient');
  const { data: visits, isLoading } = useGetPatientVisits();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentVisits = visits?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentActivity')}</CardTitle>
        <CardDescription>Your recent medical visits</CardDescription>
      </CardHeader>
      <CardContent>
        {recentVisits.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">{t('noRecentActivity')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentVisits.map((visit) => (
              <div
                key={visit.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Calendar className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {visit.diagnoses || 'No diagnosis recorded'}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {visit.doctorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" />
                      {visit.doctorSpeciality}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(visit.createdAt), 'MMM d')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
