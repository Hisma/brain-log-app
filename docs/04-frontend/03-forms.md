---
title: Form Components and Validation
description: Complete guide to form implementation, validation patterns, and data collection components in the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Form Components and Validation

## Overview

The Brain Log App features a sophisticated form system designed for comprehensive health and wellness data collection. The forms implement consistent patterns for user input, validation, state management, and API integration, providing a seamless user experience for tracking daily activities and weekly reflections.

## Form Architecture

### Design Principles

- **Consistency**: Unified component interfaces and styling patterns
- **Flexibility**: Configurable for both creation and update scenarios
- **Accessibility**: Proper labeling, ARIA attributes, and keyboard navigation
- **Validation**: Client-side validation with clear error messaging
- **Performance**: Optimized state management and minimal re-renders
- **Responsiveness**: Mobile-first design with touch-friendly controls

### Component Structure

All form components follow a consistent architecture:

```typescript
interface FormComponentProps {
  initialValues?: FormDataType;
  isUpdate?: boolean;
  onSubmit?: (data: FormDataType) => void;
  onNext?: () => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}
```

### Form Composition Pattern

Forms are built using the Card component system for consistent layout:

```typescript
<Card>
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      {/* Navigation buttons */}
    </form>
  </CardContent>
</Card>
```

## Core Form Components

### MorningCheckInForm

**Purpose**: Capture morning health metrics and sleep data

**Location**: `src/components/forms/MorningCheckInForm.tsx`

**Data Fields**:
- **sleepHours**: Number input (0-24, 0.5 step increments)
- **sleepQuality**: Slider input (1-10 scale)
- **dreams**: Textarea for sleep notes
- **morningMood**: Slider input (1-10 scale)
- **physicalStatus**: Select dropdown with predefined options
- **breakfast**: Text input for meal description

**Interface**:
```typescript
interface MorningCheckInFormProps {
  initialValues?: {
    sleepHours?: number;
    sleepQuality?: number;
    dreams?: string;
    morningMood?: number;
    physicalStatus?: string;
    breakfast?: string;
  };
  isUpdate?: boolean;
  onSubmit?: (data: MorningCheckInData) => void;
  onNext?: () => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}
```

**Usage Example**:
```typescript
<MorningCheckInForm
  initialValues={existingData}
  isUpdate={true}
  onSubmit={handleMorningSubmit}
  isSubmitting={loading}
/>
```

### WeeklyReflectionForm

**Purpose**: Weekly goal tracking and reflection

**Location**: `src/components/forms/WeeklyReflectionForm.tsx`

**Data Fields**:
- **weekRating**: Slider input (1-10 overall week rating)
- **mentalState**: Select dropdown for mental health status
- **weekHighlights**: Required textarea for positive moments
- **weekChallenges**: Required textarea for difficulties faced
- **lessonsLearned**: Required textarea for insights gained
- **nextWeekFocus**: Required textarea for upcoming goals
- **questionedLeavingJob**: Checkbox for career satisfaction
- **gymDaysCount**: Slider input (0-7 days)
- **dietRating**: Slider input (1-10 diet quality)
- **memorableFamilyActivities**: Optional textarea for family time

**Interface**:
```typescript
interface WeeklyReflectionFormProps {
  startDate: Date;
  endDate: Date;
  onSubmit?: (data: WeeklyReflectionData) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}
```

**Usage Example**:
```typescript
<WeeklyReflectionForm
  startDate={weekStart}
  endDate={weekEnd}
  onSubmit={handleWeeklySubmit}
  isSubmitting={loading}
/>
```

### Other Form Components

#### MidDayCheckInForm
- **Purpose**: Mid-day productivity and focus tracking
- **Fields**: Focus level, energy level, productivity rating, current tasks
- **Patterns**: Slider inputs, textarea for notes

#### AfternoonCheckInForm
- **Purpose**: Afternoon energy assessment and planning
- **Fields**: Energy level, stress level, afternoon activities, evening plans
- **Patterns**: Rating scales, text inputs, planning fields

#### EveningReflectionForm
- **Purpose**: End-of-day reflection and next-day preparation
- **Fields**: Day rating, accomplishments, gratitude, tomorrow's priorities
- **Patterns**: Reflection textareas, rating sliders

#### ConcertaDoseLogForm
- **Purpose**: Medication tracking and effects monitoring
- **Fields**: Dose amount, time taken, effectiveness, side effects
- **Patterns**: Time picker, number input, rating scales

## Input Patterns and Components

### Slider Inputs with Value Display

Used for rating scales (1-10) and numeric ranges:

```typescript
<div className="space-y-2">
  <div className="flex justify-between">
    <label className="text-sm font-medium">
      Sleep Quality (1-10)
    </label>
    <span className="text-sm font-medium">{sleepQuality}</span>
  </div>
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
```

**Features**:
- Live value display above slider
- Descriptive labels at extremes
- Consistent styling and spacing
- Touch-friendly design

### Select Dropdowns with Predefined Options

Used for categorical data with fixed options:

```typescript
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
```

**Features**:
- Semantic options for data consistency
- Required field validation
- Accessible label association
- Placeholder text for guidance

### Textarea for Open-Ended Responses

Used for qualitative data and detailed responses:

```typescript
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
    required
  />
</div>
```

**Features**:
- Fixed row height for consistency
- Descriptive placeholder text
- Optional vs required field handling
- Auto-resize capability

### Number Inputs with Constraints

Used for precise numeric data with validation:

```typescript
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
```

**Features**:
- Input constraints (min, max, step)
- Type-safe value parsing
- Validation feedback
- Mobile-optimized number pad

### Checkbox Inputs for Boolean Data

Used for yes/no questions and flags:

```typescript
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
```

**Features**:
- Clear labeling for context
- Type-safe boolean handling
- Proper label association
- Visual spacing and alignment

## Form State Management

### Local State Pattern

Each form manages its own state using React hooks:

```typescript
export function FormComponent({ initialValues, onSubmit }: FormProps) {
  const [field1, setField1] = useState(initialValues?.field1 || defaultValue);
  const [field2, setField2] = useState(initialValues?.field2 || defaultValue);
  // ... more fields

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      field1,
      field2,
      // ... all fields
    };
    
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### State Initialization Patterns

Forms support both creation and update modes:

```typescript
// Creation mode - use defaults
const [sleepHours, setSleepHours] = useState(initialValues?.sleepHours || 7);

// Update mode - use existing values
const [sleepQuality, setSleepQuality] = useState(initialValues?.sleepQuality || 5);
```

### Controlled Components

All form inputs are controlled components for predictable behavior:

```typescript
// Controlled input pattern
<Input 
  value={fieldValue}
  onChange={(e) => setFieldValue(e.target.value)}
/>

// Controlled slider pattern
<Slider 
  value={[sliderValue]}
  onValueChange={(value) => setSliderValue(value[0])}
/>

// Controlled select pattern
<Select
  value={selectValue}
  onValueChange={setSelectValue}
/>
```

## Validation Patterns

### HTML5 Validation

Forms use native HTML5 validation attributes:

```typescript
<Input 
  type="number"
  min={0}
  max={24}
  step={0.5}
  required
/>

<Textarea 
  required
  minLength={10}
  maxLength={1000}
/>

<Select required>
  {/* Options */}
</Select>
```

### Custom Validation Logic

Forms can implement custom validation:

```typescript
const validateForm = () => {
  const errors: string[] = [];
  
  if (sleepHours < 0 || sleepHours > 24) {
    errors.push('Sleep hours must be between 0 and 24');
  }
  
  if (!weekHighlights.trim()) {
    errors.push('Week highlights are required');
  }
  
  return errors;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const errors = validateForm();
  if (errors.length > 0) {
    // Handle validation errors
    return;
  }
  
  // Proceed with submission
};
```

### Error Display Patterns

Validation errors are displayed consistently:

```typescript
{errors.length > 0 && (
  <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md">
    <ul className="list-disc list-inside space-y-1">
      {errors.map((error, index) => (
        <li key={index} className="text-sm">{error}</li>
      ))}
    </ul>
  </div>
)}
```

## Multi-Step Form Navigation

### Navigation Button Patterns

Forms support flexible navigation with conditional buttons:

```typescript
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
    {isSubmitting ? 'Saving...' : isUpdate ? 'Update' : onNext ? 'Next' : 'Save'}
  </Button>
</div>
```

**Navigation Features**:
- Conditional back button rendering
- Dynamic button text based on context
- Loading state with disabled interaction
- Responsive button sizing

### Step Management

Multi-step forms coordinate through parent components:

```typescript
function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const handleNext = (stepData: any) => {
    setFormData({ ...formData, ...stepData });
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div>
      {currentStep === 0 && (
        <MorningCheckInForm
          onNext={handleNext}
          onSubmit={handleNext}
        />
      )}
      {currentStep === 1 && (
        <MidDayCheckInForm
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {/* More steps */}
    </div>
  );
}
```

## API Integration Patterns

### Form Submission Handling

Forms integrate with API endpoints through callback patterns:

```typescript
// Parent component handling API calls
const handleFormSubmit = async (formData: FormDataType) => {
  setIsSubmitting(true);
  try {
    await api.submitFormData(formData);
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setIsSubmitting(false);
  }
};

// Form component receives handler
<FormComponent
  onSubmit={handleFormSubmit}
  isSubmitting={isSubmitting}
/>
```

### Loading State Management

Forms provide visual feedback during submission:

```typescript
<Button 
  type="submit" 
  disabled={isSubmitting}
>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

### Error Handling

API errors are communicated through form state:

```typescript
const [error, setError] = useState<string>('');

const handleSubmit = async (data: FormData) => {
  try {
    await submitData(data);
    setError('');
  } catch (err) {
    setError('Failed to save data. Please try again.');
  }
};

// Display error in form
{error && (
  <div className="text-destructive text-sm mt-2">
    {error}
  </div>
)}
```

## Accessibility Features

### Label Association

All form inputs have proper label association:

```typescript
// Explicit label association
<label htmlFor="field-id" className="text-sm font-medium">
  Field Label
</label>
<Input id="field-id" />

// Implicit label association
<label className="text-sm font-medium">
  Field Label
  <Input />
</label>
```

### ARIA Attributes

Forms include appropriate ARIA attributes:

```typescript
<Slider 
  aria-label="Sleep quality rating from 1 to 10"
  aria-valuemin={1}
  aria-valuemax={10}
  aria-valuenow={sleepQuality}
/>

<Textarea 
  aria-describedby="field-help"
  aria-required="true"
/>
```

### Keyboard Navigation

Forms support full keyboard navigation:
- Tab order follows logical flow
- Enter submits forms
- Escape cancels dialogs
- Arrow keys navigate sliders and selects

### Screen Reader Support

Forms provide meaningful context for screen readers:
- Descriptive labels and placeholders
- Error messages are announced
- Required fields are clearly marked
- Progress indication for multi-step forms

## Responsive Design

### Mobile-First Approach

Forms are designed mobile-first with progressive enhancement:

```css
/* Base mobile styles */
.form-container {
  @apply px-4 py-6;
}

/* Tablet and desktop enhancements */
@media (min-width: 768px) {
  .form-container {
    @apply px-6 py-8;
  }
}
```

### Touch-Friendly Controls

Interactive elements are sized for touch interaction:
- Minimum 44px touch targets
- Adequate spacing between controls
- Large slider handles
- Clear visual feedback

### Responsive Layouts

Forms adapt to different screen sizes:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormField />
  <FormField />
</div>
```

## Performance Optimization

### Controlled Re-renders

Forms minimize unnecessary re-renders:

```typescript
// Memoized form components
const MemoizedFormComponent = React.memo(FormComponent);

// Optimized state updates
const handleInputChange = useCallback((value: string) => {
  setFieldValue(value);
}, []);
```

### Debounced Validation

Expensive validation is debounced:

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedValidation = useMemo(
  () => debounce((value: string) => {
    validateField(value);
  }, 300),
  []
);
```

### Lazy Loading

Large forms can be lazy-loaded:

```typescript
const WeeklyReflectionForm = lazy(() => import('./WeeklyReflectionForm'));

<Suspense fallback={<FormSkeleton />}>
  <WeeklyReflectionForm />
</Suspense>
```

## Best Practices

### Component Design

1. **Single Responsibility**: Each form handles one specific data collection task
2. **Prop Interface**: Consistent prop interfaces across all form components
3. **Default Values**: Always provide sensible defaults for form fields
4. **Type Safety**: Use TypeScript interfaces for all form data
5. **Error Boundaries**: Wrap forms in error boundaries for graceful failure

### State Management

1. **Local State**: Use local state for form-specific data
2. **Controlled Components**: Always use controlled components for predictable behavior
3. **Validation**: Implement both client-side and server-side validation
4. **Loading States**: Provide clear loading indicators during submission
5. **Error Handling**: Display user-friendly error messages

### User Experience

1. **Progressive Disclosure**: Break complex forms into logical steps
2. **Clear Labels**: Use descriptive labels and placeholder text
3. **Visual Feedback**: Provide immediate feedback for user actions
4. **Save Progress**: Allow users to save partial progress
5. **Accessibility**: Ensure forms work with assistive technologies

### Code Organization

1. **File Structure**: Organize forms in dedicated directory
2. **Reusable Components**: Extract common patterns into reusable components
3. **Type Definitions**: Centralize form data type definitions
4. **Validation Rules**: Create reusable validation functions
5. **Testing**: Write comprehensive tests for form behavior

## Troubleshooting

### Common Issues

#### Form Not Submitting
**Problem**: Form submission doesn't trigger

**Solutions**:
- Check `onSubmit` handler is passed to form
- Verify button is inside form element
- Ensure no JavaScript errors prevent submission
- Check form validation isn't blocking submission

#### State Not Updating
**Problem**: Form inputs don't reflect state changes

**Solutions**:
- Verify controlled component pattern is used
- Check state setter functions are called correctly
- Ensure no stale closures in event handlers
- Use React DevTools to inspect state changes

#### Validation Errors
**Problem**: Validation messages not displaying

**Solutions**:
- Check error state is properly managed
- Verify error display components are rendered
- Ensure validation runs at appropriate times
- Test with both valid and invalid inputs

## Related Documents

- [01-components.md](./01-components.md) - UI component reference
- [02-theming.md](./02-theming.md) - Form styling and theming
- [04-state-management.md](./04-state-management.md) - State management patterns
- [../03-api-reference/](../03-api-reference/) - API integration details

## Changelog

### 2025-07-06 - v1.0.0
- Initial documentation creation
- Complete form component reference
- Validation patterns and best practices
- Accessibility and responsive design guidelines
- Performance optimization strategies
- Troubleshooting guide
