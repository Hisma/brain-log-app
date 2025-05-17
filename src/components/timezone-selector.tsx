'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCommonTimezones } from '@/lib/utils/timezone';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function TimezoneSelector() {
  const { user, updateUserTimezone } = useAuth();
  const [timezone, setTimezone] = useState(user?.timezone || 'America/New_York');
  const [isUpdating, setIsUpdating] = useState(false);
  const timezones = getCommonTimezones();

  // Update the timezone state when the user changes
  useEffect(() => {
    if (user?.timezone) {
      setTimezone(user.timezone);
    }
  }, [user?.timezone]);

  const handleTimezoneChange = async (value: string) => {
    setTimezone(value);
    
    // Auto-save the timezone when it changes
    setIsUpdating(true);
    try {
      const success = await updateUserTimezone(value);
      if (success) {
        toast('Timezone updated', {
          description: 'Your timezone has been updated successfully.',
        });
      } else {
        toast.error('Update failed', {
          description: 'Failed to update timezone. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error updating timezone:', error);
      toast.error('Update failed', {
        description: 'An error occurred while updating your timezone.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor="timezone-select" className="text-sm font-medium">
        Timezone
      </label>
      <Select
        value={timezone}
        onValueChange={handleTimezoneChange}
        disabled={isUpdating}
      >
        <SelectTrigger id="timezone-select" className="w-full">
          <SelectValue placeholder="Select timezone" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((tz) => (
            <SelectItem key={tz.id} value={tz.id}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500">
        Your timezone is used to ensure daily logs are created for the correct day.
      </p>
    </div>
  );
}
