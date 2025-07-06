---
title: Project Structure Guide
description: Comprehensive guide to the Brain Log App codebase organization and file structure
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Project Structure Guide

## Overview

Brain Log App follows modern Next.js 15 conventions with the App Router architecture, TypeScript throughout, and a clean separation of concerns. This guide explains the codebase organization, file naming conventions, and where to find specific functionality.

## Root Directory Structure

```
brain-log-app/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets (images, icons)
├── src/                    # Application source code
├── docs/                   # Documentation system
├── scripts/                # Build and utility scripts
├── .env                    # Environment variables
├── .env.example           # Environment template
├── auth.config.ts         # Authentication configuration
├── auth.ts                # NextAuth.js setup
├── components.json        # shadcn/ui configuration
├── next.config.mjs        # Next.js configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project overview
```

## Source Code Organization (`src/`)

### Application Router (`src/app/`)

Brain Log App uses **Next.js 15 App Router** for file-based routing and server components.

```
src/app/
├── layout.tsx             # Root layout component
├── page.tsx               # Home page (dashboard)
├── globals.css            # Global styles
├── favicon.ico            # Application icon
│
├── (auth)/                # Authentication pages
│   ├── login/
│   │   └── page.tsx       # Login page
│   └── register/
│       └── page.tsx       # Registration page
│
├── daily-log/             # Daily logging system
│   ├── page.tsx           # Daily log dashboard
│   └── [id]/              # Individual log entries
│
├── weekly-reflection/     # Weekly reflection system
│   ├── page.tsx           # Weekly reflection dashboard
│   ├── new/               # Create new reflection
│   └── [id]/              # Individual reflections
│
├── insights/              # AI-powered insights
│   └── page.tsx           # Insights dashboard
│
├── weekly-insights/       # Weekly insights view
│   └── page.tsx           # Weekly insights page
│
├── profile/               # User profile management
│   └── page.tsx           # Profile settings
│
├── admin/                 # Administrative interface
│   └── page.tsx           # Admin dashboard
│
└── api/                   # API route handlers
    ├── auth/              # Authentication endpoints
    ├── users/             # User management
    ├── daily-logs/        # Daily log CRUD operations
    ├── weekly-reflections/ # Weekly reflection operations
    ├── weekly-insights/   # Weekly insights generation
    ├── insights/          # AI insights processing
    └── cleanup/           # Data cleanup utilities
```

#### Key App Router Concepts

**Route Groups**: `(auth)/` - Groups routes without affecting URL structure
**Dynamic Routes**: `[id]/` - Creates parameterized routes for individual resources
**API Routes**: `api/*/route.ts` - Server-side API endpoints
**Layout Hierarchy**: Nested layouts provide shared UI components

### Components (`src/components/`)

Components are organized by type and functionality for maintainability.

```
src/components/
├── forms/                 # Form components for data entry
│   ├── MorningCheckInForm.tsx      # Morning health check-in
│   ├── ConcertaDoseLogForm.tsx     # Medication logging
│   ├── MidDayCheckInForm.tsx       # Midday focus tracking
│   ├── AfternoonCheckInForm.tsx    # Afternoon checkpoint
│   ├── EveningReflectionForm.tsx   # End-of-day reflection
│   └── WeeklyReflectionForm.tsx    # Weekly pattern analysis
│
├── charts/                # Data visualization components
│   ├── FocusEnergyChart.tsx        # Focus and energy trends
│   ├── MoodTrendChart.tsx          # Mood pattern visualization
│   ├── SleepQualityChart.tsx       # Sleep quality tracking
│   └── WeeklyInsightsChart.tsx     # Weekly insight summaries
│
├── layout/                # Layout and navigation components
│   ├── Layout.tsx                  # Main application layout
│   ├── Header.tsx                  # Navigation header
│   └── Footer.tsx                  # Application footer
│
├── providers/             # Context providers and wrappers
│   └── ClientProviders.tsx        # Client-side provider setup
│
├── ui/                    # Reusable UI components (shadcn/ui)
│   ├── button.tsx                  # Button component variants
│   ├── card.tsx                    # Card layout component
│   ├── input.tsx                   # Form input components
│   ├── select.tsx                  # Dropdown selection
│   ├── calendar.tsx                # Date picker component
│   ├── chart.tsx                   # Chart wrapper component
│   ├── daily-insight-card.tsx      # Daily insight display
│   ├── weekly-insight-card.tsx     # Weekly insight display
│   ├── modetoggle.tsx              # Dark/light mode toggle
│   └── [...]                       # Additional UI components
│
├── current-time.tsx       # Real-time clock component
├── DailyLogOverview.tsx   # Daily log summary display
└── timezone-selector.tsx  # User timezone selection
```

#### Component Organization Principles

**Forms**: Organized by the 4-stage daily logging system
**Charts**: Dedicated visualization components using Recharts
**UI**: Reusable design system components from shadcn/ui
**Layout**: Structural components that wrap page content

### Library Code (`src/lib/`)

The `lib/` directory contains utilities, services, and shared functionality.

```
src/lib/
├── auth/                  # Authentication utilities
│   ├── auth-client.ts             # Client-side auth helpers
│   └── AuthContext.tsx            # React auth context
│
├── services/              # API service layer
│   ├── api.ts                     # Base API client configuration
│   ├── userService.ts             # User-related API calls
│   ├── dailyLogService.ts         # Daily log operations
│   ├── weeklyReflectionService.ts # Weekly reflection API
│   └── openaiService.ts           # AI insights integration
│
├── hooks/                 # Custom React hooks
│   └── useRefreshCleanup.ts       # Session refresh management
│
├── utils/                 # Utility functions
│   ├── index.ts                   # Re-exported utilities
│   ├── api-client.ts              # HTTP client wrapper
│   ├── refresh.ts                 # Session refresh logic
│   ├── timezone.ts                # Timezone handling
│   └── ThemeProvider.tsx          # Theme management
│
├── crypto.ts              # Cryptographic utilities
├── neon.ts                # Neon database connection
├── prisma.ts              # Prisma client configuration
└── utils.ts               # General utility functions
```

#### Service Layer Architecture

**API Services**: Encapsulate all external API communications
**Authentication**: Centralized auth logic for client and server
**Database**: Abstracted database access patterns
**Utilities**: Shared helper functions and constants

### Types (`src/types/`)

TypeScript type definitions for application-wide type safety.

```
src/types/
└── next-auth.d.ts         # NextAuth.js type extensions
```

### Styles (`src/styles/`)

Global styling and CSS configurations.

```
src/styles/
└── globals.css            # Global CSS styles and Tailwind imports
```

## Database Structure (`prisma/`)

Database schema definitions and migration history.

```
prisma/
├── schema.prisma          # Database schema definition
└── migrations/            # Database migration history
    ├── migration_lock.toml        # Migration metadata
    └── [timestamp]_[description]/ # Individual migrations
```

## Configuration Files

### Core Configuration

**`next.config.mjs`** - Next.js configuration including:
- Runtime settings (Edge vs Node.js)
- Build optimizations
- Environment variable handling

**`tailwind.config.ts`** - Tailwind CSS configuration:
- Custom color schemes
- Component styling extensions
- Design system tokens

**`tsconfig.json`** - TypeScript configuration:
- Path mapping for imports
- Compiler options
- Module resolution

### Authentication Configuration

**`auth.config.ts`** - NextAuth.js configuration:
- Authentication providers
- Session configuration
- Edge Runtime compatibility

**`auth.ts`** - NextAuth.js setup:
- Provider implementations
- Callback configurations
- Database adapter setup

## File Naming Conventions

### Components
- **PascalCase** for component files: `MorningCheckInForm.tsx`
- **camelCase** for utility files: `api-client.ts`
- **kebab-case** for CSS files: `globals.css`

### API Routes
- **lowercase** with descriptive paths: `/api/daily-logs/route.ts`
- **Dynamic segments** in brackets: `/api/users/[id]/route.ts`

### Documentation
- **kebab-case** for markdown files: `project-structure.md`
- **Numerical prefixes** for ordering: `01-introduction.md`

## Key File Locations

### Finding Specific Functionality

#### Authentication System
- **Configuration**: `auth.config.ts`, `auth.ts`
- **Middleware**: `src/middleware.ts`
- **Client utilities**: `src/lib/auth/`
- **API endpoints**: `src/app/api/auth/`

#### Daily Logging System
- **Forms**: `src/components/forms/`
- **API endpoints**: `src/app/api/daily-logs/`
- **Service layer**: `src/lib/services/dailyLogService.ts`
- **UI pages**: `src/app/daily-log/`

#### Data Visualization
- **Chart components**: `src/components/charts/`
- **Chart utilities**: `src/components/ui/chart.tsx`
- **Data processing**: `src/lib/services/`

#### AI Insights
- **OpenAI integration**: `src/lib/services/openaiService.ts`
- **Insight components**: `src/components/ui/*insight-card.tsx`
- **API endpoints**: `src/app/api/insights/`

#### Database Operations
- **Schema**: `prisma/schema.prisma`
- **Client setup**: `src/lib/prisma.ts`
- **Migrations**: `prisma/migrations/`

## Import Path Mapping

TypeScript path mapping enables clean imports throughout the application:

```typescript
// Instead of: import { Button } from '../../../components/ui/button'
import { Button } from '@/components/ui/button'

// Common import paths:
import '@/components/*'     // React components
import '@/lib/*'           // Utilities and services
import '@/app/*'           // App Router pages and API
import '@/types/*'         // Type definitions
```

## Environment-Specific Files

### Development
- **`.env`** - Local environment variables
- **`.env.example`** - Environment template

### Production
- **Vercel deployment** - Environment variables configured in dashboard
- **Database** - Production Neon database connection

## Development Patterns

### Component Development
1. **Create component** in appropriate `src/components/` subdirectory
2. **Export from index** if part of a component library
3. **Add TypeScript types** for props and state
4. **Include JSDoc comments** for complex components

### API Development
1. **Create route handler** in `src/app/api/[endpoint]/route.ts`
2. **Add service layer function** in `src/lib/services/`
3. **Update TypeScript types** if needed
4. **Test with API client** tools

### Database Changes
1. **Update schema** in `prisma/schema.prisma`
2. **Generate migration** with `npx prisma migrate dev`
3. **Update service layer** to use new schema
4. **Test with Prisma Studio**

## Finding Code Examples

### Form Implementation Pattern
Look at `src/components/forms/MorningCheckInForm.tsx` for:
- Form validation patterns
- State management
- API integration
- Error handling

### API Route Pattern
Check `src/app/api/daily-logs/route.ts` for:
- Request handling
- Authentication checks
- Database operations
- Response formatting

### Chart Implementation
See `src/components/charts/FocusEnergyChart.tsx` for:
- Data visualization patterns
- Recharts integration
- Responsive design
- Data processing

## Related Documents
- [Installation Guide](02-installation.md) - Setting up development environment
- [Development Workflow](04-development-workflow.md) - Development process and standards
- [Architecture Overview](../02-architecture/01-overview.md) - High-level system design
- [API Reference](../03-api-reference/) - Complete API documentation

## Changelog
- 2025-07-06: Initial project structure documentation
- 2025-07-06: Component organization and file conventions added
- 2025-07-06: Import patterns and development guidelines included
