'use client';

import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ClientProviders } from '@/components/providers/ClientProviders';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ClientProviders>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </ClientProviders>
  );
}
