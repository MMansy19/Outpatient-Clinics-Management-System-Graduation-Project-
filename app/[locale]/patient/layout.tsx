'use client';

import React from 'react';
import { use } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { Role } from '@/lib/api/types';

interface PatientLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default function PatientLayout({ children, params }: PatientLayoutProps) {
  const { locale } = use(params);
  
  return (
    <AuthGuard allowedRoles={[Role.PATIENT]} locale={locale}>
      {children}
    </AuthGuard>
  );
}
