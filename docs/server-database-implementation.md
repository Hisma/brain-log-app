# Server Database Implementation Guide

This document provides a detailed guide for implementing the server-side database for the Brain Log App. The implementation replaces the client-side IndexedDB storage with a server-side SQLite database using Prisma ORM.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Implementation Steps](#implementation-steps)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Authentication](#authentication)
7. [Client-Side Integration](#client-side-integration)
8. [Testing](#testing)
9. [Deployment Considerations](#deployment-considerations)

## Overview

The server-side database implementation offers several advantages over the client-side IndexedDB storage:

- Data persists across different browsers and devices
- Better security and backup options
- Centralized data management
- Ability to scale as the application grows

The implementation uses:

- **SQLite**: A file-based database that's easy to set up and maintain
- **Prisma ORM**: A modern database toolkit for TypeScript and Node.js
- **Next.js API Routes**: Server-side API endpoints for CRUD operations
- **NextAuth.js**: Authentication system for user management

## Prerequisites

Before starting the implementation, ensure you have:

- Node.js 18.x or later
- npm 9.x or later
- Basic knowledge of TypeScript, React, and Next.js
- Understanding of RESTful APIs and database concepts

## Implementation Steps

### 1. Install Dependencies

Run the provided script to install all required dependencies:

```bash
# Make the script executable
chmod +x scripts/install-dependencies.sh

# Run the script
./scripts/install-dependencies.sh
```

This will install:
- Prisma ORM and client
- bcryptjs for password hashing
- NextAuth.js for authentication
- Type definitions for the packages

### 2. Set Up Prisma and Database Schema

Run the provided script to initialize Prisma and create the database schema:

```bash
# Make the script executable
chmod +x scripts/setup-prisma.sh

# Run the script
./scripts/setup-prisma.sh
```

This will:
- Initialize Prisma
- Create a schema.prisma file with the database schema
- Generate the Prisma client

### 3. Create the Database

Create the SQLite database based on the schema:

```bash
npx prisma db push
```

### 4. Implement API Routes

The API routes are implemented in the `src/app/api` directory:

- `src/app/api/users/route.ts`: API endpoints for user management
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth.js API routes for authentication
- `src/app/api/daily-logs/route.ts`: API endpoints for daily logs
- `src/app/api/weekly-reflections/route.ts`: API endpoints for weekly reflections

Each API route implements the following HTTP methods:

- `GET`: Retrieve data
- `POST`: Create new data
- `PUT`: Update existing data
- `DELETE`: Delete data

### 5. Set Up Authentication

Authentication is implemented using NextAuth.js:

- `src/lib/auth/auth-options.ts`: NextAuth.js configuration
- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth.js API routes

### 6. Update Client-Side Services

Update the client-side services to use the new API endpoints:

- `src/lib/services/api.ts`: Utility functions for API requests
- `src/lib/services/dailyLogService.ts`: Service for daily logs
- `src/lib/services/weeklyReflectionService.ts`: Service for weekly reflections

### 7. Update Components

Update the components to use the new services:

- `src/components/forms/MorningCheckInForm.tsx`: Form for morning check-ins
- `src/components/forms/EveningReflectionForm.tsx`: Form for evening reflections
- `src/components/forms/WeeklyReflectionForm.tsx`: Form for weekly reflections

## Database Schema

The database schema is defined in `prisma/schema.prisma`:

### User Model

```prisma
model User {
  id           Int               @id @default(autoincrement())
  username     String            @unique
  passwordHash String
  displayName  String
  createdAt    DateTime          @default(now())
  lastLogin    DateTime?
  theme        String            @default("system") // "light", "dark", or "system"
  dailyLogs    DailyLog[]
  weeklyReflections WeeklyReflection[]
}
```

### Daily Log Model

```prisma
model DailyLog {
  id                       Int      @id @default(autoincrement())
  userId                   Int
  date                     DateTime
  
  // Morning check-in fields
  sleepHours               Float    @default(0)
  sleepQuality             Int      @default(0) // 1-10 scale
  dreams                   String?
  morningMood              Int      @default(0) // 1-10 scale
  physicalStatus           String?
  medicationTakenAt        String?
  medicationDose           Float    @default(0)
  ateWithinHour            Boolean  @default(false)
  firstHourFeeling         String?
  
  // Evening reflection fields
  focusLevel               Int      @default(0) // 1-10 scale
  energyLevel              Int      @default(0) // 1-10 scale
  ruminationLevel          Int      @default(0) // 1-10 scale
  mainTrigger              String?
  responseMethod           String?
  hadTriggeringInteraction Boolean  @default(false)
  interactionDetails       String?
  selfWorthTiedToPerformance String?
  overextended             String?
  overallMood              Int      @default(0) // 1-10 scale
  medicationEffectiveness  String?
  helpfulFactors           String?
  distractingFactors       String?
  thoughtForTomorrow       String?
  isComplete               Boolean  @default(false)
  
  // Additional fields
  dayRating                Int?     // 1-10 scale
  accomplishments          String?
  challenges               String?
  gratitude                String?
  improvements             String?
  
  // Relationships
  user                     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Indexes
  @@index([userId])
  @@index([date])
  @@unique([userId, date])
}
```

### Weekly Reflection Model

```prisma
model WeeklyReflection {
  id                     Int      @id @default(autoincrement())
  userId                 Int
  weekStartDate          DateTime
  weekEndDate            DateTime
  
  // Calculated fields
  averageRuminationScore Float    @default(0)
  stableDaysCount        Int      @default(0)
  medicationEffectiveDays Int     @default(0)
  questionedLeavingJob   Boolean  @default(false)
  weeklyInsight          String?
  
  // Reflection fields
  weekRating             Int?     // 1-10 scale
  mentalState            String?
  physicalState          String?
  weekHighlights         String?
  weekChallenges         String?
  lessonsLearned         String?
  nextWeekFocus          String?
  
  // Relationships
  user                   User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Indexes
  @@index([userId])
  @@index([weekStartDate])
  @@index([weekEndDate])
  @@unique([userId, weekStartDate, weekEndDate])
}
```

## API Routes

### Users API

- `GET /api/users`: Get all users
- `POST /api/users`: Create a new user

### Daily Logs API

- `GET /api/daily-logs`: Get all daily logs for the authenticated user
- `GET /api/daily-logs?date=YYYY-MM-DD`: Get daily log for a specific date
- `GET /api/daily-logs?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`: Get daily logs for a date range
- `POST /api/daily-logs`: Create a new daily log
- `PUT /api/daily-logs`: Update a daily log
- `DELETE /api/daily-logs?id=123`: Delete a daily log

### Weekly Reflections API

- `GET /api/weekly-reflections`: Get all weekly reflections for the authenticated user
- `GET /api/weekly-reflections?id=123`: Get a specific weekly reflection
- `GET /api/weekly-reflections?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`: Get weekly reflections for a date range
- `POST /api/weekly-reflections`: Create a new weekly reflection
- `PUT /api/weekly-reflections`: Update a weekly reflection
- `DELETE /api/weekly-reflections?id=123`: Delete a weekly reflection

## Authentication

Authentication is implemented using NextAuth.js with a credentials provider:

```typescript
// src/lib/auth/auth-options.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Authenticate user
      }
    })
  ],
  // ...
};
```

## Client-Side Integration

### API Service

The API service provides utility functions for making API requests:

```typescript
// src/lib/services/api.ts
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Make API request
}

export async function get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
  // Make GET request
}

export async function post<T>(endpoint: string, data: any): Promise<T> {
  // Make POST request
}

export async function put<T>(endpoint: string, data: any): Promise<T> {
  // Make PUT request
}

export async function del<T>(endpoint: string): Promise<T> {
  // Make DELETE request
}
```

### Daily Log Service

The daily log service provides functions for working with daily logs:

```typescript
// src/lib/services/dailyLogService.ts
export async function getDailyLog(date: Date): Promise<DailyLog | null> {
  // Get daily log for a specific date
}

export async function createDailyLog(data: DailyLogInput): Promise<DailyLog> {
  // Create a new daily log
}

export async function updateDailyLog(id: number, data: Partial<DailyLogInput>): Promise<DailyLog> {
  // Update a daily log
}

export async function deleteDailyLog(id: number): Promise<void> {
  // Delete a daily log
}
```

### Weekly Reflection Service

The weekly reflection service provides functions for working with weekly reflections:

```typescript
// src/lib/services/weeklyReflectionService.ts
export async function getWeeklyReflection(id: number): Promise<WeeklyReflection | null> {
  // Get a specific weekly reflection
}

export async function createWeeklyReflection(data: WeeklyReflectionInput): Promise<WeeklyReflection> {
  // Create a new weekly reflection
}

export async function updateWeeklyReflection(id: number, data: Partial<WeeklyReflectionInput>): Promise<WeeklyReflection> {
  // Update a weekly reflection
}

export async function deleteWeeklyReflection(id: number): Promise<void> {
  // Delete a weekly reflection
}
```

## Testing

### API Testing

Test the API routes using tools like Postman or curl:

```bash
# Test GET /api/users
curl -X GET http://localhost:3000/api/users

# Test POST /api/users
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password","displayName":"Test User"}'
```

### Component Testing

Test the components using tools like Jest and React Testing Library:

```typescript
// src/components/forms/MorningCheckInForm.test.tsx
describe('MorningCheckInForm', () => {
  it('should submit the form with valid data', async () => {
    // Test form submission
  });
});
```

## Deployment Considerations

### Database Migration

When deploying to production, consider using a more robust database like PostgreSQL:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Environment Variables

Use environment variables for sensitive information:

```bash
# .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/brain-log"
NEXTAUTH_SECRET="your-secret-key"
```

### Backup and Restore

Implement a backup and restore strategy for the database:

```bash
# Backup
npx prisma db pull > backup.sql

# Restore
npx prisma db push --schema=backup.sql
```

## Conclusion

This guide provides a comprehensive overview of the server-side database implementation for the Brain Log App. By following these steps, you can successfully migrate from the client-side IndexedDB storage to a server-side SQLite database using Prisma ORM.
