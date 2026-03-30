'use client';

import React from 'react';
import { use } from 'react';
import { PatientDashboard } from '@/components/patient/PatientDashboard';

interface PatientDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default function PatientDashboardPage({ params }: PatientDashboardPageProps) {
  use(params);

  return <PatientDashboard />;
}
