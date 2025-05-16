'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DailyLogOverview } from '@/components/DailyLogOverview';
import { MorningCheckInForm } from '@/components/forms/MorningCheckInForm';
import { ConcertaDoseLogForm } from '@/components/forms/ConcertaDoseLogForm';
import { MidDayCheckInForm } from '@/components/forms/MidDayCheckInForm';
import { AfternoonCheckInForm } from '@/components/forms/AfternoonCheckInForm';
import { EveningReflectionForm } from '@/components/forms/EveningReflectionForm';
import { dailyLogService, DailyLog } from '@/lib/services/dailyLogService';
import { formatDate } from '@/lib/utils/index';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Edit, ArrowLeft } from 'lucide-react';

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
    cravings: '',
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

  // Handle form submissions
  const handleMorningSubmit = async (data: typeof morningData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      setMorningData(data);
      
      // If we're creating a new log or updating an existing one
      if (isUpdate && dailyLogId) {
        await dailyLogService.updateMorningCheckIn(user.id, dailyLogId, data, true);
      } else {
        // Create a new daily log
        const logId = await dailyLogService.createMorningCheckIn(user.id, {
          date,
          ...data
        });
        setDailyLogId(logId);
      }
      
      // Navigate to the next section or back to overview
      setCurrentSection('overview');
    } catch (error) {
      console.error('Error saving morning check-in:', error);
      alert('Failed to save morning check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMedicationSubmit = async (data: typeof medicationData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      setMedicationData(data);
      
      // If we don't have a daily log ID yet, we need to create one first
      let logId = dailyLogId;
      if (!logId) {
        logId = await dailyLogService.createMorningCheckIn(user.id, {
          date,
          ...morningData
        });
        setDailyLogId(logId);
      }
      
      // Update the medication data
      await dailyLogService.updateConcertaDoseLog(user.id, logId, data, isUpdate);
      
      // Navigate to the next section or back to overview
      setCurrentSection('overview');
    } catch (error) {
      console.error('Error saving medication log:', error);
      alert('Failed to save medication log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMiddaySubmit = async (data: typeof middayData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      setMiddayData(data);
      
      // If we don't have a daily log ID yet, we need to create one first
      let logId = dailyLogId;
      if (!logId) {
        logId = await dailyLogService.createMorningCheckIn(user.id, {
          date,
          ...morningData
        });
        setDailyLogId(logId);
      }
      
      // Update the midday data
      await dailyLogService.updateMidDayCheckIn(user.id, logId, data, isUpdate);
      
      // Navigate to the next section or back to overview
      setCurrentSection('overview');
    } catch (error) {
      console.error('Error saving midday check-in:', error);
      alert('Failed to save midday check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAfternoonSubmit = async (data: typeof afternoonData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      setAfternoonData(data);
      
      // If we don't have a daily log ID yet, we need to create one first
      let logId = dailyLogId;
      if (!logId) {
        logId = await dailyLogService.createMorningCheckIn(user.id, {
          date,
          ...morningData
        });
        setDailyLogId(logId);
      }
      
      // Update the afternoon data
      await dailyLogService.updateAfternoonCheckIn(user.id, logId, data, isUpdate);
      
      // Navigate to the next section or back to overview
      setCurrentSection('overview');
    } catch (error) {
      console.error('Error saving afternoon check-in:', error);
      alert('Failed to save afternoon check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEveningSubmit = async (data: typeof eveningData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      setEveningData(data);
      
      // If we don't have a daily log ID yet, we need to create one first
      let logId = dailyLogId;
      if (!logId) {
        logId = await dailyLogService.createMorningCheckIn(user.id, {
          date,
          ...morningData
        });
        setDailyLogId(logId);
      }
      
      // Update the evening data
      await dailyLogService.updateEveningReflection(user.id, logId, data, isUpdate);
      
      // Navigate to the next section or back to overview
      setCurrentSection('overview');
    } catch (error) {
      console.error('Error saving evening reflection:', error);
      alert('Failed to save evening reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewLog = async (log: DailyLog) => {
    setSelectedLog(log);
    setIsViewModalOpen(true);
    
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
      cravings: log.cravings || '',
      mainTrigger: log.mainTrigger || '',
      responseMethod: log.responseMethod || [],
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
                  {formatDate(new Date(log.date), { weekday: 'short', month: 'short', day: 'numeric' })}
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
          />
        ) : currentSection === 'morning' ? (
          <MorningCheckInForm 
            initialValues={morningData}
            isUpdate={isUpdate}
            dailyLogId={dailyLogId || undefined}
            onSubmit={handleMorningSubmit}
            onBack={() => setCurrentSection('overview')}
          />
        ) : currentSection === 'medication' ? (
          <ConcertaDoseLogForm 
            initialValues={medicationData}
            isUpdate={isUpdate}
            dailyLogId={dailyLogId || undefined}
            onSubmit={handleMedicationSubmit}
            onBack={() => setCurrentSection('overview')}
          />
        ) : currentSection === 'midday' ? (
          <MidDayCheckInForm 
            initialValues={middayData}
            isUpdate={isUpdate}
            dailyLogId={dailyLogId || undefined}
            onSubmit={handleMiddaySubmit}
            onBack={() => setCurrentSection('overview')}
          />
        ) : currentSection === 'afternoon' ? (
          <AfternoonCheckInForm 
            initialValues={afternoonData}
            isUpdate={isUpdate}
            dailyLogId={dailyLogId || undefined}
            onSubmit={handleAfternoonSubmit}
            onBack={() => setCurrentSection('overview')}
          />
        ) : (
          <EveningReflectionForm 
            initialValues={eveningData}
            isUpdate={isUpdate}
            dailyLogId={dailyLogId || undefined}
            onSubmit={handleEveningSubmit}
            onBack={() => setCurrentSection('overview')}
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
                {selectedLog.cravings && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Cravings</p>
                    <p className="font-medium">{selectedLog.cravings}</p>
                  </div>
                )}
                {selectedLog.mainTrigger && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Main Trigger</p>
                    <p className="font-medium">{selectedLog.mainTrigger}</p>
                  </div>
                )}
                {selectedLog.responseMethod && selectedLog.responseMethod.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Response Methods</p>
                    <p className="font-medium">{selectedLog.responseMethod.join(', ')}</p>
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
            <Button onClick={() => setIsCreating(true)}>
              Create New Log
            </Button>
          </div>
          
          {renderLogsList()}
        </>
      )}
      
      {renderViewDialog()}
    </div>
  );
}
