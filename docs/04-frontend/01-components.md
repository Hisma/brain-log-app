---
title: Frontend Components Reference
description: Comprehensive guide to UI components, patterns, and usage in the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Frontend Components Reference

## Overview

The Brain Log App frontend is built with React and Next.js, featuring a comprehensive component library based on shadcn/ui with custom extensions. This document provides a complete reference for all UI components, their usage patterns, and integration guidelines.

## Component Architecture

### Component Categories

- **Layout Components**: Structure and navigation
- **UI Primitives**: Basic building blocks (buttons, inputs, cards)
- **Form Components**: Complex form implementations for data collection
- **Chart Components**: Data visualization components
- **Specialized Components**: Domain-specific functionality

### Design Principles

- **Composability**: Components are designed to work together seamlessly
- **Consistency**: Unified styling and behavior patterns
- **Accessibility**: ARIA compliance and keyboard navigation
- **Responsiveness**: Mobile-first responsive design
- **Theming**: Dark/light mode support throughout

## Layout Components

### Layout (`src/components/layout/Layout.tsx`)

Main application layout wrapper that provides the basic page structure.

```typescript
interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps)
```

**Features**:
- Integrates all providers (Theme, Session, Auth)
- Responsive container layout
- Header and footer placement
- Dark/light mode styling

**Usage**:
```typescript
import { Layout } from '@/components/layout/Layout';

export default function Page() {
  return (
    <Layout>
      <div>Your page content</div>
    </Layout>
  );
}
```

### Header (`src/components/layout/Header.tsx`)

Application header with navigation and user controls.

**Features**:
- Navigation menu
- User authentication status
- Theme toggle
- Mobile-responsive design

### Footer (`src/components/layout/Footer.tsx`)

Application footer with basic information and links.

## UI Primitive Components

### Card System

The card system provides consistent content containers with multiple variants.

#### Card (`src/components/ui/card.tsx`)

Base card component with semantic slots.

```typescript
// Main card container
function Card({ className, ...props }: React.ComponentProps<"div">)

// Card sections
function CardHeader({ className, ...props })
function CardTitle({ className, ...props })
function CardDescription({ className, ...props })
function CardContent({ className, ...props })
function CardFooter({ className, ...props })
function CardAction({ className, ...props })
```

**Usage Pattern**:
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

**Styling Features**:
- Rounded corners (`rounded-xl`)
- Drop shadow (`shadow-sm`)
- Theme-aware background colors
- Responsive padding
- Grid-based header layout

### Input Components

#### Button (`src/components/ui/button.tsx`)

Primary action component with multiple variants.

```typescript
interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}
```

**Usage**:
```typescript
import { Button } from '@/components/ui/button';

<Button variant="outline" onClick={handleClick}>
  Click me
</Button>
```

#### Input (`src/components/ui/input.tsx`)

Text input component with consistent styling.

**Features**:
- Theme-aware styling
- Focus states
- Error state support
- Full width by default

#### Select (`src/components/ui/select.tsx`)

Dropdown selection component.

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Slider (`src/components/ui/slider.tsx`)

Range slider for numeric input (1-10 scales).

```typescript
<Slider 
  defaultValue={[5]}
  max={10}
  step={1}
  onValueChange={(value) => setValue(value[0])}
/>
```

#### Textarea (`src/components/ui/textarea.tsx`)

Multi-line text input for longer content.

### Interactive Components

#### Dialog (`src/components/ui/dialog.tsx`)

Modal dialog system for overlays and forms.

#### Popover (`src/components/ui/popover.tsx`)

Contextual popover for additional information or controls.

#### Dropdown Menu (`src/components/ui/dropdown-menu.tsx`)

Context menus and action dropdowns.

## Form Components

### Form Architecture

All form components follow consistent patterns:
- Props interface with `initialValues`, `onSubmit`, `onNext`, `onBack`
- Loading state management
- Validation and error handling
- Responsive layout

### MorningCheckInForm (`src/components/forms/MorningCheckInForm.tsx`)

Complex form for morning health check-in data.

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

**Form Fields**:
- **Sleep Hours**: Number input (0-24, 0.5 step)
- **Sleep Quality**: Slider (1-10 scale)
- **Dreams**: Textarea for notes
- **Morning Mood**: Slider (1-10 scale)
- **Physical Status**: Select dropdown
- **Breakfast**: Text input

**Patterns Used**:
- Controlled components with individual state
- Slider with label showing current value
- Form validation on submit
- Navigation buttons (Back/Next/Submit)
- Loading state support

### Other Form Components

#### MidDayCheckInForm (`src/components/forms/MidDayCheckInForm.tsx`)
Mid-day health and productivity tracking.

#### AfternoonCheckInForm (`src/components/forms/AfternoonCheckInForm.tsx`)
Afternoon energy and focus assessment.

#### EveningReflectionForm (`src/components/forms/EveningReflectionForm.tsx`)
End-of-day reflection and planning.

#### ConcertaDoseLogForm (`src/components/forms/ConcertaDoseLogForm.tsx`)
Medication tracking form.

#### WeeklyReflectionForm (`src/components/forms/WeeklyReflectionForm.tsx`)
Comprehensive weekly goal and reflection tracking.

### Form Patterns

#### Multi-Step Form Navigation
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const data = {
    // Collect form data
  };
  
  if (onSubmit) {
    onSubmit(data);
  }
  
  if (onNext) {
    onNext();
  }
};
```

#### Slider with Value Display
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

## Chart Components

### Chart Architecture

Chart components use a consistent pattern for data visualization:
- Responsive design with container queries
- Theme-aware colors
- Loading and error states
- Configurable data ranges

### Available Charts

#### MoodTrendChart (`src/components/charts/MoodTrendChart.tsx`)
Line chart showing mood trends over time.

#### SleepQualityChart (`src/components/charts/SleepQualityChart.tsx`)
Sleep quality visualization with trend analysis.

#### FocusEnergyChart (`src/components/charts/FocusEnergyChart.tsx`)
Focus and energy level correlation chart.

#### WeeklyInsightsChart (`src/components/charts/WeeklyInsightsChart.tsx`)
Comprehensive weekly data visualization.

## Specialized Components

### CurrentTime (`src/components/current-time.tsx`)

Real-time clock display with timezone awareness.

**Features**:
- Live time updates
- Timezone display
- Theme-aware styling
- Edge Runtime compatible

### TimezoneSelector (`src/components/timezone-selector.tsx`)

Timezone selection component for user preferences.

### DailyLogOverview (`src/components/DailyLogOverview.tsx`)

Summary component for daily log data.

### Insight Components

#### DailyInsightCard (`src/components/ui/daily-insight-card.tsx`)
Card component for displaying daily AI insights.

#### WeeklyInsightCard (`src/components/ui/weekly-insight-card.tsx`)
Card component for weekly insights display.

#### InsightButton (`src/components/ui/insight-button.tsx`)
Action button for generating insights.

### Session Components

#### SessionExpiredAlert (`src/components/ui/session-expired-alert.tsx`)
Alert component for session expiration handling.

#### ModeToggle (`src/components/ui/modetoggle.tsx`)
Theme switching component.

## Component Usage Patterns

### Compound Components

Many components use the compound component pattern:

```typescript
// Card example
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

### Conditional Rendering

Components often include conditional features:

```typescript
// Navigation buttons
<div className="flex justify-between mt-6">
  {onBack && (
    <Button type="button" variant="outline" onClick={onBack}>
      Back
    </Button>
  )}
  <Button 
    type="submit" 
    disabled={isSubmitting}
    className={onBack ? "ml-auto" : "w-full"}
  >
    {isSubmitting ? 'Saving...' : isUpdate ? 'Update' : 'Save'}
  </Button>
</div>
```

### Loading States

Consistent loading state handling:

```typescript
<Button type="submit" disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

## Styling Conventions

### CSS Classes

- Use Tailwind utility classes
- Follow mobile-first responsive design
- Apply consistent spacing (`space-y-4`, `space-y-2`)
- Use semantic color variables

### Theme Integration

Components automatically support dark/light themes through:
- CSS custom properties
- Tailwind theme configuration
- Theme-aware color classes

### Responsive Design

- Mobile-first approach
- Flexible layouts with CSS Grid and Flexbox
- Container queries for complex components
- Responsive typography and spacing

## Best Practices

### Component Development

1. **Props Interface**: Always define TypeScript interfaces
2. **Default Values**: Provide sensible defaults
3. **Error Handling**: Handle edge cases gracefully
4. **Accessibility**: Include ARIA labels and keyboard navigation
5. **Performance**: Use React.memo for expensive components

### Integration Guidelines

1. **Import Structure**: Use absolute imports with `@/components`
2. **State Management**: Keep component state minimal
3. **Side Effects**: Use useEffect appropriately
4. **Event Handling**: Follow consistent naming patterns
5. **Type Safety**: Maintain strict TypeScript compliance

## Related Documents

- [02-theming.md](./02-theming.md) - Design system and styling
- [03-forms.md](./03-forms.md) - Form implementation details
- [04-state-management.md](./04-state-management.md) - State management patterns
- [../02-architecture/02-frontend.md](../02-architecture/02-frontend.md) - Frontend architecture

## Changelog

### 2025-07-06 - v1.0.0
- Initial documentation creation
- Complete component reference
- Usage patterns and examples
- Best practices and guidelines
