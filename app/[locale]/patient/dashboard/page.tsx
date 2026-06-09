'use client';

import React from 'react';
import { use } from 'react';
import { PatientDashboard } from '@/components/patient/PatientDashboard';
import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/lib/api/queries/useAuth';

interface PatientDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default function PatientDashboardPage({ params }: PatientDashboardPageProps) {
  const { locale } = use(params);
  const { mutate: logout, isPending: loggingOut } = useLogout();

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await new Promise<void>((resolve) => {
        logout(undefined, { onSettled: () => resolve() });
      });
      window.location.replace(`/${locale}/login`);
    } catch {
      window.location.replace(`/${locale}/login`);
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-2 p-4">
        <LanguageToggle locale={locale} variant="outline" size="icon" />
        <Button
          onClick={handleLogout}
          disabled={loggingOut}
          variant="outline"
          size="icon"
          className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
      <PatientDashboard />
    </>
  );
}
