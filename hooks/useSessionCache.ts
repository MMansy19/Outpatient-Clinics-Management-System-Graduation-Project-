import { useRef } from 'react';

/**
 * Session Cache Hook
 *
 * This hook caches the session validation result to avoid
 * making multiple API calls to /auth/verify in quick succession.
 *
 * The cache expires after a configurable timeout.
 */

interface SessionCache {
  isValid: boolean;
  timestamp: number;
}

const DEFAULT_CACHE_DURATION = 30 * 1000; // 30 seconds

export function useSessionCache(duration = DEFAULT_CACHE_DURATION) {
  const cacheRef = useRef<SessionCache | null>(null);

  const isValid = (): boolean => {
    if (!cacheRef.current) {
      return false;
    }

    const now = Date.now();
    const age = now - cacheRef.current.timestamp;

    // Cache is valid if it's not expired
    return age < duration;
  };

  const getCache = (): SessionCache | null => {
    return cacheRef.current;
  };

  const setCache = (isValid: boolean): void => {
    cacheRef.current = {
      isValid,
      timestamp: Date.now(),
    };
  };

  const clearCache = (): void => {
    cacheRef.current = null;
  };

  return {
    isValid,
    getCache,
    setCache,
    clearCache,
  };
}
