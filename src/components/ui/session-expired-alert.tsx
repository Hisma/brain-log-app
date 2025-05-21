'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';

export function SessionExpiredAlert() {
  const { sessionExpired, refreshSession, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (sessionExpired) {
      // Show alert dialog
      const confirmed = window.confirm(
        'Your session has expired. Would you like to refresh your session or log out?'
      );

      if (confirmed) {
        // User chose to refresh with force reload to ensure we get the latest session state
        refreshSession(true).then(success => {
          if (!success) {
            // If refresh failed, redirect to login
            logout();
          }
        });
      } else {
        // User chose to log out
        logout();
      }
    }
  }, [sessionExpired, refreshSession, logout, router]);

  // This component doesn't render anything visible
  return null;
}
