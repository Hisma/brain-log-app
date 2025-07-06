---
title: Advanced TypeScript Patterns for Next.js 15
description: Comprehensive guide to advanced TypeScript patterns, type safety, and best practices specific to Next.js 15 and our tech stack
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Advanced TypeScript Patterns for Next.js 15

## Overview

This document provides comprehensive guidance on advanced TypeScript patterns specifically optimized for Next.js 15 App Router, React 19, and our application's architecture. It covers current implementation analysis, 2025 best practices, and specific migration recommendations for improved type safety and developer experience.

## Current Implementation Analysis

### TypeScript Configuration

Our current `tsconfig.json` setup provides a solid foundation:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"],
      "@auth": ["./auth.ts"]
    }
  }
}
```

### Current Strengths

✅ **Strict Mode Enabled**: Full type checking and null safety
✅ **Path Mapping**: Clean import aliases with `@/*` and `@auth`
✅ **Module Augmentation**: Proper NextAuth type extensions
✅ **Bundler Resolution**: Optimized for Next.js 15

### Areas for Improvement

🔄 **Component Props**: Basic interfaces without advanced patterns
🔄 **API Route Typing**: Limited type safety for request/response
🔄 **Form Validation**: Manual state management without type integration
🔄 **Error Handling**: Generic error types without structured typing
🔄 **Environment Variables**: No type-safe environment variable access
🔄 **Utility Types**: Missing domain-specific utility types

## 2025 Advanced TypeScript Patterns

### 1. Enhanced Component Typing Patterns

#### Current Pattern (Basic)
```typescript
// ❌ Current: Basic interface
interface MorningCheckInFormProps {
  initialValues?: {
    sleepHours?: number;
    sleepQuality?: number;
    dreams?: string;
    // ... more fields
  };
  isUpdate?: boolean;
  onSubmit?: (data: any) => void;
}
```

#### Recommended Pattern (Advanced)
```typescript
// ✅ Recommended: Advanced typed patterns
import { z } from 'zod'
import type { ComponentPropsWithoutRef, ElementRef } from 'react'

// Domain-specific schemas
export const MorningCheckInSchema = z.object({
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.number().min(1).max(10),
  dreams: z.string().optional(),
  morningMood: z.number().min(1).max(10),
  physicalStatus: z.enum(['Energetic', 'Rested', 'Neutral', 'Tired', 'Exhausted', 'Pain']),
  breakfast: z.string().optional()
})

export type MorningCheckInData = z.infer<typeof MorningCheckInSchema>

// Advanced component props with polymorphic patterns
interface BaseFormProps<TData> {
  initialValues?: Partial<TData>
  isUpdate?: boolean
  isSubmitting?: boolean
  onSubmit?: (data: TData) => void | Promise<void>
  onNext?: () => void
  onBack?: () => void
}

export interface MorningCheckInFormProps extends BaseFormProps<MorningCheckInData> {
  variant?: 'default' | 'compact' | 'minimal'
  showValidation?: boolean
}

// Polymorphic component pattern for reusable UI components
type PolymorphicAsProp<C extends React.ElementType> = {
  as?: C
}

type PolymorphicProps<C extends React.ElementType> = 
  React.PropsWithChildren<{ as?: C }> & 
  Omit<React.ComponentPropsWithoutRef<C>, keyof PolymorphicAsProp<C>>

export type ButtonProps<C extends React.ElementType = 'button'> = 
  PolymorphicProps<C> & {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    loading?: boolean
  }

// Usage
const Button = <C extends React.ElementType = 'button'>({
  as,
  variant = 'default',
  size = 'default',
  loading,
  children,
  ...props
}: ButtonProps<C>) => {
  const Component = as || 'button'
  return (
    <Component 
      {...props}
      disabled={loading || props.disabled}
    >
      {loading ? 'Loading...' : children}
    </Component>
  )
}
```

### 2. Type-Safe API Route Patterns

#### Enhanced API Route Typing
```typescript
// lib/api-types.ts - Centralized API type definitions
import { z } from 'zod'
import type { NextRequest, NextResponse } from 'next/server'
import type { Session } from 'next-auth'

// Base API response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  error: string
  code?: string
  field?: string
  details?: Record<string, unknown>
}

// Request validation schemas
export const CreateDailyLogSchema = z.object({
  date: z.string().datetime(),
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.number().min(1).max(10),
  dreams: z.string().optional(),
  morningMood: z.number().min(1).max(10),
  physicalStatus: z.string().optional(),
  breakfast: z.string().optional()
})

export const UpdateDailyLogSchema = CreateDailyLogSchema.partial().extend({
  id: z.number()
})

export type CreateDailyLogRequest = z.infer<typeof CreateDailyLogSchema>
export type UpdateDailyLogRequest = z.infer<typeof UpdateDailyLogSchema>

// Response types
export type DailyLogResponse = {
  id: number
  date: string
  sleepHours: number
  sleepQuality: number
  morningMood: number
  isComplete: boolean
}

// Type-safe API handler wrapper
export type ApiHandler<
  TRequest = unknown,
  TResponse = unknown
> = (
  request: NextRequest & { 
    json: () => Promise<TRequest>
    user?: Session['user']
  }
) => Promise<NextResponse<ApiResponse<TResponse> | ApiError>>

// Enhanced API route implementation
export function createApiHandler<TRequest, TResponse>(
  schema: z.ZodSchema<TRequest>,
  handler: (data: TRequest, user: Session['user']) => Promise<TResponse>
): ApiHandler<TRequest, TResponse> {
  return async (request) => {
    try {
      // Authentication check
      const session = await auth()
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      // Request validation
      const body = await request.json()
      const validatedData = schema.parse(body)

      // Execute handler
      const result = await handler(validatedData, session.user)

      return NextResponse.json({ data: result }, { status: 200 })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            field: error.errors[0]?.path.join('.'),
            details: error.errors
          },
          { status: 400 }
        )
      }

      console.error('API error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
```

#### Usage in API Routes
```typescript
// app/api/daily-logs/route.ts - Type-safe implementation
import { createApiHandler, CreateDailyLogSchema, DailyLogResponse } from '@/lib/api-types'
import prisma from '@/lib/prisma'

export const POST = createApiHandler<CreateDailyLogRequest, DailyLogResponse>(
  CreateDailyLogSchema,
  async (data, user) => {
    const dailyLog = await prisma.dailyLog.create({
      data: {
        userId: user.id,
        date: new Date(data.date),
        sleepHours: data.sleepHours,
        sleepQuality: data.sleepQuality,
        dreams: data.dreams,
        morningMood: data.morningMood,
        physicalStatus: data.physicalStatus,
        breakfast: data.breakfast
      },
      select: {
        id: true,
        date: true,
        sleepHours: true,
        sleepQuality: true,
        morningMood: true,
        isComplete: true
      }
    })

    return {
      id: dailyLog.id,
      date: dailyLog.date.toISOString(),
      sleepHours: dailyLog.sleepHours,
      sleepQuality: dailyLog.sleepQuality,
      morningMood: dailyLog.morningMood,
      isComplete: dailyLog.isComplete
    }
  }
)
```

### 3. Type-Safe Environment Variables

```typescript
// lib/env.ts - Type-safe environment configuration
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),
  
  // Optional analytics
  VERCEL_ANALYTICS_ID: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

// Validate and export typed environment
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    throw new Error('Invalid environment configuration')
  }
}

export const env = validateEnv()

// Usage throughout the app
// import { env } from '@/lib/env'
// const dbUrl = env.DATABASE_URL // Fully typed and validated
```

### 4. Advanced Form Patterns with react-hook-form

#### Enhanced Form Component
```typescript
// components/forms/TypedForm.tsx - Advanced form patterns
import { useForm, SubmitHandler, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Generic form wrapper with full type safety
interface TypedFormProps<TSchema extends z.ZodSchema> {
  schema: TSchema
  onSubmit: SubmitHandler<z.infer<TSchema>>
  defaultValues?: Partial<z.infer<TSchema>>
  children: (form: UseFormReturn<z.infer<TSchema>>) => React.ReactNode
  className?: string
}

export function TypedForm<TSchema extends z.ZodSchema>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className
}: TypedFormProps<TSchema>) {
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
      {children(form)}
    </form>
  )
}

// Enhanced MorningCheckInForm with type safety
export function MorningCheckInForm({ initialValues, onSubmit }: MorningCheckInFormProps) {
  return (
    <TypedForm
      schema={MorningCheckInSchema}
      defaultValues={initialValues}
      onSubmit={onSubmit}
    >
      {({ register, formState: { errors }, watch, setValue }) => (
        <Card>
          <CardHeader>
            <CardTitle>Morning Check-In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Hours of Sleep"
              error={errors.sleepHours}
              required
            >
              <Input
                type="number"
                min={0}
                max={24}
                step={0.5}
                {...register('sleepHours', { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Sleep Quality (1-10)"
              error={errors.sleepQuality}
              required
            >
              <Slider
                value={[watch('sleepQuality') || 5]}
                onValueChange={(value) => setValue('sleepQuality', value[0])}
                max={10}
                step={1}
              />
            </FormField>

            <FormField
              label="Dreams or Sleep Notes"
              error={errors.dreams}
            >
              <Textarea
                {...register('dreams')}
                placeholder="Describe any dreams or notes about your sleep"
                rows={3}
              />
            </FormField>

            <Button type="submit">Save Morning Check-In</Button>
          </CardContent>
        </Card>
      )}
    </TypedForm>
  )
}

// Reusable FormField component with proper error typing
interface FormFieldProps {
  label: string
  error?: { message?: string }
  required?: boolean
  children: React.ReactNode
}

function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  )
}
```

### 5. Server Component and Client Component Typing

#### Server Component Patterns
```typescript
// app/dashboard/page.tsx - Typed server component
import { auth } from '@auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import type { Metadata } from 'next'

// Type-safe page props for App Router
interface DashboardPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

// Metadata generation with type safety
export async function generateMetadata({ searchParams }: DashboardPageProps): Promise<Metadata> {
  const session = await auth()
  
  return {
    title: `Dashboard - ${session?.user?.name || 'User'}`,
    description: 'Personal health tracking dashboard'
  }
}

// Server component with proper typing
export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  // Type-safe data fetching
  const dashboardData = await getDashboardData(session.user.id)
  
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <DashboardClient data={dashboardData} />
    </div>
  )
}

// Type-safe data fetching function
async function getDashboardData(userId: number) {
  const [user, recentLogs, weeklyInsights] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        displayName: true,
        timezone: true,
        theme: true
      }
    }),
    prisma.dailyLog.findMany({
      where: { userId },
      select: {
        id: true,
        date: true,
        overallMood: true,
        isComplete: true
      },
      orderBy: { date: 'desc' },
      take: 7
    }),
    prisma.weeklyInsight.findMany({
      where: { userId },
      select: {
        id: true,
        insightText: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
  ])

  // Return type is automatically inferred
  return {
    user,
    recentLogs,
    weeklyInsights
  }
}

// Type helper for server component data
export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
```

#### Client Component Patterns
```typescript
// components/DashboardClient.tsx - Typed client component
'use client'

import { useState, useTransition } from 'react'
import type { DashboardData } from '@/app/dashboard/page'

interface DashboardClientProps {
  data: DashboardData
}

export function DashboardClient({ data }: DashboardClientProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticData, setOptimisticData] = useState(data)

  // Type-safe state updates with optimistic UI
  const handleUpdateMood = (logId: number, newMood: number) => {
    startTransition(() => {
      // Optimistic update
      setOptimisticData(prev => ({
        ...prev,
        recentLogs: prev.recentLogs.map(log =>
          log.id === logId 
            ? { ...log, overallMood: newMood }
            : log
        )
      }))

      // Server action call would go here
      updateMoodAction(logId, newMood)
    })
  }

  return (
    <div>
      {/* Render optimistic data */}
      {optimisticData.recentLogs.map(log => (
        <div key={log.id}>
          Mood: {log.overallMood}
          <button onClick={() => handleUpdateMood(log.id, log.overallMood + 1)}>
            Improve Mood
          </button>
        </div>
      ))}
    </div>
  )
}
```

### 6. Advanced Utility Types

```typescript
// lib/types.ts - Domain-specific utility types
import type { Prisma } from '@prisma/client'

// Prisma utility types
export type UserWithLogs = Prisma.UserGetPayload<{
  include: { dailyLogs: true }
}>

export type DailyLogSummary = Pick<
  Prisma.DailyLog, 
  'id' | 'date' | 'overallMood' | 'isComplete'
>

// API response utilities
export type ApiSuccessResponse<T> = {
  data: T
  message?: string
}

export type ApiErrorResponse = {
  error: string
  code?: string
  field?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// Form state utilities
export type FormState<T> = {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isValid: boolean
}

// Component prop utilities
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type ComponentWithVariants<T, V extends string> = T & {
  variant?: V
}

// Date utilities for our timezone-aware app
export type TimezonedDate = {
  date: Date
  timezone: string
  formattedLocal: string
  formattedUTC: string
}

// Theme utilities
export type ThemeConfig = {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  fontFamily: string
}

// Event handler types
export type EventHandler<T = void> = (event: React.SyntheticEvent) => T
export type AsyncEventHandler<T = void> = (event: React.SyntheticEvent) => Promise<T>

// Conditional types for our forms
export type FormFieldProps<T> = T extends string
  ? { type: 'text' | 'email' | 'password' }
  : T extends number
  ? { type: 'number'; min?: number; max?: number }
  : T extends boolean
  ? { type: 'checkbox' }
  : { type: 'text' }

// Navigation types for type-safe routing
export type AppRoutes = 
  | '/'
  | '/dashboard' 
  | '/daily-log'
  | '/weekly-reflection'
  | '/insights'
  | '/profile'

export type AppRouteParams = {
  '/daily-log/[id]': { id: string }
  '/weekly-reflection/[id]': { id: string }
}
```

### 7. Error Handling Types

```typescript
// lib/error-types.ts - Structured error handling
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public field?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400, field)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

// Type-safe error result pattern
export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E }

export function createResult<T>(data: T): Result<T>
export function createResult<T, E>(error: E): Result<T, E>
export function createResult<T, E>(dataOrError: T | E): Result<T, E> {
  if (dataOrError instanceof Error) {
    return { success: false, error: dataOrError as E }
  }
  return { success: true, data: dataOrError as T }
}

// Usage in services
export async function getDailyLog(id: number): Promise<Result<DailyLogResponse>> {
  try {
    const log = await prisma.dailyLog.findUnique({ where: { id } })
    
    if (!log) {
      return createResult(new NotFoundError('Daily log'))
    }
    
    return createResult(log)
  } catch (error) {
    return createResult(new AppError('Failed to fetch daily log', 'DATABASE_ERROR'))
  }
}
```

## Migration Recommendations

### 1. Immediate Improvements (High Priority)

#### Update Component Props
```typescript
// Replace basic interfaces with advanced patterns
// Before (current)
interface MorningCheckInFormProps {
  initialValues?: any;
  onSubmit?: (data: any) => void;
}

// After (enhanced)
interface MorningCheckInFormProps extends BaseFormProps<MorningCheckInData> {
  variant?: 'default' | 'compact' | 'minimal'
  showValidation?: boolean
}
```

#### Add Type-Safe Environment Variables
```typescript
// Add to project root
// lib/env.ts - Implement type-safe environment configuration
// Update all process.env usage to use typed env object
```

### 2. Medium-Term Improvements

#### Implement Type-Safe API Routes
```typescript
// Refactor existing API routes to use createApiHandler pattern
// Add request/response schemas for all endpoints
// Implement proper error handling types
```

#### Enhanced Form Integration
```typescript
// Migrate forms to use TypedForm wrapper
// Add react-hook-form with Zod validation
// Implement proper error state management
```

### 3. Long-Term Improvements

#### Advanced Component Patterns
```typescript
// Implement polymorphic components
// Add variant-based typing
// Create reusable typed form components
```

#### Complete Type Coverage
```typescript
// Add utility types for all domain objects
// Implement Result pattern for error handling
// Add type-safe navigation and routing
```

## Testing Patterns

### Type-Safe Testing
```typescript
// tests/types.test.ts - Type-level testing
import { expectType, expectError } from 'tsd'
import type { DailyLogResponse, CreateDailyLogRequest } from '@/lib/api-types'

// Test API types
expectType<CreateDailyLogRequest>({
  date: '2025-07-06T10:00:00Z',
  sleepHours: 8,
  sleepQuality: 7,
  morningMood: 6
})

expectError<CreateDailyLogRequest>({
  date: '2025-07-06T10:00:00Z',
  sleepHours: 25, // Should error - max 24
  sleepQuality: 7,
  morningMood: 6
})

// Test component props
expectType<MorningCheckInFormProps>({
  variant: 'compact',
  onSubmit: (data) => {
    expectType<MorningCheckInData>(data)
  }
})
```

### Runtime Type Validation Testing
```typescript
// tests/validation.test.ts - Runtime validation testing
import { MorningCheckInSchema } from '@/lib/api-types'

describe('MorningCheckInSchema', () => {
  test('validates correct data', () => {
    const validData = {
      sleepHours: 8,
      sleepQuality: 7,
      dreams: 'Good dreams',
      morningMood: 6,
      physicalStatus: 'Rested',
      breakfast: 'Oatmeal'
    }
    
    expect(() => MorningCheckInSchema.parse(validData)).not.toThrow()
  })
  
  test('rejects invalid data', () => {
    const invalidData = {
      sleepHours: 25, // Invalid - too high
      sleepQuality: 11, // Invalid - too high
      morningMood: 0 // Invalid - too low
    }
    
    expect(() => MorningCheckInSchema.parse(invalidData)).toThrow()
  })
})
```

## Performance Optimization

### Type-Level Performance
```typescript
// Optimize type computation with helper types
type OptimizedUserSelect = {
  readonly id: true
  readonly displayName: true
  readonly timezone: true
}

// Use const assertions for better performance
const USER_SELECT = {
  id: true,
  displayName: true,
  timezone: true
} as const

// Avoid deep utility types in hot paths
type FastPick<T, K extends keyof T> = {
  [P in K]: T[P]
}
```

## Best Practices Checklist

- [ ] **Strict TypeScript**: Enable strict mode and all strict flags
- [ ] **Schema Validation**: Use Zod for runtime validation
- [ ] **Environment Types**: Type-safe environment variables
- [ ] **API Types**: Comprehensive request/response typing
- [ ] **Component Props**: Advanced prop patterns with variants
- [ ] **Error Handling**: Structured error types and Result pattern
- [ ] **Form Validation**: Integrated form typing with react-hook-form
- [ ] **Utility Types**: Domain-specific utility types
- [ ] **Testing**: Type-level and runtime validation testing

## Related Documents

- [Next.js 15 Patterns](./01-nextjs15-patterns.md) - App Router integration patterns
- [Prisma Patterns](./06-prisma-patterns.md) - Database type safety
- [React 19 Patterns](./08-react19-patterns.md) - React concurrent features typing
- [API Reference](../03-api-reference/01-overview.md) - API implementation patterns

## Changelog

### Version 1.0.0 (2025-07-06)
- Initial documentation of advanced TypeScript patterns
- Analysis of current implementation
- 2025 optimization recommendations
- Migration roadmap with priorities
- Component and API typing patterns
- Form validation and error handling patterns
