---
title: API Inventory
description: Comprehensive inventory of all API endpoints in the Brain Log App
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: draft
---

# API Inventory

## Overview
This document provides a comprehensive inventory of all API endpoints in the Brain Log App, documenting their purposes, authentication requirements, request/response patterns, and runtime environments.

## API Architecture Pattern

### Runtime Environment
- **All API Routes**: Node.js Runtime (default)
- **Authentication**: Required for all endpoints except authentication endpoints
- **Database Access**: Prisma ORM with connection pooling
- **Session Management**: NextAuth.js JWT-based sessions

### Common Patterns
```typescript
// Standard authentication pattern
const session = await auth();
if (!session || !session.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
const userId = session.user.id;
```

## Authentication Endpoints

### `/api/auth/[...nextauth]`
**Runtime**: Node.js Runtime
**Purpose**: NextAuth.js authentication handlers
**Methods**: GET, POST
**Authentication**: None (public endpoint)
**Functionality**:
- Sign in/sign out processing
- Session management
- Credential validation
- User authentication flow

### `/api/auth/session-check`
**Runtime**: Node.js Runtime  
**Purpose**: Session validation and user verification
**Methods**: GET
**Authentication**: Required
**Response**: User session information and validation status

## User Management Endpoints

### `/api/users`
**Runtime**: Node.js Runtime
**Purpose**: User registration and management
**Methods**: POST, GET
**Authentication**: Mixed (POST public for registration, GET requires auth)

**POST - User Registration**:
- Creates new user accounts
- Password hashing with Web Crypto API
- Input validation and duplicate checking
- Returns user object on success

**GET - User Information**:
- Retrieves current user profile data
- Returns user settings and preferences

### `/api/users/[id]`
**Runtime**: Node.js Runtime
**Purpose**: Individual user operations
**Methods**: GET, PUT, DELETE
**Authentication**: Required (user ownership validation)

**Functionality**:
- User profile updates
- Account deletion
- User-specific data retrieval

### `/api/users/timezone`
**Runtime**: Node.js Runtime
**Purpose**: User timezone management
**Methods**: PUT
**Authentication**: Required
**Functionality**:
- Updates user timezone preferences
- Validates timezone data
- Synchronizes with user session

## Daily Logging Endpoints

### `/api/daily-logs`
**Runtime**: Node.js Runtime
**Purpose**: Daily log CRUD operations
**Methods**: GET, POST, PUT, DELETE
**Authentication**: Required

**Data Structure** (Comprehensive daily tracking):
- **Morning Check-in** (7-9am): Sleep hours, quality, dreams, mood, physical status, breakfast
- **Medication Log** (9-10am): Medication taken, dose, timing, food intake, first hour feelings
- **Mid-day Check-in** (11am-1pm): Lunch, focus/energy levels, rumination, activities, distractions, emotional events
- **Afternoon Check-in** (3-5pm): Snacks, crash symptoms, anxiety, interactions, self-worth assessments
- **Evening Reflection** (8-10pm): Dinner, overall mood, sleepiness, medication effectiveness, helpful/distracting factors

**Query Parameters**:
- `date`: Specific date filtering
- `startDate`/`endDate`: Date range filtering

**Features**:
- Duplicate prevention (one log per date per user)
- Comprehensive field validation
- Partial updates supported
- User ownership verification

## Weekly Reflection Endpoints

### `/api/weekly-reflections`
**Runtime**: Node.js Runtime
**Purpose**: Weekly reflection CRUD operations
**Methods**: GET, POST, PUT, DELETE
**Authentication**: Required

**Functionality**:
- Weekly summary and reflection entry
- Long-term pattern analysis
- Goal setting and progress tracking
- Weekly insights compilation

## AI Insights Endpoints

### `/api/insights`
**Runtime**: Node.js Runtime
**Purpose**: AI-generated insights CRUD operations
**Methods**: GET, POST, PUT, DELETE
**Authentication**: Required

**Functionality**:
- Store and retrieve AI-generated insights
- Daily and weekly insight management
- User-specific insight filtering

### `/api/weekly-insights`
**Runtime**: Node.js Runtime
**Purpose**: Weekly AI insights generation
**Methods**: GET, POST
**Authentication**: Required

**Features**:
- OpenAI integration for insight generation
- Weekly data pattern analysis
- Personalized recommendations
- Trend identification

## Data Management Endpoints

### `/api/cleanup`
**Runtime**: Node.js Runtime
**Purpose**: Data cleanup and maintenance operations
**Methods**: POST
**Authentication**: Required

**Functionality**:
- Session cleanup
- Data integrity maintenance
- Orphaned record removal
- Database optimization tasks

## API Response Patterns

### Standard Success Response
```typescript
// Single resource
return NextResponse.json(resource, { status: 200 });

// Collection
return NextResponse.json({ resources }, { status: 200 });

// Creation
return NextResponse.json(newResource, { status: 201 });
```

### Standard Error Responses
```typescript
// Unauthorized
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Bad Request
return NextResponse.json({ error: 'Validation message' }, { status: 400 });

// Not Found
return NextResponse.json({ error: 'Resource not found' }, { status: 404 });

// Server Error
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
```

## Authentication & Authorization

### Session-Based Authentication
- All protected endpoints require valid NextAuth.js session
- User ID extracted from session for data scoping
- Automatic session validation and renewal

### User Data Isolation
- All user data operations scoped to authenticated user ID
- No cross-user data access permitted
- Ownership validation for resource modifications

### Security Measures
- Input validation on all endpoints
- SQL injection prevention via Prisma ORM
- Error message sanitization
- Rate limiting considerations (planned)

## Data Validation Patterns

### Required Field Validation
```typescript
if (!data.requiredField) {
  return NextResponse.json(
    { error: 'Required field is missing' },
    { status: 400 }
  );
}
```

### Date Validation
```typescript
// Ensure valid date format
const date = new Date(data.date);
if (isNaN(date.getTime())) {
  return NextResponse.json(
    { error: 'Invalid date format' },
    { status: 400 }
  );
}
```

### User Ownership Validation
```typescript
if (resource.userId !== session.user.id) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

## Database Integration

### Prisma ORM Usage
- Type-safe database queries
- Automatic connection pooling
- Transaction support for complex operations
- Relationship management

### Query Patterns
```typescript
// Single record with user scoping
const record = await prisma.model.findUnique({
  where: { id, userId }
});

// Multiple records with filtering
const records = await prisma.model.findMany({
  where: {
    userId,
    date: { gte: startDate, lte: endDate }
  },
  orderBy: { date: 'desc' }
});
```

## External Service Integration

### OpenAI Integration
- AI insights generation via OpenAI API
- Error handling and retry logic
- Response processing and storage
- Cost optimization through efficient prompting

### Database Service
- Neon PostgreSQL serverless backend
- Connection pooling and optimization
- High availability and scaling

## Performance Considerations

### Database Optimization
- Indexed queries for user-scoped data
- Connection pooling for efficient resource usage
- Query optimization for large datasets
- Pagination support for large collections

### Response Optimization
- Efficient JSON serialization
- Minimal data transfer
- Proper HTTP status codes
- Caching headers where appropriate

## Error Handling

### Centralized Error Patterns
- Consistent error response format
- Proper HTTP status codes
- User-friendly error messages
- Detailed logging for debugging

### Error Categories
- **Authentication Errors**: 401 Unauthorized
- **Validation Errors**: 400 Bad Request  
- **Resource Not Found**: 404 Not Found
- **Server Errors**: 500 Internal Server Error
- **Conflict Errors**: 409 Conflict (duplicate resources)

## API Evolution Considerations

### Versioning Strategy
- Currently unversioned (v1 implicit)
- Future versioning via URL path (/api/v2/)
- Backward compatibility maintenance
- Deprecation process planning

### Extension Points
- Additional user data fields
- New insight types and categories
- Enhanced filtering and querying
- Bulk operations support
- Real-time updates via WebSockets

## Development Patterns

### Code Organization
- One file per route with all HTTP methods
- Shared utilities in service layer
- Type definitions in separate files
- Consistent naming conventions

### Testing Considerations
- Authentication testing with mocked sessions
- Database transaction rollback for tests
- Integration testing with real database
- API contract testing

## Documentation Integration

### OpenAPI/Swagger Potential
- API documentation generation
- Request/response schema validation
- Interactive API testing
- Client SDK generation

### Current Documentation
- Inline code comments
- TypeScript type definitions
- API usage in frontend components
- Service layer abstractions

## Security Audit Points

### Input Validation
- All user inputs validated
- SQL injection prevention via ORM
- XSS prevention in responses
- CSRF protection via NextAuth.js

### Authentication Security
- JWT token validation
- Session expiration handling
- Secure cookie configuration
- Password hashing with PBKDF2

### Data Privacy
- User data isolation
- No sensitive data in logs
- Secure environment variable handling
- HTTPS enforcement in production

## Related Documents
- `codebase-analysis.md` - Overall codebase structure
- `technology-stack.md` - Technology stack details
- `edge-runtime-architecture.md` - Runtime environment analysis
- `DATABASE.md` - Database schema documentation
- `ARCHITECTURE.md` - System architecture overview

## Changelog
- 2025-07-06: Initial API inventory completed based on codebase analysis
