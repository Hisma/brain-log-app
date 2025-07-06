---
title: shadcn/ui Implementation Guide & Component Migration
description: Complete guide to using shadcn/ui in the Brain Log App - installation, usage patterns, and migration strategies for refactoring custom Tailwind components
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# shadcn/ui Implementation Guide & Component Migration

## Overview

This guide provides practical instructions for using shadcn/ui in the Brain Log App. It covers the copy-paste component philosophy, current implementation patterns, and strategies for migrating custom Tailwind components to shadcn/ui during your upcoming UI refactor.

**Key Concept**: shadcn/ui is NOT a traditional npm package. It's a collection of copy-paste components that become part of your codebase, fully customizable and owned by you.

## Current Setup & Configuration

### Project Configuration
```json
// components.json - Your current setup
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",        // Clean, modern style variant
  "rsc": true,               // React Server Components enabled
  "tsx": true,               // TypeScript support
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",   // Neutral color palette
    "cssVariables": true,     // CSS custom properties for theming
    "prefix": ""              // No Tailwind prefix
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"     // Lucide React icons
}
```

### Dependencies Already Installed
Your project includes the necessary dependencies:
- `@shadcn/ui` - CLI tool
- `@radix-ui/react-*` - Primitive components
- `class-variance-authority` - Component variants
- `lucide-react` - Icon library
- `tailwind-merge` - Tailwind class merging

### File Structure
```
src/components/
├── ui/                     # shadcn/ui components (copy-pasted)
│   ├── button.tsx         # ✅ Already using
│   ├── card.tsx           # ✅ Already using
│   ├── input.tsx          # ✅ Already using
│   ├── select.tsx         # ✅ Already using
│   ├── slider.tsx         # ✅ Already using
│   └── ...
├── forms/                 # Your custom form components
├── charts/                # Your custom chart components
├── layout/                # Your custom layout components
└── providers/             # Context providers
```

## How shadcn/ui Works (Copy-Paste Philosophy)

### 1. Adding Components
```bash
# See all available components
npx shadcn-ui@latest add

# Add specific components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add toast

# Add multiple components
npx shadcn-ui@latest add button card input select
```

### 2. What Happens When You Add a Component
1. **Downloads component code** to `src/components/ui/`
2. **Installs required dependencies** (Radix UI primitives)
3. **Updates your project** with necessary imports
4. **Component becomes yours** - modify freely!

### 3. Component Ownership
```typescript
// ✅ You OWN this code - modify as needed
// src/components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        // 🎯 Add your custom variants here!
        brand: "bg-blue-600 text-white hover:bg-blue-700",
        health: "bg-green-600 text-white hover:bg-green-700",
      },
    },
  }
)
```

## Real-World Usage Patterns (Your Current Implementation)

### Form Component Example - MorningCheckInForm
Your `MorningCheckInForm.tsx` demonstrates excellent shadcn/ui usage:

```typescript
// ✅ Your current import pattern
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export function MorningCheckInForm() {
  return (
    <Card>                          {/* shadcn/ui Card wrapper */}
      <CardHeader>
        <CardTitle>Morning Check-In</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          
          {/* shadcn/ui Input with custom label */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hours of Sleep</label>
            <Input type="number" min={0} max={24} step={0.5} />
          </div>
          
          {/* shadcn/ui Slider with custom layout */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Sleep Quality (1-10)</label>
              <span className="text-sm font-medium">{sleepQuality}</span>
            </div>
            <Slider 
              defaultValue={[sleepQuality]}
              max={10}
              step={1}
              onValueChange={(value) => setSleepQuality(value[0])}
            />
          </div>
          
          {/* shadcn/ui Select with predefined options */}
          <Select value={physicalStatus} onValueChange={setPhysicalStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Energetic">Energetic</SelectItem>
              <SelectItem value="Tired">Tired</SelectItem>
            </SelectContent>
          </Select>
          
        </form>
      </CardContent>
    </Card>
  );
}
```

**What's Working Well:**
- ✅ Consistent component imports
- ✅ Proper component composition (Card + CardHeader + CardContent)
- ✅ Using component props correctly
- ✅ Mixing shadcn/ui with custom styling

## Adding New Components - Step by Step

### 1. Check What's Available
```bash
# List all available components
npx shadcn-ui@latest add

# Common components you might need:
# - badge, breadcrumb, calendar, checkbox
# - dialog, dropdown-menu, form, label
# - popover, radio-group, sheet, switch
# - table, tabs, toast, tooltip
```

### 2. Add Components You Need
```bash
# For better forms
npx shadcn-ui@latest add form label checkbox radio-group switch

# For data display
npx shadcn-ui@latest add table badge

# For user feedback
npx shadcn-ui@latest add toast alert-dialog

# For navigation
npx shadcn-ui@latest add tabs breadcrumb
```

### 3. Use Immediately
```typescript
// After adding, import and use
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

function EnhancedForm() {
  return (
    <Form>
      <FormField name="terms">
        <FormItem className="flex items-center space-x-2">
          <FormControl>
            <Checkbox />
          </FormControl>
          <FormLabel>Accept terms and conditions</FormLabel>
        </FormItem>
      </FormField>
    </Form>
  );
}
```

## Component Migration Strategy (For Your Refactor)

### 1. Component Audit Matrix

| Current Custom Component | shadcn/ui Equivalent | Migration Strategy |
|-------------------------|---------------------|-------------------|
| Custom button styles | `Button` component | ✅ Replace - add custom variants |
| Custom form inputs | `Input`, `Textarea` | ✅ Replace - very similar API |
| Custom cards | `Card` component | ✅ Already using! |
| Custom modals | `Dialog` component | 🔄 Add & migrate gradually |
| Custom dropdowns | `Select`, `DropdownMenu` | ✅ Already using Select |
| Custom charts | Keep custom | ❌ Keep - specialized visualization |
| Custom layout components | Keep custom | ❌ Keep - app-specific logic |

### 2. Migration Workflow

#### Phase 1: Add Missing Components
```bash
# Add components you'll need for migration
npx shadcn-ui@latest add dialog alert-dialog
npx shadcn-ui@latest add dropdown-menu popover
npx shadcn-ui@latest add badge tooltip
npx shadcn-ui@latest add form label
```

#### Phase 2: Gradual Replacement
```typescript
// ❌ Before - Custom styled button
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Submit
</button>

// ✅ After - shadcn/ui Button with custom variant
<Button variant="default" className="bg-blue-500 hover:bg-blue-700">
  Submit
</Button>

// 🎯 Even better - Add custom variant to button.tsx
<Button variant="brand">Submit</Button>
```

#### Phase 3: Extend When Needed
```typescript
// src/components/ui/button.tsx - Add your variants
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        // 🎯 Your custom variants
        health: "bg-green-600 text-white hover:bg-green-700",
        energy: "bg-orange-500 text-white hover:bg-orange-600",
        mood: "bg-purple-500 text-white hover:bg-purple-600",
      },
      size: {
        default: "h-9 px-4 py-2",
        // 🎯 Your custom sizes
        xs: "h-7 px-2 text-xs",
        xl: "h-12 px-8 text-lg",
      },
    },
  }
)
```

### 3. Component Enhancement Patterns

#### Enhanced Input with Health-Specific Features
```typescript
// src/components/ui/health-input.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface HealthInputProps extends React.ComponentProps<typeof Input> {
  label: string;
  unit?: string;
  healthMetric?: 'mood' | 'energy' | 'sleep' | 'pain';
  error?: string;
}

export function HealthInput({ 
  label, 
  unit, 
  healthMetric, 
  error, 
  className,
  ...props 
}: HealthInputProps) {
  const metricColors = {
    mood: 'focus-visible:ring-purple-500',
    energy: 'focus-visible:ring-orange-500',
    sleep: 'focus-visible:ring-blue-500',
    pain: 'focus-visible:ring-red-500',
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{label}</Label>
      <div className="relative">
        <Input
          className={cn(
            healthMetric && metricColors[healthMetric],
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

// Usage
<HealthInput
  label="Sleep Hours"
  unit="hrs"
  healthMetric="sleep"
  type="number"
  min={0}
  max={24}
  step={0.5}
/>
```

## Theming & Customization

### 1. CSS Variables Integration (Already Working)
Your current CSS variables work perfectly with shadcn/ui:

```css
/* src/styles/globals.css - Your current setup */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --secondary: 240 4.8% 95.9%;
    /* shadcn/ui components automatically use these! */
  }
}
```

### 2. Theme Customization for Health App
```css
/* Add health-specific theme variables */
:root {
  /* Your existing variables */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  
  /* Health-specific colors */
  --health-mood: 280 100% 65%;      /* Purple for mood */
  --health-energy: 25 95% 53%;      /* Orange for energy */
  --health-sleep: 217 91% 60%;      /* Blue for sleep */
  --health-pain: 0 84% 60%;         /* Red for pain */
  --health-wellness: 142 71% 45%;   /* Green for wellness */
}

.dark {
  /* Dark mode variants */
  --health-mood: 280 100% 75%;
  --health-energy: 25 95% 63%;
  /* ... */
}
```

### 3. Custom Component Variants
```typescript
// Extend existing shadcn/ui components
// src/components/ui/health-card.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cva, type VariantProps } from "class-variance-authority";

const healthCardVariants = cva(
  "transition-all duration-200",
  {
    variants: {
      metric: {
        mood: "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/50",
        energy: "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50",
        sleep: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50",
        pain: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50",
      },
    },
  }
);

interface HealthCardProps extends React.ComponentProps<typeof Card>, VariantProps<typeof healthCardVariants> {
  metric?: 'mood' | 'energy' | 'sleep' | 'pain';
}

export function HealthCard({ metric, className, ...props }: HealthCardProps) {
  return (
    <Card 
      className={cn(healthCardVariants({ metric }), className)}
      {...props}
    />
  );
}
```

## Form Patterns with shadcn/ui

### 1. Upgrade to React Hook Form + shadcn/ui
```bash
# Add form components
npx shadcn-ui@latest add form

# Install React Hook Form (if not already installed)
npm install react-hook-form @hookform/resolvers zod
```

### 2. Enhanced Form Pattern
```typescript
// Enhanced version of your MorningCheckInForm
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const morningCheckInSchema = z.object({
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.number().min(1).max(10),
  dreams: z.string().optional(),
  morningMood: z.number().min(1).max(10),
  physicalStatus: z.enum(['Energetic', 'Rested', 'Neutral', 'Tired', 'Exhausted', 'Pain']),
  breakfast: z.string().optional(),
});

export function EnhancedMorningCheckInForm() {
  const form = useForm<z.infer<typeof morningCheckInSchema>>({
    resolver: zodResolver(morningCheckInSchema),
    defaultValues: {
      sleepHours: 7,
      sleepQuality: 5,
      morningMood: 5,
      dreams: '',
      breakfast: '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Morning Check-In</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="sleepHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours of Sleep</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sleepQuality"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Sleep Quality (1-10)</FormLabel>
                    <span className="text-sm font-medium">{field.value}</span>
                  </div>
                  <FormControl>
                    <Slider
                      defaultValue={[field.value]}
                      max={10}
                      step={1}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Save Morning Check-In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

## Common Patterns & Best Practices

### 1. Import Organization
```typescript
// ✅ Group imports logically
// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Custom components
import { HealthCard } from '@/components/ui/health-card';
import { CustomChart } from '@/components/charts/CustomChart';

// External libraries
import { format } from 'date-fns';
```

### 2. Component Composition
```typescript
// ✅ Compose shadcn/ui components effectively
function HealthMetricCard({ title, value, unit, trend }: HealthMetricProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        {trend && (
          <Badge variant="outline" className="mt-2">
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
```

### 3. Responsive Design
```typescript
// ✅ Use shadcn/ui with responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card className="md:col-span-2">
    <CardContent>Main content</CardContent>
  </Card>
  <Card>
    <CardContent>Sidebar</CardContent>
  </Card>
</div>
```

## Migration Checklist

### Before Starting Migration
- [ ] **Audit current components** - List all custom components
- [ ] **Identify shadcn/ui equivalents** - Check what's available
- [ ] **Plan migration order** - Start with simple components
- [ ] **Backup current components** - Git branch or copy files

### During Migration
- [ ] **Add components incrementally** - One at a time
- [ ] **Test after each addition** - Ensure everything works
- [ ] **Update imports gradually** - Replace one component per commit
- [ ] **Maintain visual consistency** - Ensure UI doesn't break

### After Migration
- [ ] **Remove unused custom components** - Clean up old files
- [ ] **Update documentation** - Document any customizations
- [ ] **Test thoroughly** - All forms and interactions
- [ ] **Performance check** - Bundle size and runtime performance

## Decision Matrix: When to Use What

### ✅ Use shadcn/ui When:
- **Standard UI patterns** (buttons, inputs, cards, dialogs)
- **Form components** (inputs, selects, checkboxes)
- **Navigation elements** (tabs, breadcrumbs, dropdowns)
- **Feedback components** (alerts, toasts, badges)
- **Data display** (tables, basic charts)

### ❌ Keep Custom Components When:
- **Complex data visualizations** (your health charts)
- **App-specific business logic** (health metric calculations)
- **Highly specialized UI** (custom layouts, unique interactions)
- **Performance-critical components** (real-time updates)

### 🔄 Hybrid Approach When:
- **Extend shadcn/ui components** with your custom logic
- **Wrap shadcn/ui components** in your business layer
- **Compose multiple shadcn/ui components** into custom patterns

## Troubleshooting Common Issues

### 1. Import Errors
```bash
# If components aren't found
npm install @radix-ui/react-slot
npm install class-variance-authority
npm install lucide-react

# Re-add the component
npx shadcn-ui@latest add button
```

### 2. Styling Conflicts
```typescript
// Use cn() to merge classes properly
import { cn } from '@/lib/utils';

<Button className={cn(
  "default-styles",
  "your-custom-styles",
  conditionalStyles && "conditional-styles"
)}>
  Button
</Button>
```

### 3. Theme Variables Not Working
```css
/* Ensure CSS variables are defined */
:root {
  --primary: 240 5.9% 10%;  /* Required for shadcn/ui */
  --background: 0 0% 100%;   /* Required for shadcn/ui */
}
```

## Next Steps for Your Refactor

1. **Start with forms** - Migrate `MorningCheckInForm` and other form components
2. **Add missing components** - `npx shadcn-ui@latest add form dialog badge`
3. **Create health-specific variants** - Extend Button, Card, Input with health themes
4. **Gradual replacement** - One component at a time
5. **Update documentation** - Keep this guide updated with your customizations

## Related Documents
- `docs/04-frontend/01-components.md` - Component architecture overview
- `docs/04-frontend/02-theming.md` - Theming and design system
- `docs/06-guides/02-adding-new-features.md` - Feature development workflow

## External Resources
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Class Variance Authority](https://cva.style/docs)

## Changelog
- 2025-07-06: Complete rewrite with practical implementation focus
- 2025-07-06: Added migration strategies and refactor planning
- 2025-07-06: Real-world examples from MorningCheckInForm
- 2025-07-06: Component decision matrix and troubleshooting guide
