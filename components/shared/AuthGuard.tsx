'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsAuthenticated, useUserRole } from '@/stores/authStore';
import { Role } from '@/lib/api/types';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  locale: string;
}

export function AuthGuard({ children, allowedRoles, locale }: AuthGuardProps) {
  const isAuthenticated = useIsAuthenticated();
  const userRole = useUserRole();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      console.log('[AuthGuard] User not authenticated, redirecting to login');
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check role authorization
    if (allowedRoles && allowedRoles.length > 0 && userRole) {
      if (!allowedRoles.includes(userRole)) {
        console.log(`[AuthGuard] User role ${userRole} not authorized. Required: ${allowedRoles.join(', ')}`);
        router.push(`/${locale}/unauthorized`);
      }
    }
  }, [isAuthenticated, userRole, allowedRoles, router, pathname, locale]);

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
      </div>
    );
  }

  // Show loading if role doesn't match (will redirect)
  if (allowedRoles && allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
