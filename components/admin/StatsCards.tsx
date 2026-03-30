'use client';

import { Users, Building2, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatsCardsProps {
  stats: {
    totalClinics: number;
    totalDoctors: number;
    totalPatients: number;
    todayVisits: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations('admin');

  const statsData = [
    {
      label: t('totalClinics'),
      value: stats.totalClinics,
      icon: Building2,
      color: 'text-medical-primary',
      bgColor: 'bg-medical-primary/10',
    },
    {
      label: t('totalDoctors'),
      value: stats.totalDoctors,
      icon: Users,
      color: 'text-medical-secondary',
      bgColor: 'bg-medical-secondary/10',
    },
    {
      label: t('totalPatients'),
      value: stats.totalPatients,
      icon: Users,
      color: 'text-medical-info',
      bgColor: 'bg-medical-info/10',
    },
    {
      label: t('todayVisits'),
      value: stats.todayVisits,
      icon: Calendar,
      color: 'text-medical-success',
      bgColor: 'bg-medical-success/10',
    },
  ];

  return (
    <div className="w-full">
      {/* Desktop/Tablet Grid */}
      <div className="hidden sm:grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="medical-card">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="sm:hidden overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="medical-card w-[280px] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll Indicator for Mobile */}
      <div className="sm:hidden text-center mt-2">
        <p className="text-xs text-muted-foreground">← Swipe to see more →</p>
      </div>
    </div>
  );
}
