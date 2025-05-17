'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { updateAfternoonCheckIn } from '@/lib/services/dailyLogService';

interface AfternoonCheckInFormProps {
  initialValues?: {
    afternoonSnack?: string;
    isCrashing?: boolean;
    crashSymptoms?: string;
    secondDoseTaken?: boolean;
    secondDoseTime?: Date;
    anxietyLevel?: number;
    isFeeling?: string;
    hadTriggeringInteraction?: boolean;
    interactionDetails?: string;
    selfWorthTiedToPerformance?: string;
    overextended?: string;
  };
  isUpdate?: boolean;
  dailyLogId?: number;
  onSubmit?: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function AfternoonCheckInForm({ 
  initialValues, 
  isUpdate = false,
  dailyLogId,
  onSubmit, 
  onNext, 
  onBack 
}: AfternoonCheckInFormProps) {
  const [afternoonSnack, setAfternoonSnack] = useState(initialValues?.afternoonSnack || '');
  const [isCrashing, setIsCrashing] = useState(initialValues?.isCrashing || false);
  const [crashSymptoms, setCrashSymptoms] = useState(initialValues?.crashSymptoms || '');
  const [secondDoseTaken, setSecondDoseTaken] = useState(initialValues?.secondDoseTaken || false);
  const [secondDoseTime, setSecondDoseTime] = useState<Date | undefined>(initialValues?.secondDoseTime);
  const [anxietyLevel, setAnxietyLevel] = useState(initialValues?.anxietyLevel || 3);
  const [isFeeling, setIsFeeling] = useState(initialValues?.isFeeling || '');
  const [hadTriggeringInteraction, setHadTriggeringInteraction] = useState(initialValues?.hadTriggeringInteraction || false);
  const [interactionDetails, setInteractionDetails] = useState(initialValues?.interactionDetails || '');
  const [selfWorthTiedToPerformance, setSelfWorthTiedToPerformance] = useState(initialValues?.selfWorthTiedToPerformance || '');
  const [overextended, setOverextended] = useState(initialValues?.overextended || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = {
        afternoonSnack,
        isCrashing,
        crashSymptoms: isCrashing ? crashSymptoms : '',
        secondDoseTaken,
        secondDoseTime: secondDoseTaken ? secondDoseTime : undefined,
        anxietyLevel,
        isFeeling,
        hadTriggeringInteraction,
        interactionDetails: hadTriggeringInteraction ? interactionDetails : '',
        selfWorthTiedToPerformance,
        overextended
      };
      
      // Get the user ID from the session
      // For now, we'll use a placeholder user ID of 1
      // This should be replaced with the actual user ID from the session
      const userId = 1;
      
      // For now, we'll use a placeholder log ID if not provided
      const logId = dailyLogId || 1;
      
      // Save the afternoon check-in data
      await updateAfternoonCheckIn(userId, logId, data, isUpdate);
      
      if (onSubmit) {
        onSubmit(data);
      }
      
      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error('Error saving afternoon check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Afternoon Check-In (3-5pm)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="afternoon-snack">
              Afternoon Snack
            </label>
            <Input 
              id="afternoon-snack"
              value={afternoonSnack}
              onChange={(e) => setAfternoonSnack(e.target.value)}
              placeholder="What did you eat for an afternoon snack?"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is-crashing" 
              checked={isCrashing} 
              onCheckedChange={(checked) => setIsCrashing(checked === true)}
            />
            <label 
              htmlFor="is-crashing" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Concerta Wearing Off / Crashing
            </label>
          </div>
          
          {isCrashing && (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="crash-symptoms">
                Crash Symptoms
              </label>
              <Textarea 
                id="crash-symptoms"
                value={crashSymptoms}
                onChange={(e) => setCrashSymptoms(e.target.value)}
                placeholder="Describe your crash symptoms"
                rows={2}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">
                Anxiety Level (1-10)
              </label>
              <span className="text-sm font-medium">{anxietyLevel}</span>
            </div>
            <Slider 
              defaultValue={[anxietyLevel]}
              max={10}
              step={1}
              onValueChange={(value) => setAnxietyLevel(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>No Anxiety</span>
              <span>Extreme Anxiety</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="is-feeling">
              Current Mental/Physical State
            </label>
            <Textarea 
              id="is-feeling"
              value={isFeeling}
              onChange={(e) => setIsFeeling(e.target.value)}
              placeholder="Describe how you're feeling mentally and physically right now"
              rows={2}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="had-triggering-interaction" 
              checked={hadTriggeringInteraction} 
              onCheckedChange={(checked) => setHadTriggeringInteraction(checked === true)}
            />
            <label 
              htmlFor="had-triggering-interaction" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Had Triggering Social Interaction
            </label>
          </div>
          
          {hadTriggeringInteraction && (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="interaction-details">
                Interaction Details
              </label>
              <Textarea 
                id="interaction-details"
                value={interactionDetails}
                onChange={(e) => setInteractionDetails(e.target.value)}
                placeholder="Describe the triggering interaction"
                rows={2}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="self-worth">
              Self-Worth Tied to Performance Today
            </label>
            <Select
              value={selfWorthTiedToPerformance}
              onValueChange={setSelfWorthTiedToPerformance}
              required
            >
              <SelectTrigger id="self-worth">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Strongly">Strongly</SelectItem>
                <SelectItem value="Mildly">Mildly</SelectItem>
                <SelectItem value="Not at all">Not at all</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="overextended">
              Did You Overextend Yourself?
            </label>
            <Select
              value={overextended}
              onValueChange={setOverextended}
              required
            >
              <SelectTrigger id="overextended">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Not sure">Not sure</SelectItem>
              </SelectContent>
            </Select>
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
              {isSubmitting ? 'Saving...' : isUpdate ? 'Update' : onNext ? 'Next' : 'Save Afternoon Check-In'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
