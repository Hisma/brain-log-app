'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { updateEndOfDayReflection } from '@/lib/services/dailyLogService';

interface EveningReflectionFormProps {
  onSubmit?: (data: any) => void;
  onBack?: () => void;
}

export function EveningReflectionForm({ onSubmit, onBack }: EveningReflectionFormProps) {
  const [overallMood, setOverallMood] = useState(5);
  const [medicationEffectiveness, setMedicationEffectiveness] = useState('');
  const [helpfulFactors, setHelpfulFactors] = useState('');
  const [distractingFactors, setDistractingFactors] = useState('');
  const [thoughtForTomorrow, setThoughtForTomorrow] = useState('');
  const [dayRating, setDayRating] = useState(5);
  const [accomplishments, setAccomplishments] = useState('');
  const [challenges, setChallenges] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = {
        overallMood,
        medicationEffectiveness,
        helpfulFactors,
        distractingFactors,
        thoughtForTomorrow,
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
      
      // For now, we'll use a placeholder log ID of 1
      // In a real implementation, this would be passed as a prop or retrieved from the current log
      const logId = 1;
      
      // Save the evening reflection data
      await updateEndOfDayReflection(userId, logId, data);
      
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
        <CardTitle>Evening Reflection</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Overall Mood Today (1-10)
            </label>
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
            <label className="text-sm font-medium">
              Rate Your Day (1-10)
            </label>
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
              {isSubmitting ? 'Saving...' : 'Complete Daily Log'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
