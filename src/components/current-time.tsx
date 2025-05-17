'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { formatInTimezone } from '@/lib/utils/timezone';

export function CurrentTime() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const timezone = user?.timezone || 'America/New_York';

  // Update the time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    // Initial update
    setCurrentTime(new Date());

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="text-sm font-medium">
      {formatInTimezone(currentTime, timezone, 'EEE, MMM d, yyyy h:mm a')}
    </div>
  );
}
