'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientStatsCards, PatientQuickActions } from './PatientStatsCards';
import { PatientQRCodeDialog } from './PatientQRCodeDialog';
import { PatientHistory } from './PatientHistory';
import { PatientProfile } from './PatientProfile';
import { PatientAppointments } from './PatientAppointments';
import { RecentActivity } from './RecentActivity';
import {
  User,
  History,
} from 'lucide-react';

export function PatientDashboard() {
  const t = useTranslations('patient');
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-medical-primary">
          {t('dashboard')}
        </h1>
        <p className="text-muted-foreground">{t('dashboardSubtitle')}</p>
      </div>

      <PatientStatsCards />

      <PatientQuickActions onShareQRCode={() => setIsQRDialogOpen(true)} />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">{t('myHistory')}</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t('myProfile')}</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Appointments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentActivity />
            <PatientAppointments />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <PatientHistory />
        </TabsContent>

        <TabsContent value="profile">
          <PatientProfile />
        </TabsContent>

        <TabsContent value="appointments">
          <PatientAppointments />
        </TabsContent>
      </Tabs>

      <PatientQRCodeDialog
        open={isQRDialogOpen}
        onOpenChange={setIsQRDialogOpen}
      />
    </div>
  );
}
