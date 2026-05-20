'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api/client';

interface NetworkStatus {
  isOnline: boolean;
  /** True when the user was offline and just came back online */
  wasOffline: boolean;
  /** Mark wasOffline as acknowledged (hides the "back online" toast) */
  acknowledgeReconnect: () => void;
}

const PING_INTERVAL_MS = 10_000;

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const prevOnline = useRef(true);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnectivity = useCallback(async () => {
    try {
      await apiClient.get('/super-admin', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    if (!prevOnline.current) {
      setWasOffline(true);
    }
    prevOnline.current = true;
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    prevOnline.current = false;
  }, []);

  const acknowledgeReconnect = useCallback(() => {
    setWasOffline(false);
  }, []);

  useEffect(() => {
    // Set initial state from navigator.onLine
    setIsOnline(navigator.onLine);
    prevOnline.current = navigator.onLine;

    // Listen for browser offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Active polling ping to verify backend connectivity
    const startPing = async () => {
      const online = await checkConnectivity();
      setIsOnline(online);
      prevOnline.current = online;

      pingIntervalRef.current = setInterval(async () => {
        const stillOnline = await checkConnectivity();
        const was = prevOnline.current;
        setIsOnline(stillOnline);
        if (!was && stillOnline) {
          setWasOffline(true);
        }
        if (was && !stillOnline) {
          setWasOffline(false);
        }
        prevOnline.current = stillOnline;
      }, PING_INTERVAL_MS);
    };

    startPing();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [handleOnline, handleOffline, checkConnectivity]);

  return { isOnline, wasOffline, acknowledgeReconnect };
}