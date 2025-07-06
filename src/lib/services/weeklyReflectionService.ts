'use client';

import { get, post, put, del } from '@/lib/services/api';

// Define the WeeklyReflection type to maintain compatibility with existing code
export interface WeeklyReflection {
  id: number;
  userId: number;
  weekStartDate: Date;
  weekEndDate: Date;
  questionedLeavingJob: boolean;
  weekRating?: number;
  mentalState?: string;
  weekHighlights?: string;
  weekChallenges?: string;
  lessonsLearned?: string;
  nextWeekFocus?: string;
  gymDaysCount?: number;
  dietRating?: number;
  memorableFamilyActivities?: string;
}

/**
 * Create a new weekly reflection
 */
export async function createWeeklyReflection(userId: number, data: Omit<WeeklyReflection, 'id' | 'userId'>) {
  const reflection = {
    ...data,
    userId
  };
  
  const response = await post<WeeklyReflection>('weekly-reflections', reflection);
  return response.id;
}

/**
 * Get a weekly reflection by ID
 */
export async function getWeeklyReflectionById(userId: number, id: number) {
  try {
    const reflection = await get<WeeklyReflection>(`weekly-reflections?id=${id}`);
    
    // Only return the reflection if it belongs to the user
    if (reflection && reflection.userId === userId) {
      return reflection;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching weekly reflection by ID:', error);
    return null;
  }
}

/**
 * Get a weekly reflection by date range
 */
export async function getWeeklyReflectionByDateRange(userId: number, startDate: Date, endDate: Date) {
  try {
    // Format dates as ISO strings for the API
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const reflections = await get<WeeklyReflection[]>(
      `weekly-reflections?startDate=${startDateStr}&endDate=${endDateStr}`
    );
    
    // The API returns an array, but we expect a single reflection or null
    if (reflections && reflections.length > 0) {
      return reflections[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching weekly reflection by date range:', error);
    return null;
  }
}

/**
 * Get all weekly reflections for a user
 */
export async function getAllWeeklyReflections() {
  try {
    return await get<WeeklyReflection[]>('weekly-reflections');
  } catch (error) {
    console.error('Error fetching all weekly reflections:', error);
    return [];
  }
}

/**
 * Update a weekly reflection
 */
export async function updateWeeklyReflection(userId: number, id: number, data: Partial<WeeklyReflection>) {
  try {
    // Get the current reflection first
    const reflection = await getWeeklyReflectionById(userId, id);
    if (!reflection) {
      throw new Error('Reflection not found or unauthorized access');
    }
    
    // Update with new data
    const updatedReflection = {
      ...reflection,
      ...data,
      id
    };
    
    await put<WeeklyReflection>('weekly-reflections', updatedReflection);
    return id;
  } catch (error) {
    console.error('Error updating weekly reflection:', error);
    throw new Error('Failed to update weekly reflection');
  }
}

/**
 * Delete a weekly reflection
 */
export async function deleteWeeklyReflection(userId: number, id: number) {
  try {
    // Verify the reflection belongs to the user first
    const reflection = await getWeeklyReflectionById(userId, id);
    if (!reflection) {
      throw new Error('Reflection not found or unauthorized access');
    }
    
    await del<{ success: boolean }>(`weekly-reflections?id=${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting weekly reflection:', error);
    throw new Error('Failed to delete weekly reflection');
  }
}

/**
 * Get the most recent weekly reflection for a user
 */
export async function getMostRecentWeeklyReflection() {
  try {
    const reflections = await get<WeeklyReflection[]>('weekly-reflections');
    
    if (reflections.length === 0) {
      return null;
    }
    
    // Sort by weekEndDate in descending order
    reflections.sort((a, b) => {
      return new Date(b.weekEndDate).getTime() - new Date(a.weekEndDate).getTime();
    });
    
    return reflections[0];
  } catch (error) {
    console.error('Error fetching most recent weekly reflection:', error);
    return null;
  }
}

/**
 * Get weekly reflections for a specific month for a user
 */
export async function getWeeklyReflectionsForMonth(year: number, month: number) {
  try {
    // Create date range for the month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    // Format dates as ISO strings for the API
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const reflections = await get<WeeklyReflection[]>(
      `weekly-reflections?startDate=${startDateStr}&endDate=${endDateStr}`
    );
    
    return reflections;
  } catch (error) {
    console.error('Error fetching weekly reflections for month:', error);
    return [];
  }
}

/**
 * Get average mental state rating over time for a user
 */
export async function getAverageMentalStateRating() {
  try {
    const reflections = await get<WeeklyReflection[]>('weekly-reflections');
    
    if (reflections.length === 0) {
      return 0;
    }
    
    const validReflections = reflections.filter(reflection => 
      reflection.mentalState !== undefined && reflection.mentalState !== ''
    );
    
    if (validReflections.length === 0) {
      return 0;
    }
    
    // This is a simplification - in a real app, you'd parse the mental state text
    // and convert it to a numeric value for proper averaging
    return validReflections.length;
  } catch (error) {
    console.error('Error calculating average mental state rating:', error);
    return 0;
  }
}

/**
 * Get average weekly rating over time for a user
 */
export async function getAverageWeeklyRating() {
  try {
    const reflections = await get<WeeklyReflection[]>('weekly-reflections');
    
    if (reflections.length === 0) {
      return 0;
    }
    
    const validReflections = reflections.filter(reflection => 
      reflection.weekRating !== undefined
    );
    
    if (validReflections.length === 0) {
      return 0;
    }
    
    const sum = validReflections.reduce((total, reflection) => 
      total + (reflection.weekRating || 0), 0
    );
    
    return sum / validReflections.length;
  } catch (error) {
    console.error('Error calculating average weekly rating:', error);
    return 0;
  }
}

/**
 * Get recent weekly reflections for a user
 */
export async function getRecent(limit: number) {
  try {
    const reflections = await get<WeeklyReflection[]>('weekly-reflections');
    
    // Sort by weekEndDate in descending order
    reflections.sort((a, b) => {
      return new Date(b.weekEndDate).getTime() - new Date(a.weekEndDate).getTime();
    });
    
    // Return only the requested number of reflections
    return reflections.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent weekly reflections:', error);
    return [];
  }
}

// Export a service object for compatibility with existing code
export const weeklyReflectionService = {
  createWeeklyReflection,
  getWeeklyReflectionById,
  getWeeklyReflectionByDateRange,
  getAllWeeklyReflections,
  updateWeeklyReflection,
  deleteWeeklyReflection,
  getMostRecentWeeklyReflection,
  getWeeklyReflectionsForMonth,
  getAverageMentalStateRating,
  getAverageWeeklyRating,
  getRecent
};
