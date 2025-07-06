---
title: System Architecture Overview
description: High-level system design and architectural patterns of the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# System Architecture Overview

## Overview
The Brain Log App implements a sophisticated hybrid architecture that combines Edge Runtime and Node.js Runtime to deliver a high-performance, globally scalable health tracking application. This document provides a comprehensive overview of the system design, architectural patterns, and key technical decisions.

## High-Level Architecture

### System Components
```
┌─────────────────────────────────────────────────────────────────┐
│                          Global CDN Edge                        │
├─────────────────────────────────────────────────────────────────┤
│  Edge Runtime (Middleware)                                      │
│  ├── Authentication Checks                                      │
│  ├── Request Routing                                           │
│  ├── JWT Verification                                          │
│  └── Global Low-Latency Operations                             │
├─────────────────────────────────────────────────────────────────┤
│                       Client Browser                            │
│  ├── Next.js App Router (React 19)                             │
│  ├── Server Components                                         │
│  ├── Client Components                                         │
│  ├── Authentication Context                                    │
│  └── Theme Management                                          │
├─────────────────────────────────────────────────────────────────┤
│                      Node.js Runtime                           │
│  ├── API Routes (/api/*)                                       │
│  ├── Authentication Handlers                                   │
│  ├── Business Logic Services                                   │
│  ├── Database Operations (Prisma)                              │
│  └── External Service Integration                              │
├─────────────────────────────────────────────────────────────────┤
│                       Data Layer                               │
│  ├── Neon PostgreSQL (Serverless)                              │
│  ├── Prisma ORM (Node.js Runtime)                              │
│  ├── Direct SQL (Edge Runtime)                                 │
│  └── Connection Pooling & Acceleration                         │
├─────────────────────────────────────────────────────────────────┤
│                   External Services                            │
│  ├── OpenAI API (GPT-4 Insights)                               │
│  ├── Vercel Platform                                           │
│  └── NextAuth.js v5                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow Architecture
```
User Request
     │
     ▼
Edge Middleware (Global CDN)
     │
     ├── Authenticated? ──NO──► Redirect to /login
     │
     ▼ YES
Next.js App Router
     │
     ├── Static Content ──► Served from CDN
     │
     ├── Server Component ──► Database Query (Prisma)
     │
     └── API Request ──► Node.js Runtime ──► Business Logic ──► Database
```

## Core Architectural Patterns

### 1. Hybrid Runtime Pattern
The application implements a sophisticated separation between Edge Runtime and Node.js Runtime:

**Edge Runtime (Global CDN)**:
- Authentication middleware
- Request routing and filtering
- JWT verification
- Lightweight database queries

**Node.js Runtime (Regional)**:
- Full API functionality
- Complex business logic
- Prisma ORM operations
- External service integrations

### 2. Database Access Strategy
Dual database access pattern optimizing for performance and functionality:

**Edge Runtime Database Access**:
```typescript
// Direct SQL via Neon serverless driver
const users = await sql`
  SELECT id, username FROM "User" 
  WHERE username = ${username}
`;
```

**Node.js Runtime Database Access**:
```typescript
// Prisma ORM with full type safety
const user = await prisma.user.findUnique({
  where: { username },
  include: { dailyLogs: true }
});
```

### 3. Authentication Architecture
Three-layer authentication system:

1. **Edge Middleware**: Global authentication checks and redirects
2. **API Authentication**: Full database user lookup and session creation
3. **Client Authentication**: Safe client-side session management

### 4. Component Architecture
Next.js App Router implementation with clear separation:

**Server Components**: Data fetching, authentication checks
**Client Components**: Interactivity, form handling, state management
**API Routes**: Backend operations, external service integration

## Technology Stack Integration

### Frontend Stack
- **Next.js 15**: App Router with Server Components
- **React 19**: Latest React features and performance optimizations
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first styling with custom design system
- **shadcn/ui**: Component library foundation

### Backend Stack
- **Node.js Runtime**: API routes and server-side logic
- **NextAuth.js v5**: Authentication and session management
- **Prisma ORM**: Type-safe database operations
- **OpenAI API**: AI-powered insights generation

### Infrastructure Stack
- **Vercel Platform**: Hosting with automatic Edge/Node.js routing
- **Neon PostgreSQL**: Serverless database with global access
- **Edge Runtime**: Global low-latency operations
- **CDN Distribution**: Static asset and Edge function distribution

## Data Flow Architecture

### Authentication Flow
```
1. User Login Request
   ├── Edge Middleware: Check existing session
   ├── API Route (/api/auth): Database user lookup
   ├── Password Verification: PBKDF2 with Web Crypto API
   ├── Session Creation: JWT with NextAuth.js
   └── Edge Middleware: Subsequent request filtering

2. Protected Route Access
   ├── Edge Middleware: JWT verification (10-50ms globally)
   ├── Server Component: Data fetching with Prisma
   └── Client Component: Interactive functionality
```

### Data Management Flow
```
User Input (Client)
     │
     ▼
Form Submission
     │
     ▼
API Route Validation
     │
     ▼
Service Layer Processing
     │
     ▼
Database Operations (Prisma)
     │
     ▼
Response to Client
     │
     ▼
UI Update & State Management
```

### AI Insights Flow
```
Weekly Reflection Data
     │
     ▼
AI Service (OpenAI Integration)
     │
     ▼
Prompt Engineering & Processing
     │
     ▼
Insight Generation & Storage
     │
     ▼
Client Display & Visualization
```

## Security Architecture

### Edge Runtime Security
- **JWT Verification**: Stateless authentication at global edge
- **Request Filtering**: Malicious requests blocked before reaching origin
- **CSRF Protection**: Built into NextAuth.js configuration
- **Environment Isolation**: Limited API surface reduces attack vectors

### Node.js Runtime Security
- **Database Security**: Parameterized queries prevent SQL injection
- **Password Security**: PBKDF2 with 100,000 iterations
- **Session Management**: Secure cookie configuration
- **API Protection**: All routes require authentication
- **Input Validation**: Comprehensive validation on all inputs

### Data Security
- **User Data Isolation**: Strict user scoping on all database operations
- **Environment Variables**: Secure configuration management
- **Database Encryption**: Neon PostgreSQL encryption at rest and in transit
- **API Key Management**: Secure external service authentication

## Performance Architecture

### Global Performance Optimization
- **Edge Runtime**: 10-50ms authentication checks globally
- **CDN Distribution**: Static assets served from global CDN
- **Connection Pooling**: Efficient database connections for Node.js operations
- **Server Components**: Reduced client-side JavaScript bundle

### Database Performance
- **Prisma Accelerate**: Connection pooling and query caching
- **Neon Serverless**: Zero-latency connection establishment
- **Query Optimization**: Efficient database queries and indexing
- **Data Access Patterns**: Optimized for read and write operations

### Client Performance
- **Next.js App Router**: Automatic code splitting and optimization
- **Server-Side Rendering**: Fast initial page loads
- **Client-Side Navigation**: Smooth transitions between pages
- **Component Optimization**: Efficient React component patterns

## Scalability Architecture

### Horizontal Scaling
- **Edge Functions**: Automatically scale with global traffic
- **Serverless Database**: Scales to zero and up automatically
- **Stateless Design**: No server-side state dependencies
- **CDN Distribution**: Global content delivery scaling

### Vertical Scaling
- **Database Resources**: Neon PostgreSQL automatic scaling
- **Function Resources**: Vercel automatic resource allocation
- **Connection Management**: Prisma connection pooling optimization
- **Cache Strategy**: Efficient caching at multiple layers

## Development Architecture

### Code Organization
```
/src
├── /app              # Next.js App Router
│   ├── /api          # Node.js Runtime API routes
│   ├── /[pages]      # Server/Client components
│   └── layout.tsx    # Application layout
├── /components       # Reusable UI components
├── /lib              # Shared utilities and services
│   ├── /auth         # Authentication utilities
│   ├── /services     # Business logic services
│   └── /utils        # Common utilities
└── /middleware.ts    # Edge Runtime middleware
```

### Runtime Separation
- **Edge Compatible**: `auth.config.ts`, `crypto.ts`, `neon.ts`
- **Node.js Only**: `auth.ts`, `prisma.ts`, API routes
- **Client Safe**: `auth-client.ts`, React components
- **Universal**: Utility functions, type definitions

## Integration Patterns

### External Service Integration
- **OpenAI API**: Secure API key management and rate limiting
- **NextAuth.js**: Provider configuration and session management
- **Vercel Platform**: Automatic deployment and scaling
- **Neon Database**: Connection management and query optimization

### Internal Service Communication
- **Type-Safe APIs**: TypeScript interfaces for all internal communication
- **Error Handling**: Consistent error patterns across all layers
- **Validation**: Input validation at API boundaries
- **Logging**: Structured logging for debugging and monitoring

## Deployment Architecture

### Vercel Platform Integration
- **Automatic Runtime Detection**: Next.js automatically routes to appropriate runtime
- **Edge Network**: Global distribution of Edge functions
- **Regional Functions**: Node.js functions deployed to optimal regions
- **Environment Management**: Secure configuration across environments

### Build and Deployment Process
```
Git Push
     │
     ▼
Vercel Build Process
     │
     ├── Edge Bundle: Middleware and Edge-compatible code
     ├── Node.js Bundle: API routes and server components
     ├── Client Bundle: React components and client code
     └── Static Assets: Images, fonts, and static content
     │
     ▼
Global Deployment
     │
     ├── Edge Functions: Deployed to global CDN
     ├── Node.js Functions: Deployed to regional infrastructure
     └── Static Assets: Distributed via global CDN
```

## Monitoring and Observability

### Performance Monitoring
- **Edge Runtime Metrics**: Response times and error rates at edge
- **Node.js Runtime Metrics**: API performance and resource usage
- **Database Monitoring**: Query performance and connection health
- **Client Performance**: Core Web Vitals and user experience metrics

### Error Tracking
- **Runtime Error Separation**: Distinct error tracking for each runtime
- **Cross-Runtime Correlation**: Tracking errors across system boundaries
- **User Impact Assessment**: Understanding error impact on user experience
- **Automated Alerting**: Real-time notification of critical issues

## Future Architecture Considerations

### Scalability Planning
- **Traffic Growth**: Edge Runtime scales automatically with global traffic
- **Feature Expansion**: Modular architecture supports new feature addition
- **Database Scaling**: Plan for read replicas and regional distribution
- **Cache Strategy**: Implement advanced caching for frequently accessed data

### Technology Evolution
- **Next.js Updates**: Regular framework updates and new feature adoption
- **Edge Runtime Evolution**: Take advantage of new Edge Runtime capabilities
- **Database Evolution**: Consider advanced PostgreSQL features and optimizations
- **AI Integration**: Enhanced AI capabilities and local processing options

## Related Documents
- [Frontend Architecture](./02-frontend.md) - Detailed frontend implementation
- [Backend Architecture](./03-backend.md) - API and service layer details
- [Database Architecture](./04-database.md) - Database design and patterns
- [Authentication Architecture](./05-authentication.md) - Security implementation

## Changelog
- 2025-07-06: Initial system architecture overview created
- 2025-07-06: Hybrid runtime patterns documented
- 2025-07-06: Performance and security architecture detailed
