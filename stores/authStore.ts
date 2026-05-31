import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Role, Language } from '@/lib/api/types';

/**
 * Authentication Store
 * 
 * This store manages user authentication state.
 * 
 * CRITICAL CHANGE: The JWT token is NOT stored here anymore!
 * The backend uses HTTP-only cookies for token storage, which:
 * - Cannot be accessed by JavaScript (XSS protection)
 * - Are automatically sent with every request
 * - Are managed entirely by the browser
 * 
 * We only store user metadata (name, language, role) for UI purposes.
 */

interface User {
  name: string;
  language: Language;
  role: Role;
  /**
   * Clinic ID for ADMIN role. This is used to scope admin actions to their clinic.
   */
  clinicId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
        
        // Note: The HTTP-only cookie will be cleared by:
        // 1. Browser on expiration
        // 2. Backend logout endpoint (when implemented)
        // We cannot clear it from JavaScript (that's the security feature!)
      },

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),
    }),
    {
      name: 'codeblue-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // Note: token is NOT persisted - it's in HTTP-only cookie
      }),
    }
  )
);

/**
 * Hydration tracking
 * 
 * Zustand persist hydrates asynchronously — on the first render the store
 * still has its default values (user: null, isAuthenticated: false).
 * Any code that reads auth state must wait for hydration to finish,
 * otherwise it will incorrectly treat the user as logged-out and redirect
 * to the login page on every refresh.
 */
export const useHasHydrated = () => {
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    // Zustand persist exposes an `onFinishHydration` listener.
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // If hydration already completed before this effect ran, catch up.
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return unsub;
  }, []);

  return hydrated;
};

/**
 * Utility Hooks
 */

// Get current user
export const useCurrentUser = () => useAuthStore((state) => state.user);

// Get authentication status
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

// Get user role
export const useUserRole = () => useAuthStore((state) => state.user?.role);

// Check if user has specific role
export const useHasRole = (role: Role) => {
  const userRole = useUserRole();
  return userRole === role;
};

// Check if user has any of the specified roles
export const useHasAnyRole = (roles: Role[]) => {
  const userRole = useUserRole();
  return userRole ? roles.includes(userRole) : false;
};
