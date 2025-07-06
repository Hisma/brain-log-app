---
title: Production Monitoring & Maintenance
description: Comprehensive guide to monitoring, logging, performance tracking, and maintenance procedures for production environments
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Production Monitoring & Maintenance

## Overview

This guide covers comprehensive monitoring, logging, performance tracking, and maintenance strategies for the Brain Log App in production. It includes error tracking, performance monitoring, health checks, alerting systems, and regular maintenance procedures.

## Monitoring Architecture

### Multi-Layer Monitoring Strategy

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Client Metrics │    │  Server Metrics  │    │   Infrastructure │
│                 │    │                  │    │                 │
│ • Core Web      │    │ • API Response   │    │ • Neon Database │
│   Vitals        │───▶│   Times          │───▶│   Performance   │
│ • Error Rates   │    │ • Function       │    │ • Vercel Edge   │
│ • User Actions  │    │   Performance    │    │   Runtime       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Monitoring Stack

**Application Performance Monitoring:**
- Vercel Analytics (Built-in)
- Error tracking with custom logging
- Performance metrics collection
- Health check endpoints

**Database Monitoring:**
- Neon built-in monitoring
- Custom query performance tracking
- Connection pool monitoring
- Slow query detection

**Infrastructure Monitoring:**
- Vercel function metrics
- Edge Runtime performance
- CDN and static asset performance
- Uptime monitoring

## Error Tracking & Logging

### 1. Application Error Tracking

**Custom Error Logging System:**
```typescript
// src/lib/monitoring/logger.ts
interface LogEvent {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  userId?: number;
  sessionId?: string;
}

class Logger {
  private static instance: Logger;
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(event: LogEvent) {
    const logEntry = {
      ...event,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${event.level.toUpperCase()}]`, logEntry);
    }

    // Production logging
    if (process.env.NODE_ENV === 'production') {
      this.sendToLogService(logEntry);
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log({
      level: 'error',
      message,
      context: {
        ...context,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : undefined,
      },
      timestamp: new Date(),
    });
  }

  warn(message: string, context?: Record<string, any>) {
    this.log({
      level: 'warn',
      message,
      context,
      timestamp: new Date(),
    });
  }

  info(message: string, context?: Record<string, any>) {
    this.log({
      level: 'info',
      message,
      context,
      timestamp: new Date(),
    });
  }

  private sendToLogService(logEntry: any) {
    // Send to external logging service
    // Example: POST to logging endpoint
    fetch('/api/internal/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry),
    }).catch(err => {
      console.error('Failed to send log:', err);
    });
  }
}

export const logger = Logger.getInstance();
```

### 2. API Error Handling

**Centralized Error Handling:**
```typescript
// src/lib/monitoring/api-error-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      const errorContext = {
        url: req.url,
        method: req.method,
        userAgent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      };

      logger.error(
        'API route error',
        error instanceof Error ? error : new Error(String(error)),
        errorContext
      );

      // Return structured error response
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' 
            ? (error instanceof Error ? error.message : String(error))
            : 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  };
}

// Usage in API routes
export const GET = withErrorHandling(async (req: NextRequest) => {
  // API logic here
  return NextResponse.json({ data: 'success' });
});
```

### 3. Client-Side Error Tracking

**Error Boundary Implementation:**
```typescript
// src/components/providers/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../../lib/monitoring/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              An error occurred while rendering this page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Performance Monitoring

### 1. Core Web Vitals Tracking

**Custom Performance Monitoring:**
```typescript
// src/lib/monitoring/performance.ts
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  init() {
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    this.trackCLS();
    this.trackFID();
    this.trackLCP();
    this.trackFCP();
    this.trackTTFB();
  }

  private trackCLS() {
    // Cumulative Layout Shift
    let clsValue = 0;
    let clsEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    // Report CLS when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportMetric({
          name: 'CLS',
          value: clsValue,
          timestamp: Date.now(),
          url: window.location.href,
        });
      }
    });
  }

  private trackFID() {
    // First Input Delay
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.reportMetric({
          name: 'FID',
          value: (entry as any).processingStart - entry.startTime,
          timestamp: Date.now(),
          url: window.location.href,
        });
      }
    });

    observer.observe({ type: 'first-input', buffered: true });
  }

  private trackLCP() {
    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.reportMetric({
        name: 'LCP',
        value: lastEntry.startTime,
        timestamp: Date.now(),
        url: window.location.href,
      });
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  private trackFCP() {
    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.reportMetric({
          name: 'FCP',
          value: entry.startTime,
          timestamp: Date.now(),
          url: window.location.href,
        });
      }
    });

    observer.observe({ type: 'paint', buffered: true });
  }

  private trackTTFB() {
    // Time to First Byte
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
      this.reportMetric({
        name: 'TTFB',
        value: navigationEntry.responseStart - navigationEntry.requestStart,
        timestamp: Date.now(),
        url: window.location.href,
      });
    }
  }

  private reportMetric(metric: PerformanceMetric) {
    // Send to analytics endpoint
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/internal/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      }).catch(err => {
        console.error('Failed to report metric:', err);
      });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${metric.name}: ${metric.value}ms`);
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
```

### 2. API Performance Monitoring

**Response Time Tracking:**
```typescript
// src/lib/monitoring/api-performance.ts
export function withPerformanceTracking(
  handler: (req: NextRequest) => Promise<NextResponse>,
  routeName: string
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    
    try {
      const response = await handler(req);
      const duration = Date.now() - startTime;
      
      // Log performance data
      logger.info('API Performance', {
        route: routeName,
        method: req.method,
        duration,
        status: response.status,
        timestamp: new Date().toISOString(),
      });
      
      // Add performance headers
      response.headers.set('X-Response-Time', `${duration}ms`);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('API Error with Performance', error as Error, {
        route: routeName,
        method: req.method,
        duration,
        timestamp: new Date().toISOString(),
      });
      
      throw error;
    }
  };
}
```

### 3. Database Performance Monitoring

**Query Performance Tracking:**
```typescript
// src/lib/monitoring/database-performance.ts
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export function createMonitoredPrismaClient(): PrismaClient {
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

  // Monitor slow queries
  prisma.$on('query', (e) => {
    const duration = e.duration;
    const query = e.query;
    
    if (duration > 1000) { // Queries taking more than 1 second
      logger.warn('Slow database query detected', {
        query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
        duration,
        params: e.params,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Log all queries in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Query: ${duration}ms - ${query}`);
    }
  });

  // Monitor database errors
  prisma.$on('error', (e) => {
    logger.error('Database error', new Error(e.message), {
      target: e.target,
      timestamp: new Date().toISOString(),
    });
  });

  return prisma;
}
```

## Health Checks & Uptime Monitoring

### 1. Health Check Endpoints

**System Health Check:**
```typescript
// src/app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { logger } from '../../../lib/monitoring/logger';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, any> = {};
  
  try {
    // Database connectivity check
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = {
        status: 'healthy',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      checks.database = {
        status: 'unhealthy',
        error: (error as Error).message,
      };
    }

    // Check OpenAI API connectivity (optional)
    if (process.env.OPENAI_API_KEY) {
      try {
        const openaiStart = Date.now();
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        });
        
        checks.openai = {
          status: response.ok ? 'healthy' : 'degraded',
          responseTime: Date.now() - openaiStart,
          statusCode: response.status,
        };
      } catch (error) {
        checks.openai = {
          status: 'unhealthy',
          error: (error as Error).message,
        };
      }
    }

    // Overall system health
    const isHealthy = Object.values(checks).every(
      check => check.status === 'healthy'
    );

    const response = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    logger.info('Health check completed', { 
      status: response.status,
      responseTime: Date.now() - startTime,
    });

    return NextResponse.json(response, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error) {
    logger.error('Health check failed', error as Error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      },
      { status: 503 }
    );
  }
}
```

### 2. External Uptime Monitoring

**Recommended Services:**
- **UptimeRobot** (Free tier available)
- **Pingdom** (Comprehensive monitoring)
- **StatusPage** (Public status page)

**Configuration Example:**
```bash
# Monitor these endpoints:
# - https://your-app.vercel.app/api/health (every 5 minutes)
# - https://your-app.vercel.app/ (every 5 minutes)
# - Database connectivity through health endpoint

# Alert channels:
# - Email notifications
# - Slack webhook
# - SMS for critical alerts
```

## Alerting & Notifications

### 1. Critical Alert System

**Alert Configuration:**
```typescript
// src/lib/monitoring/alerts.ts
interface Alert {
  level: 'critical' | 'warning' | 'info';
  service: string;
  message: string;
  context?: Record<string, any>;
}

export class AlertManager {
  static async sendAlert(alert: Alert) {
    // Log the alert
    logger.error(`${alert.level.toUpperCase()} ALERT: ${alert.service}`, 
      new Error(alert.message), alert.context);

    // Send to external services
    if (process.env.NODE_ENV === 'production') {
      await Promise.allSettled([
        this.sendEmailAlert(alert),
        this.sendSlackAlert(alert),
      ]);
    }
  }

  private static async sendEmailAlert(alert: Alert) {
    // Implementation for email alerts
    // Using your email service provider
  }

  private static async sendSlackAlert(alert: Alert) {
    if (!process.env.SLACK_WEBHOOK_URL) return;

    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 ${alert.level.toUpperCase()}: ${alert.service}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${alert.level.toUpperCase()} Alert*\n*Service:* ${alert.service}\n*Message:* ${alert.message}`,
              },
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
}

// Usage examples
export const criticalAlerts = {
  databaseDown: () => AlertManager.sendAlert({
    level: 'critical',
    service: 'Database',
    message: 'Database connection failed',
  }),
  
  highErrorRate: (rate: number) => AlertManager.sendAlert({
    level: 'warning',
    service: 'API',
    message: `High error rate detected: ${rate}%`,
    context: { errorRate: rate },
  }),
};
```

## Maintenance Procedures

### 1. Regular Maintenance Tasks

**Daily Monitoring Checklist:**
- [ ] Check application health endpoint
- [ ] Review error logs for new issues
- [ ] Monitor database performance metrics
- [ ] Verify backup completion
- [ ] Check uptime status

**Weekly Maintenance Tasks:**
- [ ] Review performance metrics trends
- [ ] Analyze slow query reports
- [ ] Check disk usage and growth
- [ ] Review security logs
- [ ] Update monitoring dashboards

**Monthly Maintenance Tasks:**
- [ ] Security updates and patches
- [ ] Performance optimization review
- [ ] Backup restoration testing
- [ ] Capacity planning review
- [ ] Documentation updates

### 2. Automated Maintenance Scripts

**Log Cleanup Script:**
```typescript
// scripts/cleanup-logs.ts
import prisma from '../src/lib/prisma';

async function cleanupOldLogs() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Clean up old log entries if you store logs in database
  const deletedLogs = await prisma.logEntry.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  });

  console.log(`Cleaned up ${deletedLogs.count} old log entries`);
}

cleanupOldLogs().catch(console.error);
```

**Database Maintenance Script:**
```typescript
// scripts/database-maintenance.ts
import prisma from '../src/lib/prisma';

async function databaseMaintenance() {
  console.log('Starting database maintenance...');

  // Analyze tables for query optimization
  await prisma.$executeRaw`ANALYZE`;

  // Check for unused indexes
  const unusedIndexes = await prisma.$queryRaw`
    SELECT 
      indexrelname,
      idx_scan
    FROM pg_stat_user_indexes
    WHERE idx_scan < 10
  `;

  console.log('Unused indexes:', unusedIndexes);

  // Check table sizes
  const tableSizes = await prisma.$queryRaw`
    SELECT 
      schemaname,
      tablename,
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
      pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  `;

  console.log('Table sizes:', tableSizes);
}

databaseMaintenance().catch(console.error);
```

### 3. Performance Optimization

**Cache Warming Script:**
```typescript
// scripts/warm-cache.ts
import { logger } from '../src/lib/monitoring/logger';

async function warmCache() {
  const endpoints = [
    '/api/daily-logs',
    '/api/weekly-reflections',
    '/api/insights',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}${endpoint}`, {
        headers: {
          'User-Agent': 'Cache-Warmer/1.0',
        },
      });
      
      logger.info(`Cache warmed for ${endpoint}`, {
        status: response.status,
        responseTime: response.headers.get('X-Response-Time'),
      });
    } catch (error) {
      logger.error(`Failed to warm cache for ${endpoint}`, error as Error);
    }
  }
}

warmCache().catch(console.error);
```

## Troubleshooting Guide

### Common Issues & Solutions

**1. High Memory Usage**
```bash
# Check memory usage in Vercel functions
# Monitor function execution logs
# Optimize database queries
# Implement proper connection pooling
```

**2. Slow API Responses**
```bash
# Check database query performance
# Review connection pool configuration
# Optimize slow queries identified in logs
# Consider implementing caching
```

**3. Authentication Issues**
```bash
# Verify environment variables
# Check NextAuth configuration
# Review session management
# Validate JWT tokens
```

**4. Database Connection Issues**
```bash
# Check database connectivity
# Verify connection string format
# Review connection pool settings
# Check Neon database status
```

## Monitoring Dashboard

### Key Metrics to Track

**Application Metrics:**
- Request rate (requests per minute)
- Error rate (percentage)
- Response time (average, 95th percentile)
- User sessions (active users)

**Infrastructure Metrics:**
- Function invocations
- Function duration
- Memory usage
- Database connections

**Business Metrics:**
- Daily active users
- Feature usage statistics
- Data growth rates
- User engagement metrics

### Dashboard Implementation

**Simple Metrics Endpoint:**
```typescript
// src/app/api/internal/metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const metrics = {
      users: {
        total: await prisma.user.count(),
        active_today: await prisma.user.count({
          where: {
            lastLoginAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        }),
      },
      daily_logs: {
        total: await prisma.dailyLog.count(),
        today: await prisma.dailyLog.count({
          where: {
            date: new Date().toISOString().split('T')[0],
          },
        }),
      },
      system: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
```

## Related Documents

- [Environment Configuration](01-environments.md)
- [Vercel Deployment](02-vercel-deployment.md)
- [Database Setup](03-database-setup.md)
- [API Reference](../03-api-reference/01-overview.md)

## Changelog

- **2025-07-06**: Initial monitoring and maintenance documentation
