---
title: Codebase Analysis
description: Comprehensive analysis of the Brain Log App codebase structure, technology stack, and architecture
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: draft
---

# Codebase Analysis

## Overview
This document provides a comprehensive analysis of the Brain Log App codebase, examining the project structure, technology stack, dependencies, and architectural patterns.

## Project Structure

### Root Level Files
- `package.json` - Node.js package configuration and dependencies
- `tsconfig.json` - TypeScript compiler configuration
- `next.config.mjs` - Next.js framework configuration
- `auth.config.ts` - Authentication configuration (Edge Runtime compatible)
- `auth.ts` - Full authentication configuration (Node.js runtime)
- `components.json` - shadcn/ui component library configuration
- `eslint.config.mjs` - ESLint linting configuration
- `postcss.config.mjs` - PostCSS configuration
- `tailwind.config.ts` - Tailwind CSS configuration

### Source Code Structure (`src/`)

#### Application Router (`src/app/`)
Next.js 15 App Router implementation with the following structure:

**Pages:**
- `/` - Home page (`page.tsx`)
- `/login` - User login page
- `/register` - User registration page
- `/profile` - User profile management
- `/daily-log` - Daily log entry and viewing
- `/daily-log/[id]` - Individual daily log view
- `/insights` - AI-generated insights page
- `/weekly-insights` - Weekly insights dashboard
- `/weekly-reflection` - Weekly reflection entry
- `/weekly-reflection/[id]` - Individual weekly reflection view
- `/weekly-reflection/new` - New weekly reflection form
- `/admin` - Administrative interface

**API Routes (`src/app/api/`):**
- `/api/auth/[...nextauth]` - NextAuth.js authentication endpoints
- `/api/auth/session-check` - Session validation endpoint
- `/api/daily-logs` - Daily log CRUD operations
- `/api/weekly-reflections` - Weekly reflection CRUD operations
- `/api/weekly-insights` - Weekly insights generation
- `/api/insights` - AI insights CRUD operations
- `/api/users` - User management operations
- `/api/users/[id]` - Individual user operations
- `/api/users/timezone` - User timezone management
- `/api/cleanup` - Data cleanup operations

#### Components (`src/components/`)

**Layout Components:**
- `Layout.tsx` - Main application layout wrapper
- `Header.tsx` - Application header with navigation
- `Footer.tsx` - Application footer

**Form Components:**
- `MorningCheckInForm.tsx` - Morning check-in data entry
- `MidDayCheckInForm.tsx` - Midday check-in form
- `AfternoonCheckInForm.tsx` - Afternoon check-in form
- `EveningReflectionForm.tsx` - End-of-day reflection form
- `ConcertaDoseLogForm.tsx` - Medication dose logging
- `WeeklyReflectionForm.tsx` - Weekly reflection entry

**Chart Components:**
- `FocusEnergyChart.tsx` - Focus and energy level visualization
- `MoodTrendChart.tsx` - Mood trend analysis
- `SleepQualityChart.tsx` - Sleep quality tracking
- `WeeklyInsightsChart.tsx` - Weekly insights visualization

**UI Components (`src/components/ui/`):**
shadcn/ui component library implementations:
- `button.tsx` - Button component with variants
- `card.tsx` - Card container component
- `input.tsx` - Form input component
- `select.tsx` - Dropdown selection component
- `checkbox.tsx` - Checkbox input component
- `radiogroup.tsx` - Radio button group component
- `slider.tsx` - Range slider component
- `dialog.tsx` - Modal dialog component
- `calendar.tsx` - Date picker calendar
- `datetime-picker.tsx` - Date and time selection
- `progress.tsx` - Progress indicator
- `chart.tsx` - Chart component wrapper
- `daily-insight-card.tsx` - Daily insight display card
- `weekly-insight-card.tsx` - Weekly insight display card
- `session-expired-alert.tsx` - Session expiration notification
- `modetoggle.tsx` - Light/dark mode toggle

**Utility Components:**
- `current-time.tsx` - Real-time clock display
- `timezone-selector.tsx` - Timezone selection component
- `DailyLogOverview.tsx` - Daily log summary view

**Provider Components:**
- `ClientProviders.tsx` - Client-side context providers wrapper

#### Library Code (`src/lib/`)

**Authentication (`src/lib/auth/`):**
- `auth-client.ts` - Client-side authentication utilities
- `AuthContext.tsx` - React context for authentication state

**Services (`src/lib/services/`):**
- `api.ts` - Base API service utilities
- `userService.ts` - User management service functions
- `dailyLogService.ts` - Daily log data operations
- `weeklyReflectionService.ts` - Weekly reflection operations
- `openaiService.ts` - OpenAI API integration for insights

**Utilities (`src/lib/utils/`):**
- `api-client.ts` - HTTP client for API requests
- `refresh.ts` - Session refresh utilities
- `timezone.ts` - Timezone handling utilities
- `ThemeProvider.tsx` - Theme management provider
- `index.ts` - Utility function exports

**Database & External Services:**
- `prisma.ts` - Prisma ORM client configuration
- `neon.ts` - Neon PostgreSQL serverless connection
- `crypto.ts` - Cryptographic utilities (Edge Runtime compatible)

**Hooks (`src/lib/hooks/`):**
- `useRefreshCleanup.ts` - Session refresh cleanup hook

#### Types (`src/types/`)
- `next-auth.d.ts` - NextAuth.js type extensions

#### Middleware (`src/middleware.ts`)
Next.js middleware for authentication and request handling

### Database Schema (`prisma/`)
- `schema.prisma` - Prisma database schema definition
- `migrations/` - Database migration history

### Documentation (`docs/`)
Existing documentation files covering deployment, architecture, and implementation plans

## Technology Stack

### Core Framework
- **Next.js 15.3.2** - React framework with App Router
- **React 19.0.0** - Frontend library
- **TypeScript 5** - Type-safe JavaScript

### Database & ORM
- **PostgreSQL** - Primary database (via Neon serverless)
- **Prisma 6.8.0** - Database ORM and query builder
- **@prisma/extension-accelerate** - Database connection acceleration
- **@neondatabase/serverless** - Serverless PostgreSQL driver

### Authentication
- **NextAuth.js v5.0.0-beta.28** - Authentication framework
- **@auth/prisma-adapter** - Prisma adapter for NextAuth
- **bcrypt/bcryptjs** - Password hashing (dual implementation for Edge/Node compatibility)

### UI Framework
- **Tailwind CSS 4.1.6** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI
- **Radix UI** - Accessible component primitives
- **class-variance-authority** - Component variant management
- **Lucide React** - Icon library

### Data Visualization
- **Recharts 2.15.3** - Chart and visualization library

### AI Integration
- **OpenAI 4.100.0** - AI insights generation

### Development Tools
- **ESLint 9** - Code linting
- **eslint-plugin-unused-imports** - Unused import detection
- **Prettier** (implicit via Next.js) - Code formatting

### Date/Time Handling
- **date-fns 3.6.0** - Date manipulation utilities
- **date-fns-tz 3.2.0** - Timezone-aware date operations
- **react-day-picker 9.7.0** - Date picker component

### Additional Libraries
- **next-themes 0.4.6** - Theme management
- **react-markdown 10.1.0** - Markdown rendering
- **sonner 2.0.3** - Toast notifications
- **clsx/tailwind-merge** - Conditional className utilities

## Architecture Patterns

### Application Architecture
- **Server-Side Rendering (SSR)** - Next.js App Router with React Server Components
- **API Routes** - RESTful API endpoints using Next.js API routes
- **Hybrid Database Access** - Prisma for Node.js runtime, Neon serverless for Edge Runtime
- **Authentication Flow** - NextAuth.js with split configuration for Edge/Node compatibility

### Component Architecture
- **Component Composition** - Reusable UI components with shadcn/ui
- **Form Management** - Controlled components with TypeScript validation
- **State Management** - React Context for global state, component state for local needs
- **Client/Server Separation** - Clear separation between client and server components

### Database Architecture
- **ORM Pattern** - Prisma for type-safe database access
- **Service Layer** - Dedicated service functions for business logic
- **Connection Pooling** - Configured for production scalability

### Security Architecture
- **Authentication** - Session-based with JWT tokens
- **Password Security** - bcrypt hashing with Web Crypto API fallback
- **API Protection** - All API routes require authentication
- **CSRF Protection** - Built-in NextAuth.js CSRF protection

## Configuration Analysis

### TypeScript Configuration
- **Target**: ES2017 for broad compatibility
- **Module Resolution**: Bundler for Next.js optimization
- **Path Mapping**: `@/*` for src directory, `@auth` for auth.ts
- **Strict Mode**: Enabled for type safety

### Next.js Configuration
- **React Strict Mode**: Enabled
- **Turbopack**: Enabled for development
- **Server Actions**: Configured with allowed origins
- **External Packages**: Prisma marked as server-external
- **Headers**: Cache control and security headers configured
- **ESLint**: Warnings allowed, errors fail build

### shadcn/ui Configuration
- **Style**: "new-york" design system
- **RSC**: React Server Components enabled
- **Base Color**: Neutral theme
- **CSS Variables**: Enabled for theming
- **Icon Library**: Lucide React

## Key Features Identified

### User Management
- User registration and authentication
- Profile management with timezone support
- Session management with refresh capabilities

### Daily Logging System
- Multi-stage daily check-ins (morning, midday, afternoon, evening)
- Medication tracking and effectiveness monitoring
- Mood, focus, and energy level tracking
- Sleep quality assessment

### Weekly Reflection System
- Weekly summary and reflection entry
- Long-term pattern analysis
- Goal setting and progress tracking

### AI Insights
- OpenAI integration for personalized insights
- Daily and weekly insight generation
- Pattern recognition and recommendations

### Data Visualization
- Interactive charts for trend analysis
- Mood, sleep, and medication effectiveness tracking
- Weekly and monthly overview dashboards

### Responsive Design
- Mobile-first responsive design
- Dark/light theme support
- Accessible UI components

## Development Workflow

### Build Process
- **Development**: `npm run dev` with Turbopack
- **Production Build**: `npm run build` with optimization
- **Linting**: `npm run lint` with ESLint

### Database Workflow
- **Schema Management**: Prisma schema as source of truth
- **Migrations**: Automatic migration generation
- **Client Generation**: Post-install Prisma client generation

### Deployment Configuration
- **Edge Runtime Compatibility**: Separate auth configurations
- **Vercel Optimization**: Configured for Vercel deployment
- **Environment Variables**: Development and production configurations

## Technical Debt & Considerations

### Current Issues
- modifying forms is challenging - significant effort ie chanages to multiple source files, database schema updates, etc.  Need to adjust code to make form modifications easier to implement
- simple security implementation - any user can sign up.  Needs to implement an admin panel with more robust user access controls
- UI is a mix of custom CSS components and shadcn/ui components. Needs a more unified standard for front-end design for maintainability & flexibility
- backend has same issue as front-end - mix of custom code & mix of nextjs standard features.  needs unified design for maintainability & flexibility

### Edge Runtime Adaptations
- Dual authentication configuration (auth.config.ts vs auth.ts)
- Web Crypto API implementation for password hashing
- Client/server separation for database access

### Performance Optimizations
- Connection pooling configured
- Cache control headers implemented
- Server-side rendering with client hydration

## Related Documents
- `PRODUCTION-DEPLOYMENT-PLAN.md` - Deployment procedures
- `VERCEL-DEPLOYMENT-FIXES.md` - Vercel-specific fixes
- `VERCEL-EDGE-RUNTIME-FIXES.md` - Edge Runtime compatibility
- `CODE-REFACTOR-IMPLEMENTATION-PLAN.md` - Code quality improvements
- `AI-INSIGHTS-IMPLEMENTATION-PLAN.md` - AI feature implementation
- `ARCHITECTURE.md` - System architecture overview
- `DATABASE.md` - Database schema documentation
- `API.md` - API endpoint documentation
- `UI.md` - UI component documentation

## Changelog
- 2025-07-06: Initial codebase analysis completed
