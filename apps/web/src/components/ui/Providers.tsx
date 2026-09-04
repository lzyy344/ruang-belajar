'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { TRPCProvider } from './TRPCProvider';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <TRPCProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: 'bg-card text-card-foreground border-border',
              description: 'text-muted-foreground',
            },
          }}
        />
      </TRPCProvider>
    </ThemeProvider>
  );
}