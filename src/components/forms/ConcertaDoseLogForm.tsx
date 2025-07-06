'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker } from '@/components/ui/datetime-picker';
interface ConcertaDoseLogData {
  medicationTaken: boolean;
  medicationTakenAt?: Date;
  medicationDose?: number;
  ateWithinHour?: boolean;
  firstHourFeeling?: string;
  reasonForSkipping?: string;
}

interface ConcertaDoseLogFormProps {
  initialValues?: {
    medicationTaken?: boolean;
    medicationTakenAt?: Date;
    medicationDose?: number;
    ateWithinHour?: boolean;
    firstHourFeeling?: string;
    reasonForSkipping?: string;
  };
  isUpdate?: boolean;
  onSubmit?: (data: ConcertaDoseLogData) => void;
  onNext?: () => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}

export function ConcertaDoseLogForm({ 
  initialValues, 
  isUpdate = false,
  onSubmit, 
  onNext, 
  onBack,
  isSubmitting: externalIsSubmitting = false
}: ConcertaDoseLogFormProps) {
  const [medicationTaken, setMedicationTaken] = useState(initialValues?.medicationTaken || false);
  const [medicationTakenAt, setMedicationTakenAt] = useState<Date | undefined>(initialValues?.medicationTakenAt);
  const [medicationDose, setMedicationDose] = useState(initialValues?.medicationDose || 36);
  const [ateWithinHour, setAteWithinHour] = useState(initialValues?.ateWithinHour || false);
  const [firstHourFeeling, setFirstHourFeeling] = useState(initialValues?.firstHourFeeling || '');
  const [reasonForSkipping, setReasonForSkipping] = useState(initialValues?.reasonForSkipping || '');
  // Set default medication time to current time if not provided and medication is taken
  useEffect(() => {
    if (medicationTaken && !medicationTakenAt) {
      setMedicationTakenAt(new Date());
    }
  }, [medicationTaken, medicationTakenAt]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      medicationTaken,
      ...(medicationTaken ? {
        medicationTakenAt,
        medicationDose,
        ateWithinHour,
        firstHourFeeling
      } : {
        reasonForSkipping
      })
    };
    
    if (onSubmit) {
      onSubmit(data);
    }
    
    if (onNext) {
      onNext();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Concerta Dose Log (9-10am)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="medication-taken" 
              checked={medicationTaken} 
              onCheckedChange={(checked) => setMedicationTaken(checked === true)}
            />
            <label 
              htmlFor="medication-taken" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Medication Taken Today
            </label>
          </div>
          
          {medicationTaken ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Time Medication Taken
                </label>
                <DateTimePicker 
                  value={medicationTakenAt} 
                  onChange={setMedicationTakenAt} 
                  className="w-full" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="medication-dose">
                  Medication Dose (mg)
                </label>
                <Input 
                  id="medication-dose"
                  type="number" 
                  min={0} 
                  step={1}
                  value={medicationDose}
                  onChange={(e) => setMedicationDose(parseFloat(e.target.value))}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ate-within-hour" 
                  checked={ateWithinHour} 
                  onCheckedChange={(checked) => setAteWithinHour(checked === true)}
                />
                <label 
                  htmlFor="ate-within-hour" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ate Within 1 Hour of Taking Medication
                </label>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="first-hour-feeling">
                  First Hour Feeling
                </label>
                <Select
                  value={firstHourFeeling}
                  onValueChange={setFirstHourFeeling}
                  required
                >
                  <SelectTrigger id="first-hour-feeling">
                    <SelectValue placeholder="Select feeling" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clear">Clear</SelectItem>
                    <SelectItem value="Foggy">Foggy</SelectItem>
                    <SelectItem value="Anxious">Anxious</SelectItem>
                    <SelectItem value="Wired">Wired</SelectItem>
                    <SelectItem value="Focused">Focused</SelectItem>
                    <SelectItem value="Calm">Calm</SelectItem>
                    <SelectItem value="No Noticeable Effect">No Noticeable Effect</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="reason-for-skipping">
                Reason for Skipping Medication
              </label>
              <Select
                value={reasonForSkipping}
                onValueChange={setReasonForSkipping}
                required
              >
                <SelectTrigger id="reason-for-skipping">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekend">Weekend</SelectItem>
                  <SelectItem value="Forgot">Forgot</SelectItem>
                  <SelectItem value="Side Effects">Side Effects</SelectItem>
                  <SelectItem value="Planned Break">Planned Break</SelectItem>
                  <SelectItem value="Out of Medication">Out of Medication</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
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
              {externalIsSubmitting ? 'Saving...' : isUpdate ? 'Update' : onNext ? 'Next' : 'Save Concerta Dose Log'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
