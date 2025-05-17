'use client';

import { get, post, put, del } from '@/lib/services/api';
import { normalizeDate, isSameDay, getCurrentDate, formatInTimezone } from '@/lib/utils/timezone';
import { format } from 'date-fns-tz';

// Define the DailyLog type to maintain compatibility with existing code
export interface DailyLog {
  id: number;
  userId: number;
  date: Date;
  
  // Morning check-in fields (7-9am)
  sleepHours: number;
  sleepQuality: number;
  dreams: string;
  morningMood: number;
  physicalStatus: string;
  breakfast?: string;
  morningCompleted: boolean;
  
  // Concerta dose log fields (9-10am)
  medicationTaken: boolean;
  medicationTakenAt: Date | null;
  medicationDose: number;
  ateWithinHour: boolean;
  firstHourFeeling: string;
  reasonForSkipping?: string;
  medicationCompleted: boolean;
  
  // Mid-day check-in fields (11am-1pm)
  lunch?: string;
  focusLevel: number;
  energyLevel: number;
  ruminationLevel: number;
  currentActivity?: string;
  distractions?: string;
  mainTrigger: string;
  responseMethod: string[];
  middayCompleted: boolean;
  
  // Afternoon check-in fields (3-5pm)
  afternoonSnack?: string;
  isCrashing: boolean;
  crashSymptoms?: string;
  anxietyLevel?: number;
  isFeeling?: string;
  hadTriggeringInteraction: boolean;
  interactionDetails: string;
  selfWorthTiedToPerformance: string;
  overextended: string;
  afternoonCompleted: boolean;
  
  // Evening reflection fields (8-10pm)
  dinner?: string;
  overallMood: number;
  sleepiness?: number;
  medicationEffectiveness: string;
  helpfulFactors: string;
  distractingFactors: string;
  thoughtForTomorrow: string;
  eveningCompleted: boolean;
  
  // Additional fields
  isComplete: boolean;
  dayRating?: number;
  accomplishments?: string;
  challenges?: string;
  gratitude?: string;
  improvements?: string;
}

// Define interfaces for each form section
export interface MorningCheckInData {
  sleepHours: number;
  sleepQuality: number;
  dreams?: string;
  morningMood: number;
  physicalStatus?: string;
  breakfast?: string;
}

export interface ConcertaDoseLogData {
  medicationTaken: boolean;
  medicationTakenAt?: Date;
  medicationDose?: number;
  ateWithinHour?: boolean;
  firstHourFeeling?: string;
  reasonForSkipping?: string;
}

export interface MidDayCheckInData {
  lunch?: string;
  focusLevel: number;
  energyLevel: number;
  ruminationLevel: number;
  currentActivity?: string;
  distractions?: string;
  mainTrigger?: string;
  responseMethod: string[];
}

export interface AfternoonCheckInData {
  afternoonSnack?: string;
  isCrashing: boolean;
  crashSymptoms?: string;
  anxietyLevel?: number;
  isFeeling?: string;
  hadTriggeringInteraction: boolean;
  interactionDetails?: string;
  selfWorthTiedToPerformance?: string;
  overextended?: string;
}

export interface EveningReflectionData {
  dinner?: string;
  overallMood: number;
  sleepiness?: number;
  medicationEffectiveness?: string;
  helpfulFactors?: string;
  distractingFactors?: string;
  thoughtForTomorrow?: string;
  dayRating?: number;
  accomplishments?: string;
  challenges?: string;
  gratitude?: string;
  improvements?: string;
}

/**
 * Create a new morning check-in entry
 */
export async function createMorningCheckIn(
  userId: number, 
  data: MorningCheckInData & { date: Date },
  timezone: string = 'America/New_York'
) {
  // Normalize the date to midnight in the user's timezone
  const normalizedDate = normalizeDate(data.date, timezone);
  
  // Create a new daily log with morning check-in data
  const dailyLog = {
    userId,
    date: normalizedDate,
    sleepHours: data.sleepHours,
    sleepQuality: data.sleepQuality,
    dreams: data.dreams || '',
    morningMood: data.morningMood,
    physicalStatus: data.physicalStatus || '',
    breakfast: data.breakfast || '',
    morningCompleted: true,
    
    // Initialize other fields with default values
    medicationTaken: false,
    medicationTakenAt: null,
    medicationDose: 0,
    ateWithinHour: false,
    firstHourFeeling: '',
    reasonForSkipping: '',
    medicationCompleted: false,
    
    lunch: '',
    focusLevel: 0,
    energyLevel: 0,
    ruminationLevel: 0,
    currentActivity: '',
    distractions: '',
    mainTrigger: '',
    responseMethod: [],
    middayCompleted: false,
    
    afternoonSnack: '',
    isCrashing: false,
    crashSymptoms: '',
    anxietyLevel: 0,
    isFeeling: '',
    hadTriggeringInteraction: false,
    interactionDetails: '',
    selfWorthTiedToPerformance: '',
    overextended: '',
    afternoonCompleted: false,
    
    dinner: '',
    overallMood: 0,
    sleepiness: 0,
    medicationEffectiveness: '',
    helpfulFactors: '',
    distractingFactors: '',
    thoughtForTomorrow: '',
    eveningCompleted: false,
    
    isComplete: false,
    dayRating: 0,
    accomplishments: '',
    challenges: '',
    gratitude: '',
    improvements: ''
  };
  
  const response = await post<DailyLog>('daily-logs', dailyLog);
  return response.id;
}

/**
 * Update morning check-in data
 */
export async function updateMorningCheckIn(userId: number, id: number, data: MorningCheckInData, isUpdate = false) {
  // Get the current log first
  const log = await getDailyLogById(userId, id);
  if (!log) {
    throw new Error('Log not found or unauthorized access');
  }
  
  // Update with new data
  const updatedLog = {
    ...log,
    sleepHours: data.sleepHours,
    sleepQuality: data.sleepQuality,
    dreams: data.dreams || log.dreams,
    morningMood: data.morningMood,
    physicalStatus: data.physicalStatus || log.physicalStatus,
    breakfast: data.breakfast || log.breakfast,
    morningCompleted: true
  };
  
  await put<DailyLog>('daily-logs', updatedLog);
  
  // Always check if all sections are complete, regardless of isUpdate
  await checkDailyLogCompletion(userId, id);
  
  return id;
}

/**
 * Update Concerta dose log data
 */
export async function updateConcertaDoseLog(userId: number, id: number, data: ConcertaDoseLogData, isUpdate = false) {
  // Get the current log first
  const log = await getDailyLogById(userId, id);
  if (!log) {
    throw new Error('Log not found or unauthorized access');
  }
  
  // Update with new data
  const updatedLog = {
    ...log,
    medicationTaken: data.medicationTaken,
    medicationTakenAt: data.medicationTaken ? data.medicationTakenAt || null : null,
    medicationDose: data.medicationTaken ? data.medicationDose || 0 : 0,
    ateWithinHour: data.medicationTaken ? data.ateWithinHour || false : false,
    firstHourFeeling: data.medicationTaken ? data.firstHourFeeling || '' : '',
    reasonForSkipping: !data.medicationTaken ? data.reasonForSkipping || '' : '',
    medicationCompleted: true
  };
  
  await put<DailyLog>('daily-logs', updatedLog);
  
  // Always check if all sections are complete, regardless of isUpdate
  await checkDailyLogCompletion(userId, id);
  
  return id;
}

/**
 * Update midday focus and emotion data
 */
export async function updateMidDayCheckIn(userId: number, id: number, data: MidDayCheckInData, isUpdate = false) {
  // Get the current log first
  const log = await getDailyLogById(userId, id);
  if (!log) {
    throw new Error('Log not found or unauthorized access');
  }
  
  // Update with new data
  const updatedLog = {
    ...log,
    lunch: data.lunch || log.lunch,
    focusLevel: data.focusLevel,
    energyLevel: data.energyLevel,
    ruminationLevel: data.ruminationLevel,
    currentActivity: data.currentActivity || log.currentActivity,
    distractions: data.distractions || log.distractions,
    mainTrigger: data.mainTrigger || log.mainTrigger,
    responseMethod: data.responseMethod,
    middayCompleted: true
  };
  
  await put<DailyLog>('daily-logs', updatedLog);
  
  // Always check if all sections are complete, regardless of isUpdate
  await checkDailyLogCompletion(userId, id);
  
  return id;
}

/**
 * Update afternoon checkpoint data
 */
export async function updateAfternoonCheckIn(userId: number, id: number, data: AfternoonCheckInData, isUpdate = false) {
  // Get the current log first
  const log = await getDailyLogById(userId, id);
  if (!log) {
    throw new Error('Log not found or unauthorized access');
  }
  
  // Update with new data
  const updatedLog = {
    ...log,
    afternoonSnack: data.afternoonSnack || log.afternoonSnack,
    isCrashing: data.isCrashing,
    crashSymptoms: data.isCrashing ? data.crashSymptoms || '' : '',
    anxietyLevel: data.anxietyLevel || log.anxietyLevel,
    isFeeling: data.isFeeling || log.isFeeling,
    hadTriggeringInteraction: data.hadTriggeringInteraction,
    interactionDetails: data.hadTriggeringInteraction ? data.interactionDetails || '' : '',
    selfWorthTiedToPerformance: data.selfWorthTiedToPerformance || log.selfWorthTiedToPerformance,
    overextended: data.overextended || log.overextended,
    afternoonCompleted: true
  };
  
  await put<DailyLog>('daily-logs', updatedLog);
  
  // Always check if all sections are complete, regardless of isUpdate
  await checkDailyLogCompletion(userId, id);
  
  return id;
}

/**
 * Update end of day reflection data
 */
export async function updateEveningReflection(userId: number, id: number, data: EveningReflectionData, isUpdate = false) {
  // Get the current log first
  const log = await getDailyLogById(userId, id);
  if (!log) {
    throw new Error('Log not found or unauthorized access');
  }
  
  // Update with new data
  const updatedLog = {
    ...log,
    dinner: data.dinner || log.dinner,
    overallMood: data.overallMood,
    sleepiness: data.sleepiness || log.sleepiness,
    medicationEffectiveness: data.medicationEffectiveness || log.medicationEffectiveness,
    helpfulFactors: data.helpfulFactors || log.helpfulFactors,
    distractingFactors: data.distractingFactors || log.distractingFactors,
    thoughtForTomorrow: data.thoughtForTomorrow || log.thoughtForTomorrow,
    dayRating: data.dayRating || log.dayRating,
    accomplishments: data.accomplishments || log.accomplishments,
    challenges: data.challenges || log.challenges,
    gratitude: data.gratitude || log.gratitude,
    improvements: data.improvements || log.improvements,
    eveningCompleted: true
  };
  
  await put<DailyLog>('daily-logs', updatedLog);
  
  // Always check if all sections are complete, regardless of isUpdate
  await checkDailyLogCompletion(userId, id);
  
  return id;
}

/**
 * Check if all sections of the daily log are complete and update isComplete status
 */
export async function checkDailyLogCompletion(userId: number, id: number) {
  // Get the current log
  const log = await getDailyLogById(userId, id);
  if (!log) {
    throw new Error('Log not found or unauthorized access');
  }
  
  // Check if all sections are complete
  const isComplete = 
    log.morningCompleted && 
    log.medicationCompleted && 
    log.middayCompleted && 
    log.afternoonCompleted && 
    log.eveningCompleted;
  
  // Only update if the status has changed
  if (log.isComplete !== isComplete) {
    const updatedLog = {
      ...log,
      isComplete
    };
    
    await put<DailyLog>('daily-logs', updatedLog);
  }
  
  return isComplete;
}

// Legacy methods for backward compatibility
/**
 * Update medication and routine data (legacy method)
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
  
  // Convert to new format
  const concertaData: ConcertaDoseLogData = {
    medicationTaken: true,
    medicationTakenAt: new Date(data.medicationTakenAt),
    medicationDose: data.medicationDose,
    ateWithinHour: data.ateWithinHour,
    firstHourFeeling: data.firstHourFeeling
  };
  
  return updateConcertaDoseLog(userId, id, concertaData);
}

/**
 * Update midday focus and emotion data (legacy method)
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
  
  // Convert to new format
  const midDayData: MidDayCheckInData = {
    focusLevel: data.focusLevel,
    energyLevel: data.energyLevel,
    ruminationLevel: data.ruminationLevel,
    mainTrigger: data.mainTrigger,
    responseMethod: data.responseMethod
  };
  
  return updateMidDayCheckIn(userId, id, midDayData);
}

/**
 * Update afternoon checkpoint data (legacy method)
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
  
  // Convert to new format
  const afternoonData: AfternoonCheckInData = {
    isCrashing: false,
    hadTriggeringInteraction: data.hadTriggeringInteraction,
    interactionDetails: data.interactionDetails,
    selfWorthTiedToPerformance: data.selfWorthTiedToPerformance,
    overextended: data.overextended
  };
  
  return updateAfternoonCheckIn(userId, id, afternoonData);
}

/**
 * Update end of day reflection data (legacy method)
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
  
  // Convert to new format
  const eveningData: EveningReflectionData = {
    overallMood: data.overallMood,
    medicationEffectiveness: data.medicationEffectiveness,
    helpfulFactors: data.helpfulFactors,
    distractingFactors: data.distractingFactors,
    thoughtForTomorrow: data.thoughtForTomorrow,
    dayRating: data.dayRating,
    accomplishments: data.accomplishments,
    challenges: data.challenges,
    gratitude: data.gratitude,
    improvements: data.improvements
  };
  
  return updateEveningReflection(userId, id, eveningData);
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
export async function getDailyLogByDate(userId: number, date: Date, timezone: string = 'America/New_York') {
  try {
    // Normalize the date to midnight in the user's timezone
    const normalizedDate = normalizeDate(date, timezone);
    
    // Format date as ISO string for the API
    const dateStr = normalizedDate.toISOString().split('T')[0];
    console.log(`Fetching log for date: ${dateStr} in timezone: ${timezone}`);
    
    // Get all logs and filter by date using isSameDay
    const allLogs = await get<DailyLog[]>('daily-logs');
    
    // Find the log that matches the date in the user's timezone
    const matchingLog = allLogs.find(log => {
      const logDate = new Date(log.date);
      const isMatch = isSameDay(logDate, date, timezone);
      
      // Log for debugging
      const logDateStr = format(logDate, 'yyyy-MM-dd', { timeZone: timezone });
      const dateStr = format(date, 'yyyy-MM-dd', { timeZone: timezone });
      console.log(`Comparing log date: ${logDateStr} with requested date: ${dateStr}, match: ${isMatch}`);
      
      return isMatch;
    });
    
    return matchingLog || null;
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

/**
 * Check if a log exists for the current date
 */
export async function checkLogExistsForToday(userId: number, timezone: string = 'America/New_York') {
  try {
    // Get the current date in the user's timezone
    const today = getCurrentDate(timezone);
    const logs = await getAllDailyLogs(userId);
    
    // Format today's date for debugging
    const todayFormatted = format(today, 'yyyy-MM-dd', { timeZone: timezone });
    console.log(`Checking for logs on date: ${todayFormatted} in timezone: ${timezone}`);
    
    // Check each log to see if it matches today's date in the user's timezone
    const existingLog = logs.find(log => {
      const logDate = new Date(log.date);
      const isSame = isSameDay(logDate, today, timezone);
      
      // Log for debugging
      const logDateFormatted = format(logDate, 'yyyy-MM-dd', { timeZone: timezone });
      console.log(`Log date: ${logDateFormatted}, matches today: ${isSame}`);
      
      return isSame;
    });
    
    return !!existingLog;
  } catch (error) {
    console.error('Error checking if log exists for today:', error);
    return false;
  }
}

// Export a service object for compatibility with existing code
export const dailyLogService = {
  // New methods
  createMorningCheckIn,
  updateMorningCheckIn,
  updateConcertaDoseLog,
  updateMidDayCheckIn,
  updateAfternoonCheckIn,
  updateEveningReflection,
  checkDailyLogCompletion,
  
  // Legacy methods for backward compatibility
  updateMedicationRoutine,
  updateMiddayFocusEmotion,
  updateAfternoonCheckpoint,
  updateEndOfDayReflection,
  
  // Utility methods
  getDailyLogById,
  getDailyLogByDate,
  getAllDailyLogs,
  getCompletedDailyLogs,
  deleteDailyLog,
  deleteOrphanedLogs,
  getRecent,
  checkLogExistsForToday
};
