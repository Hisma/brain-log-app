'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeeklyReflectionForm } from '@/components/forms/WeeklyReflectionForm';
import { weeklyReflectionService, WeeklyReflection } from '@/lib/services/weeklyReflectionService';
import { formatDate, formatWeekRange, getWeekRange } from '@/lib/utils/index';
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

export default function WeeklyReflectionPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState<WeeklyReflection | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflection[]>([]);
  const [isLoadingReflections, setIsLoadingReflections] = useState(true);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Get current week range
  const { startDate, endDate } = getWeekRange();
  
  // Fetch weekly reflections using API
  useEffect(() => {
    async function fetchWeeklyReflections() {
      if (user) {
        try {
          setIsLoadingReflections(true);
          const reflections = await weeklyReflectionService.getRecent(user.id, 10);
          setWeeklyReflections(reflections);
        } catch (error) {
          console.error('Error fetching weekly reflections:', error);
        } finally {
          setIsLoadingReflections(false);
        }
      }
    }
    
    fetchWeeklyReflections();
  }, [user, isCreating]); // Re-fetch when user changes or after creating a new reflection

  const handleSubmit = async (data: Omit<WeeklyReflection, 'id' | 'weekStartDate' | 'weekEndDate' | 'userId'>) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      await weeklyReflectionService.createWeeklyReflection(user.id, {
        ...data,
        weekStartDate: startDate,
        weekEndDate: endDate
      });
      
      // Reset form and close creation mode
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving weekly reflection:', error);
      alert('Failed to save weekly reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReflection = (reflection: WeeklyReflection) => {
    setSelectedReflection(reflection);
    setIsViewModalOpen(true);
  };

  const renderReflectionsList = () => {
    if (isLoadingReflections) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading weekly reflections...</p>
        </div>
      );
    }
    
    if (!weeklyReflections || weeklyReflections.length === 0) {
      return (
        <div className="p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No weekly reflections found</p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking your weekly progress by creating your first reflection.
          </p>
          <Button onClick={() => setIsCreating(true)}>
            Create Your First Reflection
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {weeklyReflections.map((reflection) => (
          <Card 
            key={reflection.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleViewReflection(reflection)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">
                  {formatWeekRange(new Date(reflection.weekStartDate), new Date(reflection.weekEndDate))}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  (reflection.weekRating || 0) >= 8 ? 'bg-green-100 text-green-800' :
                  (reflection.weekRating || 0) >= 5 ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {reflection.weekRating || 0}/10
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Mental:</span> {reflection.mentalState}
                </div>
                <div>
                  <span className="font-medium">Physical:</span> {reflection.physicalState}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">New Weekly Reflection</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {formatWeekRange(startDate, endDate)}
          </p>
        </div>

        <WeeklyReflectionForm 
          onSubmit={handleSubmit}
          onBack={() => setIsCreating(false)}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    );
  };

  const handleDeleteReflection = async () => {
    if (!selectedReflection || !user) return;
    
    try {
      await weeklyReflectionService.deleteWeeklyReflection(user.id, selectedReflection.id);
      setIsViewModalOpen(false);
      
      // Refresh the reflections list
      const updatedReflections = await weeklyReflectionService.getRecent(user.id, 10);
      setWeeklyReflections(updatedReflections);
    } catch (error) {
      console.error('Error deleting reflection:', error);
      alert('Failed to delete reflection. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in">
      {!isCreating ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Weekly Reflections</h1>
            <Button onClick={() => setIsCreating(true)}>
              Create New Reflection
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            {renderReflectionsList()}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              About Weekly Reflections
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Weekly reflections help you track your progress and identify patterns over time:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mb-4">
              <li>Reflect on your week's highlights and challenges</li>
              <li>Identify lessons learned and areas for growth</li>
              <li>Set intentions for the upcoming week</li>
              <li>Track your mental and physical well-being</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-400">
              Taking time to reflect weekly helps build self-awareness and promotes continuous personal growth.
            </p>
          </div>
        </>
      ) : (
        renderCreationForm()
      )}

      {/* View Reflection Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={(open) => setIsViewModalOpen(open)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedReflection ? `Weekly Reflection: ${formatWeekRange(new Date(selectedReflection.weekStartDate), new Date(selectedReflection.weekEndDate))}` : 'Weekly Reflection'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReflection && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Week Rating</p>
                  <p className="font-medium">{selectedReflection.weekRating}/10</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Mental State</p>
                  <p className="font-medium">{selectedReflection.mentalState}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Physical State</p>
                  <p className="font-medium">{selectedReflection.physicalState}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Week Highlights</p>
                <p className="font-medium">{selectedReflection.weekHighlights || 'Not specified'}</p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Week Challenges</p>
                <p className="font-medium">{selectedReflection.weekChallenges || 'Not specified'}</p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Lessons Learned</p>
                <p className="font-medium">{selectedReflection.lessonsLearned || 'Not specified'}</p>
              </div>

              <div>
                <p className="text-gray-500 dark:text-gray-400">Next Week Focus</p>
                <p className="font-medium">{selectedReflection.nextWeekFocus || 'Not specified'}</p>
              </div>

              <DialogFooter className="flex justify-end space-x-2">
                <Button 
                  onClick={handleDeleteReflection}
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
