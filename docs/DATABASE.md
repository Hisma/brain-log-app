# Brain Log App - Database Documentation

This document provides comprehensive documentation for the PostgreSQL database implementation in the Brain Log App.

## Database Overview

The Brain Log App uses a PostgreSQL database for server-side data storage, replacing the previous client-side IndexedDB implementation. This change provides several benefits:

- **Data Persistence**: Data is stored on the server, ensuring it persists across different browsers and devices
- **Multi-device Access**: Users can access their data from any device with internet connection
- **Enhanced Security**: Server-side storage provides better security options and control
- **Centralized Management**: Easier to manage, backup, and maintain data
- **Scalability**: Better equipped to handle growing data and user base

## Database Schema

The database schema is defined using Prisma ORM in the `prisma/schema.prisma` file. The schema includes three main models:

### User Model

Stores user authentication and profile information:

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

### DailyLog Model

Stores daily check-ins and reflections:

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
  responseMethod           String[]  @default([])
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

### WeeklyReflection Model

Stores weekly reflections and insights:

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

## Database Setup

### Prerequisites

- PostgreSQL server (version 12 or higher recommended)
- Database user with appropriate permissions

### Configuration

1. Create a PostgreSQL database for the application:

```sql
CREATE DATABASE brain_log_db;
```

2. Configure the database connection in the `.env` file:

```
DATABASE_URL="postgresql://username:password@hostname:5432/brain_log_db"
```

Replace `username`, `password`, and `hostname` with your PostgreSQL credentials and server information.

3. Generate the Prisma client:

```bash
npx prisma generate
```

4. Create the database tables:

```bash
npx prisma db push
```

## Prisma ORM

The application uses Prisma ORM to interact with the PostgreSQL database. Prisma provides:

- Type-safe database access
- Auto-generated client based on the schema
- Migration management
- Query building

### Prisma Client Setup

The Prisma client is initialized in `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as { 
    prisma: PrismaClient
}

const prisma = globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

This setup ensures that only one instance of the Prisma client is created during development, and it uses the Accelerate extension for improved performance.

## Database Operations

The application interacts with the database through API routes and service functions:

### API Routes

- `src/app/api/users/route.ts`: User management operations
- `src/app/api/daily-logs/route.ts`: Daily log operations
- `src/app/api/weekly-reflections/route.ts`: Weekly reflection operations

### Service Functions

- `src/lib/services/userService.ts`: User-related operations
- `src/lib/services/dailyLogService.ts`: Daily log operations
- `src/lib/services/weeklyReflectionService.ts`: Weekly reflection operations

## Data Migration

If you're migrating from the previous client-side IndexedDB implementation, you'll need to:

1. Export your data from the client-side database
2. Create user accounts in the new system
3. Import the data into the PostgreSQL database

A data migration tool is planned for a future release to automate this process.

## Backup and Maintenance

### Database Backup

Regular backups are essential for data safety. You can use PostgreSQL's built-in backup tools:

```bash
pg_dump -U username -d brain_log_db > backup.sql
```

### Database Maintenance

For optimal performance:

1. Regularly update PostgreSQL to the latest version
2. Set up automated backups
3. Monitor database size and performance
4. Consider implementing connection pooling for production environments

## Security Considerations

The database implementation includes several security measures:

1. **Password Hashing**: User passwords are hashed using bcrypt before storage
2. **Authentication**: API routes are protected with NextAuth.js
3. **Data Validation**: Input validation is performed before database operations
4. **Relationship Protection**: Cascade deletion ensures data integrity

## Future Enhancements

Planned database enhancements include:

1. **Data Analytics**: Additional tables for storing analytics data
2. **Sharing Features**: Functionality to share insights with healthcare providers
3. **Advanced Search**: Improved search capabilities across logs and reflections
