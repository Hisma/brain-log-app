---
title: User Management API
description: User registration, profiles, and settings management endpoints
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# User Management API

## Overview

The User Management API provides endpoints for user registration, profile management, and user settings. These endpoints handle user account creation, authentication data, profile updates, and user preferences.

## Security Note

Most user management endpoints are public for registration purposes or require authentication for profile management. Password hashes are never returned in API responses for security.

## Endpoints

### User Registration

**Endpoint**: `/api/users`  
**Method**: POST  
**Authentication**: Public (registration endpoint)  
**Runtime**: Node.js  

#### Description
Creates a new user account with username, password, and display name. Validates input data and ensures username uniqueness.

#### Request Body
```json
{
  "username": "user@example.com",
  "password": "securepassword123",
  "displayName": "John Doe",
  "timezone": "America/New_York"
}
```

#### Request Fields
- **username** (required): Email address used as username
- **password** (required): User password (will be hashed)
- **displayName** (required): User's display name
- **timezone** (optional): User's timezone (defaults to "America/New_York")

#### Validation Rules
- **username**: Must be unique across all users
- **password**: Required, will be hashed using PBKDF2
- **displayName**: Required, cannot be empty
- **timezone**: Optional, defaults to "America/New_York"

#### Response (Success)
```json
HTTP 201 Created
{
  "id": 1,
  "username": "user@example.com",
  "displayName": "John Doe",
  "theme": "system",
  "timezone": "America/New_York",
  "createdAt": "2025-07-06T14:30:00.000Z",
  "lastLogin": null
}
```

#### Response (Username Exists)
```json
HTTP 400 Bad Request
{
  "error": "Username already exists"
}
```

#### Response (Validation Error)
```json
HTTP 400 Bad Request
{
  "error": "Username, password, and display name are required"
}
```

#### Example Request
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@example.com",
    "password": "mypassword123",
    "displayName": "John Doe",
    "timezone": "America/New_York"
  }'
```

### User List

**Endpoint**: `/api/users`  
**Method**: GET  
**Authentication**: Public (returns safe user data only)  
**Runtime**: Node.js  

#### Description
Returns a list of all registered users with safe public information. Password hashes are excluded from the response.

#### Response
```json
HTTP 200 OK
[
  {
    "id": 1,
    "username": "user1@example.com",
    "displayName": "User One",
    "theme": "light",
    "createdAt": "2025-07-06T14:30:00.000Z",
    "lastLogin": "2025-07-06T15:00:00.000Z"
  },
  {
    "id": 2,
    "username": "user2@example.com",
    "displayName": "User Two",
    "theme": "dark",
    "createdAt": "2025-07-06T14:35:00.000Z",
    "lastLogin": null
  }
]
```

#### Example Request
```bash
curl -X GET http://localhost:3000/api/users
```

### Get Specific User

**Endpoint**: `/api/users/[id]`  
**Method**: GET  
**Authentication**: Public (returns safe user data only)  
**Runtime**: Node.js  

#### Description
Returns information for a specific user by ID. Password hash is excluded from the response.

#### URL Parameters
- **id**: User ID (integer)

#### Response (User Found)
```json
HTTP 200 OK
{
  "id": 1,
  "username": "user@example.com",
  "displayName": "John Doe",
  "theme": "light",
  "createdAt": "2025-07-06T14:30:00.000Z",
  "lastLogin": "2025-07-06T15:00:00.000Z"
}
```

#### Response (User Not Found)
```json
HTTP 404 Not Found
{
  "error": "User not found"
}
```

#### Response (Invalid ID)
```json
HTTP 400 Bad Request
{
  "error": "Invalid user ID"
}
```

#### Example Request
```bash
curl -X GET http://localhost:3000/api/users/1
```

### Update User Profile

**Endpoint**: `/api/users/[id]`  
**Method**: PATCH  
**Authentication**: Public (no session validation implemented)  
**Runtime**: Node.js  

#### Description
Updates user profile information including display name, theme, and password. Supports partial updates.

#### URL Parameters
- **id**: User ID (integer)

#### Request Body
```json
{
  "displayName": "Updated Name",
  "theme": "dark",
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Request Fields
- **displayName** (optional): New display name
- **theme** (optional): UI theme preference ("light", "dark", "system")
- **currentPassword** (optional): Current password (required for password change)
- **newPassword** (optional): New password (requires currentPassword)

#### Password Change Validation
- Both `currentPassword` and `newPassword` must be provided together
- Current password is verified against stored hash
- New password is hashed using bcrypt before storage

#### Response (Success)
```json
HTTP 200 OK
{
  "id": 1,
  "username": "user@example.com",
  "displayName": "Updated Name",
  "theme": "dark",
  "createdAt": "2025-07-06T14:30:00.000Z",
  "lastLogin": "2025-07-06T15:00:00.000Z"
}
```

#### Response (Invalid Current Password)
```json
HTTP 400 Bad Request
{
  "error": "Current password is incorrect"
}
```

#### Response (User Not Found)
```json
HTTP 404 Not Found
{
  "error": "User not found"
}
```

#### Example Request
```bash
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "John Smith",
    "theme": "dark"
  }'
```

### Delete User

**Endpoint**: `/api/users/[id]`  
**Method**: DELETE  
**Authentication**: Public (no session validation implemented)  
**Runtime**: Node.js  

#### Description
Permanently deletes a user account and all associated data.

#### URL Parameters
- **id**: User ID (integer)

#### Response (Success)
```json
HTTP 200 OK
{
  "message": "User deleted successfully"
}
```

#### Response (User Not Found)
```json
HTTP 404 Not Found
{
  "error": "User not found"
}
```

#### Response (Invalid ID)
```json
HTTP 400 Bad Request
{
  "error": "Invalid user ID"
}
```

#### Example Request
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

### Update User Timezone

**Endpoint**: `/api/users/timezone`  
**Method**: PUT  
**Authentication**: Required  
**Runtime**: Node.js  

#### Description
Updates the authenticated user's timezone preference. Requires valid session authentication.

#### Request Body
```json
{
  "timezone": "America/Los_Angeles"
}
```

#### Request Fields
- **timezone** (required): Valid timezone string (e.g., "America/New_York", "Europe/London")

#### Response (Success)
```json
HTTP 200 OK
{
  "success": true,
  "timezone": "America/Los_Angeles"
}
```

#### Response (Unauthorized)
```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

#### Response (Missing Timezone)
```json
HTTP 400 Bad Request
{
  "error": "Timezone is required"
}
```

#### Example Request
```bash
curl -X PUT http://localhost:3000/api/users/timezone \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "timezone": "America/Los_Angeles"
  }'
```

## Data Model

### User Object Structure
```typescript
interface User {
  id: number;
  username: string;          // Email address used as username
  displayName: string;       // User's display name
  passwordHash: string;      // Hashed password (excluded from API responses)
  theme: string;             // UI theme: "light" | "dark" | "system"
  timezone: string;          // User's timezone
  createdAt: Date;           // Account creation timestamp
  lastLogin: Date | null;    // Last login timestamp
}
```

### Safe User Object (API Responses)
```typescript
interface SafeUser {
  id: number;
  username: string;
  displayName: string;
  theme: string;
  timezone?: string;         // Only included in authenticated responses
  createdAt: Date;
  lastLogin: Date | null;
}
```

## Password Security

### Hashing Implementation
- **Algorithm**: PBKDF2 (registration) and bcrypt (updates)
- **Registration**: Edge-compatible Web Crypto API with PBKDF2
- **Updates**: bcrypt with 10 salt rounds
- **Storage**: Hash string includes salt and iterations

### Password Requirements
- Minimum length enforced by frontend validation
- No specific complexity requirements in API
- Passwords are hashed immediately upon receipt
- Original passwords are never stored or logged

## Validation Rules

### Username Validation
- Must be unique across all users
- Used as email for authentication
- Cannot be changed after registration
- Required field for registration

### Display Name Validation
- Required for registration
- Can be updated via PATCH endpoint
- Cannot be empty string
- No length restrictions enforced

### Theme Validation
- Accepted values: "light", "dark", "system"
- Defaults to "system" on registration
- Can be updated via PATCH endpoint

### Timezone Validation
- Must be valid timezone string
- Defaults to "America/New_York"
- Can be updated via dedicated timezone endpoint
- Validated by database constraint

## Error Handling

### Common Error Responses

#### Validation Errors
```json
HTTP 400 Bad Request
{
  "error": "Specific validation message"
}
```

#### Authentication Errors
```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

#### Not Found Errors
```json
HTTP 404 Not Found
{
  "error": "User not found"
}
```

#### Server Errors
```json
HTTP 500 Internal Server Error
{
  "error": "Failed to perform operation"
}
```

## Security Considerations

### Password Security
- Passwords are hashed using secure algorithms
- Password hashes are never returned in API responses
- Current password verification required for password changes
- No password reset functionality currently implemented

### Data Privacy
- User list endpoint excludes sensitive information
- Password hashes are always excluded from responses
- Timezone information only returned in authenticated contexts

### Authentication Gaps
⚠️ **Note**: Some endpoints (GET, PATCH, DELETE `/api/users/[id]`) currently lack proper authentication validation. These should be secured in production use.

## Integration with Authentication

### Registration Flow
1. User submits registration form
2. API validates input and username uniqueness
3. Password is hashed using Edge-compatible crypto
4. User record created in database
5. User can immediately sign in with credentials

### Profile Updates
1. User updates profile via authenticated session
2. API validates ownership and permissions
3. Changes are applied with appropriate validation
4. Updated user object returned (without password hash)

### Session Integration
- Timezone endpoint requires valid NextAuth.js session
- User ID extracted from session for data scoping
- Session validation ensures data privacy

## Database Relationships

### Related Data
- **Daily Logs**: Foreign key relationship to User.id
- **Weekly Reflections**: Foreign key relationship to User.id
- **AI Insights**: Foreign key relationship to User.id
- **Sessions**: Managed by NextAuth.js

### Cascade Behavior
- User deletion cascades to related data
- Orphaned records are prevented by foreign key constraints
- Data integrity maintained across relationships

## Testing

### Registration Testing
```bash
# Test successful registration
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "testpassword",
    "displayName": "Test User"
  }'

# Test duplicate username
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "another password",
    "displayName": "Another User"
  }'
```

### Profile Update Testing
```bash
# Test profile update
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "Updated Name",
    "theme": "dark"
  }'

# Test password change
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }'
```

### Timezone Update Testing
```bash
# Test timezone update (requires authentication)
curl -X PUT http://localhost:3000/api/users/timezone \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{
    "timezone": "Europe/London"
  }'
```

## Related Documents
- [API Overview](01-overview.md)
- [Authentication API](02-authentication.md)
- [Database Schema](../02-architecture/04-database.md)
- [Authentication Architecture](../02-architecture/05-authentication.md)

## Changelog
- 2025-07-06: Initial user management API documentation created
