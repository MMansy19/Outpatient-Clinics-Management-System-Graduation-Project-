'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Role } from '@/lib/api/types';

interface RootPageProps {
  params: Promise<{ locale: string }>;
}

export default function RootPage({ params }: RootPageProps) {
  const { locale } = use(params);
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace(`/${locale}/login`);
      return;
    }

    switch (user.role) {
      case Role.SUPER_ADMIN:
        router.replace(`/${locale}/super-admin/dashboard`);
        break;
      case Role.DOCTOR:
        router.replace(`/${locale}/doctor/dashboard`);
        break;
      case Role.PATIENT:
      default:
        router.replace(`/${locale}/home`);
        break;
    }
  }, [isAuthenticated, user, locale, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

