'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { isSameDay } from '@/lib/utils/timezone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Edit, ChevronRight } from 'lucide-react';
import { DailyLog, getDailyLogByDate, getDailyLogById, dailyLogService } from '@/lib/services/dailyLogService';

interface DailyLogOverviewProps {
  date: Date;
  userId: number;
  onNavigate: (section: string, isUpdate: boolean) => void;
  dailyLogId?: number | null;
}

export function DailyLogOverview({ date, userId, onNavigate, dailyLogId }: DailyLogOverviewProps) {
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  useEffect(() => {
    const fetchDailyLog = async () => {
      setLoading(true);
      try {
        let log = null;
        
        // If we have a dailyLogId, use it to fetch the log directly
        if (dailyLogId) {
          log = await getDailyLogById(userId, dailyLogId);
        } else {
          // Otherwise, fetch by date
          // Use getDailyLogByDate which now uses the improved timezone-aware date comparison
          log = await getDailyLogByDate(userId, date);
          
          // Log for debugging
          console.log('Fetched log by date:', log ? 'Found' : 'Not found');
        }
        
        // Calculate completion percentage and check if all sections are complete
        if (log) {
          const completedSections = [
            log.morningCompleted,
            log.medicationCompleted,
            log.middayCompleted,
            log.afternoonCompleted,
            log.eveningCompleted
          ].filter(Boolean).length;
          
          setCompletionPercentage((completedSections / 5) * 100);
          
          // Add debug logging for the log date
          const logDate = new Date(log.date);
          console.log('Log date:', logDate);
          console.log('Current date:', date);
          console.log('Same day check:', isSameDay(logDate, date, 'America/New_York'));
          
          // Check if all sections are complete but isComplete is false
          const allSectionsComplete = completedSections === 5;
          if (allSectionsComplete && !log.isComplete) {
            // Update the isComplete status
            await dailyLogService.checkDailyLogCompletion(userId, log.id);
            
            // Fetch the updated log
            if (dailyLogId) {
              const updatedLog = await getDailyLogById(userId, dailyLogId);
              setDailyLog(updatedLog);
            } else {
              const updatedLog = await getDailyLogByDate(userId, date);
              setDailyLog(updatedLog);
            }
          } else {
            setDailyLog(log);
          }
        } else {
          setCompletionPercentage(0);
          setDailyLog(null);
        }
      } catch (error) {
        console.error('Error fetching daily log:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyLog();
  }, [date, userId, dailyLogId]);
  
  const sections = [
    {
      id: 'morning',
      name: 'Morning Check-In',
      timeBlock: '7-9am',
      completed: dailyLog?.morningCompleted || false,
      action: () => onNavigate('morning', !!dailyLog?.morningCompleted)
    },
    {
      id: 'medication',
      name: 'Concerta Dose Log',
      timeBlock: '9-10am',
      completed: dailyLog?.medicationCompleted || false,
      action: () => onNavigate('medication', !!dailyLog?.medicationCompleted)
    },
    {
      id: 'midday',
      name: 'Mid-day Check-In',
      timeBlock: '11am-1pm',
      completed: dailyLog?.middayCompleted || false,
      action: () => onNavigate('midday', !!dailyLog?.middayCompleted)
    },
    {
      id: 'afternoon',
      name: 'Afternoon Check-In',
      timeBlock: '3-5pm',
      completed: dailyLog?.afternoonCompleted || false,
      action: () => onNavigate('afternoon', !!dailyLog?.afternoonCompleted)
    },
    {
      id: 'evening',
      name: 'Evening Reflection',
      timeBlock: '8-10pm',
      completed: dailyLog?.eveningCompleted || false,
      action: () => onNavigate('evening', !!dailyLog?.eveningCompleted)
    }
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Daily Log - {format(date, 'MMMM d, yyyy')}</span>
          {dailyLog?.isComplete && (
            <span className="text-sm text-green-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : (
          <>
            <div className="space-y-4">
              {sections.map((section) => (
                <div 
                  key={section.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center">
                    {section.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground mr-3" />
                    )}
                    <div>
                      <div className="font-medium">{section.name}</div>
                      <div className="text-sm text-muted-foreground">{section.timeBlock}</div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={section.action}
                    className="flex items-center"
                  >
                    {section.completed ? (
                      <>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </>
                    ) : (
                      <>
                        Start
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Completion</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground text-center mt-1">
                {dailyLog?.isComplete 
                  ? 'All sections completed' 
                  : `${sections.filter(s => s.completed).length} of ${sections.length} sections completed`}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
