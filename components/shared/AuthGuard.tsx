'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/entities/User';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  locale: string;
}

export function AuthGuard({ children, allowedRoles, locale }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push(`/${locale}/unauthorized`);
    }
  }, [isAuthenticated, user, allowedRoles, router, pathname, locale]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="skeleton h-32 w-32 rounded-lg" />
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
