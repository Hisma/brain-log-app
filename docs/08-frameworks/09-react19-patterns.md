---
title: React 19 Patterns and Best Practices
description: Comprehensive guide to React 19 features, patterns, and integration with Next.js 15 for the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# React 19 Patterns and Best Practices

## Overview

React 19 introduces significant improvements for modern web applications, particularly when integrated with Next.js 15. This document covers React 19's new features, migration patterns, and best practices specific to the Brain Log App's architecture and use cases.

## React 19 Key Features

### New Hooks

#### useActionState
Manages state updates based on form action results, providing integrated loading and error states.

```typescript
import { useActionState } from 'react';

// Traditional pattern (current implementation)
function TraditionalForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await submitAction(data);
      // Handle success
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
}

// React 19 pattern with useActionState
function ModernForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const result = await submitAction(formData);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    { success: null, data: null, error: null }
  );
  
  return (
    <form action={formAction}>
      {/* Form fields */}
      <button disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
```

#### useOptimistic
Provides optimistic UI updates during async operations, improving perceived performance.

```typescript
import { useOptimistic } from 'react';

// Daily Log optimistic updates example
function DailyLogList({ logs }: { logs: DailyLog[] }) {
  const [optimisticLogs, addOptimisticLog] = useOptimistic(
    logs,
    (currentLogs, newLog: DailyLog) => [...currentLogs, newLog]
  );
  
  const handleAddLog = async (logData: Partial<DailyLog>) => {
    // Optimistically add the log
    const optimisticLog = {
      id: `temp-${Date.now()}`,
      ...logData,
      createdAt: new Date(),
    } as DailyLog;
    
    addOptimisticLog(optimisticLog);
    
    try {
      // Actual API call
      await createDailyLog(logData);
      // React will automatically replace optimistic state with real data
    } catch (error) {
      // Handle error - optimistic update will be reverted
      console.error('Failed to create log:', error);
    }
  };
  
  return (
    <div>
      {optimisticLogs.map(log => (
        <LogCard 
          key={log.id} 
          log={log} 
          isPending={log.id.startsWith('temp-')}
        />
      ))}
    </div>
  );
}
```

#### use Hook
Handles promises and context consumption in a more declarative way.

```typescript
import { use } from 'react';

// Promise handling with use hook
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // Suspends until resolved
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// Context consumption with use hook
function ThemeConsumer() {
  const theme = use(ThemeContext); // Alternative to useContext
  
  return <div className={theme.mode}>Content</div>;
}
```

## Migration Patterns

### Form Component Migration

Current MorningCheckInForm using traditional patterns:

```typescript
// Current implementation (traditional React patterns)
export function MorningCheckInForm({ onSubmit, isSubmitting }: Props) {
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await onSubmit({ sleepHours, sleepQuality });
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

Migrated version using React 19 patterns:

```typescript
// Modern React 19 implementation
import { useActionState } from 'react';

async function submitMorningCheckIn(
  prevState: any,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = {
      sleepHours: Number(formData.get('sleepHours')),
      sleepQuality: Number(formData.get('sleepQuality')),
      dreams: formData.get('dreams') as string,
      morningMood: Number(formData.get('morningMood')),
      physicalStatus: formData.get('physicalStatus') as string,
      breakfast: formData.get('breakfast') as string,
    };
    
    const response = await fetch('/api/daily-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('Failed to save');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function ModernMorningCheckInForm() {
  const [state, formAction, isPending] = useActionState(
    submitMorningCheckIn,
    { success: null, error: null }
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Morning Check-In</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="sleepHours">Hours of Sleep</label>
            <Input 
              name="sleepHours"
              type="number" 
              min={0} 
              max={24} 
              step={0.5}
              defaultValue={7}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="sleepQuality">Sleep Quality (1-10)</label>
            <Slider 
              name="sleepQuality"
              defaultValue={[5]}
              max={10}
              step={1}
            />
          </div>
          
          {/* Other form fields */}
          
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Morning Check-In'}
          </Button>
          
          {state.error && (
            <p className="text-red-500 text-sm">{state.error}</p>
          )}
          
          {state.success && (
            <p className="text-green-500 text-sm">Saved successfully!</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
```

### Server Actions Integration

Enhanced server actions with React 19:

```typescript
// app/actions/daily-logs.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function createDailyLogAction(
  prevState: any,
  formData: FormData
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const data = {
      userId: session.user.id,
      sleepHours: Number(formData.get('sleepHours')),
      sleepQuality: Number(formData.get('sleepQuality')),
      dreams: formData.get('dreams') as string,
      morningMood: Number(formData.get('morningMood')),
      physicalStatus: formData.get('physicalStatus') as string,
      breakfast: formData.get('breakfast') as string,
      date: new Date().toISOString().split('T')[0],
    };
    
    const log = await prisma.dailyLog.create({ data });
    
    revalidatePath('/daily-log');
    revalidatePath('/insights');
    
    return { success: true, data: log };
  } catch (error) {
    console.error('Failed to create daily log:', error);
    return { 
      success: false, 
      error: 'Failed to save daily log. Please try again.' 
    };
  }
}

// Usage in component
import { createDailyLogAction } from '@/app/actions/daily-logs';

export function DailyLogForm() {
  const [state, formAction, isPending] = useActionState(
    createDailyLogAction,
    { success: null, error: null }
  );
  
  return (
    <form action={formAction}>
      {/* Form implementation */}
    </form>
  );
}
```

## Next.js 15 Integration

### Server Components with React 19

```typescript
// app/insights/page.tsx
import { use } from 'react';
import { getInsights } from '@/lib/services/insights';
import { auth } from '@/lib/auth';

// Server Component with React 19 patterns
export default function InsightsPage() {
  const session = use(auth()); // Using 'use' hook for auth
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div>
      <h1>AI Insights</h1>
      <Suspense fallback={<InsightsLoading />}>
        <InsightsList userId={session.user.id} />
      </Suspense>
    </div>
  );
}

// Client component with optimistic updates
'use client';

function InsightsList({ userId }: { userId: string }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [optimisticInsights, addOptimisticInsight] = useOptimistic(
    insights,
    (currentInsights, newInsight: Insight) => [newInsight, ...currentInsights]
  );
  
  const generateInsight = async () => {
    const optimisticInsight = {
      id: `temp-${Date.now()}`,
      content: 'Generating insight...',
      type: 'daily',
      createdAt: new Date(),
    } as Insight;
    
    addOptimisticInsight(optimisticInsight);
    
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      
      const newInsight = await response.json();
      setInsights(prev => [newInsight, ...prev]);
    } catch (error) {
      // Optimistic update will be reverted automatically
      console.error('Failed to generate insight:', error);
    }
  };
  
  return (
    <div>
      <button onClick={generateInsight}>
        Generate New Insight
      </button>
      
      {optimisticInsights.map(insight => (
        <InsightCard 
          key={insight.id} 
          insight={insight}
          isPending={insight.id.startsWith('temp-')}
        />
      ))}
    </div>
  );
}
```

### Enhanced Error Boundaries

```typescript
// components/providers/ErrorBoundary.tsx
'use client';

import { ErrorBoundary as ReactErrorBoundary } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

function DefaultErrorFallback({ 
  error, 
  retry 
}: { 
  error: Error; 
  retry: () => void; 
}) {
  return (
    <div className="p-6 border border-red-200 rounded-lg bg-red-50">
      <h2 className="text-lg font-semibold text-red-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button 
        onClick={retry}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try Again
      </button>
    </div>
  );
}

export function ErrorBoundary({ 
  children, 
  fallback: Fallback = DefaultErrorFallback 
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <Fallback error={error} retry={resetErrorBoundary} />
      )}
      onError={(error, errorInfo) => {
        console.error('Error boundary caught an error:', error, errorInfo);
        // Report to error tracking service
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Usage in layout
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SessionProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SessionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

## Edge Runtime Considerations

### React 19 Compatibility

React 19 is fully compatible with Vercel Edge Runtime:

```typescript
// app/api/insights/route.ts
export const runtime = 'edge';

import { useActionState } from 'react'; // ✅ Works in Edge Runtime
import { useOptimistic } from 'react'; // ✅ Works in Edge Runtime
import { use } from 'react'; // ✅ Works in Edge Runtime

// Server Actions in Edge Runtime
export async function POST(request: Request) {
  try {
    // React 19 features work seamlessly in Edge Runtime
    const data = await request.json();
    
    // Process with AI insights
    const insights = await generateInsights(data);
    
    return Response.json({ success: true, insights });
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
```

### Memory Optimization

```typescript
// Optimized component for Edge Runtime
import { memo, useMemo } from 'react';
import { useOptimistic } from 'react';

const OptimizedDailyLogCard = memo(function DailyLogCard({ 
  log 
}: { 
  log: DailyLog 
}) {
  // Memoize expensive calculations
  const moodTrend = useMemo(() => 
    calculateMoodTrend(log.morningMood, log.afternoonMood, log.eveningMood),
    [log.morningMood, log.afternoonMood, log.eveningMood]
  );
  
  return (
    <Card>
      <CardContent>
        <h3>Daily Log - {log.date}</h3>
        <p>Mood Trend: {moodTrend}</p>
        {/* Render log details */}
      </CardContent>
    </Card>
  );
});
```

## Performance Optimizations

### Concurrent Features

```typescript
// Enhanced Suspense patterns with React 19
import { Suspense, startTransition } from 'react';

function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  const handlePeriodChange = (period: string) => {
    startTransition(() => {
      setSelectedPeriod(period);
    });
  };
  
  return (
    <div>
      <PeriodSelector 
        value={selectedPeriod}
        onChange={handlePeriodChange}
      />
      
      <Suspense fallback={<ChartLoading />}>
        <InsightsChart period={selectedPeriod} />
      </Suspense>
      
      <Suspense fallback={<LogsLoading />}>
        <RecentLogs period={selectedPeriod} />
      </Suspense>
    </div>
  );
}
```

### Streaming and Progressive Enhancement

```typescript
// app/daily-log/[id]/page.tsx
import { Suspense } from 'react';

export default function DailyLogDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div>
      <Suspense fallback={<LogHeaderSkeleton />}>
        <LogHeader logId={params.id} />
      </Suspense>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <MoodChart logId={params.id} />
        </Suspense>
        
        <Suspense fallback={<InsightsSkeleton />}>
          <RelatedInsights logId={params.id} />
        </Suspense>
      </div>
      
      <Suspense fallback={<TimelineSkeleton />}>
        <DayTimeline logId={params.id} />
      </Suspense>
    </div>
  );
}
```

## Best Practices

### When to Use New Hooks

#### useActionState
- ✅ Form submissions with server validation
- ✅ Complex async operations with multiple states
- ✅ When you need integrated loading/error handling
- ❌ Simple client-side state management
- ❌ Non-form related state updates

#### useOptimistic
- ✅ Creating, updating, or deleting items in lists
- ✅ Social interactions (likes, comments)
- ✅ Real-time collaborative features
- ❌ Critical operations that must not show intermediate states
- ❌ Operations with complex rollback logic

#### use Hook
- ✅ Reading context in event handlers or conditions
- ✅ Handling promises in render
- ✅ Dynamic context consumption
- ❌ Regular useContext scenarios
- ❌ Complex promise orchestration

### TypeScript Integration

```typescript
// Type-safe useActionState
type FormState = {
  success: boolean;
  error?: string;
  data?: DailyLog;
};

type FormAction = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

const [state, formAction, isPending] = useActionState<FormState>(
  submitDailyLog as FormAction,
  { success: false }
);

// Type-safe useOptimistic
type OptimisticAction = DailyLog | { type: 'delete'; id: string };

const [optimisticLogs, updateOptimisticLogs] = useOptimistic<
  DailyLog[],
  OptimisticAction
>(
  logs,
  (currentLogs, action) => {
    if ('type' in action && action.type === 'delete') {
      return currentLogs.filter(log => log.id !== action.id);
    }
    return [...currentLogs, action as DailyLog];
  }
);
```

### Testing Strategies

```typescript
// Testing components with React 19 hooks
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';

describe('ModernMorningCheckInForm', () => {
  it('handles form submission with useActionState', async () => {
    const mockAction = jest.fn().mockResolvedValue({ 
      success: true 
    });
    
    render(<ModernMorningCheckInForm action={mockAction} />);
    
    const submitButton = screen.getByRole('button', { name: /save/i });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Saved successfully!')).toBeInTheDocument();
    });
  });
  
  it('handles optimistic updates', async () => {
    const { rerender } = render(
      <DailyLogList logs={[]} onAddLog={jest.fn()} />
    );
    
    const addButton = screen.getByRole('button', { name: /add log/i });
    
    await act(async () => {
      fireEvent.click(addButton);
    });
    
    // Should show optimistic log immediately
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
  });
});
```

## Migration Checklist

### Phase 1: Preparation
- [ ] Audit existing form components
- [ ] Identify optimistic update opportunities
- [ ] Review server action implementations
- [ ] Update TypeScript types

### Phase 2: Gradual Migration
- [ ] Migrate one form component to useActionState
- [ ] Add optimistic updates to one list component
- [ ] Update error boundaries
- [ ] Test Edge Runtime compatibility

### Phase 3: Full Adoption
- [ ] Migrate all form components
- [ ] Implement optimistic updates across the app
- [ ] Optimize performance with concurrent features
- [ ] Update testing strategies

### Phase 4: Optimization
- [ ] Monitor performance metrics
- [ ] Optimize bundle size
- [ ] Implement advanced patterns
- [ ] Document patterns for team

## Common Pitfalls

### useActionState Pitfalls
```typescript
// ❌ Don't use for non-form state
const [count, setCount] = useActionState(
  (prev, increment) => prev + increment,
  0
);

// ✅ Use regular useState instead
const [count, setCount] = useState(0);

// ❌ Don't mix with controlled inputs
<input 
  value={inputValue} 
  onChange={handleChange}
  name="fieldName" // This won't work as expected
/>

// ✅ Use uncontrolled inputs with useActionState
<input 
  name="fieldName"
  defaultValue={initialValue}
/>
```

### useOptimistic Pitfalls
```typescript
// ❌ Don't use for critical data
const [balance, optimisticBalance] = useOptimistic(
  accountBalance,
  (current, transaction) => current - transaction.amount
);

// ❌ Don't use without proper error handling
addOptimisticItem(newItem);
// Missing try-catch for actual operation

// ✅ Always handle errors properly
try {
  addOptimisticItem(newItem);
  await actualOperation(newItem);
} catch (error) {
  // Error automatically reverts optimistic state
  showErrorMessage(error);
}
```

## Resources

### Official Documentation
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [useActionState Hook](https://react.dev/reference/react/useActionState)
- [useOptimistic Hook](https://react.dev/reference/react/useOptimistic)
- [Next.js 15 Documentation](https://nextjs.org/blog/next-15)

### Project-Specific Examples
- See `src/components/forms/` for form migration examples
- Check `src/app/actions/` for server action patterns
- Review `src/components/providers/` for error boundary setup

## Conclusion

React 19 brings powerful new patterns that enhance user experience through optimistic updates, simplified form handling, and better error management. When combined with Next.js 15 and Edge Runtime, these features provide a solid foundation for building responsive, modern web applications.

The migration should be gradual, starting with the most critical user interactions (form submissions, data creation) and expanding to cover the entire application. Focus on maintaining backward compatibility while incrementally adopting new patterns.
