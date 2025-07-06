---
title: API Overview
description: Brain Log App API design principles, authentication, and general patterns
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# API Overview

## Introduction

The Brain Log App API provides a comprehensive set of RESTful endpoints for managing user accounts, daily health logs, weekly reflections, and AI-generated insights. Built on Next.js with Node.js runtime, the API emphasizes security, data integrity, and user privacy.

## Base URL

```
Development: http://192.168.0.227:3003/api
Production: https://brain-log-app.vercel.app/api
```

## Runtime Environment

**Runtime**: Node.js (default)
- All API routes run on Node.js runtime for full feature support
- Database connectivity via Prisma ORM
- External service integrations (OpenAI, authentication providers)
- Server-side session management

## Authentication

### Authentication Method
All protected endpoints require authentication via NextAuth.js JWT-based sessions.

```typescript
// Standard authentication pattern used across all protected endpoints
const session = await auth();
if (!session || !session.user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
const userId = session.user.id;
```

### Session Management
- **Session Provider**: NextAuth.js
- **Session Storage**: JWT tokens
- **Session Validation**: Automatic validation on each request
- **User Identification**: Session contains user ID for data scoping

### Authentication Headers
No additional headers required beyond standard session cookies managed by NextAuth.js.

## Request/Response Patterns

### Standard Success Responses

#### Single Resource
```json
HTTP 200 OK
{
  "id": 1,
  "userId": "user_123",
  "field1": "value1",
  "field2": "value2",
  "createdAt": "2025-07-06T14:30:00.000Z",
  "updatedAt": "2025-07-06T14:30:00.000Z"
}
```

#### Resource Collection
```json
HTTP 200 OK
{
  "resources": [
    {
      "id": 1,
      "userId": "user_123",
      "field1": "value1"
    }
  ]
}
```

#### Resource Creation
```json
HTTP 201 Created
{
  "id": 1,
  "userId": "user_123",
  "field1": "value1",
  "createdAt": "2025-07-06T14:30:00.000Z"
}
```

#### Successful Operation
```json
HTTP 200 OK
{
  "success": true
}
```

### Standard Error Responses

#### Unauthorized Access
```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

#### Validation Error
```json
HTTP 400 Bad Request
{
  "error": "Validation message describing the issue"
}
```

#### Resource Not Found
```json
HTTP 404 Not Found
{
  "error": "Resource not found"
}
```

#### Conflict Error
```json
HTTP 409 Conflict
{
  "error": "Resource already exists or conflict condition"
}
```

#### Server Error
```json
HTTP 500 Internal Server Error
{
  "error": "Internal server error"
}
```

## Data Validation

### Input Validation Patterns
All endpoints implement comprehensive input validation:

#### Required Field Validation
```typescript
if (!data.requiredField) {
  return NextResponse.json(
    { error: 'Required field is missing' },
    { status: 400 }
  );
}
```

#### Date Validation
```typescript
if (!data.date) {
  return NextResponse.json(
    { error: 'Date is required' },
    { status: 400 }
  );
}

const date = new Date(data.date);
if (isNaN(date.getTime())) {
  return NextResponse.json(
    { error: 'Invalid date format' },
    { status: 400 }
  );
}
```

#### User Ownership Validation
```typescript
if (resource.userId !== session.user.id) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

## Database Integration

### Prisma ORM
- **Type Safety**: Full TypeScript support with generated types
- **Connection Pooling**: Automatic connection management
- **Query Optimization**: Efficient database queries
- **Transaction Support**: ACID compliance for complex operations

### Query Patterns

#### User-Scoped Queries
```typescript
// Single record with user scoping
const record = await prisma.model.findUnique({
  where: { id, userId }
});

// Multiple records with user scoping
const records = await prisma.model.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' }
});
```

#### Date Range Queries
```typescript
const records = await prisma.model.findMany({
  where: {
    userId,
    date: {
      gte: startDate,
      lte: endDate
    }
  },
  orderBy: { date: 'desc' }
});
```

## Security

### Data Isolation
- **User Scoping**: All data operations scoped to authenticated user
- **Ownership Validation**: Resources verified to belong to requesting user
- **No Cross-User Access**: Strict user data isolation

### Input Security
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **Input Validation**: Comprehensive validation on all inputs
- **Type Safety**: TypeScript type checking

### Session Security
- **JWT Validation**: Automatic session validation
- **Secure Cookies**: HTTPOnly, Secure cookie configuration
- **Session Expiration**: Automatic session timeout

## HTTP Methods

### GET - Resource Retrieval
- Retrieve single resources or collections
- Support for query parameters (filtering, pagination)
- Always user-scoped for data privacy

### POST - Resource Creation
- Create new resources
- Comprehensive validation before creation
- Duplicate prevention where applicable
- Returns created resource with generated ID

### PUT - Resource Updates
- Update existing resources
- Partial updates supported (only provided fields updated)
- Ownership validation required
- Returns updated resource

### DELETE - Resource Deletion
- Remove existing resources
- Ownership validation required
- Cascading deletion where appropriate
- Returns success confirmation

## Query Parameters

### Date Filtering
```
GET /api/endpoint?date=2025-07-06
GET /api/endpoint?startDate=2025-07-01&endDate=2025-07-31
```

### Resource Identification
```
DELETE /api/endpoint?id=123
```

## Data Types

### Common Field Types
- **Strings**: Text fields, descriptions, notes
- **Numbers**: Ratings, scores, counts (0-10 scales common)
- **Booleans**: Yes/no fields, completion status
- **Dates**: ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- **DateTime**: Full timestamp with timezone information

### Validation Rules
- **Required Fields**: Validated on creation
- **Optional Fields**: Default values provided where appropriate
- **Range Validation**: Numeric fields have defined min/max values
- **Format Validation**: Dates, emails, and other formatted fields

## Error Handling

### Error Response Format
All errors follow consistent format:
```json
{
  "error": "Human-readable error message"
}
```

### Error Categories
1. **Authentication Errors** (401): Invalid or missing session
2. **Authorization Errors** (401): Insufficient permissions
3. **Validation Errors** (400): Invalid input data
4. **Not Found Errors** (404): Resource doesn't exist
5. **Conflict Errors** (409): Resource conflicts (duplicates)
6. **Server Errors** (500): Internal processing errors

### Error Logging
- Server-side error logging for debugging
- User-friendly error messages
- No sensitive information in error responses

## Rate Limiting

### Current Implementation
- No explicit rate limiting implemented
- Relies on Vercel's infrastructure limits
- Session-based natural rate limiting

### Future Considerations
- API key-based rate limiting
- User-specific rate limits
- Endpoint-specific rate limiting

## API Versioning

### Current Version
- **Version**: 1.0 (implicit)
- **URL Pattern**: `/api/endpoint` (no version prefix)

### Future Versioning Strategy
- **URL-based versioning**: `/api/v2/endpoint`
- **Backward compatibility**: Maintain v1 during transition
- **Deprecation process**: Clear migration timeline

## Content Types

### Request Content Type
```
Content-Type: application/json
```

### Response Content Type
```
Content-Type: application/json
```

## CORS Configuration

- **Same-Origin Policy**: Default browser CORS policy
- **Credentials**: Session cookies included in requests
- **Headers**: Standard JSON headers accepted

## Performance Considerations

### Database Optimization
- Indexed queries for user-scoped data
- Connection pooling for efficient resource usage
- Query optimization for large datasets

### Response Optimization
- Efficient JSON serialization
- Minimal data transfer
- Proper HTTP status codes
- Conditional requests support (planned)

### Caching Strategy
- No explicit caching headers currently
- Session-based data freshness
- Client-side caching considerations

## External Integrations

### OpenAI API
- AI insights generation
- Error handling and retry logic
- Rate limiting compliance
- Response processing and storage

### Authentication Providers
- NextAuth.js integration
- Multiple provider support capability
- Session management

### Database Service
- Neon PostgreSQL
- Serverless architecture
- High availability

## API Endpoint Categories

The Brain Log App API is organized into the following categories:

1. **[Authentication](02-authentication.md)** - User authentication and session management
2. **[User Management](03-users.md)** - User registration, profiles, and settings
3. **[Daily Logs](04-daily-logs.md)** - Daily health and medication tracking
4. **[Weekly Reflections](05-weekly-reflections.md)** - Weekly summary and reflection
5. **[AI Insights](06-insights.md)** - AI-generated insights and recommendations
6. **[Data Management](07-data-management.md)** - Cleanup and maintenance operations

## Development Guidelines

### Adding New Endpoints
1. Follow established authentication patterns
2. Implement comprehensive input validation
3. Ensure user data isolation
4. Use consistent error handling
5. Document request/response schemas
6. Add appropriate tests

### Code Patterns
- Use TypeScript for type safety
- Follow consistent naming conventions
- Implement proper error handling
- Add meaningful comments
- Use Prisma for database operations

## Related Documents
- [Authentication API](02-authentication.md)
- [System Architecture](../02-architecture/01-overview.md)
- [Database Schema](../02-architecture/04-database.md)
- [Backend Architecture](../02-architecture/03-backend.md)

## Changelog
- 2025-07-06: Initial API overview documentation created
