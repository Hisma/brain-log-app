'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MorningCheckInForm } from '@/components/forms/MorningCheckInForm';
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

export default function DailyLogPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'morning' | 'evening'>('morning');
  const [date] = useState(new Date());
  const [morningData, setMorningData] = useState({
    sleepHours: 7,
    sleepQuality: 5,
    dreams: '',
    morningMood: 5,
    physicalStatus: '',
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

  const handleMorningSubmit = async (data: typeof morningData) => {
    setMorningData(data);
    setCurrentStep('evening');
  };

  const handleEveningSubmit = async (eveningData: {
    dayRating: number;
    accomplishments: string;
    challenges: string;
    gratitude: string;
    improvements: string;
    isComplete: boolean;
  }) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      // First save the morning data
      const logId = await dailyLogService.createMorningCheckIn(user.id, {
        date,
        ...morningData
      });
      
      // Then save the evening data
      await dailyLogService.updateEndOfDayReflection(user.id, logId, {
        overallMood: eveningData.dayRating,
        medicationEffectiveness: '',
        helpfulFactors: '',
        distractingFactors: '',
        thoughtForTomorrow: '',
        dayRating: eveningData.dayRating,
        accomplishments: eveningData.accomplishments,
        challenges: eveningData.challenges,
        gratitude: eveningData.gratitude,
        improvements: eveningData.improvements
      });
      
      // Reset form and close creation mode
      setIsCreating(false);
      setCurrentStep('morning');
    } catch (error) {
      console.error('Error saving daily log:', error);
      alert('Failed to save daily log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewLog = (log: DailyLog) => {
    setSelectedLog(log);
    setIsViewModalOpen(true);
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
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderCreationForm = () => {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">New Daily Log</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-md">
            <CardHeader>
              <CardTitle>Daily Log Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="relative">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                      <div 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500`}
                        style={{ width: currentStep === 'morning' ? '50%' : '100%' }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                  {currentStep === 'morning' ? '1/2' : '2/2'}
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div className={currentStep === 'morning' ? 'font-bold text-primary-600' : ''}>Morning Check-In</div>
                <div className={currentStep === 'evening' ? 'font-bold text-primary-600' : ''}>Evening Reflection</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {currentStep === 'morning' ? (
          <MorningCheckInForm 
            initialValues={morningData}
            onSubmit={handleMorningSubmit}
            onNext={() => setCurrentStep('evening')}
          />
        ) : (
          <EveningReflectionForm
            onSubmit={handleEveningSubmit}
            onBack={() => setCurrentStep('morning')}
          />
        )}

        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setIsCreating(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          {currentStep === 'evening' && (
            <Button 
              onClick={() => {
                handleEveningSubmit({
                  dayRating: 5,
                  accomplishments: '',
                  challenges: '',
                  gratitude: '',
                  improvements: '',
                  isComplete: false
                });
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const handleDeleteLog = async () => {
    if (!selectedLog || !user) return;
    
    try {
      await dailyLogService.deleteDailyLog(user.id, selectedLog.id);
      setIsViewModalOpen(false);
      
      // Refresh the logs list
      const updatedLogs = await dailyLogService.getRecent(user.id, 10);
      setDailyLogs(updatedLogs);
    } catch (error) {
      console.error('Error deleting log:', error);
      alert('Failed to delete log. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in">
      {!isCreating ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Daily Logs</h1>
            <Button onClick={() => setIsCreating(true)}>
              Create New Log
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            {renderLogsList()}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              About Daily Logs
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Daily logs help you track various aspects of your mental well-being throughout the day:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li>Morning check-in to assess sleep quality and mood</li>
              <li>Evening reflection on your day's accomplishments and challenges</li>
              <li>Gratitude practice to improve mental well-being</li>
              <li>Track patterns in your mood and sleep quality over time</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400">
              By consistently tracking these factors, you&apos;ll gain valuable insights into patterns affecting your mental health.
            </p>
          </div>
        </>
      ) : (
        renderCreationForm()
      )}

      {/* View Log Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={(open) => setIsViewModalOpen(open)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedLog ? `Daily Log: ${formatDate(new Date(selectedLog.date))}` : 'Daily Log'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Morning Check-In</h3>
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
                </div>
                {selectedLog.dreams && (
                  <div className="mt-2">
                    <p className="text-gray-500 dark:text-gray-400">Dreams</p>
                    <p className="font-medium">{selectedLog.dreams}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Evening Reflection</h3>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Day Rating</p>
                    <p className="font-medium">{selectedLog.dayRating}/10</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Accomplishments</p>
                    <p className="font-medium">{selectedLog.accomplishments || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Challenges</p>
                    <p className="font-medium">{selectedLog.challenges || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Gratitude</p>
                    <p className="font-medium">{selectedLog.gratitude || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Improvements for Tomorrow</p>
                    <p className="font-medium">{selectedLog.improvements || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-end space-x-2">
                <Button 
                  onClick={handleDeleteLog}
                  variant="destructive"
                >
                  Delete
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
