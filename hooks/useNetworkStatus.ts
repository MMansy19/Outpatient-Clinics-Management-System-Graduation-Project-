'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api/client';

interface NetworkStatus {
  isOnline: boolean;
  /** True when the user was offline and just came back online */
  wasOffline: boolean;
  /** Mark wasOffline as acknowledged (hides the "back online" toast) */
  acknowledgeReconnect: () => void;
  /** Force an immediate connectivity check (e.g. before submitting a form). */
  forceRecheck: () => Promise<boolean>;
}

const PING_INTERVAL_MS = 10_000;
const PING_TIMEOUT_MS = 1_500;

function detectBrowserOffline(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (navigator.onLine === false) return true;
  const conn = (navigator as unknown as { connection?: { type?: string } }).connection;
  if (conn && conn.type === 'none') return true;
  return false;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const prevOnline = useRef(true);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyState = useCallback((next: boolean) => {
    const was = prevOnline.current;
    setIsOnline(next);
    if (!was && next) setWasOffline(true);
    if (was && !next) setWasOffline(false);
    prevOnline.current = next;
  }, []);

  const checkConnectivity = useCallback(async (): Promise<boolean> => {
    // Trust the browser's offline signal — no need to ping.
    if (detectBrowserOffline()) return false;
    try {
      await apiClient.get('/super-admin', { timeout: PING_TIMEOUT_MS });
      return true;
    } catch {
      return false;
    }
  }, []);

  const forceRecheck = useCallback(async () => {
    const next = await checkConnectivity();
    applyState(next);
    return next;
  }, [checkConnectivity, applyState]);

  const handleOnline = useCallback(() => {
    applyState(true);
  }, [applyState]);

  const handleOffline = useCallback(() => {
    applyState(false);
  }, [applyState]);

  const acknowledgeReconnect = useCallback(() => {
    setWasOffline(false);
  }, []);

  useEffect(() => {
    // Set initial state from the browser. Treat the browser's "offline"
    // signal as authoritative — only ping when the browser claims online.
    const initialOnline = !detectBrowserOffline();
    setIsOnline(initialOnline);
    prevOnline.current = initialOnline;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const startPing = async () => {
      const online = await checkConnectivity();
      applyState(online);

      pingIntervalRef.current = setInterval(async () => {
        const stillOnline = await checkConnectivity();
        applyState(stillOnline);
      }, PING_INTERVAL_MS);
    };

    startPing();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, [handleOnline, handleOffline, checkConnectivity, applyState]);

  return { isOnline, wasOffline, acknowledgeReconnect, forceRecheck };
}
