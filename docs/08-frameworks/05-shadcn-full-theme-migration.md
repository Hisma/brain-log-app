---
title: Complete Migration to Stock shadcn/ui Theme
description: Clean migration from custom purple theme to stock shadcn/ui default theme with zero customization for maximum maintainability
created: 2025-07-06
updated: 2025-07-06
version: 2.0.0
status: final
priority: high
---

# Complete Migration to Stock shadcn/ui Theme

## Mission Statement

**Transform Brain Log App from a hybrid custom/shadcn setup to a 100% stock shadcn/ui default theme with zero custom styling.**

**Goal**: Eliminate all custom CSS and AI-generated purple theming in favor of clean, flat, maintainable stock shadcn/ui components.

## Why Stock shadcn/ui Theme?

### Current Problems (AI-Generated Custom Theme)
- ❌ **Purple gradient mess** - AI-generated styling that looks unprofessional
- ❌ **Complex custom CSS** - Overengineered theming with oklch colors and gradients
- ❌ **Maintenance nightmare** - Custom variables that break with updates
- ❌ **Inconsistent patterns** - Mix of custom Tailwind and shadcn/ui approaches
- ❌ **Non-standard appearance** - Doesn't follow established design patterns

### Benefits of Stock Default Theme
- ✅ **Clean, flat design** - Professional appearance without gradients
- ✅ **Zero maintenance overhead** - Always compatible with shadcn updates
- ✅ **Battle-tested** - Used by thousands of production applications
- ✅ **Built-in accessibility** - WCAG 2.1 AA compliant out of the box
- ✅ **System theme integration** - Perfect light/dark mode with auto-detection
- ✅ **Future-proof** - Solid foundation for minimal customization later

## Current State Audit

### Existing shadcn/ui Components ✅
```typescript
// Already using shadcn/ui properly
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
```

### Custom Components Requiring Migration 🔄

#### Forms Directory (`src/components/forms/`)
| Custom Component | Lines | shadcn/ui Replacement | Migration Complexity |
|------------------|-------|----------------------|---------------------|
| `AfternoonCheckInForm.tsx` | ~150 | Form + Input + Select + Slider | Medium |
| `ConcertaDoseLogForm.tsx` | ~100 | Form + Input + TimePicker | Medium |
| `EveningReflectionForm.tsx` | ~200 | Form + Textarea + Select | Medium |
| `MidDayCheckInForm.tsx` | ~120 | Form + Input + Select | Medium |
| `MorningCheckInForm.tsx` | ~180 | Form + Input + Slider + Select | Medium |
| `WeeklyReflectionForm.tsx` | ~250 | Form + Textarea + Checkbox | High |

#### Charts Directory (`src/components/charts/`)
| Custom Component | Migration Strategy | Reason |
|------------------|-------------------|--------|
| `FocusEnergyChart.tsx` | **Keep + Theme** | Specialized health visualization |
| `MoodTrendChart.tsx` | **Keep + Theme** | Custom health data patterns |
| `SleepQualityChart.tsx` | **Keep + Theme** | Domain-specific requirements |
| `WeeklyInsightsChart.tsx` | **Keep + Theme** | Complex health analytics |

#### Layout Directory (`src/components/layout/`)
| Custom Component | shadcn/ui Replacement | Migration Strategy |
|------------------|----------------------|-------------------|
| `Header.tsx` | Navigation + Avatar + DropdownMenu | Replace with themed shadcn/ui |
| `Footer.tsx` | Custom layout | Keep but use shadcn/ui primitives |
| `Layout.tsx` | Composition of shadcn/ui components | Refactor to use shadcn/ui |

#### UI Directory (`src/components/ui/`)
| Custom Component | Status | Action |
|------------------|--------|--------|
| `daily-insight-card.tsx` | Custom | Replace with themed Card |
| `datetime-picker.tsx` | Custom | Replace with shadcn/ui DatePicker |
| `dropdown-menu.tsx` | shadcn/ui | ✅ Keep |
| `modetoggle.tsx` | Custom | Replace with themed Switch |

### Other Custom Components
| Component | Location | Migration Plan |
|-----------|----------|---------------|
| `current-time.tsx` | `src/components/` | Theme with shadcn/ui Typography |
| `DailyLogOverview.tsx` | `src/components/` | Replace with themed Card + Badge |
| `timezone-selector.tsx` | `src/components/` | Replace with shadcn/ui Select |

## Stock Theme Implementation Strategy

### 1. Complete CSS Reset - Stock Default Theme

**Replace current globals.css with official shadcn default theme:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 10% 3.9%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Key Changes:**
- ❌ **Remove all oklch() colors** - Use standard HSL
- ❌ **Remove gradients** - Flat colors only  
- ❌ **Remove custom @theme block** - Use standard CSS variables
- ❌ **Remove custom variants** - Stock functionality only
- ✅ **Clean, flat appearance** - Professional and maintainable

### 2. System Theme Detection Setup

**Enhanced theme provider with system preference:**

```typescript
// src/lib/utils/ThemeProvider.tsx - Stock theme system
'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"  // Auto-detect system preference
      enableSystem={true}    // Enable system theme detection
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
```

### 3. Zero Custom Components Strategy

**Component replacement approach:**
- **No custom variants** - Use only stock shadcn/ui components
- **No custom CSS classes** - Pure shadcn composition
- **No health-specific theming** - Clean, neutral design
- **Standard patterns only** - Follow shadcn documentation exactly

## Migration Implementation Plan

### Phase 1: CSS Reset to Stock Theme (Day 1)

#### Step 1: Replace globals.css with Stock Theme
```bash
# Backup current theme
cp src/app/globals.css src/app/globals.css.backup

# Replace with stock default theme CSS
# (See stock theme CSS above)
```

#### Step 2: Add Missing shadcn/ui Components  
```bash
# Add components needed for migration
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add date-picker
```

#### Step 3: Verify Stock Theme Works
- Test light/dark mode switching
- Verify system theme detection
- Check existing shadcn/ui components still work
- Confirm purple theme is eliminated

### Phase 2: Component Migration with Stock Components (Week 2)

#### Priority Order (Simplest to Most Complex)
1. **ConcertaDoseLogForm** (Simplest - mainly inputs)
2. **MidDayCheckInForm** (Simple - few components)  
3. **AfternoonCheckInForm** (Medium - standard form pattern)
4. **MorningCheckInForm** (Medium - slider + inputs)
5. **EveningReflectionForm** (Complex - textarea + validation)
6. **WeeklyReflectionForm** (Most complex - multi-step form)

#### Stock Component Migration Template
```typescript
// Template: Migrating MorningCheckInForm.tsx - STOCK COMPONENTS ONLY
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const morningCheckInSchema = z.object({
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.number().min(1).max(10),
  morningMood: z.number().min(1).max(10),
  physicalStatus: z.enum(['Energetic', 'Rested', 'Neutral', 'Tired', 'Exhausted']),
});

export function MorningCheckInForm() {
  const form = useForm<z.infer<typeof morningCheckInSchema>>({
    resolver: zodResolver(morningCheckInSchema),
  });

  return (
    <Card>  {/* Stock Card - no custom variants */}
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
                    <Input  {/* Stock Input - no customization */}
                      type="number"
                      min={0}
                      max={24}
                      step={0.5}
                      placeholder="7.5"
                      {...field}
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
                  <FormLabel>Sleep Quality (1-10): {field.value}</FormLabel>
                  <FormControl>
                    <Slider  {/* Stock Slider - no theming */}
                      defaultValue={[field.value]}
                      max={10}
                      step={1}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">  {/* Stock Button */}
              Save Morning Check-In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

**Key Principles:**
- ❌ **No custom components** - Use only stock shadcn/ui
- ❌ **No custom variants** - Default variants only
- ❌ **No custom styling** - Standard shadcn patterns
- ✅ **Clean composition** - Stack stock components

### Phase 3: Layout & Navigation Migration (Week 3)

#### Header Component Migration
```typescript
// src/components/layout/Header.tsx - Fully themed version
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        
        {/* Logo */}
        <div className="mr-4 flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <Badge variant="outline" className="text-health-wellness border-health-wellness">
              Brain Log
            </Badge>
          </a>
        </div>

        {/* Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink 
                className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                href="/daily-log"
              >
                Daily Log
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/insights">Insights</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/weekly-reflection">Weekly Reflection</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* User Menu */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  );
}
```

### Phase 4: Final Component Replacements (Week 4)

#### Component Replacement Checklist
- [ ] **DailyLogOverview** → Composed HealthCard components
- [ ] **timezone-selector** → shadcn/ui Select with custom styling
- [ ] **current-time** → Typography component with theming
- [ ] **daily-insight-card** → Enhanced HealthCard component
- [ ] **datetime-picker** → shadcn/ui DatePicker
- [ ] **modetoggle** → shadcn/ui Switch with custom theming

## Quality Gates & Validation

### 1. Component Audit Script
```bash
# Create audit script to find custom Tailwind usage
echo "# Custom Tailwind Component Audit" > component-audit.md
echo "Generated: $(date)" >> component-audit.md
echo "" >> component-audit.md

# Find all custom className usage
grep -r "className=" src/components --include="*.tsx" | grep -v "shadcn" | wc -l
echo "Custom className instances found: $(grep -r "className=" src/components --include="*.tsx" | grep -v "shadcn" | wc -l)" >> component-audit.md

# Find non-shadcn component imports
grep -r "from.*components" src --include="*.tsx" | grep -v "ui/" | wc -l
echo "Non-shadcn component imports: $(grep -r "from.*components" src --include="*.tsx" | grep -v "ui/" | wc -l)" >> component-audit.md
```

### 2. Accessibility Validation
```typescript
// Add to each migrated component
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('MorningCheckInForm should be accessible', async () => {
  const { container } = render(<MorningCheckInForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 3. Design System Consistency Check
- [ ] All components use health color variables
- [ ] No hardcoded colors outside of CSS variables
- [ ] Consistent spacing using shadcn/ui patterns
- [ ] All interactive elements use shadcn/ui primitives
- [ ] Dark mode works for all health-themed components

## Success Metrics

### Before Migration (Current State)
- **Custom Components**: ~15 custom Tailwind components
- **Styling Approaches**: 2 (custom Tailwind + shadcn/ui)
- **Accessibility Coverage**: ~60% (estimated)
- **Design Consistency**: Medium (mixed patterns)
- **Maintenance Overhead**: High (multiple patterns)

### After Migration (Target State)
- **Custom Components**: 0 (everything uses shadcn/ui base)
- **Styling Approaches**: 1 (themed shadcn/ui only)
- **Accessibility Coverage**: 95% (shadcn/ui standards)
- **Design Consistency**: High (single design system)
- **Maintenance Overhead**: Low (centralized theming)

### Key Performance Indicators
1. **Zero custom Tailwind components** - Everything uses shadcn/ui
2. **100% health theming** - All components follow health color system
3. **Accessible by default** - All components meet WCAG 2.1 AA standards
4. **Consistent design language** - No visual inconsistencies
5. **Developer experience** - Single pattern for all UI components

## Migration Timeline

### Week 1: Foundation
- **Days 1-2**: Add all needed shadcn/ui components
- **Days 3-4**: Create health-themed component variants
- **Day 5**: Test foundation and color system

### Week 2: Forms Migration
- **Day 1**: ConcertaDoseLogForm (simplest)
- **Day 2**: MidDayCheckInForm
- **Day 3**: AfternoonCheckInForm
- **Day 4**: MorningCheckInForm
- **Day 5**: Start EveningReflectionForm

### Week 3: Complex Forms + Layout
- **Days 1-2**: Complete EveningReflectionForm
- **Days 3-4**: WeeklyReflectionForm (most complex)
- **Day 5**: Header/Layout migration

### Week 4: Final Polish
- **Days 1-3**: Remaining component migrations
- **Day 4**: Quality gates and accessibility audit
- **Day 5**: Documentation and testing

## Rollback Strategy

### Git Strategy
```bash
# Create migration branch
git checkout -b feature/shadcn-full-migration

# Create checkpoint branches for each phase
git checkout -b checkpoint/phase-1-foundation
git checkout -b checkpoint/phase-2-forms
git checkout -b checkpoint/phase-3-layout
git checkout -b checkpoint/phase-4-final
```

### Component Backup
- Keep original components in `/backup/` directory during migration
- Don't delete until migration is complete and tested
- Document any custom logic that needs to be preserved

### Testing at Each Phase
- Visual regression testing with screenshots
- Functional testing of all form submissions
- Accessibility testing with screen readers
- Performance testing (bundle size, runtime)

## Troubleshooting Guide

### Common Migration Issues

#### 1. Styling Conflicts
```typescript
// Problem: Custom styles not applying
<Button className="bg-red-500">Custom Button</Button>

// Solution: Use component variants
<Button variant="pain">Custom Button</Button>
```

#### 2. Form Validation Issues
```typescript
// Problem: Complex validation logic
const validateSleep = (hours) => hours >= 0 && hours <= 24;

// Solution: Use Zod schema with shadcn/ui Form
const schema = z.object({
  sleepHours: z.number().min(0).max(24)
});
```

#### 3. Custom Event Handlers
```typescript
// Problem: Custom onChange logic
<input onChange={(e) => complexLogic(e.target.value)} />

// Solution: Wrap in FormField with custom logic
<FormField
  render={({ field }) => (
    <Input 
      {...field}
      onChange={(e) => {
        field.onChange(e.target.value);
        complexLogic(e.target.value);
      }}
    />
  )}
/>
```

## Related Documents
- `docs/08-frameworks/03-shadcn-ui-usage.md` - Basic shadcn/ui implementation
- `docs/08-frameworks/04-tailwindcss4-practices.md` - TailwindCSS 4 integration
- `docs/04-frontend/02-theming.md` - Design system documentation
- `docs/06-guides/02-adding-new-features.md` - Component development guide

## External Resources
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [shadcn/ui Theming Guide](https://ui.shadcn.com/docs/theming)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

## Changelog
- 2025-07-06: Initial creation - Complete migration strategy
- 2025-07-06: Added health theming system and component variants
- 2025-07-06: Detailed migration timeline and quality gates
- 2025-07-06: Troubleshooting guide and rollback strategy
