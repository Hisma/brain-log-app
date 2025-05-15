# Brain Log App - Architecture Documentation

This document provides a comprehensive overview of the Brain Log App architecture, explaining how the different components work together.

## Architecture Overview

The Brain Log App follows a modern web application architecture with the following key components:

1. **Frontend**: Next.js React application with TypeScript and Tailwind CSS
2. **Backend**: Next.js API routes for server-side logic
3. **Database**: PostgreSQL for data persistence
4. **Authentication**: NextAuth.js for user authentication
5. **ORM**: Prisma for database access

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Server                          │
│                                                                 │
│  ┌─────────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │   React Pages   │    │  API Routes  │    │  Authentication │  │
│  │   & Components  │◄──►│  (Next.js)   │◄──►│  (NextAuth.js)  │  │
│  └─────────────────┘    └──────┬───────┘    └────────┬───────┘  │
│                                │                      │          │
│                                ▼                      │          │
│                         ┌─────────────┐              │          │
│                         │ Prisma ORM  │◄─────────────┘          │
│                         └──────┬──────┘                         │
└──────────────────────────────┬─┴─────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                        │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend

The frontend is built with Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui. It follows a component-based architecture with the following structure:

#### Pages

Pages are defined in the `src/app` directory following Next.js App Router conventions:

- `src/app/page.tsx`: Home page
- `src/app/login/page.tsx`: Login page
- `src/app/register/page.tsx`: Registration page
- `src/app/profile/page.tsx`: User profile page
- `src/app/daily-log/page.tsx`: Daily log page
- `src/app/weekly-reflection/page.tsx`: Weekly reflection page
- `src/app/analytics/page.tsx`: Analytics page

#### Components

Reusable components are organized in the `src/components` directory:

- `src/components/common`: Common components used throughout the application
- `src/components/forms`: Form components for data entry
- `src/components/layout`: Layout components like headers, footers, and navigation
- `src/components/ui`: UI components like buttons, inputs, and modals, built with shadcn/ui

#### shadcn/ui Integration

The application uses [shadcn/ui](https://ui.shadcn.com/) for its UI component system. shadcn/ui is not a traditional component library but rather a collection of reusable components built on top of Tailwind CSS and Radix UI primitives.

**Key aspects of the shadcn/ui implementation:**

1. **Component Configuration**: Configured in `components.json`:
   - Style: "new-york"
   - React Server Components (RSC): enabled
   - Base color: neutral
   - Icon library: Lucide

2. **Component Architecture**:
   - Components are built using Radix UI primitives for accessibility
   - Styling is handled with Tailwind CSS and class-variance-authority (cva)
   - Components are fully customizable and can be modified directly in the codebase

3. **Theming System**:
   - Uses CSS variables for theming
   - Supports light and dark modes
   - Theme configuration is defined in `tailwind.config.ts` and `src/styles/globals.css`

4. **Component Usage Pattern**:
   ```tsx
   import { Button } from "@/components/ui/Button";
   
   function MyComponent() {
     return (
       <Button variant="outline" size="sm">
         Click me
       </Button>
     );
   }
   ```

#### Context Providers

Context providers are used for state management:

- `src/lib/auth/AuthContext.tsx`: Authentication context provider
- `src/lib/theme/ThemeContext.tsx`: Theme context provider

### Backend

The backend is implemented using Next.js API routes, which provide serverless functions for handling API requests.

#### API Routes

API routes are defined in the `src/app/api` directory:

- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth.js authentication routes
- `src/app/api/users/route.ts`: User management routes
- `src/app/api/daily-logs/route.ts`: Daily log routes
- `src/app/api/weekly-reflections/route.ts`: Weekly reflection routes

#### Service Layer

The service layer provides functions for interacting with the database:

- `src/lib/services/userService.ts`: User-related operations
- `src/lib/services/dailyLogService.ts`: Daily log operations
- `src/lib/services/weeklyReflectionService.ts`: Weekly reflection operations
- `src/lib/services/api.ts`: API utility functions

### Database

The database is PostgreSQL, accessed through Prisma ORM.

#### Schema

The database schema is defined in `prisma/schema.prisma` and includes the following models:

- `User`: User authentication and profile information
- `DailyLog`: Daily check-ins and reflections
- `WeeklyReflection`: Weekly reflections and insights

#### Prisma Client

The Prisma client is initialized in `src/lib/prisma.ts` and provides type-safe access to the database.

### Authentication

Authentication is implemented using NextAuth.js.

#### Authentication Flow

1. User submits credentials on the login page
2. NextAuth.js verifies credentials against the database
3. If valid, NextAuth.js creates a session and sets cookies
4. The session is used to authenticate subsequent API requests

#### Authentication Configuration

NextAuth.js is configured in `src/lib/auth/auth-options.ts` with the following options:

- Credentials provider for username/password authentication
- JWT session strategy
- Custom callbacks for handling user data
- Custom pages for login, logout, and error handling

## Data Flow

### User Authentication

```
┌──────────┐    ┌───────────┐    ┌──────────────┐    ┌────────────┐
│  Login   │    │ NextAuth  │    │ Prisma ORM   │    │ PostgreSQL │
│  Form    │───►│ API Route │───►│ (User Model) │───►│ Database   │
└──────────┘    └───────────┘    └──────────────┘    └────────────┘
                      │                                     │
                      │                                     │
                      ▼                                     │
                ┌───────────┐                              │
                │  Session  │◄─────────────────────────────┘
                │  Cookie   │
                └───────────┘
```

### Daily Log Creation

```
┌──────────┐    ┌───────────┐    ┌──────────────┐    ┌────────────┐
│  Daily   │    │ Daily Log │    │ Prisma ORM   │    │ PostgreSQL │
│  Log Form│───►│ API Route │───►│ (DailyLog)   │───►│ Database   │
└──────────┘    └───────────┘    └──────────────┘    └────────────┘
                      │                                     │
                      │                                     │
                      ▼                                     │
                ┌───────────┐                              │
                │  Response │◄─────────────────────────────┘
                │  JSON     │
                └───────────┘
```

### Data Retrieval

```
┌──────────┐    ┌───────────┐    ┌──────────────┐    ┌────────────┐
│  React   │    │ API Route │    │ Prisma ORM   │    │ PostgreSQL │
│  Component│◄──►│ (GET)     │◄──►│ (Query)      │◄──►│ Database   │
└──────────┘    └───────────┘    └──────────────┘    └────────────┘
```

## Security Architecture

The application implements several security measures:

### Authentication Security

- Passwords are hashed using bcrypt before storage
- JWT tokens are used for session management
- CSRF protection is provided by NextAuth.js
- Session cookies are HTTP-only and secure

### API Security

- All API routes require authentication
- Input validation is performed before database operations
- Error messages don't expose sensitive information
- Database queries use parameterized queries to prevent SQL injection

### Frontend Security

- React components sanitize user input
- Authentication state is managed securely
- Sensitive data is not stored in local storage

## Performance Considerations

The application includes several performance optimizations:

### Database Performance

- Indexes are defined on frequently queried fields
- Prisma Accelerate extension is used for improved performance
- Database connections are pooled for efficient resource usage

### Frontend Performance

- Next.js provides server-side rendering and static generation
- React components are optimized for minimal re-renders
- Tailwind CSS provides efficient styling with minimal CSS
- shadcn/ui components are tree-shakable and optimized for performance

### API Performance

- API responses are optimized for minimal payload size
- Caching is implemented where appropriate
- Database queries are optimized for performance

## Deployment Architecture

The application can be deployed in various environments:

### Development Environment

- Local Next.js development server
- Local PostgreSQL database
- Environment variables for configuration

### Production Environment

- Next.js application deployed on a hosting platform (e.g., Vercel)
- PostgreSQL database hosted on a database service (e.g., AWS RDS, Supabase)
- Environment variables for configuration
- HTTPS for secure communication

## Future Architecture Considerations

As the application evolves, the following architectural enhancements are planned:

### Scalability

- Implement database sharding for horizontal scaling
- Add caching layer (e.g., Redis) for frequently accessed data
- Optimize database queries for large datasets

### Reliability

- Implement database backups and disaster recovery
- Add health checks and monitoring
- Implement retry mechanisms for failed operations

### Security

- Add rate limiting to prevent abuse
- Implement two-factor authentication
- Add audit logging for security events

### Performance

- Implement server-side caching
- Optimize frontend bundle size
- Add performance monitoring and analytics
