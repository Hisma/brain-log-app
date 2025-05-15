'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { createMorningCheckIn } from '@/lib/services/dailyLogService';

interface MorningCheckInFormProps {
  initialValues?: {
    sleepHours: number;
    sleepQuality: number;
    dreams: string;
    morningMood: number;
    physicalStatus: string;
  };
  onSubmit?: (data: any) => void;
  onNext?: () => void;
}

export function MorningCheckInForm({ initialValues, onSubmit, onNext }: MorningCheckInFormProps) {
  const [sleepHours, setSleepHours] = useState(initialValues?.sleepHours || 7);
  const [sleepQuality, setSleepQuality] = useState(initialValues?.sleepQuality || 5);
  const [dreams, setDreams] = useState(initialValues?.dreams || '');
  const [morningMood, setMorningMood] = useState(initialValues?.morningMood || 5);
  const [physicalStatus, setPhysicalStatus] = useState(initialValues?.physicalStatus || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = {
        date: new Date(),
        sleepHours,
        sleepQuality,
        dreams,
        morningMood,
        physicalStatus
      };
      
      // Get the user ID from the session
      // For now, we'll use a placeholder user ID of 1
      // This should be replaced with the actual user ID from the session
      const userId = 1;
      
      // Save the morning check-in data
      await createMorningCheckIn(userId, data);
      
      if (onSubmit) {
        onSubmit(data);
      }
      
      if (onNext) {
        onNext();
      }
    } catch (error) {
      console.error('Error saving morning check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Morning Check-In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="sleep-hours">
              Hours of Sleep
            </label>
            <Input 
              id="sleep-hours"
              type="number" 
              min={0} 
              max={24} 
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              required
            />
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Sleep Quality (1-10)
            </label>
            <Slider 
              defaultValue={[sleepQuality]}
              max={10}
              step={1}
              onValueChange={(value) => setSleepQuality(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="dreams">
              Dreams or Sleep Notes
            </label>
            <Textarea 
              id="dreams"
              value={dreams}
              onChange={(e) => setDreams(e.target.value)}
              placeholder="Describe any dreams or notes about your sleep"
              rows={3}
            />
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Morning Mood (1-10)
            </label>
            <Slider 
              defaultValue={[morningMood]}
              max={10}
              step={1}
              onValueChange={(value) => setMorningMood(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>Very Low</span>
              <span>Very High</span>
            </div>
          </div>
        
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="physical-status">
              Physical Status
            </label>
            <Select
              value={physicalStatus}
              onValueChange={setPhysicalStatus}
              required
            >
              <SelectTrigger id="physical-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Energetic">Energetic</SelectItem>
                <SelectItem value="Rested">Rested</SelectItem>
                <SelectItem value="Neutral">Neutral</SelectItem>
                <SelectItem value="Tired">Tired</SelectItem>
                <SelectItem value="Exhausted">Exhausted</SelectItem>
                <SelectItem value="Pain">In Pain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        
          <div className="flex justify-end mt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Saving...' : onNext ? 'Next' : 'Save Morning Check-In'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
