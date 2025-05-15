'use client';

import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ThemeProvider } from '@/lib/utils/ThemeProvider';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/lib/auth/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
