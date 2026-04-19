'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  /** True when the user was offline and just came back online */
  wasOffline: boolean;
  /** Mark wasOffline as acknowledged (hides the "back online" toast) */
  acknowledgeReconnect: () => void;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const prevOnline = useRef(isOnline);

  const acknowledgeReconnect = useCallback(() => {
    setWasOffline(false);
  }, []);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      if (!prevOnline.current) {
        setWasOffline(true);
      }
      prevOnline.current = true;
    }

    function handleOffline() {
      setIsOnline(false);
      prevOnline.current = false;
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline, acknowledgeReconnect };
}
