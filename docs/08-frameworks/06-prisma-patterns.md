---
title: Prisma ORM Best Practices with Edge Runtime
description: Comprehensive guide to Prisma ORM patterns, Edge Runtime optimization, and serverless best practices for the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Prisma ORM Best Practices with Edge Runtime

## Overview

This document provides comprehensive guidance on Prisma ORM implementation patterns specifically optimized for Edge Runtime environments, serverless deployments, and modern Next.js 15 applications. It covers our current implementation analysis, 2025 best practices, and specific migration recommendations.

## Current Implementation Analysis

### Architecture Overview

Our application uses a hybrid database setup optimized for Edge Runtime compatibility:

```typescript
// src/lib/prisma.ts - Current Implementation
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

const prisma = globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

```typescript
// src/lib/neon.ts - Edge Runtime Fallback
import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);
```

### Current Strengths

✅ **Proper Global Singleton Pattern**: Prevents connection exhaustion in serverless environments
✅ **Prisma Accelerate Integration**: Connection pooling and query caching
✅ **Edge Runtime Compatibility**: Neon serverless driver for Edge functions
✅ **Type Safety**: Full TypeScript integration with generated types
✅ **Well-Structured Schema**: Proper indexes, relationships, and constraints

### Areas for Improvement

🔄 **Query Optimization**: Limited use of `select` clauses increases payload size
🔄 **Error Handling**: Basic error handling without structured error types
🔄 **Performance Monitoring**: No query performance tracking or logging
🔄 **Connection Management**: No timeout handling for Edge Runtime constraints
🔄 **Type Patterns**: Missing advanced TypeScript patterns for better type safety

## Edge Runtime Constraints and Solutions

### Memory Limitations

Edge Runtime has strict memory constraints (typically 128MB). Our solutions:

#### 1. Connection Pooling with Prisma Accelerate

```typescript
// Recommended: Enhanced connection setup
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends(withAccelerate())
}

// Global singleton with proper typing
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### 2. Bundle Size Optimization

```typescript
// next.config.mjs - Required configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  experimental: {
    // Enable for better Edge Runtime support
    serverComponentsExternalPackages: ['@prisma/client']
  }
}
```

### Connection Timeout Handling

```typescript
// Enhanced connection with timeout handling
const createPrismaClientWithTimeout = () => {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Add timeout wrapper for Edge Runtime
  return client.$extends({
    client: {
      $queryWithTimeout: async <T>(
        query: () => Promise<T>,
        timeoutMs: number = 25000 // Edge Runtime ~30s limit
      ): Promise<T> => {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Database query timeout')), timeoutMs)
        })
        
        return Promise.race([query(), timeoutPromise])
      }
    }
  }).$extends(withAccelerate())
}
```

## 2025 Best Practices

### 1. Optimized Query Patterns

#### Current Pattern (Inefficient)
```typescript
// ❌ Current: Fetches all fields
const dailyLogs = await prisma.dailyLog.findMany({
  where: { userId }
})
```

#### Recommended Pattern (Optimized)
```typescript
// ✅ Recommended: Select only needed fields
const dailyLogs = await prisma.dailyLog.findMany({
  where: { userId },
  select: {
    id: true,
    date: true,
    sleepHours: true,
    sleepQuality: true,
    morningMood: true,
    focusLevel: true,
    energyLevel: true,
    overallMood: true,
    isComplete: true
  },
  orderBy: { date: 'desc' },
  take: 30 // Limit results for performance
})
```

#### Advanced Query Optimization
```typescript
// For complex queries with relations
const userWithRecentLogs = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    displayName: true,
    timezone: true,
    dailyLogs: {
      select: {
        id: true,
        date: true,
        overallMood: true,
        isComplete: true
      },
      orderBy: { date: 'desc' },
      take: 7 // Last 7 days only
    }
  }
})
```

### 2. Advanced Type Safety Patterns

#### Type-Safe Query Builder
```typescript
// Create type-safe query helpers
type DailyLogSelect = {
  id: boolean
  date: boolean
  sleepHours: boolean
  sleepQuality: boolean
  morningMood: boolean
  focusLevel: boolean
  energyLevel: boolean
  overallMood: boolean
  isComplete: boolean
}

const createDailyLogQuery = <T extends Partial<DailyLogSelect>>(
  userId: number,
  select: T
) => {
  return prisma.dailyLog.findMany({
    where: { userId },
    select,
    orderBy: { date: 'desc' }
  })
}

// Usage with full type safety
const logs = await createDailyLogQuery(userId, {
  id: true,
  date: true,
  overallMood: true
})
// logs is properly typed based on select
```

#### Generated Type Utilities
```typescript
// Leverage Prisma's generated types
import type { Prisma, DailyLog } from '@prisma/client'

// Create partial types for API responses
export type DailyLogSummary = Pick<DailyLog, 'id' | 'date' | 'overallMood' | 'isComplete'>

export type DailyLogWithInsights = Prisma.DailyLogGetPayload<{
  include: { insights: true }
}>

// Type-safe update operations
export type DailyLogUpdate = Prisma.DailyLogUpdateInput

// Validation schemas with Zod integration
import { z } from 'zod'

export const DailyLogCreateSchema = z.object({
  date: z.string().datetime(),
  sleepHours: z.number().min(0).max(24),
  sleepQuality: z.number().min(1).max(10),
  morningMood: z.number().min(1).max(10),
  // ... other fields
}) satisfies z.ZodType<Prisma.DailyLogCreateInput>
```

### 3. Error Handling Best Practices

#### Structured Error Types
```typescript
// Define specific error types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public operation: string
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, public field: string) {
    super(message, 'VALIDATION_ERROR', 'validation')
  }
}

export class NotFoundError extends DatabaseError {
  constructor(resource: string, id: string | number) {
    super(`${resource} not found`, 'NOT_FOUND', 'query')
  }
}
```

#### Error Handling Wrapper
```typescript
// Enhanced error handling for database operations
export async function handleDatabaseOperation<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new ValidationError('Unique constraint violation', error.meta?.target as string)
        case 'P2025':
          throw new NotFoundError(context, 'unknown')
        case 'P2003':
          throw new ValidationError('Foreign key constraint violation', 'relationId')
        default:
          throw new DatabaseError(error.message, error.code, context)
      }
    }
    
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      throw new DatabaseError('Unknown database error', 'UNKNOWN', context)
    }
    
    if (error instanceof Prisma.PrismaClientRustPanicError) {
      throw new DatabaseError('Database engine error', 'ENGINE_ERROR', context)
    }
    
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new DatabaseError('Database connection error', 'CONNECTION_ERROR', context)
    }
    
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new ValidationError('Query validation error', 'query')
    }
    
    // Re-throw unknown errors
    throw error
  }
}
```

#### Usage in API Routes
```typescript
// api/daily-logs/route.ts - Enhanced error handling
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    const dailyLog = await handleDatabaseOperation(
      () => prisma.dailyLog.create({
        data: {
          userId: session.user.id,
          date: new Date(data.date),
          // ... other fields
        },
        select: {
          id: true,
          date: true,
          userId: true,
          isComplete: true
        }
      }),
      'daily-log-creation'
    )

    return NextResponse.json(dailyLog, { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 }
      )
    }
    
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: 'Database operation failed', code: error.code },
        { status: 500 }
      )
    }
    
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 4. Performance Monitoring and Logging

#### Query Performance Tracking
```typescript
// Enhanced Prisma client with performance monitoring
const createMonitoredPrismaClient = () => {
  return new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
    ],
  }).$extends({
    query: {
      $allOperations: async ({ operation, model, args, query }) => {
        const start = Date.now()
        
        try {
          const result = await query(args)
          const duration = Date.now() - start
          
          // Log slow queries (>1000ms)
          if (duration > 1000) {
            console.warn(`Slow query detected:`, {
              model,
              operation,
              duration,
              args: JSON.stringify(args, null, 2)
            })
          }
          
          // Performance metrics for production
          if (process.env.NODE_ENV === 'production' && duration > 2000) {
            // Send to monitoring service (e.g., Vercel Analytics, Sentry)
            console.error(`Critical slow query:`, {
              model,
              operation,
              duration,
              timestamp: new Date().toISOString()
            })
          }
          
          return result
        } catch (error) {
          const duration = Date.now() - start
          
          console.error(`Query failed:`, {
            model,
            operation,
            duration,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          
          throw error
        }
      }
    }
  }).$extends(withAccelerate())
}
```

### 5. Neon Serverless Driver Patterns

#### When to Use Neon vs Prisma
```typescript
// Use Neon for simple queries in Edge Runtime
import { sql } from '@/lib/neon'

// ✅ Good for Edge Runtime: Simple aggregation
export async function getUserLogCount(userId: number) {
  const result = await sql`
    SELECT COUNT(*) as count 
    FROM "DailyLog" 
    WHERE "userId" = ${userId}
  `
  return result[0].count
}

// ✅ Good for Edge Runtime: Simple joins
export async function getUserWithLogCount(userId: number) {
  const result = await sql`
    SELECT 
      u."displayName",
      u."timezone",
      COUNT(dl.id) as "logCount"
    FROM "User" u
    LEFT JOIN "DailyLog" dl ON u.id = dl."userId"
    WHERE u.id = ${userId}
    GROUP BY u.id, u."displayName", u."timezone"
  `
  return result[0]
}

// ❌ Use Prisma for complex operations: Relations, transactions
export async function createDailyLogWithInsight(data: any) {
  // This should use Prisma for type safety and transaction support
  return prisma.$transaction(async (tx) => {
    const dailyLog = await tx.dailyLog.create({ data })
    const insight = await tx.insight.create({
      data: {
        userId: data.userId,
        dailyLogId: dailyLog.id,
        insightText: 'Generated insight...'
      }
    })
    return { dailyLog, insight }
  })
}
```

#### Edge-Optimized Query Patterns
```typescript
// Utility for Edge Runtime database operations
export class EdgeDatabaseService {
  static async executeWithFallback<T>(
    prismaQuery: () => Promise<T>,
    neonQuery: () => Promise<T>
  ): Promise<T> {
    try {
      // Try Prisma first
      return await prismaQuery()
    } catch (error) {
      console.warn('Prisma query failed, falling back to Neon:', error)
      // Fallback to Neon for Edge compatibility
      return await neonQuery()
    }
  }
  
  static async getUserDashboardData(userId: number) {
    return this.executeWithFallback(
      // Prisma query (preferred)
      () => prisma.user.findUnique({
        where: { id: userId },
        select: {
          displayName: true,
          timezone: true,
          dailyLogs: {
            select: {
              id: true,
              date: true,
              overallMood: true,
              isComplete: true
            },
            orderBy: { date: 'desc' },
            take: 7
          }
        }
      }),
      // Neon fallback
      async () => {
        const user = await sql`
          SELECT "displayName", "timezone" 
          FROM "User" 
          WHERE id = ${userId}
        `
        const logs = await sql`
          SELECT id, date, "overallMood", "isComplete"
          FROM "DailyLog" 
          WHERE "userId" = ${userId}
          ORDER BY date DESC 
          LIMIT 7
        `
        return {
          ...user[0],
          dailyLogs: logs
        }
      }
    )
  }
}
```

## Migration Recommendations

### 1. Immediate Improvements (High Priority)

#### Add Query Optimization
```typescript
// Replace current inefficient queries
// Before (current)
const dailyLogs = await prisma.dailyLog.findMany({
  where: { userId }
})

// After (optimized)
const dailyLogs = await prisma.dailyLog.findMany({
  where: { userId },
  select: {
    id: true,
    date: true,
    sleepHours: true,
    sleepQuality: true,
    morningMood: true,
    focusLevel: true,
    energyLevel: true,
    overallMood: true,
    isComplete: true
  },
  orderBy: { date: 'desc' },
  take: 30
})
```

#### Implement Error Handling
```typescript
// Add to existing API routes
import { handleDatabaseOperation, ValidationError, DatabaseError } from '@/lib/database-errors'

// Update POST /api/daily-logs
export async function POST(request: Request) {
  try {
    // ... existing session validation
    
    const dailyLog = await handleDatabaseOperation(
      () => prisma.dailyLog.create({
        data: { /* ... */ },
        select: { /* only needed fields */ }
      }),
      'daily-log-creation'
    )
    
    return NextResponse.json(dailyLog, { status: 201 })
  } catch (error) {
    // ... structured error handling
  }
}
```

### 2. Medium-Term Improvements

#### Enhanced Connection Management
```typescript
// Replace src/lib/prisma.ts
export const prisma = createMonitoredPrismaClient()
```

#### Type Safety Enhancements
```typescript
// Add to existing API routes
import { DailyLogCreateSchema } from '@/lib/prisma-types'

export async function POST(request: Request) {
  const data = await request.json()
  const validatedData = DailyLogCreateSchema.parse(data)
  // ... rest of implementation
}
```

### 3. Long-Term Improvements

#### Performance Monitoring Integration
```typescript
// Add to production deployment
const prisma = createMonitoredPrismaClient()

// Integrate with Vercel Analytics or similar
if (process.env.NODE_ENV === 'production') {
  prisma.$on('query', (e) => {
    if (e.duration > 2000) {
      // Send to monitoring service
      analytics.track('slow_query', {
        query: e.query,
        duration: e.duration,
        timestamp: e.timestamp
      })
    }
  })
}
```

## Testing Patterns

### Unit Testing with Prisma
```typescript
// tests/prisma.test.ts
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

beforeEach(() => {
  mockReset(prismaMock)
})

describe('Daily Log Service', () => {
  test('should create daily log', async () => {
    const mockDailyLog = {
      id: 1,
      userId: 1,
      date: new Date(),
      sleepHours: 8,
      sleepQuality: 7
    }
    
    prismaMock.dailyLog.create.mockResolvedValue(mockDailyLog)
    
    const result = await createDailyLog(mockDailyLog)
    
    expect(result).toEqual(mockDailyLog)
    expect(prismaMock.dailyLog.create).toHaveBeenCalledWith({
      data: mockDailyLog
    })
  })
})
```

### Integration Testing
```typescript
// tests/api/daily-logs.test.ts
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/daily-logs/route'

describe('/api/daily-logs', () => {
  test('POST creates daily log', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        date: '2025-07-06',
        sleepHours: 8,
        sleepQuality: 7
      }
    })
    
    const response = await POST(req)
    const data = await response.json()
    
    expect(response.status).toBe(201)
    expect(data.id).toBeDefined()
  })
})
```

## Performance Optimization Checklist

- [ ] **Query Optimization**: Use `select` clauses to reduce payload size
- [ ] **Indexing**: Ensure proper database indexes for frequent queries
- [ ] **Connection Pooling**: Implement Prisma Accelerate for production
- [ ] **Error Handling**: Structured error types and handling
- [ ] **Type Safety**: Advanced TypeScript patterns
- [ ] **Monitoring**: Query performance tracking and alerting
- [ ] **Caching**: Implement query result caching where appropriate
- [ ] **Bundle Size**: Optimize for Edge Runtime memory constraints

## Related Documents

- [Next.js 15 Patterns](./01-nextjs15-patterns.md) - App Router and Server Components integration
- [Vercel Edge Runtime Guide](./07-vercel-edge-runtime.md) - Deployment and runtime optimization
- [Database Architecture](../02-architecture/04-database.md) - Schema design and relationships
- [API Reference](../03-api-reference/01-overview.md) - API implementation patterns

## Changelog

### Version 1.0.0 (2025-07-06)
- Initial documentation of Prisma patterns and best practices
- Analysis of current implementation
- 2025 optimization recommendations
- Migration roadmap with priorities
- Edge Runtime compatibility guide
- Performance monitoring patterns
