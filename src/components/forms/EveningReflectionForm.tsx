'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { updateEveningReflection } from '@/lib/services/dailyLogService';

interface EveningReflectionFormProps {
  initialValues?: {
    dinner?: string;
    overallMood?: number;
    sleepiness?: number;
    medicationEffectiveness?: string;
    helpfulFactors?: string;
    distractingFactors?: string;
    thoughtForTomorrow?: string;
    tomorrowPlan?: string;
    dayRating?: number;
    accomplishments?: string;
    challenges?: string;
    gratitude?: string;
    improvements?: string;
  };
  isUpdate?: boolean;
  dailyLogId?: number;
  onSubmit?: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function EveningReflectionForm({ 
  initialValues, 
  isUpdate = false,
  dailyLogId,
  onSubmit, 
  onNext,
  onBack 
}: EveningReflectionFormProps) {
  const [dinner, setDinner] = useState(initialValues?.dinner || '');
  const [overallMood, setOverallMood] = useState(initialValues?.overallMood || 5);
  const [sleepiness, setSleepiness] = useState(initialValues?.sleepiness || 5);
  const [medicationEffectiveness, setMedicationEffectiveness] = useState(initialValues?.medicationEffectiveness || '');
  const [helpfulFactors, setHelpfulFactors] = useState(initialValues?.helpfulFactors || '');
  const [distractingFactors, setDistractingFactors] = useState(initialValues?.distractingFactors || '');
  const [thoughtForTomorrow, setThoughtForTomorrow] = useState(initialValues?.thoughtForTomorrow || '');
  const [tomorrowPlan, setTomorrowPlan] = useState(initialValues?.tomorrowPlan || '');
  const [dayRating, setDayRating] = useState(initialValues?.dayRating || 5);
  const [accomplishments, setAccomplishments] = useState(initialValues?.accomplishments || '');
  const [challenges, setChallenges] = useState(initialValues?.challenges || '');
  const [gratitude, setGratitude] = useState(initialValues?.gratitude || '');
  const [improvements, setImprovements] = useState(initialValues?.improvements || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = {
        dinner,
        overallMood,
        sleepiness,
        medicationEffectiveness,
        helpfulFactors,
        distractingFactors,
        thoughtForTomorrow,
        tomorrowPlan,
        dayRating,
        accomplishments,
        challenges,
        gratitude,
        improvements
      };
      
      // Get the user ID from the session
      // For now, we'll use a placeholder user ID of 1
      // This should be replaced with the actual user ID from the session
      const userId = 1;
      
      // For now, we'll use a placeholder log ID if not provided
      const logId = dailyLogId || 1;
      
      // Save the evening reflection data
      await updateEveningReflection(userId, logId, data, isUpdate);
      
      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      console.error('Error saving evening reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evening Reflection (8-10pm)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="dinner">
              Dinner
            </label>
            <Input 
              id="dinner"
              value={dinner}
              onChange={(e) => setDinner(e.target.value)}
              placeholder="What did you eat for dinner?"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">
                Overall Mood Today (1-10)
              </label>
              <span className="text-sm font-medium">{overallMood}</span>
            </div>
            <Slider 
              defaultValue={[overallMood]}
              max={10}
              step={1}
              onValueChange={(value) => setOverallMood(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>Very Low</span>
              <span>Very High</span>
            </div>
          </div>
        
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">
                Sleepiness Level (1-10)
              </label>
              <span className="text-sm font-medium">{sleepiness}</span>
            </div>
            <Slider 
              defaultValue={[sleepiness]}
              max={10}
              step={1}
              onValueChange={(value) => setSleepiness(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>Wide Awake</span>
              <span>Very Sleepy</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="medication-effectiveness">
              Medication Effectiveness
            </label>
            <Select
              value={medicationEffectiveness}
              onValueChange={setMedicationEffectiveness}
              required
            >
              <SelectTrigger id="medication-effectiveness">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="helpful-factors">
              What helped you today?
            </label>
            <Textarea 
              id="helpful-factors"
              value={helpfulFactors}
              onChange={(e) => setHelpfulFactors(e.target.value)}
              placeholder="List factors that helped your focus and mood"
              rows={3}
            />
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="distracting-factors">
              What distracted you today?
            </label>
            <Textarea 
              id="distracting-factors"
              value={distractingFactors}
              onChange={(e) => setDistractingFactors(e.target.value)}
              placeholder="List factors that hindered your focus and mood"
              rows={3}
            />
          </div>
        
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">
                Rate Your Day (1-10)
              </label>
              <span className="text-sm font-medium">{dayRating}</span>
            </div>
            <Slider 
              defaultValue={[dayRating]}
              max={10}
              step={1}
              onValueChange={(value) => setDayRating(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>Very Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="accomplishments">
              Today's Accomplishments
            </label>
            <Textarea 
              id="accomplishments"
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              placeholder="What did you accomplish today?"
              rows={3}
            />
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="challenges">
              Today's Challenges
            </label>
            <Textarea 
              id="challenges"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="What challenges did you face today?"
              rows={3}
            />
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="gratitude">
              Gratitude
            </label>
            <Textarea 
              id="gratitude"
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="What are you grateful for today?"
              rows={3}
            />
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="improvements">
              Areas for Improvement
            </label>
            <Textarea 
              id="improvements"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="What could you improve on?"
              rows={3}
            />
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="thought-for-tomorrow">
              Thought for Tomorrow
            </label>
            <Textarea 
              id="thought-for-tomorrow"
              value={thoughtForTomorrow}
              onChange={(e) => setThoughtForTomorrow(e.target.value)}
              placeholder="What's one thing you want to remember for tomorrow?"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="tomorrow-plan">
              Tomorrow's Plan
            </label>
            <Textarea 
              id="tomorrow-plan"
              value={tomorrowPlan}
              onChange={(e) => setTomorrowPlan(e.target.value)}
              placeholder="What's your plan for tomorrow?"
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
              className={onBack ? "ml-auto" : "w-full"}
            >
              {isSubmitting ? 'Saving...' : isUpdate ? 'Update' : onNext ? 'Next' : 'Complete Daily Log'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
