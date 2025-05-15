'use client';

import { get, post, put, del } from '@/lib/services/api';

// Define the DailyLog type to maintain compatibility with existing code
export interface DailyLog {
  id: number;
  userId: number;
  date: Date;
  sleepHours: number;
  sleepQuality: number;
  dreams: string;
  morningMood: number;
  physicalStatus: string;
  medicationTakenAt: string;
  medicationDose: number;
  ateWithinHour: boolean;
  firstHourFeeling: string;
  focusLevel: number;
  energyLevel: number;
  ruminationLevel: number;
  mainTrigger: string;
  responseMethod: string[];
  hadTriggeringInteraction: boolean;
  interactionDetails: string;
  selfWorthTiedToPerformance: string;
  overextended: string;
  overallMood: number;
  medicationEffectiveness: string;
  helpfulFactors: string;
  distractingFactors: string;
  thoughtForTomorrow: string;
  isComplete: boolean;
  dayRating?: number;
  accomplishments?: string;
  challenges?: string;
  gratitude?: string;
  improvements?: string;
}

/**
 * Create a new morning check-in entry
 */
export async function createMorningCheckIn(userId: number, data: {
  date: Date;
  sleepHours: number;
  sleepQuality: number;
  dreams: string;
  morningMood: number;
  physicalStatus: string;
}) {
  // Create a new daily log with morning check-in data
  const dailyLog = {
    userId,
    date: data.date,
    sleepHours: data.sleepHours,
    sleepQuality: data.sleepQuality,
    dreams: data.dreams,
    morningMood: data.morningMood,
    physicalStatus: data.physicalStatus,
    
    // Initialize other fields with default values
    medicationTakenAt: '',
    medicationDose: 0,
    ateWithinHour: false,
    firstHourFeeling: '',
    focusLevel: 0,
    energyLevel: 0,
    ruminationLevel: 0,
    mainTrigger: '',
    responseMethod: [],
    hadTriggeringInteraction: false,
    interactionDetails: '',
    selfWorthTiedToPerformance: '',
    overextended: '',
    overallMood: 0,
    medicationEffectiveness: '',
    helpfulFactors: '',
    distractingFactors: '',
    thoughtForTomorrow: '',
    isComplete: false
  };
  
  const response = await post<DailyLog>('daily-logs', dailyLog);
  return response.id;
}

/**
 * Update medication and routine data
 */
export async function updateMedicationRoutine(userId: number, id: number, data: {
  medicationTakenAt: string;
  medicationDose: number;
  ateWithinHour: boolean;
  firstHourFeeling: string;
}) {
  // Get the current log first
  const log = await getDailyLogById(userId, id);
  if (!log) {
    throw new Error('Log not found or unauthorized access');
  }
  
  // Update with new data
  const updatedLog = {
    ...log,
    medicationTakenAt: data.medicationTakenAt,
    medicationDose: data.medicationDose,
    ateWithinHour: data.ateWithinHour,
    firstHourFeeling: data.firstHourFeeling
  };
  
  await put<DailyLog>('daily-logs', updatedLog);
  return id;
}

/**
 * Update midday focus and emotion data
 */
export async function updateMiddayFocusEmotion(userId: number, id: number, data: {
  focusLevel: number;
  energyLevel: number;
  ruminationLevel: number;
  mainTrigger: string;
  responseMethod: string[];
}) {
  // Get the current log first
  const log = await getDailyLogById(userId, id);
  if (!log) {
    throw new Error('Log not found or unauthorized access');
  }
  
  // Update with new data
  const updatedLog = {
    ...log,
    focusLevel: data.focusLevel,
    energyLevel: data.energyLevel,
    ruminationLevel: data.ruminationLevel,
    mainTrigger: data.mainTrigger,
    responseMethod: data.responseMethod
  };
  
  await put<DailyLog>('daily-logs', updatedLog);
  return id;
}

/**
 * Update afternoon checkpoint data
 */
export async function updateAfternoonCheckpoint(userId: number, id: number, data: {
  hadTriggeringInteraction: boolean;
  interactionDetails: string;
  selfWorthTiedToPerformance: string;
  overextended: string;
}) {
  // Get the current log first
  const log = await getDailyLogById(userId, id);
  if (!log) {
    throw new Error('Log not found or unauthorized access');
  }
  
  // Update with new data
  const updatedLog = {
    ...log,
    hadTriggeringInteraction: data.hadTriggeringInteraction,
    interactionDetails: data.interactionDetails,
    selfWorthTiedToPerformance: data.selfWorthTiedToPerformance,
    overextended: data.overextended
  };
  
  await put<DailyLog>('daily-logs', updatedLog);
  return id;
}

/**
 * Update end of day reflection data
 */
export async function updateEndOfDayReflection(userId: number, id: number, data: {
  overallMood: number;
  medicationEffectiveness: string;
  helpfulFactors: string;
  distractingFactors: string;
  thoughtForTomorrow: string;
  dayRating: number;
  accomplishments: string;
  challenges: string;
  gratitude: string;
  improvements: string;
}) {
  // Get the current log first
  const log = await getDailyLogById(userId, id);
  if (!log) {
    throw new Error('Log not found or unauthorized access');
  }
  
  // Update with new data
  const updatedLog = {
    ...log,
    overallMood: data.overallMood,
    medicationEffectiveness: data.medicationEffectiveness,
    helpfulFactors: data.helpfulFactors,
    distractingFactors: data.distractingFactors,
    thoughtForTomorrow: data.thoughtForTomorrow,
    dayRating: data.dayRating,
    accomplishments: data.accomplishments,
    challenges: data.challenges,
    gratitude: data.gratitude,
    improvements: data.improvements,
    isComplete: true
  };
  
  await put<DailyLog>('daily-logs', updatedLog);
  return id;
}

/**
 * Get a daily log by ID
 */
export async function getDailyLogById(userId: number, id: number) {
  try {
    const logs = await get<DailyLog[]>(`daily-logs?id=${id}`);
    
    // The API returns an array, but we expect a single log or null
    if (logs && logs.length > 0 && logs[0].userId === userId) {
      return logs[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching daily log by ID:', error);
    return null;
  }
}

/**
 * Get a daily log by date
 */
export async function getDailyLogByDate(userId: number, date: Date) {
  try {
    // Format date as ISO string for the API
    const dateStr = date.toISOString().split('T')[0];
    const logs = await get<DailyLog[]>(`daily-logs?date=${dateStr}`);
    
    // The API returns an array, but we expect a single log or null
    if (logs && logs.length > 0) {
      return logs[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching daily log by date:', error);
    return null;
  }
}

/**
 * Get all daily logs for a user
 */
export async function getAllDailyLogs(userId: number) {
  try {
    return await get<DailyLog[]>('daily-logs');
  } catch (error) {
    console.error('Error fetching all daily logs:', error);
    return [];
  }
}

/**
 * Get all completed daily logs for a user
 */
export async function getCompletedDailyLogs(userId: number) {
  try {
    const logs = await get<DailyLog[]>('daily-logs');
    return logs.filter(log => log.isComplete === true);
  } catch (error) {
    console.error('Error fetching completed daily logs:', error);
    return [];
  }
}

/**
 * Delete a daily log
 */
export async function deleteDailyLog(userId: number, id: number) {
  try {
    await del<{ success: boolean }>(`daily-logs?id=${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting daily log:', error);
    throw new Error('Failed to delete daily log');
  }
}

/**
 * Delete all daily logs that don't have a valid user ID
 * This is used to clean up logs created before user authentication was implemented
 */
export async function deleteOrphanedLogs() {
  try {
    const response = await get<{ success: boolean; message: string }>('cleanup');
    // Extract the number of deleted logs from the message
    const match = response.message.match(/(\d+) orphaned logs/);
    return match ? parseInt(match[1]) : 0;
  } catch (error) {
    console.error('Error cleaning up orphaned logs:', error);
    return 0;
  }
}

/**
 * Get recent daily logs for a user
 */
export async function getRecent(userId: number, limit: number) {
  try {
    const logs = await get<DailyLog[]>('daily-logs');
    
    // Sort by date in descending order and take the first 'limit' logs
    return logs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent daily logs:', error);
    return [];
  }
}

// Export a service object for compatibility with existing code
export const dailyLogService = {
  createMorningCheckIn,
  updateMedicationRoutine,
  updateMiddayFocusEmotion,
  updateAfternoonCheckpoint,
  updateEndOfDayReflection,
  getDailyLogById,
  getDailyLogByDate,
  getAllDailyLogs,
  getCompletedDailyLogs,
  deleteDailyLog,
  deleteOrphanedLogs,
  getRecent
};
