---
title: Next.js 15 App Router Patterns & Best Practices
description: Latest Next.js 15 patterns, Server Components, Edge Runtime optimization, and modern development practices for the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Next.js 15 App Router Patterns & Best Practices

## Overview

This document provides comprehensive patterns and best practices for Next.js 15 App Router development, focusing on the latest features and optimization techniques used in the Brain Log App. It covers Server Components, Edge Runtime compatibility, data fetching patterns, and modern development approaches.

## Next.js 15 Key Features & Updates

### React 19 Integration
Next.js 15 fully integrates with React 19, providing:
- **Enhanced Server Components**: Better performance and streaming
- **Concurrent Features**: Improved user experience with Suspense boundaries
- **React Compiler**: Automatic optimization of component re-renders
- **Actions**: Built-in form handling and server mutations

### Edge Runtime Optimization
- **Faster Cold Starts**: 10-50ms authentication response times
- **Global Distribution**: Reduced latency worldwide
- **Reduced Memory Footprint**: Optimized for Edge environments
- **Streaming Support**: Better perceived performance

## App Router Architecture Patterns

### Project Structure Best Practices (2025)

#### Recommended Folder Organization
```
src/
├── app/                    # App Router pages and layouts
│   ├── (auth)/            # Route groups for auth pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Protected dashboard routes
│   ├── api/              # API routes
│   │   ├── auth/
│   │   ├── daily-logs/
│   │   └── insights/
│   └── globals.css
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── forms/           # Form components
│   ├── charts/          # Data visualization
│   └── layout/          # Layout components
├── lib/                 # Utility functions and configurations
│   ├── auth/           # Authentication utilities
│   ├── utils/          # Helper functions
│   └── hooks/          # Custom React hooks
└── types/              # TypeScript type definitions
```

#### Anti-Pattern: Avoid "Everything in App"
```typescript
// ❌ Don't put all logic in app directory
src/app/components/     // Wrong - components should be in src/components
src/app/utils/         // Wrong - utilities should be in src/lib
src/app/types/         // Wrong - types should be in src/types

// ✅ Correct structure
src/components/        // UI components
src/lib/              // Utilities and configurations
src/types/            // Type definitions
src/app/              // Only pages, layouts, and API routes
```

### Server Components vs Client Components

#### Server Components (Default in App Router)
Use Server Components for:
- Data fetching from databases or APIs
- Rendering static content
- SEO-critical content
- Heavy computations that don't require interactivity

```typescript
// ✅ Server Component - Default behavior
// app/insights/page.tsx
import { getInsights } from '@/lib/services/insights-service';

export default async function InsightsPage() {
  // Direct database/API access in Server Components
  const insights = await getInsights();
  
  return (
    <div>
      <h1>Your Health Insights</h1>
      {insights.map(insight => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}

// ✅ Server Component with error handling
export default async function DashboardPage() {
  try {
    const [logs, insights] = await Promise.all([
      getDailyLogs(),
      getRecentInsights(),
    ]);
    
    return <Dashboard logs={logs} insights={insights} />;
  } catch (error) {
    throw new Error('Failed to load dashboard data');
  }
}
```

#### Client Components Pattern
Use Client Components for:
- Interactive elements (forms, buttons, modals)
- Browser APIs (localStorage, geolocation)
- React hooks (useState, useEffect, custom hooks)
- Event handlers

```typescript
// ✅ Client Component with 'use client' directive
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function DailyLogForm() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    mood: 5,
    energy: 5,
    sleep_quality: 5,
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### Hybrid Pattern: Server + Client Composition
```typescript
// ✅ Server Component that renders Client Components
// app/daily-log/page.tsx (Server Component)
import { getCurrentUserLogs } from '@/lib/services/daily-logs';
import { DailyLogForm } from '@/components/forms/DailyLogForm'; // Client Component

export default async function DailyLogPage() {
  const existingLogs = await getCurrentUserLogs();
  
  return (
    <div>
      <h1>Daily Health Log</h1>
      {/* Pass server data to client component */}
      <DailyLogForm initialData={existingLogs} />
    </div>
  );
}
```

## Data Fetching Patterns

### Server Component Data Fetching
```typescript
// ✅ Direct async/await in Server Components
export default async function WeeklyInsightsPage() {
  // Parallel data fetching
  const [insights, trends] = await Promise.all([
    fetch('/api/weekly-insights').then(res => res.json()),
    fetch('/api/trends').then(res => res.json()),
  ]);
  
  return (
    <div>
      <WeeklyInsights data={insights} />
      <TrendChart data={trends} />
    </div>
  );
}

// ✅ Error handling with try-catch
export default async function ProfilePage() {
  try {
    const user = await getUserProfile();
    return <UserProfile user={user} />;
  } catch (error) {
    console.error('Failed to load user profile:', error);
    throw error; // Will be caught by error.tsx
  }
}
```

### Client Component Data Fetching
```typescript
// ✅ Using SWR for client-side data fetching
'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function RealtimeInsights() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/insights/realtime',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );
  
  if (isLoading) return <InsightsSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <InsightsDisplay data={data} onRefresh={mutate} />;
}

// ✅ Custom hook for data fetching
export function useUserPreferences() {
  return useSWR('/api/user/preferences', fetcher, {
    onError: (error) => {
      console.error('Failed to load user preferences:', error);
    },
  });
}
```

### Streaming with Suspense
```typescript
// ✅ Streaming Server Components with Suspense
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Fast-loading content renders immediately */}
      <QuickStats />
      
      {/* Slow content streams in with loading state */}
      <Suspense fallback={<ChartsSkeleton />}>
        <HealthCharts />
      </Suspense>
      
      <Suspense fallback={<InsightsSkeleton />}>
        <AIInsights />
      </Suspense>
    </div>
  );
}

// Heavy data fetching component
async function HealthCharts() {
  const chartData = await getComplexChartData(); // Slow operation
  return <ChartsComponent data={chartData} />;
}
```

## Routing Patterns

### Route Groups for Organization
```typescript
// ✅ Route groups with parentheses (don't affect URL)
app/
├── (auth)/           # Group auth-related pages
│   ├── layout.tsx    # Auth-specific layout
│   ├── login/
│   └── register/
├── (dashboard)/      # Group dashboard pages
│   ├── layout.tsx    # Dashboard layout with navigation
│   ├── insights/
│   ├── daily-log/
│   └── profile/
└── (marketing)/      # Public marketing pages
    ├── layout.tsx    # Marketing layout
    ├── about/
    └── contact/
```

### Dynamic Routes and Params
```typescript
// ✅ Dynamic route: app/daily-log/[id]/page.tsx
interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DailyLogDetailPage({ params }: PageProps) {
  const log = await getDailyLogById(params.id);
  
  if (!log) {
    notFound(); // Shows 404 page
  }
  
  return <DailyLogDetail log={log} />;
}

// ✅ Generate metadata for dynamic routes
export async function generateMetadata({ params }: PageProps) {
  const log = await getDailyLogById(params.id);
  
  return {
    title: `Daily Log - ${log.created_at}`,
    description: `Health tracking data for ${log.created_at}`,
  };
}
```

### Parallel Routes
```typescript
// ✅ Parallel routes with @folder convention
app/
├── dashboard/
│   ├── @analytics/    # Parallel route slot
│   ├── @insights/     # Parallel route slot
│   ├── layout.tsx
│   └── page.tsx

// dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  insights,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  insights: React.ReactNode;
}) {
  return (
    <div className="dashboard-grid">
      <main>{children}</main>
      <aside>{analytics}</aside>
      <section>{insights}</section>
    </div>
  );
}
```

## Form Handling Patterns

### Server Actions (React 19 + Next.js 15)
```typescript
// ✅ Server Actions for form handling
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createDailyLog(formData: FormData) {
  const mood = formData.get('mood') as string;
  const energy = formData.get('energy') as string;
  
  try {
    await saveDailyLog({
      mood: parseInt(mood),
      energy: parseInt(energy),
      // ... other fields
    });
    
    revalidatePath('/dashboard'); // Refresh dashboard data
    redirect('/dashboard?success=true');
  } catch (error) {
    throw new Error('Failed to save daily log');
  }
}

// Form component using Server Action
export function DailyLogForm() {
  return (
    <form action={createDailyLog}>
      <input name="mood" type="range" min="1" max="10" />
      <input name="energy" type="range" min="1" max="10" />
      <button type="submit">Save Log</button>
    </form>
  );
}
```

### Progressive Enhancement with useFormState
```typescript
// ✅ Progressive enhancement with useFormState
'use client';

import { useFormState } from 'react-dom';
import { createDailyLog } from '@/lib/actions/daily-log';

export function EnhancedDailyLogForm() {
  const [state, formAction] = useFormState(createDailyLog, {
    success: false,
    message: '',
  });
  
  return (
    <form action={formAction}>
      {state.message && (
        <div className={state.success ? 'success' : 'error'}>
          {state.message}
        </div>
      )}
      
      <input name="mood" type="range" min="1" max="10" />
      <input name="energy" type="range" min="1" max="10" />
      <button type="submit">Save Log</button>
    </form>
  );
}
```

## Performance Optimization Patterns

### Code Splitting and Lazy Loading
```typescript
// ✅ Dynamic imports for code splitting
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Skip SSR for client-only components
});

const AIInsights = dynamic(
  () => import('@/components/insights/AIInsights'),
  {
    loading: () => <InsightsSkeleton />,
  }
);
```

### Image Optimization
```typescript
// ✅ Next.js Image component with optimization
import Image from 'next/image';

export function UserAvatar({ user }: { user: User }) {
  return (
    <Image
      src={user.avatarUrl || '/default-avatar.png'}
      alt={`${user.name}'s avatar`}
      width={64}
      height={64}
      className="rounded-full"
      priority={false} // Set to true for above-the-fold images
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..." // Low-quality placeholder
    />
  );
}
```

### Caching Strategies
```typescript
// ✅ Request memoization with unstable_cache
import { unstable_cache } from 'next/cache';

const getCachedInsights = unstable_cache(
  async (userId: string) => {
    return await generateInsights(userId);
  },
  ['user-insights'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['insights', 'user-data'],
  }
);

// ✅ Cache invalidation
import { revalidateTag } from 'next/cache';

export async function updateUserData(userId: string, data: any) {
  await saveUserData(userId, data);
  
  // Invalidate related caches
  revalidateTag('user-data');
  revalidateTag('insights');
}
```

## Error Handling Patterns

### Error Boundaries
```typescript
// ✅ Error boundary: app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);
  
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <details>
        <summary>Error details</summary>
        <pre>{error.message}</pre>
      </details>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Global Error Handling
```typescript
// ✅ Global error handler: app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="global-error">
          <h1>Application Error</h1>
          <p>A critical error occurred. Please try refreshing the page.</p>
          <button onClick={reset}>Reset Application</button>
        </div>
      </body>
    </html>
  );
}
```

### Loading States
```typescript
// ✅ Loading UI: app/loading.tsx
export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Loading your health dashboard...</p>
    </div>
  );
}

// ✅ Custom loading component
export function InsightsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mt-2"></div>
        </div>
      ))}
    </div>
  );
}
```

## Metadata and SEO Patterns

### Static Metadata
```typescript
// ✅ Static metadata export
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Health Log | Brain Log App',
  description: 'Track your daily health metrics and mood patterns',
  keywords: ['health tracking', 'mood', 'wellness'],
  openGraph: {
    title: 'Daily Health Log',
    description: 'Track your daily health metrics',
    type: 'website',
  },
};
```

### Dynamic Metadata
```typescript
// ✅ Dynamic metadata generation
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const log = await getDailyLogById(params.id);
  
  return {
    title: `Health Log - ${format(log.created_at, 'PPP')}`,
    description: `Health tracking data from ${format(log.created_at, 'PPP')}`,
    openGraph: {
      title: `Health Log - ${format(log.created_at, 'PPP')}`,
      description: `Mood: ${log.mood}/10, Energy: ${log.energy}/10`,
    },
  };
}
```

## Environment and Configuration Patterns

### Environment Variables
```typescript
// ✅ Environment variable validation
const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
} as const;

// Validate at startup
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// ✅ Type-safe environment config
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  // Client-side variables (NEXT_PUBLIC_*)
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
} as const;
```

### Configuration Files
```typescript
// ✅ next.config.mjs for Next.js 15
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable React Compiler
    reactCompiler: true,
    // Edge Runtime for API routes
    runtime: 'edge',
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/images/**',
      },
    ],
  },
  
  // Bundle analyzer
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true',
  },
};

export default nextConfig;
```

## Testing Patterns

### Component Testing
```typescript
// ✅ Testing Server Components
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

// Mock the data fetching
jest.mock('@/lib/services/insights-service', () => ({
  getInsights: jest.fn().mockResolvedValue([
    { id: '1', title: 'Test Insight', content: 'Test content' },
  ]),
}));

test('renders dashboard with insights', async () => {
  render(await DashboardPage());
  
  expect(screen.getByText('Your Health Insights')).toBeInTheDocument();
  expect(screen.getByText('Test Insight')).toBeInTheDocument();
});
```

### API Route Testing
```typescript
// ✅ Testing API routes
import { POST } from '@/app/api/daily-logs/route';
import { NextRequest } from 'next/server';

test('creates daily log', async () => {
  const request = new NextRequest('http://localhost:3000/api/daily-logs', {
    method: 'POST',
    body: JSON.stringify({
      mood: 8,
      energy: 7,
      sleep_quality: 6,
    }),
  });
  
  const response = await POST(request);
  const data = await response.json();
  
  expect(response.status).toBe(201);
  expect(data.success).toBe(true);
});
```

## Common Anti-Patterns to Avoid

### ❌ Mixing Server and Client Logic
```typescript
// ❌ Don't use client hooks in Server Components
export default async function BadServerComponent() {
  const [state, setState] = useState(0); // Error: hooks not allowed
  const data = await fetch('/api/data');  // This is fine
  return <div>{data.title}</div>;
}

// ✅ Separate concerns properly
export default async function GoodServerComponent() {
  const data = await fetch('/api/data');
  return <ClientInteractiveComponent initialData={data} />;
}
```

### ❌ Blocking the Main Thread
```typescript
// ❌ Don't block with synchronous operations
export default async function BadPage() {
  const heavyOperation = () => {
    // Expensive synchronous calculation
    for (let i = 0; i < 1000000; i++) {
      // blocking work
    }
  };
  
  heavyOperation(); // Blocks rendering
  return <div>Page content</div>;
}

// ✅ Use Web Workers or defer heavy operations
export default function GoodPage() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### ❌ Over-fetching Data
```typescript
// ❌ Don't fetch unnecessary data
export default async function BadPage() {
  const allUserData = await getUserWithEverything(userId); // Too much data
  return <UserName name={allUserData.name} />;
}

// ✅ Fetch only what you need
export default async function GoodPage() {
  const { name } = await getUserBasicInfo(userId);
  return <UserName name={name} />;
}
```

## Performance Monitoring

### Core Web Vitals Tracking
```typescript
// ✅ Performance monitoring
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);
    
    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        custom_map: { metric_id: 'web_vitals' },
        value: Math.round(metric.value),
        event_category: 'Web Vitals',
      });
    }
  });
  
  return null;
}
```

### Bundle Analysis
```bash
# ✅ Analyze bundle size
ANALYZE=true npm run build

# ✅ Monitor bundle size in CI
npm install -g bundlesize
bundlesize
```

## Related Documents
- `docs/08-frameworks/02-authjs5-implementation.md` - Auth.js v5 Edge Runtime patterns
- `docs/08-frameworks/07-vercel-edge-runtime.md` - Edge Runtime specific optimizations
- `docs/02-architecture/02-frontend.md` - Frontend architecture overview
- `docs/06-guides/02-adding-new-features.md` - Feature development workflow

## External Resources
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Next.js App Router Best Practices](https://nextjs.org/docs/app/building-your-application/routing)
- [Performance Optimization Guide](https://nextjs.org/docs/app/building-your-application/optimizing)

## Changelog
- 2025-07-06: Initial Next.js 15 patterns documentation created
- 2025-07-06: Server Components and Client Components patterns established
- 2025-07-06: Data fetching, routing, and performance patterns documented
- 2025-07-06: Testing patterns and anti-patterns guidance provided
