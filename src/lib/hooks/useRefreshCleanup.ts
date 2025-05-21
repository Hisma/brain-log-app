'use client';

import { useEffect } from 'react';
import { wasRefreshed, cleanRefreshParam } from '@/lib/utils/refresh';

/**
 * Hook to clean up the refresh parameter from the URL
 * This should be used in components that need to know if they were just refreshed
 * @returns True if the page was refreshed, false otherwise
 */
export function useRefreshCleanup(): boolean {
  const refreshed = wasRefreshed();
  
  useEffect(() => {
    // Clean up the refresh parameter from the URL
    if (refreshed) {
      cleanRefreshParam();
    }
  }, [refreshed]);
  
  return refreshed;
}
