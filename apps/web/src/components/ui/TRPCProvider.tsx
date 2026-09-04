'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { SuperJSON } from 'superjson';
import { useState, ReactNode } from 'react';
import type { AppRouter } from '@ruang-belajar/api';

export const trpc = createTRPCReact<AppRouter>();

interface TRPCProviderProps {
  children: ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [trpcClient] = useState(() => trpc.createClient({
    links: [
      loggerLink({
        enabled: (opts) => process.env.NODE_ENV === 'development' && (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: '/api/trpc',
        transformer: SuperJSON,
        headers() {
          return {
            'x-trpc-source': 'react',
          };
        },
      }),
    ],
  }));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}