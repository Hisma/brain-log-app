---
title: Database Architecture
description: Database schema design, relationships, and data access patterns in the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Database Architecture

## Overview
The Brain Log App uses a sophisticated database architecture built on PostgreSQL with Prisma ORM, implementing a dual-access pattern that supports both Edge Runtime direct SQL queries and Node.js Runtime ORM operations. This document details the database schema, relationships, access patterns, and data management strategies.

## Database Infrastructure

### Technology Stack
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Prisma with Accelerate extension
- **Connection Pooling**: Prisma Accelerate connection pooling
- **Edge Access**: Neon serverless driver for direct SQL
- **Migrations**: Prisma Migrate for schema versioning

### Dual Database Access Pattern

#### Node.js Runtime Access (Primary)
```typescript
// Prisma ORM with full type safety and relationships
import prisma from '@/lib/prisma';

const user = await prisma.user.findUnique({
  where: { username },
  include: { 
    dailyLogs: true,
    weeklyReflections: true,
    insights: true 
  }
});
```

#### Edge Runtime Access (Authentication)
```typescript
// Direct SQL for lightweight authentication queries
import { sql } from '@/lib/neon';

const users = await sql`
  SELECT id, username, "passwordHash", "displayName", timezone, theme 
  FROM "User" 
  WHERE username = ${username}
`;
```

## Database Schema Design

### Core Entity Relationships
```
User (1) ──────────┬─── (Many) DailyLog
     │             │
     ├─────────────┬─── (Many) WeeklyReflection
     │             │
     ├─────────────┬─── (Many) Insight
     │             │
     └─────────────────── (Many) WeeklyInsight

DailyLog (1) ─────────── (Many) Insight
WeeklyReflection (1) ─── (Many) WeeklyInsight
```

### User Model
**Purpose**: Authentication, user management, and personalization settings

```typescript
model User {
  id                Int               @id @default(autoincrement())
  username          String            @unique
  passwordHash      String
  displayName       String
  createdAt         DateTime          @default(now())
  lastLogin         DateTime?
  timezone          String            @default("America/New_York")
  theme             String            @default("system") // "light", "dark", "system"
  
  // Relationships (One-to-Many)
  dailyLogs         DailyLog[]
  weeklyReflections WeeklyReflection[]
  insights          Insight[]
  weeklyInsights    WeeklyInsight[]
}
```

**Design Principles**:
- **Unique Username**: Primary authentication identifier
- **Secure Password Storage**: PBKDF2 hashed passwords
- **Timezone Support**: Per-user timezone for accurate date handling
- **Theme Preferences**: User interface customization
- **Audit Fields**: Creation and last login tracking

### DailyLog Model
**Purpose**: Comprehensive daily health tracking with 4-stage logging system

```typescript
model DailyLog {
  id                       Int      @id @default(autoincrement())
  userId                   Int
  date                     DateTime
  
  // Morning Check-in (7-9am)
  sleepHours               Float    @default(0)
  sleepQuality             Int      @default(0) // 1-10 scale
  dreams                   String?
  morningMood              Int      @default(0) // 1-10 scale
  physicalStatus           String?
  breakfast                String?
  morningCompleted         Boolean  @default(false)
  
  // Concerta Dose Log (9-10am)
  medicationTaken          Boolean  @default(false)
  medicationTakenAt        DateTime?
  medicationDose           Float    @default(0)
  ateWithinHour            Boolean  @default(false)
  firstHourFeeling         String?
  reasonForSkipping        String?
  medicationCompleted      Boolean  @default(false)
  
  // Mid-day Check-in (11am-1pm)
  lunch                    String?
  focusLevel               Int      @default(0) // 1-10 scale
  energyLevel              Int      @default(0) // 1-10 scale
  ruminationLevel          Int      @default(0) // 1-10 scale
  currentActivity          String?
  distractions             String?
  hadEmotionalEvent        Boolean  @default(false)
  emotionalEvent           String?
  copingStrategies         String?
  middayCompleted          Boolean  @default(false)
  
  // Afternoon Check-in (3-5pm)
  afternoonSnack           String?
  isCrashing               Boolean  @default(false)
  crashSymptoms            String?
  anxietyLevel             Int?     // 1-10 scale
  isFeeling                String?
  hadTriggeringInteraction Boolean  @default(false)
  interactionDetails       String?
  selfWorthTiedToPerformance String?
  overextended             String?
  afternoonCompleted       Boolean  @default(false)
  
  // Evening Reflection (8-10pm)
  dinner                   String?
  overallMood              Int      @default(0) // 1-10 scale
  sleepiness               Int?     // 1-10 scale
  medicationEffectiveness  String?
  helpfulFactors           String?
  distractingFactors       String?
  thoughtForTomorrow       String?
  metPhysicalActivityGoals Boolean  @default(false)
  metDietaryGoals          Boolean  @default(false)
  neverFeltIsolated        Boolean  @default(false)
  eveningCompleted         Boolean  @default(false)
  
  // Additional Metadata
  dayRating                Int?     // 1-10 overall day rating
  accomplishments          String?
  challenges               String?
  gratitude                String?
  improvements             String?
  isComplete               Boolean  @default(false)
  
  // Relationships
  user                     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  insights                 Insight[]
  
  // Database Indexes
  @@index([userId])
  @@index([date])
  @@unique([userId, date]) // One log per user per day
}
```

**Design Principles**:
- **Time-Based Sections**: 4 distinct check-in periods throughout the day
- **Progress Tracking**: Completion flags for each section
- **Flexible Data Types**: Mix of structured (Int, Boolean) and unstructured (String) data
- **Unique Constraint**: One daily log per user per date
- **Cascading Deletes**: Automatic cleanup when user is deleted

### WeeklyReflection Model
**Purpose**: Weekly introspection and goal tracking

```typescript
model WeeklyReflection {
  id                     Int      @id @default(autoincrement())
  userId                 Int
  weekStartDate          DateTime
  weekEndDate            DateTime
  
  // Calculated Analytics
  questionedLeavingJob   Boolean  @default(false)
  
  // Reflection Content
  weekRating             Int?     // 1-10 scale
  mentalState            String?
  weekHighlights         String?
  weekChallenges         String?
  lessonsLearned         String?
  nextWeekFocus          String?
  
  // Lifestyle Tracking
  gymDaysCount           Int      @default(0) // 1-7 days
  dietRating             Int?     // 1-10 scale
  memorableFamilyActivities String?
  
  // Relationships
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  weeklyInsights         WeeklyInsight[]
  
  // Database Indexes
  @@index([userId])
  @@index([weekStartDate])
  @@index([weekEndDate])
  @@unique([userId, weekStartDate, weekEndDate]) // One reflection per user per week
}
```

**Design Principles**:
- **Week Boundary Tracking**: Explicit start and end dates for flexible week definitions
- **Quantitative Metrics**: Numerical ratings for trend analysis
- **Qualitative Reflection**: Open-text fields for deep insights
- **Lifestyle Integration**: Physical health and family activity tracking

### Insight Models
**Purpose**: AI-generated insights for both daily and weekly data

#### Daily Insights
```typescript
model Insight {
  id              Int      @id @default(autoincrement())
  userId          Int
  dailyLogId      Int
  insightText     String   @db.Text
  createdAt       DateTime @default(now())
  
  // Relationships
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  dailyLog        DailyLog @relation(fields: [dailyLogId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([dailyLogId])
  @@unique([userId, dailyLogId]) // One insight per user per daily log
}
```

#### Weekly Insights
```typescript
model WeeklyInsight {
  id                  Int              @id @default(autoincrement())
  userId              Int
  weeklyReflectionId  Int
  insightText         String           @db.Text
  createdAt           DateTime         @default(now())
  
  // Relationships
  user                User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  weeklyReflection    WeeklyReflection @relation(fields: [weeklyReflectionId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([weeklyReflectionId])
  @@unique([userId, weeklyReflectionId]) // One insight per user per weekly reflection
}
```

**Design Principles**:
- **Text Storage**: Large text fields for comprehensive AI-generated content
- **Unique Constraints**: One insight per parent entity to prevent duplicates
- **Audit Trail**: Creation timestamp for insight tracking
- **Cascading Relationships**: Automatic cleanup of insights when parent data is deleted

## Data Access Patterns

### Prisma ORM Configuration
```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

const prisma = globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

**Key Features**:
- **Connection Pooling**: Prisma Accelerate extension for optimized connections
- **Global Instance**: Singleton pattern for development efficiency
- **Type Safety**: Full TypeScript integration with generated types

### Common Query Patterns

#### User Data Retrieval
```typescript
// Complete user profile with related data
const userWithData = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    dailyLogs: {
      orderBy: { date: 'desc' },
      take: 30 // Last 30 days
    },
    weeklyReflections: {
      orderBy: { weekStartDate: 'desc' },
      take: 12 // Last 12 weeks
    },
    insights: {
      orderBy: { createdAt: 'desc' },
      take: 10 // Latest insights
    }
  }
});
```

#### Daily Log Operations
```typescript
// Create or update daily log
const dailyLog = await prisma.dailyLog.upsert({
  where: {
    userId_date: { userId, date: new Date(date) }
  },
  update: {
    morningMood: data.morningMood,
    sleepQuality: data.sleepQuality,
    morningCompleted: true
  },
  create: {
    userId,
    date: new Date(date),
    morningMood: data.morningMood,
    sleepQuality: data.sleepQuality,
    morningCompleted: true
  }
});
```

#### Analytics Queries
```typescript
// Weekly mood trends
const moodTrends = await prisma.dailyLog.findMany({
  where: {
    userId,
    date: {
      gte: startDate,
      lte: endDate
    }
  },
  select: {
    date: true,
    morningMood: true,
    overallMood: true,
    dayRating: true
  },
  orderBy: { date: 'asc' }
});
```

### Edge Runtime SQL Queries
```typescript
// Authentication query for Edge Runtime
const users = await sql`
  SELECT id, username, "passwordHash", "displayName", timezone, theme 
  FROM "User" 
  WHERE username = ${username}
  LIMIT 1
`;

// Simple user verification
const userExists = await sql`
  SELECT EXISTS(
    SELECT 1 FROM "User" WHERE id = ${userId}
  ) as exists
`;
```

## Database Security

### Data Isolation
Every query includes user-based filtering to ensure data isolation:

```typescript
// Always filter by userId
const dailyLogs = await prisma.dailyLog.findMany({
  where: {
    userId: session.user.id, // Always include userId filter
    date: {
      gte: startDate,
      lte: endDate
    }
  }
});
```

### Cascade Deletion Strategy
```typescript
// User deletion cascades to all related data
onDelete: Cascade // Automatically removes:
// - All daily logs
// - All weekly reflections  
// - All insights
// - All weekly insights
```

### Input Validation
- **Prisma Validation**: Schema-level type checking and constraints
- **Application Validation**: Additional validation in service layer
- **SQL Injection Prevention**: Parameterized queries and Prisma protection

## Migration Strategy

### Prisma Migrate Workflow
```bash
# Create new migration
npx prisma migrate dev --name add_new_field

# Deploy to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Migration History
Current migrations include:
- `20250516010330_init`: Initial schema creation
- `20250516014701_add_user_timezone`: User timezone support
- `20250516020254_remove_cravings_field`: Schema cleanup
- `20250518171623_update_schema_and_add_insights`: AI insights implementation
- `20250518200526_update_schema_add_weekly_insights`: Weekly insights addition
- `20250518204422_rename_excessively_isolated_field`: Field renaming for clarity

### Schema Evolution Principles
- **Backward Compatibility**: Maintain existing data during migrations
- **Default Values**: Provide sensible defaults for new fields
- **Non-Breaking Changes**: Avoid removing required fields without migration path
- **Documentation**: Clear migration descriptions and reasoning

## Performance Optimization

### Database Indexes
Strategic indexing for common query patterns:

```sql
-- User-based queries (most common)
@@index([userId])

-- Date-based queries for time-series analysis
@@index([date])
@@index([weekStartDate])
@@index([weekEndDate])

-- Relationship lookups
@@index([dailyLogId])
@@index([weeklyReflectionId])

-- Unique constraints for data integrity
@@unique([userId, date])
@@unique([userId, weekStartDate, weekEndDate])
@@unique([userId, dailyLogId])
@@unique([userId, weeklyReflectionId])
```

### Query Optimization Strategies
- **Selective Fields**: Use `select` to fetch only needed data
- **Pagination**: Implement `take` and `skip` for large datasets
- **Relationship Loading**: Strategic use of `include` vs separate queries
- **Connection Pooling**: Prisma Accelerate for optimized connections

### Neon PostgreSQL Features
- **Serverless Scaling**: Automatic scaling based on demand
- **Connection Pooling**: Built-in connection management
- **Read Replicas**: Available for read-heavy workloads
- **Branching**: Database branching for testing migrations

## Data Management

### Backup Strategy
- **Neon Automated Backups**: Point-in-time recovery
- **Migration History**: Schema versioning and rollback capability
- **Data Export**: Prisma-based data export utilities

### Data Retention
Current retention policy:
- **User Data**: Retained indefinitely while account active
- **Session Data**: Managed by NextAuth.js expiration
- **Temporary Data**: Cleaned up via scheduled tasks

### Analytics and Reporting
Database supports various analytics queries:
- **Mood Trends**: Time-series analysis of mood data
- **Medication Effectiveness**: Correlation analysis
- **Weekly Patterns**: Aggregated weekly performance metrics
- **User Engagement**: Completion rates and usage patterns

## Development Workflow

### Local Development
```bash
# Start development database
npx prisma db push

# Generate Prisma client
npx prisma generate

# View database in browser
npx prisma studio
```

### Testing Strategy
- **Unit Tests**: Service layer functions with test database
- **Integration Tests**: API endpoints with test data
- **Migration Tests**: Schema changes in isolated environment

### Schema Management
- **Development**: Use `prisma db push` for rapid iteration
- **Production**: Use `prisma migrate deploy` for versioned changes
- **Staging**: Test migrations before production deployment

## Monitoring and Maintenance

### Database Monitoring
- **Query Performance**: Slow query identification
- **Connection Usage**: Pool utilization tracking
- **Error Rates**: Database error monitoring
- **Data Growth**: Storage and performance impact tracking

### Maintenance Tasks
- **Index Optimization**: Regular index usage analysis
- **Query Optimization**: Performance review of common queries
- **Schema Evolution**: Plan for future schema changes
- **Data Archival**: Strategy for long-term data management

## Future Considerations

### Scalability Planning
- **Read Replicas**: For read-heavy analytics workloads
- **Data Partitioning**: Time-based partitioning for large datasets
- **Caching Layer**: Redis integration for frequently accessed data
- **Archive Strategy**: Historical data management

### Feature Expansion
- **Additional Entities**: Support for new tracking categories
- **Relationship Complexity**: More sophisticated data relationships
- **Real-time Features**: WebSocket integration for live updates
- **Multi-tenant**: Support for multiple organizations

### Technology Evolution
- **Prisma Updates**: New ORM features and performance improvements
- **PostgreSQL Features**: Advanced database capabilities
- **Neon Platform**: New serverless database features
- **Edge Database**: Consider edge-optimized database solutions

## Related Documents
- [System Architecture Overview](./01-overview.md) - High-level system design
- [Authentication Architecture](./05-authentication.md) - Security implementation
- [Backend Architecture](./03-backend.md) - API and service layer details
- [Frontend Architecture](./02-frontend.md) - Client-side data handling

## Changelog
- 2025-07-06: Initial database architecture documentation created
- 2025-07-06: Schema relationships and access patterns documented
- 2025-07-06: Security and performance considerations detailed
