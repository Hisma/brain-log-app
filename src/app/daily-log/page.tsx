'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DailyLogOverview } from '@/components/DailyLogOverview';
import { MorningCheckInForm } from '@/components/forms/MorningCheckInForm';
import { ConcertaDoseLogForm } from '@/components/forms/ConcertaDoseLogForm';
import { MidDayCheckInForm } from '@/components/forms/MidDayCheckInForm';
import { AfternoonCheckInForm } from '@/components/forms/AfternoonCheckInForm';
import { EveningReflectionForm } from '@/components/forms/EveningReflectionForm';
import { dailyLogService, DailyLog, MorningCheckInData, ConcertaDoseLogData, MidDayCheckInData, AfternoonCheckInData, EveningReflectionData } from '@/lib/services/dailyLogService';
import { formatDate } from '@/lib/utils/index';
import { formatInTimezone, getCurrentDate, isSameDay } from '@/lib/utils/timezone';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Edit, ArrowLeft } from 'lucide-react';
import { InsightButton } from '@/components/ui/insight-button';

// Define the possible form sections
type FormSection = 'overview' | 'morning' | 'medication' | 'midday' | 'afternoon' | 'evening';

export default function DailyLogPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [currentSection, setCurrentSection] = useState<FormSection>('overview');
  const [date] = useState(new Date());
  const [dailyLogId, setDailyLogId] = useState<number | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  
  // Form data states
  const [morningData, setMorningData] = useState({
    sleepHours: 7,
    sleepQuality: 5,
    dreams: '',
    morningMood: 5,
    physicalStatus: '',
    breakfast: '',
  });
  
  const [medicationData, setMedicationData] = useState({
    medicationTaken: false,
    medicationTakenAt: undefined as Date | undefined,
    medicationDose: 36,
    ateWithinHour: false,
    firstHourFeeling: '',
    reasonForSkipping: '',
  });
  
  const [middayData, setMiddayData] = useState({
    lunch: '',
    focusLevel: 5,
    energyLevel: 5,
    ruminationLevel: 5,
    currentActivity: '',
    distractions: '',
    mainTrigger: '',
    responseMethod: [] as string[],
  });
  
  const [afternoonData, setAfternoonData] = useState({
    afternoonSnack: '',
    isCrashing: false,
    crashSymptoms: '',
    anxietyLevel: 5,
    isFeeling: '',
    hadTriggeringInteraction: false,
    interactionDetails: '',
    selfWorthTiedToPerformance: '',
    overextended: '',
  });
  
  const [eveningData, setEveningData] = useState({
    dinner: '',
    overallMood: 5,
    sleepiness: 5,
    medicationEffectiveness: '',
    helpfulFactors: '',
    distractingFactors: '',
    thoughtForTomorrow: '',
    dayRating: 5,
    accomplishments: '',
    challenges: '',
    gratitude: '',
    improvements: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch daily logs using API
  useEffect(() => {
    async function fetchDailyLogs() {
      if (user) {
        try {
          setIsLoadingLogs(true);
          const logs = await dailyLogService.getRecent(user.id, 10);
          setDailyLogs(logs);
          
          // Check if a log already exists for today
          const logExistsForToday = await dailyLogService.checkLogExistsForToday(user.id, user.timezone);
          console.log('Log exists for today:', logExistsForToday);
          
          if (logExistsForToday) {
            // Find today's log using the improved isSameDay function
            const today = getCurrentDate(user.timezone);
            const todayLog = logs.find(log => 
              isSameDay(new Date(log.date), today, user.timezone)
            );
            
            if (todayLog) {
              console.log('Found today\'s log:', todayLog);
              setDailyLogId(todayLog.id);
              setIsUpdate(true);
            }
          }
        } catch (error) {
          console.error('Error fetching daily logs:', error);
        } finally {
          setIsLoadingLogs(false);
        }
      }
    }
    
    fetchDailyLogs();
  }, [user, isCreating]); // Re-fetch when user changes or after creating a new log

  // Handle navigation between forms
  const handleNavigate = (section: string, isUpdateMode: boolean) => {
    if (!isCreating) {
      setIsCreating(true);
    }
    
    setCurrentSection(section as FormSection);
    setIsUpdate(isUpdateMode);
    
    // If we're navigating from the overview and we don't have a daily log ID yet,
    // we need to create one by submitting the morning check-in form first
    if (section !== 'morning' && !dailyLogId && !isUpdateMode) {
      // This will be handled in the form submission
    }
  };

  // Check if all sections are completed and redirect if needed
  const checkAllSectionsCompleted = async () => {
    if (!dailyLogId || !user) return false;
    
    try {
      const log = await dailyLogService.getDailyLogById(dailyLogId);
      if (log && log.isComplete) {
        // All sections are completed, redirect to home page
        router.push('/');
        return true;
      }
    } catch (error) {
      console.error('Error checking log completion status:', error);
    }
    
    return false;
  };

  // Handle form submissions
  const handleMorningSubmit = async (data: MorningCheckInData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // If we're creating a new log or updating an existing one
      if (isUpdate && dailyLogId) {
        await dailyLogService.updateMorningCheckIn(user.id, dailyLogId, data);
      } else {
        // Check if a log already exists for today before creating a new one
        const logExistsForToday = await dailyLogService.checkLogExistsForToday(user.id, user.timezone);
        
        if (logExistsForToday) {
          // If a log exists, get it and set it as the current log
          const today = getCurrentDate(user.timezone);
          const logs = await dailyLogService.getAllDailyLogs();
          const todayLog = logs.find(log => 
            isSameDay(new Date(log.date), today, user.timezone)
          );
          
          if (todayLog) {
            setDailyLogId(todayLog.id);
            setIsUpdate(true);
            
            // Now update the existing log
            await dailyLogService.updateMorningCheckIn(user.id, todayLog.id, data);
          } else {
            throw new Error('A log already exists for today but could not be retrieved.');
          }
        } else {
          // Create a new daily log
          const logId = await dailyLogService.createMorningCheckIn(
            user.id, 
            {
              date,
              ...data
            },
            user.timezone
          );
          setDailyLogId(logId);
        }
      }
      
      // Check if all sections are completed
      const isComplete = await checkAllSectionsCompleted();
      
      // If not complete, navigate to the overview
      if (!isComplete) {
        setCurrentSection('overview');
      }
    } catch (error) {
      console.error('Error saving morning check-in:', error);
      
      // Check for specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('A log already exists for this date')) {
        // Try to load the existing log
        try {
          const today = getCurrentDate(user.timezone);
          const logs = await dailyLogService.getAllDailyLogs();
          const todayLog = logs.find(log => 
            isSameDay(new Date(log.date), today, user.timezone)
          );
          
          if (todayLog) {
            // Ask the user if they want to delete the existing log or edit it
            const shouldDelete = confirm(
              'You already have a log for today. Would you like to delete it and create a new one?\n\n' +
              'Click "OK" to delete the existing log and create a new one.\n' +
              'Click "Cancel" to edit the existing log instead.'
            );
            
            if (shouldDelete) {
              // Delete the existing log
              await dailyLogService.deleteDailyLog(user.id, todayLog.id);
              
              // Create a new log
              const logId = await dailyLogService.createMorningCheckIn(
                user.id, 
                {
                  date,
                  ...data
                },
                user.timezone
              );
              setDailyLogId(logId);
              setIsUpdate(false);
              setCurrentSection('overview');
            } else {
              // Load the existing log for editing
              setDailyLogId(todayLog.id);
              setIsUpdate(true);
              setCurrentSection('overview');
            }
          }
        } catch (loadError) {
          console.error('Error handling existing log:', loadError);
          alert('An error occurred while trying to handle the existing log. Please try again.');
        }
      } else {
        alert('Failed to save morning check-in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMedicationSubmit = async (data: ConcertaDoseLogData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // If we don't have a daily log ID yet, we need to create one first
      let logId = dailyLogId;
      if (!logId) {
        // Check if a log already exists for today before creating a new one
        const logExistsForToday = await dailyLogService.checkLogExistsForToday(user.id, user.timezone);
        
        if (logExistsForToday) {
          // If a log exists, get it and set it as the current log
          const today = getCurrentDate(user.timezone);
          const logs = await dailyLogService.getAllDailyLogs();
          const todayLog = logs.find(log => 
            isSameDay(new Date(log.date), today, user.timezone)
          );
          
          if (todayLog) {
            // Ask the user if they want to delete the existing log or edit it
            const shouldDelete = confirm(
              'You already have a log for today. Would you like to delete it and create a new one?\n\n' +
              'Click "OK" to delete the existing log and create a new one.\n' +
              'Click "Cancel" to edit the existing log instead.'
            );
            
            if (shouldDelete) {
              // Delete the existing log
              await dailyLogService.deleteDailyLog(user.id, todayLog.id);
              
              // Create a new log with morning data first
              logId = await dailyLogService.createMorningCheckIn(user.id, {
                date,
                ...morningData
              }, user.timezone);
              setDailyLogId(logId);
              setIsUpdate(false);
            } else {
              // Load the existing log for editing
              setDailyLogId(todayLog.id);
              setIsUpdate(true);
              logId = todayLog.id;
            }
          } else {
            throw new Error('A log already exists for today but could not be retrieved.');
          }
        } else {
          // Create a new daily log
          logId = await dailyLogService.createMorningCheckIn(user.id, {
            date,
            ...morningData
          }, user.timezone);
          setDailyLogId(logId);
        }
      }
      
      // Update the medication data
      await dailyLogService.updateConcertaDoseLog(user.id, logId, data);
      
      // Check if all sections are completed
      const isComplete = await checkAllSectionsCompleted();
      
      // If not complete, navigate to the overview
      if (!isComplete) {
        setCurrentSection('overview');
      }
    } catch (error) {
      console.error('Error saving medication log:', error);
      
      // Check for specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('A log already exists for this date')) {
        // Try to load the existing log
        try {
          const today = getCurrentDate(user.timezone);
          const logs = await dailyLogService.getAllDailyLogs();
          const todayLog = logs.find(log => 
            isSameDay(new Date(log.date), today, user.timezone)
          );
          
          if (todayLog) {
            // Ask the user if they want to delete the existing log or edit it
            const shouldDelete = confirm(
              'You already have a log for today. Would you like to delete it and create a new one?\n\n' +
              'Click "OK" to delete the existing log and create a new one.\n' +
              'Click "Cancel" to edit the existing log instead.'
            );
            
            if (shouldDelete) {
              // Delete the existing log
              await dailyLogService.deleteDailyLog(user.id, todayLog.id);
              
              // Create a new log with morning data first
              const logId = await dailyLogService.createMorningCheckIn(
                user.id, 
                {
                  date,
                  ...morningData
                },
                user.timezone
              );
              setDailyLogId(logId);
              setIsUpdate(false);
              setCurrentSection('overview');
            } else {
              // Load the existing log for editing
              setDailyLogId(todayLog.id);
              setIsUpdate(true);
              setCurrentSection('overview');
            }
          }
        } catch (loadError) {
          console.error('Error handling existing log:', loadError);
          alert('An error occurred while trying to handle the existing log. Please try again.');
        }
      } else {
        alert('Failed to save medication log. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMiddaySubmit = async (data: MidDayCheckInData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // If we don't have a daily log ID yet, we need to create one first
      let logId = dailyLogId;
      if (!logId) {
        // Check if a log already exists for today before creating a new one
        const logExistsForToday = await dailyLogService.checkLogExistsForToday(user.id, user.timezone);
        
        if (logExistsForToday) {
          // If a log exists, get it and set it as the current log
          const today = getCurrentDate(user.timezone);
          const logs = await dailyLogService.getAllDailyLogs();
          const todayLog = logs.find(log => 
            isSameDay(new Date(log.date), today, user.timezone)
          );
          
          if (todayLog) {
            // Ask the user if they want to delete the existing log or edit it
            const shouldDelete = confirm(
              'You already have a log for today. Would you like to delete it and create a new one?\n\n' +
              'Click "OK" to delete the existing log and create a new one.\n' +
              'Click "Cancel" to edit the existing log instead.'
            );
            
            if (shouldDelete) {
              // Delete the existing log
              await dailyLogService.deleteDailyLog(user.id, todayLog.id);
              
              // Create a new log with morning data first
              logId = await dailyLogService.createMorningCheckIn(user.id, {
                date,
                ...morningData
              }, user.timezone);
              setDailyLogId(logId);
              setIsUpdate(false);
            } else {
              // Load the existing log for editing
              setDailyLogId(todayLog.id);
              setIsUpdate(true);
              logId = todayLog.id;
            }
          } else {
            throw new Error('A log already exists for today but could not be retrieved.');
          }
        } else {
          // Create a new daily log
          logId = await dailyLogService.createMorningCheckIn(user.id, {
            date,
            ...morningData
          }, user.timezone);
          setDailyLogId(logId);
        }
      }
      
      // Update the midday data
      await dailyLogService.updateMidDayCheckIn(user.id, logId, data);
      
      // Check if all sections are completed
      const isComplete = await checkAllSectionsCompleted();
      
      // If not complete, navigate to the overview
      if (!isComplete) {
        setCurrentSection('overview');
      }
    } catch (error) {
      console.error('Error saving midday check-in:', error);
      
      // Check for specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('A log already exists for this date')) {
        // Try to load the existing log
        try {
          const today = getCurrentDate(user.timezone);
          const logs = await dailyLogService.getAllDailyLogs();
          const todayLog = logs.find(log => 
            isSameDay(new Date(log.date), today, user.timezone)
          );
          
          if (todayLog) {
            // Ask the user if they want to delete the existing log or edit it
            const shouldDelete = confirm(
              'You already have a log for today. Would you like to delete it and create a new one?\n\n' +
              'Click "OK" to delete the existing log and create a new one.\n' +
              'Click "Cancel" to edit the existing log instead.'
            );
            
            if (shouldDelete) {
              // Delete the existing log
              await dailyLogService.deleteDailyLog(user.id, todayLog.id);
              
              // Create a new log with morning data first
              const logId = await dailyLogService.createMorningCheckIn(
                user.id, 
                {
                  date,
                  ...morningData
                },
                user.timezone
              );
              setDailyLogId(logId);
              setIsUpdate(false);
              setCurrentSection('overview');
            } else {
              // Load the existing log for editing
              setDailyLogId(todayLog.id);
              setIsUpdate(true);
              setCurrentSection('overview');
            }
          }
        } catch (loadError) {
          console.error('Error handling existing log:', loadError);
          alert('An error occurred while trying to handle the existing log. Please try again.');
        }
      } else {
        alert('Failed to save midday check-in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAfternoonSubmit = async (data: AfternoonCheckInData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // If we don't have a daily log ID yet, we need to create one first
      let logId = dailyLogId;
      if (!logId) {
        // Check if a log already exists for today before creating a new one
        const logExistsForToday = await dailyLogService.checkLogExistsForToday(user.id, user.timezone);
        
        if (logExistsForToday) {
          // If a log exists, get it and set it as the current log
          const today = getCurrentDate(user.timezone);
          const logs = await dailyLogService.getAllDailyLogs();
          const todayLog = logs.find(log => 
            isSameDay(new Date(log.date), today, user.timezone)
          );
          
          if (todayLog) {
            // Ask the user if they want to delete the existing log or edit it
            const shouldDelete = confirm(
              'You already have a log for today. Would you like to delete it and create a new one?\n\n' +
              'Click "OK" to delete the existing log and create a new one.\n' +
              'Click "Cancel" to edit the existing log instead.'
            );
            
            if (shouldDelete) {
              // Delete the existing log
              await dailyLogService.deleteDailyLog(user.id, todayLog.id);
              
              // Create a new log with morning data first
              logId = await dailyLogService.createMorningCheckIn(user.id, {
                date,
                ...morningData
              }, user.timezone);
              setDailyLogId(logId);
              setIsUpdate(false);
            } else {
              // Load the existing log for editing
              setDailyLogId(todayLog.id);
              setIsUpdate(true);
              logId = todayLog.id;
            }
          } else {
            throw new Error('A log already exists for today but could not be retrieved.');
          }
        } else {
          // Create a new daily log
          logId = await dailyLogService.createMorningCheckIn(user.id, {
            date,
            ...morningData
          }, user.timezone);
          setDailyLogId(logId);
        }
      }
      
      // Update the afternoon data
      await dailyLogService.updateAfternoonCheckIn(user.id, logId, data);
      
      // Check if all sections are completed
      const isComplete = await checkAllSectionsCompleted();
      
      // If not complete, navigate to the overview
      if (!isComplete) {
        setCurrentSection('overview');
      }
    } catch (error) {
      console.error('Error saving afternoon check-in:', error);
      
      // Check for specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('A log already exists for this date')) {
        // Try to load the existing log
        try {
          const today = getCurrentDate(user.timezone);
          const logs = await dailyLogService.getAllDailyLogs();
          const todayLog = logs.find(log => 
            isSameDay(new Date(log.date), today, user.timezone)
          );
          
          if (todayLog) {
            // Ask the user if they want to delete the existing log or edit it
            const shouldDelete = confirm(
              'You already have a log for today. Would you like to delete it and create a new one?\n\n' +
              'Click "OK" to delete the existing log and create a new one.\n' +
              'Click "Cancel" to edit the existing log instead.'
            );
            
            if (shouldDelete) {
              // Delete the existing log
              await dailyLogService.deleteDailyLog(user.id, todayLog.id);
              
              // Create a new log with morning data first
              const logId = await dailyLogService.createMorningCheckIn(
                user.id, 
                {
                  date,
                  ...morningData
                },
                user.timezone
              );
              setDailyLogId(logId);
              setIsUpdate(false);
              setCurrentSection('overview');
            } else {
              // Load the existing log for editing
              setDailyLogId(todayLog.id);
              setIsUpdate(true);
              setCurrentSection('overview');
            }
          }
        } catch (loadError) {
          console.error('Error handling existing log:', loadError);
          alert('An error occurred while trying to handle the existing log. Please try again.');
        }
      } else {
        alert('Failed to save afternoon check-in. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEveningSubmit = async (data: EveningReflectionData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // If we don't have a daily log ID yet, we need to create one first
      let logId = dailyLogId;
      if (!logId) {
        // Check if a log already exists for today before creating a new one
        const logExistsForToday = await dailyLogService.checkLogExistsForToday(user.id, user.timezone);
        
        if (logExistsForToday) {
          // If a log exists, get it and set it as the current log
          const today = getCurrentDate(user.timezone);
          const logs = await dailyLogService.getAllDailyLogs();
          const todayLog = logs.find(log => 
            isSameDay(new Date(log.date), today, user.timezone)
          );
          
          if (todayLog) {
            // Ask the user if they want to delete the existing log or edit it
            const shouldDelete = confirm(
              'You already have a log for today. Would you like to delete it and create a new one?\n\n' +
              'Click "OK" to delete the existing log and create a new one.\n' +
              'Click "Cancel" to edit the existing log instead.'
            );
            
            if (shouldDelete) {
              // Delete the existing log
              await dailyLogService.deleteDailyLog(user.id, todayLog.id);
              
              // Create a new log with morning data first
              logId = await dailyLogService.createMorningCheckIn(user.id, {
                date,
                ...morningData
              }, user.timezone);
              setDailyLogId(logId);
              setIsUpdate(false);
            } else {
              // Load the existing log for editing
              setDailyLogId(todayLog.id);
              setIsUpdate(true);
              logId = todayLog.id;
            }
          } else {
            throw new Error('A log already exists for today but could not be retrieved.');
          }
        } else {
          // Create a new daily log
          logId = await dailyLogService.createMorningCheckIn(user.id, {
            date,
            ...morningData
          }, user.timezone);
          setDailyLogId(logId);
        }
      }
      
      // Update the evening data
      await dailyLogService.updateEveningReflection(user.id, logId, data);
      
      // Check if all sections are completed
      const isComplete = await checkAllSectionsCompleted();
      
      // If not complete, navigate to the overview
      if (!isComplete) {
        setCurrentSection('overview');
      }
    } catch (error) {
      console.error('Error saving evening reflection:', error);
      
      // Check for specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('A log already exists for this date')) {
        // Try to load the existing log
        try {
          const today = getCurrentDate(user.timezone);
          const logs = await dailyLogService.getAllDailyLogs();
          const todayLog = logs.find(log => 
            isSameDay(new Date(log.date), today, user.timezone)
          );
          
          if (todayLog) {
            // Ask the user if they want to delete the existing log or edit it
            const shouldDelete = confirm(
              'You already have a log for today. Would you like to delete it and create a new one?\n\n' +
              'Click "OK" to delete the existing log and create a new one.\n' +
              'Click "Cancel" to edit the existing log instead.'
            );
            
            if (shouldDelete) {
              // Delete the existing log
              await dailyLogService.deleteDailyLog(user.id, todayLog.id);
              
              // Create a new log with morning data first
              const logId = await dailyLogService.createMorningCheckIn(
                user.id, 
                {
                  date,
                  ...morningData
                },
                user.timezone
              );
              setDailyLogId(logId);
              setIsUpdate(false);
              setCurrentSection('overview');
            } else {
              // Load the existing log for editing
              setDailyLogId(todayLog.id);
              setIsUpdate(true);
              setCurrentSection('overview');
            }
          }
        } catch (loadError) {
          console.error('Error handling existing log:', loadError);
          alert('An error occurred while trying to handle the existing log. Please try again.');
        }
      } else {
        alert('Failed to save evening reflection. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewLog = async (log: DailyLog) => {
    // Load the log data into the form states
    setDailyLogId(log.id);
    
    // Morning data
    setMorningData({
      sleepHours: log.sleepHours,
      sleepQuality: log.sleepQuality,
      dreams: log.dreams || '',
      morningMood: log.morningMood,
      physicalStatus: log.physicalStatus || '',
      breakfast: log.breakfast || '',
    });
    
    // Medication data
    setMedicationData({
      medicationTaken: log.medicationTaken,
      medicationTakenAt: log.medicationTakenAt || undefined,
      medicationDose: log.medicationDose || 36,
      ateWithinHour: log.ateWithinHour || false,
      firstHourFeeling: log.firstHourFeeling || '',
      reasonForSkipping: log.reasonForSkipping || '',
    });
    
    // Midday data
    setMiddayData({
      lunch: log.lunch || '',
      focusLevel: log.focusLevel || 5,
      energyLevel: log.energyLevel || 5,
      ruminationLevel: log.ruminationLevel || 5,
      currentActivity: log.currentActivity || '',
      distractions: log.distractions || '',
      mainTrigger: log.emotionalEvent || '',
      responseMethod: log.copingStrategies ? [log.copingStrategies] : [],
    });
    
    // Afternoon data
    setAfternoonData({
      afternoonSnack: log.afternoonSnack || '',
      isCrashing: log.isCrashing || false,
      crashSymptoms: log.crashSymptoms || '',
      anxietyLevel: log.anxietyLevel || 5,
      isFeeling: log.isFeeling || '',
      hadTriggeringInteraction: log.hadTriggeringInteraction || false,
      interactionDetails: log.interactionDetails || '',
      selfWorthTiedToPerformance: log.selfWorthTiedToPerformance || '',
      overextended: log.overextended || '',
    });
    
    // Evening data
    setEveningData({
      dinner: log.dinner || '',
      overallMood: log.overallMood || 5,
      sleepiness: log.sleepiness || 5,
      medicationEffectiveness: log.medicationEffectiveness || '',
      helpfulFactors: log.helpfulFactors || '',
      distractingFactors: log.distractingFactors || '',
      thoughtForTomorrow: log.thoughtForTomorrow || '',
      dayRating: log.dayRating || 5,
      accomplishments: log.accomplishments || '',
      challenges: log.challenges || '',
      gratitude: log.gratitude || '',
      improvements: log.improvements || '',
    });
    
    // Check if the log is complete
    if (log.isComplete) {
      // If the log is complete, show the popup
      setSelectedLog(log);
      setIsViewModalOpen(true);
    } else {
      // If the log is not complete, navigate to the daily log overview page
      setIsCreating(true);
      setIsUpdate(true);
      setCurrentSection('overview');
    }
  };

  const handleEditSection = (section: FormSection) => {
    setIsViewModalOpen(false);
    setIsCreating(true);
    setIsUpdate(true);
    setCurrentSection(section);
  };

  const handleDeleteLog = async () => {
    if (!selectedLog || !user) return;
    
    try {
      await dailyLogService.deleteDailyLog(user.id, selectedLog.id);
      setIsViewModalOpen(false);
      
      // Refresh the logs list
      const updatedLogs = await dailyLogService.getRecent(user.id, 10);
      setDailyLogs(updatedLogs);
      
      // Reset states
      setDailyLogId(null);
      setIsUpdate(false);
      setCurrentSection('overview');
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Failed to delete log. Please try again.');
    }
  };

  const renderLogsList = () => {
    if (isLoadingLogs) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading daily logs...</p>
        </div>
      );
    }
    
    if (!dailyLogs || dailyLogs.length === 0) {
      return (
        <div className="p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No daily logs found</p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking your mental well-being by creating your first daily log.
          </p>
          <Button onClick={() => setIsCreating(true)}>
            Create Your First Log
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {dailyLogs.map((log) => (
          <Card 
            key={log.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleViewLog(log)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">
                  {formatInTimezone(new Date(log.date), user?.timezone || 'America/New_York', 'EEE, MMM d')}
                </h3>
                {log.isComplete ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Complete
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    In Progress
                  </span>
                )}
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Sleep:</span> {log.sleepHours}h ({log.sleepQuality}/10)
                </div>
                <div>
                  <span className="font-medium">Mood:</span> {log.morningMood}/10
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {[
                  log.morningCompleted ? 'Morning' : null,
                  log.medicationCompleted ? 'Medication' : null,
                  log.middayCompleted ? 'Midday' : null,
                  log.afternoonCompleted ? 'Afternoon' : null,
                  log.eveningCompleted ? 'Evening' : null
                ].filter(Boolean).join(' • ')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderCreationForm = () => {
    return (
      <div className="animate-fade-in">
        <div className="mb-8 flex items-center">
          {currentSection !== 'overview' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentSection('overview')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Overview
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isUpdate ? 'Update Daily Log' : 'New Daily Log'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {currentSection === 'overview' ? (
          <DailyLogOverview 
            date={date} 
            userId={user?.id || 1} 
            onNavigate={handleNavigate}
            dailyLogId={dailyLogId}
          />
        ) : currentSection === 'morning' ? (
          <MorningCheckInForm 
            initialValues={morningData}
            isUpdate={isUpdate}
            onSubmit={handleMorningSubmit}
            onBack={() => setCurrentSection('overview')}
            isSubmitting={isSubmitting}
          />
        ) : currentSection === 'medication' ? (
          <ConcertaDoseLogForm 
            initialValues={medicationData}
            isUpdate={isUpdate}
            onSubmit={handleMedicationSubmit}
            onBack={() => setCurrentSection('overview')}
            isSubmitting={isSubmitting}
          />
        ) : currentSection === 'midday' ? (
          <MidDayCheckInForm 
            initialValues={middayData}
            isUpdate={isUpdate}
            onSubmit={handleMiddaySubmit}
            onBack={() => setCurrentSection('overview')}
            isSubmitting={isSubmitting}
          />
        ) : currentSection === 'afternoon' ? (
          <AfternoonCheckInForm 
            initialValues={afternoonData}
            isUpdate={isUpdate}
            onSubmit={handleAfternoonSubmit}
            onBack={() => setCurrentSection('overview')}
            isSubmitting={isSubmitting}
          />
        ) : (
          <EveningReflectionForm 
            initialValues={eveningData}
            isUpdate={isUpdate}
            onSubmit={handleEveningSubmit}
            onBack={() => setCurrentSection('overview')}
            isSubmitting={isSubmitting}
          />
        )}

          {currentSection === 'overview' && (
            <div className="mt-8 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setCurrentSection('overview');
                  setDailyLogId(null);
                  setIsUpdate(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
              >
                Return to Dashboard
              </Button>
            </div>
          )}
      </div>
    );
  };

  // Render the view dialog with all sections
  const renderViewDialog = () => {
    if (!selectedLog) return null;
    
    return (
      <Dialog open={isViewModalOpen} onOpenChange={(open) => setIsViewModalOpen(open)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Daily Log: {formatDate(new Date(selectedLog.date))}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Morning Check-In Section */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Morning Check-In (7-9am)</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditSection('morning')}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Sleep Hours</p>
                  <p className="font-medium">{selectedLog.sleepHours} hours</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Sleep Quality</p>
                  <p className="font-medium">{selectedLog.sleepQuality}/10</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Morning Mood</p>
                  <p className="font-medium">{selectedLog.morningMood}/10</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Physical Status</p>
                  <p className="font-medium">{selectedLog.physicalStatus || 'Not specified'}</p>
                </div>
                {selectedLog.breakfast && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Breakfast</p>
                    <p className="font-medium">{selectedLog.breakfast}</p>
                  </div>
                )}
                {selectedLog.dreams && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Dreams</p>
                    <p className="font-medium">{selectedLog.dreams}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Concerta Dose Log Section */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Concerta Dose Log (9-10am)</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditSection('medication')}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2">
                  <p className="text-gray-500 dark:text-gray-400">Medication Taken</p>
                  <p className="font-medium">{selectedLog.medicationTaken ? 'Yes' : 'No'}</p>
                </div>
                
                {selectedLog.medicationTaken ? (
                  <>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Time Taken</p>
                      <p className="font-medium">
                        {selectedLog.medicationTakenAt 
                          ? formatDate(new Date(selectedLog.medicationTakenAt), { hour: 'numeric', minute: 'numeric' }) 
                          : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Dose</p>
                      <p className="font-medium">{selectedLog.medicationDose || 0} mg</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Ate Within Hour</p>
                      <p className="font-medium">{selectedLog.ateWithinHour ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">First Hour Feeling</p>
                      <p className="font-medium">{selectedLog.firstHourFeeling || 'Not specified'}</p>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Reason for Skipping</p>
                    <p className="font-medium">{selectedLog.reasonForSkipping || 'Not specified'}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mid-day Check-In Section */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Mid-day Check-In (11am-1pm)</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditSection('midday')}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedLog.lunch && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Lunch</p>
                    <p className="font-medium">{selectedLog.lunch}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Focus Level</p>
                  <p className="font-medium">{selectedLog.focusLevel || 0}/10</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Energy Level</p>
                  <p className="font-medium">{selectedLog.energyLevel || 0}/10</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Rumination Level</p>
                  <p className="font-medium">{selectedLog.ruminationLevel || 0}/10</p>
                </div>
                {selectedLog.currentActivity && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Current Activity</p>
                    <p className="font-medium">{selectedLog.currentActivity}</p>
                  </div>
                )}
                {selectedLog.distractions && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Distractions</p>
                    <p className="font-medium">{selectedLog.distractions}</p>
                  </div>
                )}
                {selectedLog.emotionalEvent && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Emotional Event</p>
                    <p className="font-medium">{selectedLog.emotionalEvent}</p>
                  </div>
                )}
                {selectedLog.copingStrategies && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Coping Strategies</p>
                    <p className="font-medium">{selectedLog.copingStrategies}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Afternoon Check-In Section */}
            <div className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Afternoon Check-In (3-5pm)</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditSection('afternoon')}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedLog.afternoonSnack && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Afternoon Snack</p>
                    <p className="font-medium">{selectedLog.afternoonSnack}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Crashing</p>
                  <p className="font-medium">{selectedLog.isCrashing ? 'Yes' : 'No'}</p>
                </div>
                
                {selectedLog.isCrashing && selectedLog.crashSymptoms && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Crash Symptoms</p>
                    <p className="font-medium">{selectedLog.crashSymptoms}</p>
                  </div>
                )}
                
                {selectedLog.anxietyLevel !== undefined && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Anxiety Level</p>
                    <p className="font-medium">{selectedLog.anxietyLevel}/10</p>
                  </div>
                )}
                
                {selectedLog.isFeeling && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Current Feeling</p>
                    <p className="font-medium">{selectedLog.isFeeling}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Triggering Interaction</p>
                  <p className="font-medium">{selectedLog.hadTriggeringInteraction ? 'Yes' : 'No'}</p>
                </div>
                
                {selectedLog.hadTriggeringInteraction && selectedLog.interactionDetails && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Interaction Details</p>
                    <p className="font-medium">{selectedLog.interactionDetails}</p>
                  </div>
                )}
                
                {selectedLog.selfWorthTiedToPerformance && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Self-Worth Tied to Performance</p>
                    <p className="font-medium">{selectedLog.selfWorthTiedToPerformance}</p>
                  </div>
                )}
                
                {selectedLog.overextended && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Overextended</p>
                    <p className="font-medium">{selectedLog.overextended}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Evening Reflection Section */}
            <div className="pb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Evening Reflection (8-10pm)</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditSection('evening')}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedLog.dinner && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Dinner</p>
                    <p className="font-medium">{selectedLog.dinner}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Overall Mood</p>
                  <p className="font-medium">{selectedLog.overallMood}/10</p>
                </div>
                {selectedLog.sleepiness !== undefined && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Sleepiness</p>
                    <p className="font-medium">{selectedLog.sleepiness}/10</p>
                  </div>
                )}
                {selectedLog.medicationEffectiveness && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Medication Effectiveness</p>
                    <p className="font-medium">{selectedLog.medicationEffectiveness}</p>
                  </div>
                )}
                {selectedLog.helpfulFactors && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Helpful Factors</p>
                    <p className="font-medium">{selectedLog.helpfulFactors}</p>
                  </div>
                )}
                {selectedLog.distractingFactors && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Distracting Factors</p>
                    <p className="font-medium">{selectedLog.distractingFactors}</p>
                  </div>
                )}
                {selectedLog.thoughtForTomorrow && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Thought for Tomorrow</p>
                    <p className="font-medium">{selectedLog.thoughtForTomorrow}</p>
                  </div>
                )}
                {selectedLog.dayRating !== undefined && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Day Rating</p>
                    <p className="font-medium">{selectedLog.dayRating}/10</p>
                  </div>
                )}
                {selectedLog.accomplishments && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Accomplishments</p>
                    <p className="font-medium">{selectedLog.accomplishments}</p>
                  </div>
                )}
                {selectedLog.challenges && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Challenges</p>
                    <p className="font-medium">{selectedLog.challenges}</p>
                  </div>
                )}
                {selectedLog.gratitude && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Gratitude</p>
                    <p className="font-medium">{selectedLog.gratitude}</p>
                  </div>
                )}
                {selectedLog.improvements && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Improvements</p>
                    <p className="font-medium">{selectedLog.improvements}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              variant="destructive" 
              onClick={handleDeleteLog}
              className="mr-auto"
            >
              Delete
            </Button>
            <InsightButton 
              dailyLogId={selectedLog.id} 
              isComplete={selectedLog.isComplete} 
              className="mr-2"
            />
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // If loading or not authenticated, show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Daily Log
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your daily mental well-being and medication effectiveness
        </p>
      </div>
      
      {isCreating ? (
        renderCreationForm()
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Recent Logs
            </h2>
            {!dailyLogs.some(log => 
              isSameDay(new Date(log.date), new Date(), user?.timezone || 'America/New_York')
            ) && (
              <Button onClick={() => setIsCreating(true)}>
                Create New Log
              </Button>
            )}
          </div>
          
          {renderLogsList()}
        </>
      )}
      
      {renderViewDialog()}
    </div>
  );
}
