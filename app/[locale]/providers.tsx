'use client';

import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useState, useEffect, type ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { SessionInitializer } from '@/components/shared/SessionInitializer';
import { OfflineIndicator } from '@/components/shared/OfflineIndicator';
import { createIdbPersister } from '@/lib/offline/queryPersister';
import { startAutoSync, stopAutoSync } from '@/lib/offline/syncEngine';
import { cleanupStaleData } from '@/lib/offline/dataCleanup';

interface ProvidersProps {
  children: ReactNode;
}

const persister = createIdbPersister();

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
            gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep cache for offline use
            retry: (failureCount, error: unknown) => {
              // Don't retry on 401 (authentication errors)
              const err = error as { response?: { status?: number } };
              if (err?.response?.status === 401) {
                return false;
              }
              // Retry once for other errors
              return failureCount < 1;
            },
            refetchOnWindowFocus: false, // Prevents unnecessary refetches
            refetchOnReconnect: 'always', // Refetch when coming back online
            networkMode: 'offlineFirst', // Serve from cache, then revalidate
          },
          mutations: {
            retry: 0, // No retry on mutations (like login, create, update, delete)
          },
        },
      })
  );

  // Start background sync engine & clean stale data on mount
  useEffect(() => {
    startAutoSync();
    cleanupStaleData();
    return () => stopAutoSync();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          buster: '', // cache buster string — change to invalidate all caches
        }}
      >
        <SessionInitializer />
        {children}
        <OfflineIndicator />
        <Toaster />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}
