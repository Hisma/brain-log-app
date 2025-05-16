# Daily Log Feature Updates

## Overview

This document outlines the planned updates to the Daily Log feature in the Brain Log App. The current implementation has a simple two-step flow (Morning Check-In → Evening Reflection), but we need a more granular approach with multiple forms that can be incrementally updated throughout the day.

## Current Implementation

Currently, the daily log feature:
- Has two main forms: Morning Check-In and Evening Reflection
- Uses a linear flow where users go directly from morning to evening
- Lacks intermediate forms mentioned in the implementation plan (medication routine, midday focus, afternoon checkpoint)
- Doesn't allow for incremental updates throughout the day
- Doesn't provide a way to edit logs after submission

## Planned Changes

### 1. Time-Based Structure

Each form will be associated with a specific time block during the day:

- Morning Check-In: 7-9am
- Concerta Dose Log: 9-10am
- Mid-day Check-In: 11am-1pm
- Afternoon Check-In: 3-5pm
- Evening Reflection: 8-10pm

This time-based structure will help enforce a consistent daily routine and make it clear when each form should be completed.

### 2. Daily Log Overview Page

Create a new overview component that:
- Shows all available forms for the daily log with their associated time blocks
- Displays completion status for each form
- Allows users to navigate to any form directly
- Marks the daily log as complete only when all forms are completed

### 3. Form Modifications and Additions

#### A. Morning Check-In Form (7-9am)
- Add "breakfast" field (string type)
- Keep existing fields (sleep hours, quality, dreams, mood, physical status)

#### B. Concerta Dose Log Form (9-10am) - New
- Add "medicationTaken" boolean field at the top
- If true, show:
  - "medicationTakenAt" (DateTime type)
  - "medicationDose" (number)
  - "ateWithinHour" (boolean)
  - "firstHourFeeling" (string)
- If false, show:
  - "reasonForSkipping" (string): Why medication wasn't taken (e.g., "weekend", "forgot", etc.)

#### C. Mid-day Check-In Form (11am-1pm) - New
- Add "lunch" field (string type)
- Include focus level (1-10 scale)
- Include energy level (1-10 scale)
- Include rumination level (1-10 scale)
- Add new fields:
  - "currentActivity" (string): What I'm currently working on
  - "distractions" (string): What's distracting me right now
  - "cravings" (string): Any food/substance cravings I'm experiencing

#### D. Afternoon Check-In Form (3-5pm) - New
- Add "afternoon snack" field (string type)
- Add "isCrashing" boolean field to indicate Concerta wearing off
- Add "crashSymptoms" (string, only shown if isCrashing is true)
- Add "secondDoseTaken" (boolean)
- Add "secondDoseTime" (DateTime, only shown if secondDoseTaken is true)
- Add "anxietyLevel" (int 1-10)
- Add "isFeeling" (string): Description of mental and physical state
- Keep existing fields from the implementation plan:
  - hadTriggeringInteraction (boolean)
  - interactionDetails (string)
  - selfWorthTiedToPerformance (string)
  - overextended (string)

#### E. Evening Reflection Form (8-10pm)
- Add "dinner" field (string type)
- Add "sleepiness" (1-10 scale)
- Add "tomorrowPlan" (string)
- Keep existing fields:
  - overallMood (1-10 scale)
  - medicationEffectiveness (string)
  - helpfulFactors (string)
  - distractingFactors (string)
  - thoughtForTomorrow (string)
  - dayRating (1-10 scale)
  - accomplishments (string)
  - challenges (string)
  - gratitude (string)
  - improvements (string)

### 4. Edit/Update Functionality

#### Overview Page Updates
- Add an "Edit" button for each completed form in the overview page
- When clicked, it will navigate to the specific form with pre-populated data

#### Individual Form Updates
- Each form will have an "Update" mode in addition to the current "Create" mode
- When in "Update" mode, forms will:
  - Load existing data for that section
  - Show an "Update" button instead of "Next" or "Save"
  - Maintain the same validation rules

#### Daily Log View Dialog Updates
- Add an "Edit" button next to each section in the view dialog
- When clicked, it will close the dialog and navigate to the specific form in update mode

### 5. Database Schema Updates

The updated DailyLog model will include:

```prisma
model DailyLog {
  // Existing fields
  id                       Int      @id @default(autoincrement())
  userId                   Int
  date                     DateTime
  
  // Morning check-in fields (7-9am)
  sleepHours               Float    @default(0)
  sleepQuality             Int      @default(0) // 1-10 scale
  dreams                   String?
  morningMood              Int      @default(0) // 1-10 scale
  physicalStatus           String?
  breakfast                String?  // New field
  morningCompleted         Boolean  @default(false)
  
  // Concerta dose log fields (9-10am)
  medicationTaken          Boolean  @default(false)
  medicationTakenAt        DateTime?
  medicationDose           Float?
  ateWithinHour            Boolean?
  firstHourFeeling         String?
  reasonForSkipping        String?
  medicationCompleted      Boolean  @default(false)
  
  // Mid-day check-in fields (11am-1pm)
  lunch                    String?  // New field
  focusLevel               Int?     // 1-10 scale
  energyLevel              Int?     // 1-10 scale
  ruminationLevel          Int?     // 1-10 scale
  currentActivity          String?  // New field
  distractions             String?  // New field
  cravings                 String?  // New field
  middayCompleted          Boolean  @default(false)
  
  // Afternoon check-in fields (3-5pm)
  afternoonSnack           String?  // New field
  isCrashing               Boolean  @default(false)
  crashSymptoms            String?
  secondDoseTaken          Boolean  @default(false)
  secondDoseTime           DateTime?
  anxietyLevel             Int?     // 1-10 scale
  isFeeling                String?
  hadTriggeringInteraction Boolean  @default(false)
  interactionDetails       String?
  selfWorthTiedToPerformance String?
  overextended             String?
  afternoonCompleted       Boolean  @default(false)
  
  // Evening reflection fields (8-10pm)
  dinner                   String?  // New field
  overallMood              Int?     // 1-10 scale
  sleepiness               Int?     // 1-10 scale
  medicationEffectiveness  String?
  helpfulFactors           String?
  distractingFactors       String?
  thoughtForTomorrow       String?
  tomorrowPlan             String?  // New field
  eveningCompleted         Boolean  @default(false)
  
  // Additional fields
  dayRating                Int?     // 1-10 scale
  accomplishments          String?
  challenges               String?
  gratitude                String?
  improvements             String?
  
  isComplete               Boolean  @default(false)
  
  // Relationships and indexes
  user                     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([date])
  @@unique([userId, date])
}
```

### 6. Service Layer Updates

The dailyLogService will be updated with new methods for each form section:

```typescript
// New methods to add
updateMorningCheckIn(userId, id, data, isUpdate = false)
updateConcertaDoseLog(userId, id, data, isUpdate = false)
updateMidDayCheckIn(userId, id, data, isUpdate = false)
updateAfternoonCheckIn(userId, id, data, isUpdate = false)
updateEveningReflection(userId, id, data, isUpdate = false)

// Method to check if all sections are complete
checkDailyLogCompletion(userId, id)
```

## Implementation Plan

### Phase 1: Database Updates
- ✅ Update the Prisma schema with new fields and completion status fields
- ✅ Run migration to update the database

### Phase 2: Service Layer Updates
- ✅ Add new methods for each form section
- ✅ Implement logic to track completion status for each section
- ✅ Add method to check overall completion
- ✅ Modify service methods to support partial updates

### Phase 3: Form Components
- Create ConcertaDoseLogForm.tsx with conditional fields
  - Use the datetime-picker component for the medicationTakenAt field:
  ```tsx
  import { DateTimePicker } from '@/components/ui/datetime-picker';
  
  // Inside your form component:
  const [medicationTime, setMedicationTime] = useState<Date | undefined>(undefined);
  
  // In your JSX:
  <DateTimePicker 
    value={medicationTime} 
    onChange={setMedicationTime} 
    className="w-[280px]" 
  />
  ```
- Create MidDayCheckInForm.tsx with new fields
- Create AfternoonCheckInForm.tsx with new fields
- Update MorningCheckInForm.tsx and EveningReflectionForm.tsx
- Modify all form components to accept an `initialValues` prop
- Add an `isUpdate` prop to control the form's behavior and button text

### Phase 4: Daily Log Overview Component
- Implement DailyLogOverview.tsx with time blocks and status tracking
- Create navigation between forms
- Add edit buttons for each completed form

### Phase 5: Daily Log Page Updates
- Modify the flow to start with the overview
- Implement navigation between forms
- Display appropriate time blocks for each form
- Add state to track which form is being edited
- Implement logic to load existing data when editing

### Phase 6: View Dialog Updates
- Add edit buttons for each section
- Implement handlers to navigate to the appropriate form

## UI Mockups

### Daily Log Overview

```
┌─────────────────────────────────────────────────┐
│           Daily Log - May 15, 2025              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ○ Morning Check-In (7-9am)         Not Started │
│                                                 │
│  ○ Concerta Dose Log (9-10am)       Not Started │
│                                                 │
│  ○ Mid-day Check-In (11am-1pm)      Not Started │
│                                                 │
│  ○ Afternoon Check-In (3-5pm)       Not Started │
│                                                 │
│  ○ Evening Reflection (8-10pm)      Not Started │
│                                                 │
│                                                 │
│  Overall Completion: 0/5                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

### View Dialog with Edit Options

```
┌─────────────────────────────────────────────────┐
│ Daily Log: May 15, 2025                         │
├─────────────────────────────────────────────────┤
│                                                 │
│ Morning Check-In (7-9am)                [Edit]  │
│ ----------------------------------------       │
│ Sleep: 7 hours (8/10)                          │
│ Mood: 7/10                                     │
│ ...                                            │
│                                                 │
│ Concerta Dose Log (9-10am)              [Edit]  │
│ ----------------------------------------       │
│ Medication Taken: Yes                          │
│ Dose: 36mg                                     │
│ ...                                            │
│                                                 │
│ Mid-day Check-In (11am-1pm)             [Edit]  │
│ ----------------------------------------       │
│ Focus Level: 8/10                              │
│ Energy Level: 7/10                             │
│ ...                                            │
│                                                 │
│ Afternoon Check-In (3-5pm)              [Edit]  │
│ ----------------------------------------       │
│ Anxiety Level: 4/10                            │
│ Crashing: No                                   │
│ ...                                            │
│                                                 │
│ Evening Reflection (8-10pm)             [Edit]  │
│ ----------------------------------------       │
│ Overall Mood: 7/10                             │
│ Sleepiness: 8/10                               │
│ ...                                            │
│                                                 │
│                [Delete]        [Close]          │
└─────────────────────────────────────────────────┘
```

## Benefits of These Changes

1. **Improved User Experience**
   - Users can incrementally update their daily log throughout the day
   - Time-based structure provides clear guidance on when to complete each form
   - Edit functionality allows users to correct or update information

2. **Better Data Collection**
   - More granular data collection throughout the day
   - Specific fields for tracking medication effects and symptoms
   - Meal tracking integrated into each form

3. **Enhanced Insights**
   - More detailed data allows for better pattern recognition
   - Time-stamped entries help correlate symptoms with medication timing
   - Comprehensive tracking of physical and mental state throughout the day
