'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserRole } from '@/stores/authStore';
import { useSessionValidation } from '@/hooks/useSessionValidation';
import { Role } from '@/lib/api/types';
import { Loader2 } from 'lucide-react';

/** Map string role names (as the backend may return) to the numeric Role enum */
const ROLE_NAME_MAP: Record<string, Role> = {
  SUPER_ADMIN: Role.SUPER_ADMIN,
  ADMIN: Role.ADMIN,
  PATIENT: Role.PATIENT,
  DOCTOR: Role.DOCTOR,
};

function normalizeRole(role: unknown): Role | undefined {
  if (role === undefined || role === null) return undefined;
  if (typeof role === 'number' && role in Role) return role as Role;
  if (typeof role === 'string' && role in ROLE_NAME_MAP) return ROLE_NAME_MAP[role];
  return undefined;
}

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  locale: string;
}

export function AuthGuard({ children, allowedRoles, locale }: AuthGuardProps) {
  const userRole = useUserRole();
  const { isValidating, isAuthenticated: isSessionValid } = useSessionValidation();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect after we've finished validating the session
    if (isValidating) {
      return;
    }

    // If session validation failed, redirect to login
    if (!isSessionValid) {
      console.log('[AuthGuard] Session validation failed, redirecting to login');
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Check role authorization
    const normalized = normalizeRole(userRole);
    if (allowedRoles && allowedRoles.length > 0) {
      console.log(`[AuthGuard] Role check — raw: ${userRole} (${typeof userRole}), normalized: ${normalized}, allowed: [${allowedRoles}]`);
      if (normalized !== undefined && !allowedRoles.includes(normalized)) {
        console.log(`[AuthGuard] User role ${normalized} not authorized. Required: ${allowedRoles.join(', ')}`);
        router.push(`/${locale}/unauthorized`);
      }
    }
  }, [isValidating, isSessionValid, userRole, allowedRoles, router, pathname, locale]);

  // Show loading while validating session
  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
          <p className="text-sm text-muted-foreground">Validating session...</p>
        </div>
      </div>
    );
  }

  // If validation is complete but not authenticated, show nothing (will redirect)
  if (!isSessionValid) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show loading if role doesn't match (will redirect)
  const normalizedForRender = normalizeRole(userRole);
  if (allowedRoles && allowedRoles.length > 0 && normalizedForRender !== undefined && !allowedRoles.includes(normalizedForRender)) {
    return null;
  }

  return <>{children}</>;
}
