'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { initMockData } from '@/lib/api/mockData';

/**
 * Session Initializer Component
 *
 * This component should be placed at the root level of your app
 * (e.g., in app/layout.tsx or a top-level provider) to initialize
 * the session on app initialization and after navigation.
 *
 * The auth store uses localStorage persistence, so users remain
 * authenticated even after page refresh. The HTTP-only cookie will
 * be automatically validated on API calls.
 */

export function SessionInitializer() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Initialize mock data for development mode
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      initMockData();
    }

    // Session is automatically restored from localStorage by Zustand persist
    // No additional validation needed here
  }, [isAuthenticated, user]);

  return null; // This component doesn't render anything
}
