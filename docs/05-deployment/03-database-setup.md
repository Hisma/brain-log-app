---
title: Database Setup & Management
description: Complete guide to database deployment, configuration, and management for production environments
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Database Setup & Management

## Overview

The Brain Log App uses a hybrid database architecture optimized for serverless deployment with PostgreSQL as the primary database. This guide covers database setup, migration procedures, performance optimization, and maintenance strategies for production environments.

## Database Architecture

### Hybrid Database Strategy

The application uses a dual-driver approach for optimal performance across different runtime environments:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Edge Runtime  │    │   Node.js Runtime │    │    Database     │
│                 │    │                   │    │                 │
│  • Middleware   │    │  • Prisma Client  │───▶│  • PostgreSQL   │
│  • Basic Auth   │    │  • Full ORM       │    │  • Neon Database│
│  • Neon Direct │───▶│  • Transactions   │    │  • Connection   │
│                 │    │  • Relations      │    │    Pooling      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Database Drivers

**Prisma Client (Node.js Runtime):**
- Full ORM capabilities with type safety
- Complex queries and transactions
- Relationship handling
- Migration management
- Used in API routes

**Neon Serverless (Edge Runtime):**
- Lightweight SQL queries
- Direct database access
- Edge Runtime compatible
- Used for simple authentication queries

## Neon Database Setup

The Brain Log App uses Neon Database as its PostgreSQL provider, offering serverless PostgreSQL optimized for modern applications.

**Neon Database Advantages:**
- Serverless PostgreSQL designed for modern applications
- Automatic scaling and connection pooling
- Built-in branching for development workflows
- Excellent Vercel integration
- Generous free tier

**Setup Process:**
1. Visit [neon.tech](https://neon.tech) and create account
2. Create new PostgreSQL database
3. Note connection string and pooled connection URL
4. Configure environment variables

**Pricing Tiers:**
- **Free:** 512MB storage, 1 database
- **Pro:** Starts at $19/month, multiple databases
- **Enterprise:** Custom pricing with advanced features

## Production Database Setup

### 1. Neon Database Configuration

**Step 1: Create Database Instance**
```bash
# Using Neon CLI (optional)
npm install -g @neondatabase/cli
neon login
neon projects create brain-log-prod
```

**Step 2: Configure Connection Strings**
```env
# Production environment (.env.production.local)
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech:5432/main?sslmode=require"

# Include connection pooling parameters
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech:5432/main?sslmode=require&connection_limit=20&pool_timeout=30"
```

**Step 3: Database Configuration**
```typescript
// Enhanced Prisma configuration for production
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient
}

const createPrismaClient = () => {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

  // Add Accelerate extension for production performance
  return client.$extends(withAccelerate());
};

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### 2. Schema Migration to Production

**Step 1: Prepare Migration**
```bash
# Generate Prisma client locally
npx prisma generate

# Create migration (if schema changes exist)
npx prisma migrate dev --name production-setup

# Review generated migration files
ls prisma/migrations/
```

**Step 2: Deploy to Production**
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Deploy migrations to production
npx prisma migrate deploy

# Verify schema deployment
npx prisma studio
```

**Step 3: Verify Schema**
```sql
-- Connect to production database and verify tables
\dt
-- Should show: Account, DailyLog, Session, User, VerificationToken, WeeklyReflection
```

### 3. Data Migration (if applicable)

**Development to Production Migration:**
```bash
# Export development data
npx prisma studio
# Use studio interface to export necessary seed data

# Or create SQL dump
pg_dump $DEVELOPMENT_DATABASE_URL > development_data.sql

# Import to production (selective)
# Only migrate essential data like admin users
```

## Database Schema Overview

### Core Tables

**User Management:**
```sql
-- Users table with authentication data
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    timezone VARCHAR(100) DEFAULT 'America/New_York',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NextAuth.js session management
CREATE TABLE "Account" (
    -- OAuth and external provider accounts
);

CREATE TABLE "Session" (
    -- User session tracking
);
```

**Core Application Data:**
```sql
-- Daily health and mood tracking
CREATE TABLE "DailyLog" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    -- 40+ health tracking fields
    -- Sleep, mood, energy, medication, etc.
);

-- Weekly reflection and goals
CREATE TABLE "WeeklyReflection" (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    -- Reflection and goal tracking fields
);
```

### Key Indexes

Performance-critical indexes already implemented:

```sql
-- User authentication
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- Daily log queries
CREATE INDEX "DailyLog_user_id_idx" ON "DailyLog"("user_id");
CREATE INDEX "DailyLog_date_idx" ON "DailyLog"("date");
CREATE UNIQUE INDEX "DailyLog_user_id_date_key" ON "DailyLog"("user_id", "date");

-- Weekly reflection queries
CREATE INDEX "WeeklyReflection_user_id_idx" ON "WeeklyReflection"("user_id");
CREATE INDEX "WeeklyReflection_start_date_idx" ON "WeeklyReflection"("start_date");
```

## Performance Optimization

### 1. Connection Pooling

**Neon Configuration:**
```env
# Optimize connection parameters
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require&connection_limit=20&pool_timeout=30&statement_timeout=30s"
```

**Prisma Configuration:**
```typescript
// src/lib/prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection optimization
  log: ['error'],
  errorFormat: 'minimal',
});
```

### 2. Query Optimization

**Efficient Query Patterns:**
```typescript
// Good: Use select to limit fields
const dailyLogs = await prisma.dailyLog.findMany({
  where: { userId: user.id },
  select: {
    id: true,
    date: true,
    morningMood: true,
    energyLevel: true,
  },
  orderBy: { date: 'desc' },
  take: 30, // Limit results
});

// Good: Use proper indexing
const weeklyData = await prisma.dailyLog.findMany({
  where: {
    userId: user.id,
    date: {
      gte: startDate,
      lte: endDate,
    },
  },
});
```

### 3. Caching Strategy

**Query Caching with Prisma Accelerate:**
```typescript
// Leverage Prisma Accelerate for caching
const cachedData = await prisma.dailyLog.findMany({
  where: { userId: user.id },
  cacheStrategy: {
    ttl: 300, // 5 minutes
  },
});
```

## Backup and Recovery

### 1. Automated Backups

**Neon Automatic Backups:**
- Point-in-time recovery up to 7 days (free tier)
- Extended retention available on paid plans
- Automatic daily snapshots

**Manual Backup Process:**
```bash
# Create manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup
head -20 backup_*.sql

# Store backup securely
# Upload to S3, Google Cloud Storage, etc.
```

### 2. Recovery Procedures

**Point-in-time Recovery:**
```bash
# Using Neon CLI
neon branches create --parent main --timestamp "2025-01-15T10:30:00Z"
```

**Manual Recovery:**
```bash
# Restore from backup file
psql $DATABASE_URL < backup_20250115_103000.sql

# Run migrations to ensure schema consistency
npx prisma migrate deploy
```

### 3. Disaster Recovery Plan

**Recovery Steps:**
1. Assess scope of data loss
2. Create new database instance if needed
3. Restore from most recent backup
4. Apply any missing migrations
5. Verify data integrity
6. Update application environment variables
7. Test critical functionality

## Monitoring and Maintenance

### 1. Database Monitoring

**Key Metrics to Monitor:**
- Connection pool utilization
- Query execution times
- Database size and growth
- Index usage statistics
- Error rates

**Monitoring Tools:**
```typescript
// Custom query performance logging
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Log slow queries
    console.warn('Slow query detected:', {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });
  }
});
```

### 2. Regular Maintenance Tasks

**Weekly Tasks:**
```bash
# Check database size
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check index usage
SELECT 
  indexrelname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

**Monthly Tasks:**
- Review slow query logs
- Analyze growth patterns
- Update connection pool settings if needed
- Review backup and recovery procedures

### 3. Performance Tuning

**Database Configuration:**
```sql
-- Check current settings
SHOW shared_preload_libraries;
SHOW max_connections;
SHOW shared_buffers;

-- Analyze table statistics
ANALYZE;

-- Check for unused indexes
SELECT 
  indexrelname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan < 10;
```

## Security Considerations

### 1. Connection Security

**SSL Configuration:**
```env
# Enforce SSL connections
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"

# Additional security parameters
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require&sslcert=client-cert.pem&sslkey=client-key.pem"
```

### 2. Access Control

**Database User Permissions:**
```sql
-- Create application-specific user
CREATE USER brain_log_app WITH PASSWORD 'secure_password';

-- Grant minimal required permissions
GRANT CONNECT ON DATABASE brain_log TO brain_log_app;
GRANT USAGE ON SCHEMA public TO brain_log_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO brain_log_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO brain_log_app;
```

### 3. Data Protection

**Environment Security:**
```bash
# Rotate database passwords regularly
# Use different credentials per environment
# Store credentials securely (not in code)
```

**Data Encryption:**
- Database encryption at rest (provided by Neon)
- Encrypted connections in transit (SSL)
- Application-level encryption for sensitive fields

## Troubleshooting

### Common Issues

**1. Connection Pool Exhaustion**
```
Error: Can't reach database server
```

**Solutions:**
```typescript
// Reduce connection limit
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=5',
    },
  },
});

// Implement connection cleanup
export async function closeConnections() {
  await prisma.$disconnect();
}
```

**2. Migration Failures**
```
Error: Migration failed to apply
```

**Solutions:**
```bash
# Check migration status
npx prisma migrate status

# Reset if needed (development only)
npx prisma migrate reset

# Force apply specific migration
npx prisma migrate resolve --applied "migration_name"
```

**3. Performance Issues**
```
Slow query performance
```

**Solutions:**
```sql
-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM "DailyLog" WHERE user_id = 1;

-- Check missing indexes
SELECT * FROM pg_stat_user_tables WHERE idx_scan = 0;
```

### Debugging Tools

**Database Connection Testing:**
```typescript
// Test database connectivity
export async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
```

**Query Performance Analysis:**
```typescript
// Monitor query performance
const startTime = Date.now();
const result = await prisma.dailyLog.findMany({ /* query */ });
const endTime = Date.now();

if (endTime - startTime > 1000) {
  console.warn(`Slow query detected: ${endTime - startTime}ms`);
}
```

## Migration Strategies

### Development to Production

**Schema Migrations:**
```bash
# 1. Test migration locally
npx prisma migrate dev --name feature_update

# 2. Review generated SQL
cat prisma/migrations/*/migration.sql

# 3. Apply to staging
DATABASE_URL="staging_url" npx prisma migrate deploy

# 4. Apply to production
DATABASE_URL="production_url" npx prisma migrate deploy
```

### Zero-Downtime Migrations

**Safe Migration Patterns:**
1. **Additive changes** (new columns, indexes) - Safe
2. **Backwards compatible changes** - Safe with proper planning
3. **Breaking changes** - Require careful coordination

**Example Safe Migration:**
```sql
-- Safe: Add new optional column
ALTER TABLE "DailyLog" ADD COLUMN "new_field" TEXT;

-- Safe: Add new index
CREATE INDEX CONCURRENTLY "DailyLog_new_field_idx" ON "DailyLog"("new_field");
```

## Related Documents

- [Environment Configuration](01-environments.md)
- [Vercel Deployment](02-vercel-deployment.md)
- [Database Architecture](../02-architecture/04-database.md)
- [API Reference](../03-api-reference/01-overview.md)

## Changelog

- **2025-07-06**: Initial database setup and management documentation
