'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Calendar,
  Pill,
  FlaskConical,
  Scan,
  QrCode,
} from 'lucide-react';
import { useGetPatientStats } from '@/lib/api/hooks/usePatient';

export function PatientStatsCards() {
  const t = useTranslations('patient');
  const { data: stats, isLoading } = useGetPatientStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: t('totalVisits'),
      value: stats?.totalVisits ?? 0,
      icon: Calendar,
      color: 'text-medical-primary',
      bgColor: 'bg-medical-primary/10',
    },
    {
      title: t('totalMedications'),
      value: stats?.totalMedications ?? 0,
      icon: Pill,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: t('totalLabs'),
      value: stats?.totalLabs ?? 0,
      icon: FlaskConical,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: t('totalScans'),
      value: stats?.totalScans ?? 0,
      icon: Scan,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PatientQuickActions({
  onShareQRCode,
}: {
  onShareQRCode: () => void;
}) {
  const t = useTranslations('patient');

  const actions = [
    {
      title: t('shareQRCode'),
      description: t('shareQRCodeDescription'),
      icon: QrCode,
      onClick: onShareQRCode,
      color: 'text-medical-primary',
      bgColor: 'border-medical-primary/30 hover:bg-medical-primary/10',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {actions.map((action, index) => (
        <Card
          key={index}
          className={`cursor-pointer transition-colors ${action.bgColor}`}
          onClick={action.onClick}
        >
          <CardHeader className="flex flex-row items-center gap-4">
            <div className={`p-2 rounded-lg ${action.bgColor}`}>
              <action.icon className={`h-6 w-6 ${action.color}`} />
            </div>
            <div>
              <CardTitle className="text-base">{action.title}</CardTitle>
              <CardDescription className="text-xs">
                {action.description}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
