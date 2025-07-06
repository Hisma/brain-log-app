'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

interface MidDayCheckInFormProps {
  initialValues?: {
    lunch?: string;
    focusLevel?: number;
    energyLevel?: number;
    ruminationLevel?: number;
    currentActivity?: string;
    distractions?: string;
    mainTrigger?: string;
    responseMethod?: string[];
  };
  isUpdate?: boolean;
  dailyLogId?: number;
  onSubmit?: (data: {
    lunch?: string;
    focusLevel: number;
    energyLevel: number;
    ruminationLevel: number;
    currentActivity?: string;
    distractions?: string;
    hadEmotionalEvent?: boolean;
    emotionalEvent?: string;
    copingStrategies?: string;
  }) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}

export function MidDayCheckInForm({ 
  initialValues, 
  isUpdate = false,
  onSubmit, 
  onBack,
  isSubmitting: externalIsSubmitting = false
}: MidDayCheckInFormProps) {
  const [lunch, setLunch] = useState(initialValues?.lunch || '');
  const [focusLevel, setFocusLevel] = useState(initialValues?.focusLevel || 5);
  const [energyLevel, setEnergyLevel] = useState(initialValues?.energyLevel || 5);
  const [ruminationLevel, setRuminationLevel] = useState(initialValues?.ruminationLevel || 3);
  const [currentActivity, setCurrentActivity] = useState(initialValues?.currentActivity || '');
  const [distractions, setDistractions] = useState(initialValues?.distractions || '');
  const [mainTrigger, setMainTrigger] = useState(initialValues?.mainTrigger || '');
  const [responseMethod, setResponseMethod] = useState<string[]>(initialValues?.responseMethod || ['Redirected attention']);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      lunch,
      focusLevel,
      energyLevel,
      ruminationLevel,
      currentActivity,
      distractions,
      mainTrigger,
      responseMethod
    };
    
    if (onSubmit) {
      onSubmit(data);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mid-day Check-In (11am-1pm)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="lunch">
              Lunch
            </label>
            <Input 
              id="lunch"
              value={lunch}
              onChange={(e) => setLunch(e.target.value)}
              placeholder="What did you eat for lunch?"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">
                Focus Level (1-10)
              </label>
              <span className="text-sm font-medium">{focusLevel}</span>
            </div>
            <Slider 
              defaultValue={[focusLevel]}
              max={10}
              step={1}
              onValueChange={(value) => setFocusLevel(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>Very Unfocused</span>
              <span>Very Focused</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">
                Energy Level (1-10)
              </label>
              <span className="text-sm font-medium">{energyLevel}</span>
            </div>
            <Slider 
              defaultValue={[energyLevel]}
              max={10}
              step={1}
              onValueChange={(value) => setEnergyLevel(value[0])}
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
                Rumination Level (1-10)
              </label>
              <span className="text-sm font-medium">{ruminationLevel}</span>
            </div>
            <Slider 
              defaultValue={[ruminationLevel]}
              max={10}
              step={1}
              onValueChange={(value) => setRuminationLevel(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs">
              <span>Not Ruminating</span>
              <span>Constant Rumination</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="current-activity">
              Current Activity
            </label>
            <Textarea 
              id="current-activity"
              value={currentActivity}
              onChange={(e) => setCurrentActivity(e.target.value)}
              placeholder="What are you currently working on?"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="distractions">
              Distractions
            </label>
            <Textarea 
              id="distractions"
              value={distractions}
              onChange={(e) => setDistractions(e.target.value)}
              placeholder="What's distracting you right now?"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="main-trigger">
              Main Rumination Trigger (if any)
            </label>
            <Input 
              id="main-trigger"
              value={mainTrigger}
              onChange={(e) => setMainTrigger(e.target.value)}
              placeholder="What's triggering your rumination, if anything?"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              How I Responded
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="redirected-attention" 
                  checked={responseMethod.includes('Redirected attention')} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setResponseMethod([...responseMethod, 'Redirected attention']);
                    } else {
                      setResponseMethod(responseMethod.filter(m => m !== 'Redirected attention'));
                    }
                  }}
                />
                <label htmlFor="redirected-attention" className="text-sm">Redirected attention</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="talked-it-out" 
                  checked={responseMethod.includes('Talked it out')} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setResponseMethod([...responseMethod, 'Talked it out']);
                    } else {
                      setResponseMethod(responseMethod.filter(m => m !== 'Talked it out'));
                    }
                  }}
                />
                <label htmlFor="talked-it-out" className="text-sm">Talked it out</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="journaled" 
                  checked={responseMethod.includes('Journaled')} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setResponseMethod([...responseMethod, 'Journaled']);
                    } else {
                      setResponseMethod(responseMethod.filter(m => m !== 'Journaled'));
                    }
                  }}
                />
                <label htmlFor="journaled" className="text-sm">Journaled</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="spiraled" 
                  checked={responseMethod.includes('Spiraled')} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setResponseMethod([...responseMethod, 'Spiraled']);
                    } else {
                      setResponseMethod(responseMethod.filter(m => m !== 'Spiraled'));
                    }
                  }}
                />
                <label htmlFor="spiraled" className="text-sm">Spiraled</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="detached" 
                  checked={responseMethod.includes('Detached')} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setResponseMethod([...responseMethod, 'Detached']);
                    } else {
                      setResponseMethod(responseMethod.filter(m => m !== 'Detached'));
                    }
                  }}
                />
                <label htmlFor="detached" className="text-sm">Detached</label>
              </div>
            </div>
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
              disabled={externalIsSubmitting}
              className={onBack ? "ml-auto" : "w-full"}
            >
              {externalIsSubmitting ? 'Saving...' : isUpdate ? 'Update' : 'Save Mid-day Check-In'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
