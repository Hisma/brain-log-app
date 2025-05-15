import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes properly.
 * Uses clsx for conditional class names and tailwind-merge to handle conflicting Tailwind classes.
 * 
 * @param inputs - Class names to combine
 * @returns A string of combined class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a readable string
 * 
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns A formatted date string
 */
export function formatDate(date: Date, options: Intl.DateTimeFormatOptions = {}) {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  return new Date(date).toLocaleDateString(undefined, defaultOptions);
}

/**
 * Formats a time to a readable string
 * 
 * @param time - The time string to format
 * @returns A formatted time string
 */
export function formatTime(time: string) {
  if (!time) return '';
  
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return time;
  }
}

/**
 * Calculates the average of an array of numbers
 * 
 * @param numbers - Array of numbers
 * @returns The average value or 0 if the array is empty
 */
export function calculateAverage(numbers: number[]): number {
  if (!numbers.length) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

/**
 * Generates a week date range string
 * 
 * @param startDate - The start date of the week
 * @param endDate - The end date of the week
 * @returns A formatted date range string
 */
export function formatWeekRange(startDate: Date, endDate: Date): string {
  const start = formatDate(startDate, { month: 'short', day: 'numeric' });
  const end = formatDate(endDate, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${start} - ${end}`;
}

/**
 * Gets the start and end dates of a week given a date within that week
 * 
 * @param date - A date within the week
 * @returns An object with startDate and endDate
 */
export function getWeekRange(date: Date = new Date()): { startDate: Date; endDate: Date } {
  const currentDate = new Date(date);
  const day = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the date of the Sunday (start of week)
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - day);
  startDate.setHours(0, 0, 0, 0);
  
  // Calculate the date of the Saturday (end of week)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
}
