---
title: Frontend Architecture
description: Next.js App Router implementation and frontend component architecture in the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Frontend Architecture

## Overview
The Brain Log App implements a modern frontend architecture using Next.js 15 App Router with React 19, featuring a hybrid server/client component strategy, responsive design with Tailwind CSS, and a comprehensive UI component system built on shadcn/ui. This document details the frontend implementation patterns, component architecture, and user interface design systems.

## Frontend Technology Stack

### Core Framework
- **Next.js 15**: App Router with Server Components
- **React 19**: Latest React features and performance optimizations
- **TypeScript**: Full type safety across the frontend
- **Tailwind CSS**: Utility-first styling framework
- **shadcn/ui**: Component library foundation

### Additional Libraries
- **NextAuth.js v5**: Client-side authentication management
- **Recharts**: Data visualization and charting
- **Radix UI**: Primitive component foundation
- **Lucide React**: Icon system
- **Date-fns**: Date manipulation utilities

## App Router Architecture

### Directory Structure
```
/src/app
├── layout.tsx              # Root layout (Server Component)
├── page.tsx               # Home page (Server Component)
├── globals.css            # Global styles and Tailwind imports
├── /daily-log
│   ├── page.tsx           # Daily log overview (Server Component)
│   └── /[id]
│       └── page.tsx       # Individual daily log (Server Component)
├── /weekly-reflection
│   ├── page.tsx           # Weekly reflection list (Server Component)
│   ├── /[id]
│   │   └── page.tsx       # View weekly reflection (Server Component)
│   └── /new
│       └── page.tsx       # Create weekly reflection (Server Component)
├── /insights
│   └── page.tsx           # Insights dashboard (Server Component)
├── /weekly-insights
│   └── page.tsx           # Weekly insights view (Server Component)
├── /profile
│   └── page.tsx           # User profile (Server Component)
├── /login
│   └── page.tsx           # Login page (Server Component)
└── /register
    └── page.tsx           # Registration page (Server Component)
```

### Server vs Client Component Strategy

#### Server Components (Default)
**Purpose**: Data fetching, SEO optimization, performance
**Files**: All page.tsx files, layout.tsx

```typescript
// Server Component Example - Daily Log Page
import { auth } from '@/auth';
import { DailyLogOverview } from '@/components/DailyLogOverview';
import prisma from '@/lib/prisma';

export default async function DailyLogPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  // Server-side data fetching
  const dailyLogs = await prisma.dailyLog.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 30
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Daily Log</h1>
      <DailyLogOverview logs={dailyLogs} />
    </div>
  );
}
```

#### Client Components
**Purpose**: Interactivity, state management, browser APIs
**Identification**: 'use client' directive

```typescript
// Client Component Example - Interactive Form
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function MorningCheckInForm({ initialData }: FormProps) {
  const [formData, setFormData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        router.refresh(); // Refresh server components
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Component Architecture

### Component Organization
```
/src/components
├── /layout               # Layout components
│   ├── Layout.tsx        # Main layout wrapper (Client)
│   ├── Header.tsx        # Navigation header (Client)
│   └── Footer.tsx        # Site footer (Client)
├── /providers           # Context providers
│   └── ClientProviders.tsx # All client providers (Client)
├── /forms               # Form components
│   ├── MorningCheckInForm.tsx
│   ├── MidDayCheckInForm.tsx
│   ├── AfternoonCheckInForm.tsx
│   ├── EveningReflectionForm.tsx
│   ├── ConcertaDoseLogForm.tsx
│   └── WeeklyReflectionForm.tsx
├── /charts              # Data visualization
│   ├── MoodTrendChart.tsx
│   ├── SleepQualityChart.tsx
│   ├── FocusEnergyChart.tsx
│   └── WeeklyInsightsChart.tsx
├── /ui                  # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── dialog.tsx
│   ├── calendar.tsx
│   ├── chart.tsx
│   └── [additional ui components]
├── DailyLogOverview.tsx  # Daily log display
├── current-time.tsx      # Real-time clock
└── timezone-selector.tsx # Timezone management
```

### Layout Component System

#### Root Layout
**File**: `/src/app/layout.tsx`
**Type**: Server Component

```typescript
import { Inter } from 'next/font/google';
import { ClientProviders } from '@/components/providers/ClientProviders';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Brain Log App',
  description: 'Personal health and wellness tracking application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
```

#### Main Layout Component
**File**: `/src/components/layout/Layout.tsx`
**Type**: Client Component

```typescript
'use client';

import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ClientProviders } from '@/components/providers/ClientProviders';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <ClientProviders>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </ClientProviders>
  );
}
```

## State Management Architecture

### Client Providers System
**File**: `/src/components/providers/ClientProviders.tsx`

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/lib/utils/ThemeProvider';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { Toaster } from '@/components/ui/sonner';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
```

### Authentication Context
**File**: `/src/lib/auth/AuthContext.tsx`

```typescript
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        isLoading: status === 'loading',
        isAuthenticated: !!session?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### Theme Management
**File**: `/src/lib/utils/ThemeProvider.tsx`

```typescript
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

## Form Component Architecture

### Form Component Pattern
All form components follow a consistent pattern for state management and API interaction:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FormData {
  // Type definitions for form data
}

interface FormProps {
  initialData?: Partial<FormData>;
  onSubmit?: (data: FormData) => void;
}

export function FormComponent({ initialData, onSubmit }: FormProps) {
  const [formData, setFormData] = useState<FormData>(initialData || {});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        setErrors({ general: error.message });
        return;
      }
      
      const result = await response.json();
      
      if (onSubmit) {
        onSubmit(result);
      } else {
        router.push('/success-page');
      }
      
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Title</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Daily Log Form System

#### Four-Stage Form Architecture
The daily logging system implements a time-based four-stage form system:

1. **Morning Check-in (7-9am)**: Sleep tracking and morning mood
2. **Medication Log (9-10am)**: Concerta dose and timing
3. **Mid-day Check-in (11am-1pm)**: Focus, energy, and emotional state
4. **Afternoon Check-in (3-5pm)**: Crash symptoms and interactions
5. **Evening Reflection (8-10pm)**: Overall assessment and planning

```typescript
// Shared form state management
interface DailyLogFormData {
  // Morning fields
  sleepHours: number;
  sleepQuality: number;
  morningMood: number;
  
  // Medication fields
  medicationTaken: boolean;
  medicationDose: number;
  
  // Mid-day fields
  focusLevel: number;
  energyLevel: number;
  
  // Afternoon fields
  isCrashing: boolean;
  anxietyLevel: number;
  
  // Evening fields
  overallMood: number;
  dayRating: number;
}
```

## UI Component System

### shadcn/ui Integration
The application uses shadcn/ui as the foundation for the component library:

#### Core UI Components
```typescript
// /src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

#### Custom UI Components
```typescript
// /src/components/ui/daily-insight-card.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Button } from './button';

interface InsightCardProps {
  title: string;
  content: string;
  date: string;
  onGenerate?: () => void;
}

export function DailyInsightCard({ title, content, date, onGenerate }: InsightCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {title}
          <span className="text-sm text-muted-foreground">{date}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {content ? (
          <p className="text-sm leading-relaxed">{content}</p>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">No insight generated yet</p>
            <Button onClick={onGenerate} variant="outline">
              Generate Insight
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Data Visualization Architecture

### Chart Component System
**Technology**: Recharts with custom styling

```typescript
// /src/components/charts/MoodTrendChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MoodData {
  date: string;
  morningMood: number;
  overallMood: number;
}

interface MoodTrendChartProps {
  data: MoodData[];
}

export function MoodTrendChart({ data }: MoodTrendChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis 
            domain={[1, 10]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number, name: string) => [value, name]}
          />
          <Line 
            type="monotone" 
            dataKey="morningMood" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="Morning Mood"
          />
          <Line 
            type="monotone" 
            dataKey="overallMood" 
            stroke="#82ca9d" 
            strokeWidth={2}
            name="Overall Mood"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## Responsive Design Architecture

### Tailwind CSS Configuration
**File**: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... additional color definitions
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### Responsive Component Patterns
```typescript
// Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards adapt to screen size */}
</div>

// Container with responsive padding
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content with responsive spacing */}
</div>

// Typography scaling
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>
```

## Performance Optimization

### Server Component Benefits
- **Reduced JavaScript Bundle**: Server components don't ship to the client
- **Faster Initial Load**: HTML rendered on server
- **SEO Optimization**: Server-rendered content for search engines
- **Data Fetching**: Direct database access in server components

### Client Component Optimization
```typescript
// Lazy loading for heavy components
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

export function Dashboard() {
  return (
    <div>
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/profile-picture.jpg"
  alt="User profile"
  width={100}
  height={100}
  className="rounded-full"
  priority // For above-the-fold images
/>
```

## Error Handling and Loading States

### Error Boundaries
```typescript
// /src/app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold mb-4">Something went wrong!</h2>
      <button
        onClick={reset}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Try again
      </button>
    </div>
  );
}
```

### Loading States
```typescript
// /src/app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}
```

## Navigation and Routing

### App Router Navigation
```typescript
// Client-side navigation
'use client';

import { useRouter } from 'next/navigation';

export function NavigationExample() {
  const router = useRouter();
  
  const handleNavigation = () => {
    router.push('/daily-log');
    router.refresh(); // Refresh server components
  };
  
  return <button onClick={handleNavigation}>Go to Daily Log</button>;
}
```

### Header Navigation Component
```typescript
// /src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Daily Log', href: '/daily-log' },
    { name: 'Weekly Reflection', href: '/weekly-reflection' },
    { name: 'Insights', href: '/insights' },
  ];
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Brain Log
          </Link>
          
          {isAuthenticated && (
            <div className="flex space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
```

## Accessibility Implementation

### Semantic HTML and ARIA
```typescript
// Accessible form components
<form role="form" aria-labelledby="form-title">
  <h2 id="form-title">Morning Check-in</h2>
  
  <label htmlFor="sleep-hours" className="block text-sm font-medium">
    Sleep Hours
  </label>
  <input
    id="sleep-hours"
    type="number"
    min="0"
    max="24"
    aria-describedby="sleep-hours-help"
    className="mt-1 block w-full rounded-md border-gray-300"
  />
  <p id="sleep-hours-help" className="text-sm text-gray-500">
    Enter the number of hours you slept
  </p>
</form>
```

### Keyboard Navigation
```typescript
// Focus management
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
};

<button
  onKeyDown={handleKeyDown}
  className="focus:outline-none focus:ring-2 focus:ring-primary"
>
  Action Button
</button>
```

## Future Frontend Enhancements

### Planned Features
- **Progressive Web App**: Service worker implementation for offline capability
- **Real-time Updates**: WebSocket integration for live data synchronization
- **Advanced Data Visualization**: Interactive charts and analytics dashboards
- **Mobile App**: React Native implementation for native mobile experience

### Performance Improvements
- **Code Splitting**: Further optimization of bundle sizes
- **Caching Strategies**: Implementation of React Query for data caching
- **Component Library**: Migration to a fully custom component system
- **Animation System**: Framer Motion integration for enhanced UX

## Related Documents
- [System Architecture Overview](./01-overview.md) - High-level system design
- [Backend Architecture](./03-backend.md) - API integration patterns
- [Authentication Architecture](./05-authentication.md) - Client-side authentication
- [Database Architecture](./04-database.md) - Data structure understanding

## Changelog
- 2025-07-06: Initial frontend architecture documentation created
- 2025-07-06: Next.js App Router patterns and component system detailed
- 2025-07-06: UI component library and responsive design documented
