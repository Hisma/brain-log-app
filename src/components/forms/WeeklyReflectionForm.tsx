'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Checkbox } from '@/components/ui/Checkbox';
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
  const [physicalState, setPhysicalState] = useState('');
  const [weekHighlights, setWeekHighlights] = useState('');
  const [weekChallenges, setWeekChallenges] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [averageRuminationScore, setAverageRuminationScore] = useState(5);
  const [stableDaysCount, setStableDaysCount] = useState(0);
  const [medicationEffectiveDays, setMedicationEffectiveDays] = useState(0);
  const [questionedLeavingJob, setQuestionedLeavingJob] = useState(false);
  const [weeklyInsight, setWeeklyInsight] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = {
        weekRating,
        mentalState,
        physicalState,
        weekHighlights,
        weekChallenges,
        lessonsLearned,
        nextWeekFocus,
        averageRuminationScore,
        stableDaysCount,
        medicationEffectiveDays,
        questionedLeavingJob,
        weeklyInsight
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
            <label className="text-sm font-medium">
              Rate Your Week (1-10)
            </label>
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
            <label className="text-sm font-medium" htmlFor="physical-state">
              Physical State
            </label>
            <Select
              value={physicalState}
              onValueChange={setPhysicalState}
              required
            >
              <SelectTrigger id="physical-state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Neutral">Neutral</SelectItem>
                <SelectItem value="Tired">Tired</SelectItem>
                <SelectItem value="Ill">Ill</SelectItem>
                <SelectItem value="In Pain">In Pain</SelectItem>
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
            <label className="text-sm font-medium">
              Average Rumination Score (1-10)
            </label>
            <Slider 
              defaultValue={[averageRuminationScore]}
              max={10}
              step={1}
              onValueChange={(value) => setAverageRuminationScore(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Number of Stable Days
            </label>
            <Slider 
              defaultValue={[stableDaysCount]}
              max={7}
              step={1}
              onValueChange={(value) => setStableDaysCount(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>0</span>
              <span>7</span>
            </div>
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Days Medication Was Effective
            </label>
            <Slider 
              defaultValue={[medicationEffectiveDays]}
              max={7}
              step={1}
              onValueChange={(value) => setMedicationEffectiveDays(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>0</span>
              <span>7</span>
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
            <label className="text-sm font-medium" htmlFor="weekly-insight">
              Weekly Insight
            </label>
            <Textarea 
              id="weekly-insight"
              value={weeklyInsight}
              onChange={(e) => setWeeklyInsight(e.target.value)}
              placeholder="What's your main insight from this week?"
              rows={3}
              required
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
