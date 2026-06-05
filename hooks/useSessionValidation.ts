import { useEffect, useState } from 'react';
import { useAuthStore, useHasHydrated } from '@/stores/authStore';
import { useSessionCache } from './useSessionCache';

/**
 * Session Validation Hook
 *
 * This hook validates the user's session by checking the persisted auth state.
 * The auth store uses localStorage persistence, so users remain authenticated
 * even after page refresh.
 *
 * IMPORTANT: We must wait for Zustand persist to finish hydrating from
 * localStorage before reading auth state. Otherwise the store still has
 * its defaults (user: null) and the user would be incorrectly logged out
 * on every page refresh.
 *
 * Since the backend uses HTTP-only cookies for JWT storage, we don't need to
 * make API calls to verify the session. The cookie is automatically sent with
 * requests, and the backend will return 401 if it's invalid.
 *
 * Usage:
 * const { isValidating, isAuthenticated } = useSessionValidation();
 */

interface SessionValidationResult {
  isValidating: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

export function useSessionValidation(): SessionValidationResult {
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, isAuthenticated: storeIsAuthenticated } = useAuthStore();
  const hasHydrated = useHasHydrated();
  const { isValid, getCache, setCache, clearCache } = useSessionCache();

  useEffect(() => {
    // Don't do anything until Zustand has finished hydrating from localStorage
    if (!hasHydrated) {
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const validateSession = async () => {
      try {
        setIsValidating(true);
        setError(null);

        // If we don't have a user in the store, we're definitely not authenticated
        if (!user || !storeIsAuthenticated) {
          clearCache();
          if (isMounted) {
            setIsValidating(false);
          }
          return;
        }

        // Check if we have a valid cache
        if (isValid()) {
          const cache = getCache();
          if (cache?.isValid) {
            if (isMounted) {
              setIsValidating(false);
            }
            return;
          }
        }

        // Session is valid - user exists in persisted store
        // The HTTP-only cookie will be validated automatically on API calls
        setCache(true);

        if (isMounted) {
          setIsValidating(false);
        }
      } catch (err: any) {
        // Session is invalid - clear cache and auth state
        clearCache();
        useAuthStore.getState().logout();

        if (isMounted) {
          setError(err);
          setIsValidating(false);
        }
      }
    };

    // Debounce validation to avoid rapid successive calls
    timeoutId = setTimeout(validateSession, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [hasHydrated, user, storeIsAuthenticated, isValid, getCache, setCache, clearCache]);

  return {
    isValidating,
    isAuthenticated: !isValidating && !error && storeIsAuthenticated,
    error,
  };
}
