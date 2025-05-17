'use client';

import { format, toZonedTime} from 'date-fns-tz';

/**
 * Converts a date to UTC, taking into account the user's timezone
 * @param date The date to convert
 * @param timezone The user's timezone (e.g., 'America/New_York')
 * @returns The date in UTC
 */
export function toUTC(date: Date, timezone: string): Date {
  // Since zonedTimeToUtc doesn't exist, we'll use a workaround
  // This is a simplified approach - in production you might want a more robust solution
  const zonedDate = toZonedTime(date, timezone);
  return new Date(zonedDate.toISOString());
}

/**
 * Converts a UTC date to the user's local timezone
 * @param date The UTC date to convert
 * @param timezone The user's timezone (e.g., 'America/New_York')
 * @returns The date in the user's timezone
 */
export function fromUTC(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone);
}

/**
 * Formats a date according to the user's timezone
 * @param date The date to format
 * @param timezone The user's timezone (e.g., 'America/New_York')
 * @param formatStr The format string to use (default: 'yyyy-MM-dd')
 * @returns The formatted date string
 */
export function formatInTimezone(
  date: Date, 
  timezone: string, 
  formatStr: string = 'yyyy-MM-dd'
): string {
  const zonedDate = toZonedTime(date, timezone);
  return format(zonedDate, formatStr, { timeZone: timezone });
}

/**
 * Normalizes a date to midnight in the user's timezone
 * This is useful for comparing dates without time components
 * @param date The date to normalize
 * @param timezone The user's timezone (e.g., 'America/New_York')
 * @returns The normalized date
 */
export function normalizeDate(date: Date, timezone: string): Date {
  // Convert to user's timezone
  const zonedDate = toZonedTime(date, timezone);
  
  // Format the date as YYYY-MM-DD to get just the date part
  const dateStr = format(zonedDate, 'yyyy-MM-dd', { timeZone: timezone });
  
  // Parse the date string back to a Date object at midnight in the user's timezone
  const normalizedDate = new Date(`${dateStr}T00:00:00`);
  
  // Convert back to UTC for storage
  return new Date(normalizedDate.toISOString());
}

/**
 * Gets the current date in the user's timezone
 * @param timezone The user's timezone (e.g., 'America/New_York')
 * @returns The current date in the user's timezone
 */
export function getCurrentDate(timezone: string): Date {
  const now = new Date();
  return toZonedTime(now, timezone);
}

/**
 * Checks if two dates are the same day in the user's timezone
 * @param date1 The first date
 * @param date2 The second date
 * @param timezone The user's timezone (e.g., 'America/New_York')
 * @returns True if the dates are the same day
 */
export function isSameDay(date1: Date, date2: Date, timezone: string): boolean {
  // Convert both dates to the user's timezone
  const zonedDate1 = toZonedTime(date1, timezone);
  const zonedDate2 = toZonedTime(date2, timezone);
  
  // Format both dates as YYYY-MM-DD to compare just the date part
  const formattedDate1 = format(zonedDate1, 'yyyy-MM-dd', { timeZone: timezone });
  const formattedDate2 = format(zonedDate2, 'yyyy-MM-dd', { timeZone: timezone });
  
  // Compare the formatted dates
  return formattedDate1 === formattedDate2;
}

/**
 * Gets a list of common timezones for UI selection
 * @returns An array of timezone objects with id and label
 */
export function getCommonTimezones(): { id: string; label: string }[] {
  return [
    { id: 'America/New_York', label: 'Eastern Time (ET)' },
    { id: 'America/Chicago', label: 'Central Time (CT)' },
    { id: 'America/Denver', label: 'Mountain Time (MT)' },
    { id: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { id: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { id: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
    { id: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { id: 'Europe/Paris', label: 'Central European Time (CET)' },
    { id: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { id: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];
}
