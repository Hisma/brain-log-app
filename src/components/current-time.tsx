'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { formatInTimezone } from '@/lib/utils/timezone';

export function CurrentTime() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const timezone = user?.timezone || 'America/New_York';

  // Detect client-side rendering
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
  }, []);

  // Update the time every minute, but only on the client
  useEffect(() => {
    if (!isClient) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => {
      clearInterval(timer);
    };
  }, [isClient]);

  // During SSR or before hydration, show a placeholder
  if (!isClient || !currentTime) {
    return (
      <div className="text-sm font-medium text-transparent animate-pulse bg-gray-200 dark:bg-gray-700 rounded" suppressHydrationWarning>
        Loading time...
      </div>
    );
  }

  // Only render the actual time on the client after hydration
  return (
    <div className="text-sm font-medium" suppressHydrationWarning>
      {formatInTimezone(currentTime, timezone, 'EEE, MMM d, yyyy h:mm a')}
    </div>
  );
}
