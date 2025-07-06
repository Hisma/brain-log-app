'use client';

import React, { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ThemeProvider } from '@/lib/utils/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import { SessionExpiredAlert } from '@/components/ui/session-expired-alert';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider>
      <SessionProvider 
        // Only refetch when window regains focus
        // This is a more targeted approach that doesn't cause random refreshes
        refetchOnWindowFocus={true}
      >
        <AuthProvider>
          {children}
          <SessionExpiredAlert />
          <Toaster />
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
