---
title: Backend Architecture
description: API design, service layer patterns, and backend implementation in the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Backend Architecture

## Overview
The Brain Log App implements a robust backend architecture using Next.js API routes running on Node.js Runtime, providing comprehensive REST API functionality with secure authentication, data validation, and external service integration. This document details the API design patterns, service layer organization, and backend implementation strategies.

## Backend Architecture Pattern

### Technology Stack
- **Runtime Environment**: Node.js Runtime (API Routes)
- **Framework**: Next.js 15 App Router API Routes
- **Database ORM**: Prisma with Accelerate extension
- **Authentication**: NextAuth.js v5 with JWT strategy
- **External Services**: OpenAI API for AI insights
- **Database**: Neon PostgreSQL (Serverless)

### Architecture Layers
```
┌─────────────────────────────────────────────────────────────────┐
│                      API Route Layer                            │
│  ├── Authentication & Authorization                             │
│  ├── Request Validation & Parsing                               │
│  ├── HTTP Method Routing                                        │
│  └── Response Formatting                                        │
├─────────────────────────────────────────────────────────────────┤
│                     Service Layer                               │
│  ├── Business Logic Implementation                              │
│  ├── Data Processing & Transformation                           │
│  ├── External Service Integration                               │
│  └── Complex Operation Orchestration                            │
├─────────────────────────────────────────────────────────────────┤
│                    Data Access Layer                            │
│  ├── Prisma ORM Operations                                      │
│  ├── Database Query Optimization                                │
│  ├── Transaction Management                                     │
│  └── Data Relationship Handling                                 │
├─────────────────────────────────────────────────────────────────┤
│                   External Services                             │
│  ├── OpenAI API Integration                                     │
│  ├── Database Connection (Neon)                                 │
│  ├── NextAuth.js Authentication                                 │
│  └── Future Service Integrations                                │
└─────────────────────────────────────────────────────────────────┘
```

## API Route Structure

### Standard API Route Pattern
```typescript
// /src/app/api/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication Check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Request Parameter Extraction
    const { searchParams } = new URL(request.url);
    const userId = session.user.id;
    
    // 3. Business Logic / Service Layer Call
    const result = await serviceFunction(userId, params);
    
    // 4. Response Formatting
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    // 5. Error Handling
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### HTTP Method Implementation
```typescript
// Complete CRUD operations in single route file
export async function GET(request: NextRequest) {
  // Read operations
}

export async function POST(request: NextRequest) {
  // Create operations
}

export async function PUT(request: NextRequest) {
  // Update operations
}

export async function DELETE(request: NextRequest) {
  // Delete operations
}
```

## API Endpoint Architecture

### Authentication Endpoints

#### `/api/auth/[...nextauth]`
**Purpose**: NextAuth.js authentication handlers
**Implementation Pattern**:
```typescript
// Handled by NextAuth.js internally
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

#### `/api/auth/session-check`
**Purpose**: Session validation and user verification
**Implementation**:
```typescript
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        timezone: session.user.timezone,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Session validation failed' },
      { status: 500 }
    );
  }
}
```

### User Management APIs

#### `/api/users`
**Methods**: GET, POST
**Purpose**: User registration and profile management

**POST Implementation (Registration)**:
```typescript
export async function POST(request: NextRequest) {
  try {
    const { username, password, displayName } = await request.json();
    
    // Input validation
    if (!username || !password || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }
    
    // Hash password using Web Crypto API
    const passwordHash = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        displayName,
        timezone: 'America/New_York', // Default timezone
        theme: 'system' // Default theme
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        timezone: true,
        theme: true,
        createdAt: true
      }
    });
    
    return NextResponse.json(user, { status: 201 });
    
  } catch (error) {
    console.error('User registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

### Daily Logging APIs

#### `/api/daily-logs`
**Methods**: GET, POST, PUT, DELETE
**Purpose**: Comprehensive daily health tracking

**Complex Data Structure Management**:
```typescript
// Daily log with 4-stage time-based structure
interface DailyLogData {
  // Morning Check-in (7-9am)
  sleepHours: number;
  sleepQuality: number; // 1-10 scale
  dreams?: string;
  morningMood: number; // 1-10 scale
  physicalStatus?: string;
  breakfast?: string;
  morningCompleted: boolean;
  
  // Medication Log (9-10am)
  medicationTaken: boolean;
  medicationTakenAt?: Date;
  medicationDose: number;
  ateWithinHour: boolean;
  firstHourFeeling?: string;
  reasonForSkipping?: string;
  medicationCompleted: boolean;
  
  // Mid-day Check-in (11am-1pm)
  lunch?: string;
  focusLevel: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  ruminationLevel: number; // 1-10 scale
  currentActivity?: string;
  distractions?: string;
  hadEmotionalEvent: boolean;
  emotionalEvent?: string;
  copingStrategies?: string;
  middayCompleted: boolean;
  
  // Afternoon Check-in (3-5pm)
  afternoonSnack?: string;
  isCrashing: boolean;
  crashSymptoms?: string;
  anxietyLevel?: number; // 1-10 scale
  isFeeling?: string;
  hadTriggeringInteraction: boolean;
  interactionDetails?: string;
  selfWorthTiedToPerformance?: string;
  overextended?: string;
  afternoonCompleted: boolean;
  
  // Evening Reflection (8-10pm)
  dinner?: string;
  overallMood: number; // 1-10 scale
  sleepiness?: number; // 1-10 scale
  medicationEffectiveness?: string;
  helpfulFactors?: string;
  distractingFactors?: string;
  thoughtForTomorrow?: string;
  metPhysicalActivityGoals: boolean;
  metDietaryGoals: boolean;
  neverFeltIsolated: boolean;
  eveningCompleted: boolean;
  
  // Additional metadata
  dayRating?: number; // 1-10 overall rating
  accomplishments?: string;
  challenges?: string;
  gratitude?: string;
  improvements?: string;
  isComplete: boolean;
}
```

**Upsert Pattern Implementation**:
```typescript
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const data = await request.json();
  const userId = session.user.id;
  
  // Validate date
  const date = new Date(data.date);
  if (isNaN(date.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date format' },
      { status: 400 }
    );
  }
  
  try {
    // Use upsert to handle both create and update
    const dailyLog = await prisma.dailyLog.upsert({
      where: {
        userId_date: { userId, date }
      },
      update: {
        ...data,
        userId, // Ensure userId consistency
        date
      },
      create: {
        ...data,
        userId,
        date
      }
    });
    
    return NextResponse.json(dailyLog, { status: 200 });
    
  } catch (error) {
    console.error('Daily log creation/update error:', error);
    return NextResponse.json(
      { error: 'Failed to save daily log' },
      { status: 500 }
    );
  }
}
```

### AI Insights APIs

#### `/api/insights`
**Methods**: GET, POST, DELETE
**Purpose**: AI-generated insights management

#### `/api/weekly-insights`
**Methods**: GET, POST
**Purpose**: Weekly insights generation with OpenAI integration

**OpenAI Integration Pattern**:
```typescript
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { weeklyReflectionId } = await request.json();
    const userId = session.user.id;
    
    // Get weekly reflection data
    const weeklyReflection = await prisma.weeklyReflection.findUnique({
      where: { id: weeklyReflectionId, userId },
      include: {
        user: {
          select: { displayName: true }
        }
      }
    });
    
    if (!weeklyReflection) {
      return NextResponse.json(
        { error: 'Weekly reflection not found' },
        { status: 404 }
      );
    }
    
    // Check if insight already exists
    const existingInsight = await prisma.weeklyInsight.findUnique({
      where: { userId_weeklyReflectionId: { userId, weeklyReflectionId } }
    });
    
    if (existingInsight) {
      return NextResponse.json(existingInsight, { status: 200 });
    }
    
    // Generate AI insight using OpenAI service
    const insightText = await generateWeeklyInsight(weeklyReflection);
    
    // Store insight in database
    const insight = await prisma.weeklyInsight.create({
      data: {
        userId,
        weeklyReflectionId,
        insightText
      }
    });
    
    return NextResponse.json(insight, { status: 201 });
    
  } catch (error) {
    console.error('Weekly insight generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate weekly insight' },
      { status: 500 }
    );
  }
}
```

## Service Layer Architecture

### Service Layer Organization
```
/src/lib/services/
├── api.ts                  # Base API utilities
├── userService.ts          # User management operations
├── dailyLogService.ts      # Daily log business logic
├── weeklyReflectionService.ts # Weekly reflection operations
└── openaiService.ts        # AI service integration
```

### OpenAI Service Integration
**File**: `/src/lib/services/openaiService.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateWeeklyInsight(weeklyReflection: any): Promise<string> {
  try {
    const prompt = `
      Based on the following weekly reflection data, provide personalized insights 
      and recommendations for the user:
      
      Week Rating: ${weeklyReflection.weekRating}/10
      Mental State: ${weeklyReflection.mentalState}
      Highlights: ${weeklyReflection.weekHighlights}
      Challenges: ${weeklyReflection.weekChallenges}
      Lessons Learned: ${weeklyReflection.lessonsLearned}
      Gym Days: ${weeklyReflection.gymDaysCount}/7
      Diet Rating: ${weeklyReflection.dietRating}/10
      
      Please provide:
      1. Key insights about their week
      2. Patterns you notice
      3. Actionable recommendations
      4. Encouragement and positive reinforcement
      
      Keep the tone supportive and personalized.
    `;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a supportive wellness coach providing personalized insights based on user reflection data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    return completion.choices[0]?.message?.content || 'Unable to generate insight at this time.';
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI insight');
  }
}

export async function generateDailyInsight(dailyLog: any): Promise<string> {
  // Similar implementation for daily insights
  // Analyze daily patterns and provide relevant feedback
}
```

### Business Logic Services

#### Daily Log Service
```typescript
// /src/lib/services/dailyLogService.ts
export class DailyLogService {
  static async createOrUpdateDailyLog(userId: number, date: Date, data: Partial<DailyLogData>) {
    return await prisma.dailyLog.upsert({
      where: { userId_date: { userId, date } },
      update: data,
      create: { ...data, userId, date }
    });
  }
  
  static async getDailyLogsByDateRange(userId: number, startDate: Date, endDate: Date) {
    return await prisma.dailyLog.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'desc' }
    });
  }
  
  static async calculateWeeklyAverages(userId: number, startDate: Date, endDate: Date) {
    const logs = await this.getDailyLogsByDateRange(userId, startDate, endDate);
    
    // Calculate averages for mood, energy, focus, etc.
    const averages = {
      morningMood: logs.reduce((sum, log) => sum + (log.morningMood || 0), 0) / logs.length,
      overallMood: logs.reduce((sum, log) => sum + (log.overallMood || 0), 0) / logs.length,
      energyLevel: logs.reduce((sum, log) => sum + (log.energyLevel || 0), 0) / logs.length,
      focusLevel: logs.reduce((sum, log) => sum + (log.focusLevel || 0), 0) / logs.length,
      sleepQuality: logs.reduce((sum, log) => sum + (log.sleepQuality || 0), 0) / logs.length,
    };
    
    return averages;
  }
}
```

## Data Validation Architecture

### Input Validation Patterns
```typescript
// Centralized validation utilities
export function validateDailyLogData(data: any): ValidationResult {
  const errors: string[] = [];
  
  // Validate required fields
  if (typeof data.sleepHours !== 'number' || data.sleepHours < 0 || data.sleepHours > 24) {
    errors.push('Sleep hours must be a number between 0 and 24');
  }
  
  // Validate scale fields (1-10)
  const scaleFields = ['sleepQuality', 'morningMood', 'overallMood', 'focusLevel', 'energyLevel', 'ruminationLevel'];
  scaleFields.forEach(field => {
    if (data[field] !== undefined && (data[field] < 1 || data[field] > 10)) {
      errors.push(`${field} must be between 1 and 10`);
    }
  });
  
  // Validate date field
  if (data.date && isNaN(new Date(data.date).getTime())) {
    errors.push('Invalid date format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### Database Constraint Validation
```typescript
// Prisma schema validation is automatically enforced
// Additional business logic validation in service layer
export function validateUserOwnership(resourceUserId: number, sessionUserId: number): boolean {
  return resourceUserId === sessionUserId;
}

export function validateDateUniqueness(userId: number, date: Date): Promise<boolean> {
  // Check if daily log already exists for user and date
  return prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date } }
  }).then(existing => !existing);
}
```

## Error Handling Architecture

### Centralized Error Handling
```typescript
// Error handling utilities
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      );
    }
  }
  
  // Generic server error
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Error Response Patterns
```typescript
// Standard error responses across all APIs
const ERROR_RESPONSES = {
  UNAUTHORIZED: { error: 'Unauthorized', status: 401 },
  FORBIDDEN: { error: 'Forbidden', status: 403 },
  NOT_FOUND: { error: 'Resource not found', status: 404 },
  CONFLICT: { error: 'Resource already exists', status: 409 },
  VALIDATION_ERROR: { error: 'Invalid input data', status: 400 },
  SERVER_ERROR: { error: 'Internal server error', status: 500 }
};
```

## Database Integration Patterns

### Prisma Query Patterns
```typescript
// Complex queries with relationships
export async function getUserDashboardData(userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      dailyLogs: {
        orderBy: { date: 'desc' },
        take: 7, // Last 7 days
        include: {
          insights: true
        }
      },
      weeklyReflections: {
        orderBy: { weekStartDate: 'desc' },
        take: 4, // Last 4 weeks
        include: {
          weeklyInsights: true
        }
      }
    }
  });
}

// Transaction handling for complex operations
export async function createWeeklyReflectionWithInsight(data: WeeklyReflectionData) {
  return await prisma.$transaction(async (tx) => {
    // Create weekly reflection
    const reflection = await tx.weeklyReflection.create({
      data: data
    });
    
    // Generate and create insight
    const insightText = await generateWeeklyInsight(reflection);
    const insight = await tx.weeklyInsight.create({
      data: {
        userId: reflection.userId,
        weeklyReflectionId: reflection.id,
        insightText
      }
    });
    
    return { reflection, insight };
  });
}
```

### Connection Management
```typescript
// Prisma client with connection pooling
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient
}

const prisma = globalForPrisma.prisma || 
  new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

## Performance Optimization

### Query Optimization
```typescript
// Selective field retrieval
const userProfile = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    username: true,
    displayName: true,
    timezone: true,
    theme: true,
    // Exclude sensitive fields like passwordHash
  }
});

// Pagination for large datasets
const dailyLogs = await prisma.dailyLog.findMany({
  where: { userId },
  orderBy: { date: 'desc' },
  take: 20, // Limit results
  skip: page * 20, // Pagination offset
});
```

### Caching Strategies
```typescript
// Service-level caching for expensive operations
const cache = new Map<string, { data: any; timestamp: number }>();

export async function getCachedUserStats(userId: number) {
  const cacheKey = `user-stats-${userId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes
    return cached.data;
  }
  
  const stats = await calculateUserStats(userId);
  cache.set(cacheKey, { data: stats, timestamp: Date.now() });
  
  return stats;
}
```

## Security Implementation

### Input Sanitization
```typescript
// Sanitize user inputs
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().slice(0, 1000); // Limit length and trim
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    Object.keys(input).forEach(key => {
      sanitized[key] = sanitizeInput(input[key]);
    });
    return sanitized;
  }
  
  return input;
}
```

### Rate Limiting (Planned)
```typescript
// Future rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: number, limit: number = 100): boolean {
  const key = `user-${userId}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  
  const userLimit = rateLimitMap.get(key);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    return false;
  }
  
  userLimit.count++;
  return true;
}
```

## API Documentation Strategy

### OpenAPI/Swagger Integration (Planned)
```typescript
// Future API documentation generation
export const dailyLogSchema = {
  type: 'object',
  properties: {
    date: { type: 'string', format: 'date' },
    sleepHours: { type: 'number', minimum: 0, maximum: 24 },
    sleepQuality: { type: 'integer', minimum: 1, maximum: 10 },
    morningMood: { type: 'integer', minimum: 1, maximum: 10 },
    // ... complete schema definition
  },
  required: ['date', 'sleepHours', 'sleepQuality', 'morningMood']
};
```

## Future Backend Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live data sync
- **Bulk Operations**: Batch API endpoints for efficient data processing
- **Data Export**: Comprehensive data export functionality
- **Analytics APIs**: Advanced analytics and reporting endpoints
- **Webhook Integration**: Event-driven architecture for external integrations

### Scalability Considerations
- **Microservices**: Potential service separation for different domains
- **Message Queues**: Async processing for heavy operations
- **Caching Layer**: Redis integration for performance optimization
- **API Versioning**: Structured versioning strategy for API evolution

## Related Documents
- [System Architecture Overview](./01-overview.md) - High-level system design
- [Database Architecture](./04-database.md) - Data layer implementation
- [Authentication Architecture](./05-authentication.md) - Security patterns
- [Frontend Architecture](./02-frontend.md) - Client-side integration

## Changelog
- 2025-07-06: Initial backend architecture documentation created
- 2025-07-06: API patterns and service layer architecture detailed
- 2025-07-06: Security implementation and performance optimization documented
