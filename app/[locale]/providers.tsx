'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { SessionInitializer } from '@/components/shared/SessionInitializer';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes - garbage collection time (was 10)
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
            networkMode: 'online', // Only online mode for backend integration
          },
          mutations: {
            retry: 0, // No retry on mutations (like login, create, update, delete)
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <SessionInitializer />
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
