'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import { Role } from '@/lib/api/types';

interface GuestGuardProps {
  children: React.ReactNode;
  locale: string;
}

const roleRedirects: Record<number, string> = {
  [Role.SUPER_ADMIN]: '/super-admin/dashboard',
  [Role.DOCTOR]: '/doctor/dashboard',
};

/**
 * GuestGuard
 *
 * Wraps auth-only pages (login, register) so that already-authenticated
 * users are immediately redirected to their role's dashboard instead of
 * seeing the form. Renders a spinner while waiting for the Zustand persist
 * store to hydrate from localStorage (avoids a flash of the form on refresh).
 */
export function GuestGuard({ children, locale }: GuestGuardProps) {
  const hasHydrated = useHasHydrated();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const isLoggedIn = hasHydrated && isAuthenticated && user !== null;

  useEffect(() => {
    if (!isLoggedIn) return;

    const dashboardPath = roleRedirects[user!.role] ?? '/';
    router.replace(`/${locale}${dashboardPath}`);
  }, [isLoggedIn, user, locale, router]);

  // Still hydrating from localStorage — don't flash the auth form
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
      </div>
    );
  }

  // Authenticated — redirect is in flight, show spinner
  if (isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
