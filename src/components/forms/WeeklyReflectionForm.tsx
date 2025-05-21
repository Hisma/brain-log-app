'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { createWeeklyReflection } from '@/lib/services/weeklyReflectionService';

interface WeeklyReflectionFormProps {
  startDate: Date;
  endDate: Date;
  onSubmit?: (data: any) => void;
  onBack?: () => void;
}

export function WeeklyReflectionForm({ 
  startDate, 
  endDate, 
  onSubmit,
  onBack
}: WeeklyReflectionFormProps) {
  // Rename for internal consistency
  const weekStartDate = startDate;
  const weekEndDate = endDate;
  const [weekRating, setWeekRating] = useState(5);
  const [mentalState, setMentalState] = useState('');
  const [weekHighlights, setWeekHighlights] = useState('');
  const [weekChallenges, setWeekChallenges] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [questionedLeavingJob, setQuestionedLeavingJob] = useState(false);
  const [gymDaysCount, setGymDaysCount] = useState(0);
  const [dietRating, setDietRating] = useState(5);
  const [memorableFamilyActivities, setMemorableFamilyActivities] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = {
        weekRating,
        mentalState,
        weekHighlights,
        weekChallenges,
        lessonsLearned,
        nextWeekFocus,
        questionedLeavingJob,
        gymDaysCount,
        dietRating,
        memorableFamilyActivities
      };
      
      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      console.error('Error saving weekly reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Reflection</CardTitle>
        <CardDescription>
          Week of {weekStartDate.toLocaleDateString()} to {weekEndDate.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">
                Rate Your Week (1-10)
              </label>
              <span className="text-sm font-medium">{weekRating}</span>
            </div>
            <Slider 
              defaultValue={[weekRating]}
              max={10}
              step={1}
              onValueChange={(value) => setWeekRating(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>Very Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="mental-state">
              Mental State
            </label>
            <Select
              value={mentalState}
              onValueChange={setMentalState}
              required
            >
              <SelectTrigger id="mental-state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Neutral">Neutral</SelectItem>
                <SelectItem value="Struggling">Struggling</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="week-highlights">
              Week Highlights
            </label>
            <Textarea 
              id="week-highlights"
              value={weekHighlights}
              onChange={(e) => setWeekHighlights(e.target.value)}
              placeholder="What were the highlights of your week?"
              rows={3}
              required
            />
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="week-challenges">
              Week Challenges
            </label>
            <Textarea 
              id="week-challenges"
              value={weekChallenges}
              onChange={(e) => setWeekChallenges(e.target.value)}
              placeholder="What challenges did you face this week?"
              rows={3}
              required
            />
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="lessons-learned">
              Lessons Learned
            </label>
            <Textarea 
              id="lessons-learned"
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              placeholder="What did you learn this week?"
              rows={3}
              required
            />
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="next-week-focus">
              Next Week Focus
            </label>
            <Textarea 
              id="next-week-focus"
              value={nextWeekFocus}
              onChange={(e) => setNextWeekFocus(e.target.value)}
              placeholder="What will you focus on next week?"
              rows={3}
              required
            />
          </div>
        
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">
                Number of Gym Days This Week
              </label>
              <span className="text-sm font-medium">{gymDaysCount}</span>
            </div>
            <Slider 
              defaultValue={[gymDaysCount]}
              max={7}
              step={1}
              onValueChange={(value) => setGymDaysCount(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>0</span>
              <span>7</span>
            </div>
          </div>
        
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">
                Diet Rating (1-10)
              </label>
              <span className="text-sm font-medium">{dietRating}</span>
            </div>
            <Slider 
              defaultValue={[dietRating]}
              max={10}
              step={1}
              onValueChange={(value) => setDietRating(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        
          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="questionedLeavingJob"
              checked={questionedLeavingJob}
              onCheckedChange={(checked) => setQuestionedLeavingJob(checked as boolean)}
            />
            <label htmlFor="questionedLeavingJob" className="text-sm font-medium">
              I questioned leaving my job this week
            </label>
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="memorable-family-activities">
              Memorable Family Activities
            </label>
            <Textarea 
              id="memorable-family-activities"
              value={memorableFamilyActivities}
              onChange={(e) => setMemorableFamilyActivities(e.target.value)}
              placeholder="What memorable activities did you do with family this week?"
              rows={3}
            />
          </div>
        
          <div className="flex justify-between mt-6">
            {onBack && (
              <Button 
                type="button"
                variant="outline"
                onClick={onBack}
              >
                Back
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className={onBack ? "" : "w-full"}
            >
              {isSubmitting ? 'Saving...' : 'Save Weekly Reflection'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
