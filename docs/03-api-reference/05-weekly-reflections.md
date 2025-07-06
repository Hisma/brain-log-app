---
title: Weekly Reflections API
description: Weekly summary and reflection endpoints for long-term tracking
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Weekly Reflections API

## Overview

The Weekly Reflections API provides endpoints for managing weekly summary and reflection data. This system captures longer-term patterns, insights, and goal tracking that complement the daily logging system.

## Weekly Reflection Structure

Each weekly reflection captures:
- **Week Period**: Start and end dates defining the week
- **Overall Assessment**: Week rating and mental state evaluation
- **Reflection Content**: Highlights, challenges, and lessons learned
- **Goal Tracking**: Physical activity, diet, and family activities
- **Forward Planning**: Focus areas for the upcoming week

## Endpoints

### Create Weekly Reflection

**Endpoint**: `/api/weekly-reflections`  
**Method**: POST  
**Authentication**: Required  
**Runtime**: Node.js  

#### Description
Creates a new weekly reflection entry for the authenticated user. Only one reflection per week period per user is allowed.

#### Request Body
```json
{
  "weekStartDate": "2025-07-01",
  "weekEndDate": "2025-07-07",
  "questionedLeavingJob": false,
  "weekRating": 8,
  "mentalState": "Positive and productive",
  "weekHighlights": "Completed major project milestone, had great family time",
  "weekChallenges": "Managing work-life balance during busy periods",
  "lessonsLearned": "Taking breaks actually improves productivity",
  "nextWeekFocus": "Focus on maintaining exercise routine",
  "gymDaysCount": 4,
  "dietRating": 7,
  "memorableFamilyActivities": "Weekend hiking trip and board game night"
}
```

#### Request Fields
- **weekStartDate** (required): Start date of the week (YYYY-MM-DD)
- **weekEndDate** (required): End date of the week (YYYY-MM-DD)
- **questionedLeavingJob** (optional): Whether questioned leaving job this week (boolean)
- **weekRating** (optional): Overall week rating (0-10)
- **mentalState** (optional): Description of mental state during the week
- **weekHighlights** (optional): Notable positive events or achievements
- **weekChallenges** (optional): Challenges or difficulties faced
- **lessonsLearned** (optional): Key insights or learnings from the week
- **nextWeekFocus** (optional): Focus areas or goals for next week
- **gymDaysCount** (optional): Number of gym/exercise days (default: 0)
- **dietRating** (optional): Diet quality rating (0-10, default: 0)
- **memorableFamilyActivities** (optional): Notable family activities or time

#### Validation Rules
- **weekStartDate** and **weekEndDate** are required
- Only one reflection per week period per user allowed
- User scoping is automatic based on authentication
- All other fields are optional with sensible defaults

#### Response (Success)
```json
HTTP 201 Created
{
  "id": 45,
  "userId": 123,
  "weekStartDate": "2025-07-01T00:00:00.000Z",
  "weekEndDate": "2025-07-07T23:59:59.999Z",
  "questionedLeavingJob": false,
  "weekRating": 8,
  "mentalState": "Positive and productive",
  "weekHighlights": "Completed major project milestone, had great family time",
  "weekChallenges": "Managing work-life balance during busy periods",
  "lessonsLearned": "Taking breaks actually improves productivity",
  "nextWeekFocus": "Focus on maintaining exercise routine",
  "gymDaysCount": 4,
  "dietRating": 7,
  "memorableFamilyActivities": "Weekend hiking trip and board game night",
  "createdAt": "2025-07-08T10:30:00.000Z",
  "updatedAt": "2025-07-08T10:30:00.000Z"
}
```

#### Response (Duplicate Week)
```json
HTTP 400 Bad Request
{
  "error": "A reflection already exists for this week"
}
```

#### Response (Missing Required Fields)
```json
HTTP 400 Bad Request
{
  "error": "Week start date and end date are required"
}
```

### Get Weekly Reflections

**Endpoint**: `/api/weekly-reflections`  
**Method**: GET  
**Authentication**: Required  
**Runtime**: Node.js  

#### Description
Retrieves weekly reflections for the authenticated user. Supports filtering by specific reflection ID or date range.

#### Query Parameters
- **id** (optional): Specific reflection ID
- **startDate** (optional): Start date for range query
- **endDate** (optional): End date for range query

#### Query Examples
```bash
# Get all reflections
GET /api/weekly-reflections

# Get specific reflection by ID
GET /api/weekly-reflections?id=45

# Get reflections for date range
GET /api/weekly-reflections?startDate=2025-07-01&endDate=2025-07-31
```

#### Response (All Reflections)
```json
HTTP 200 OK
[
  {
    "id": 45,
    "userId": 123,
    "weekStartDate": "2025-07-01T00:00:00.000Z",
    "weekEndDate": "2025-07-07T23:59:59.999Z",
    "questionedLeavingJob": false,
    "weekRating": 8,
    "mentalState": "Positive and productive",
    "weekHighlights": "Completed major project milestone",
    "weekChallenges": "Managing work-life balance",
    "lessonsLearned": "Taking breaks improves productivity",
    "nextWeekFocus": "Focus on exercise routine",
    "gymDaysCount": 4,
    "dietRating": 7,
    "memorableFamilyActivities": "Weekend hiking trip",
    "createdAt": "2025-07-08T10:30:00.000Z",
    "updatedAt": "2025-07-08T10:30:00.000Z"
  }
]
```

#### Response (Specific Reflection)
```json
HTTP 200 OK
{
  "id": 45,
  "userId": 123,
  "weekStartDate": "2025-07-01T00:00:00.000Z",
  "weekEndDate": "2025-07-07T23:59:59.999Z",
  // ... complete reflection data
}
```

#### Response (Reflection Not Found)
```json
HTTP 404 Not Found
{
  "error": "Weekly reflection not found"
}
```

### Update Weekly Reflection

**Endpoint**: `/api/weekly-reflections`  
**Method**: PUT  
**Authentication**: Required  
**Runtime**: Node.js  

#### Description
Updates an existing weekly reflection. Supports partial updates - only provided fields will be updated.

#### Request Body
```json
{
  "id": 45,
  "weekRating": 9,
  "lessonsLearned": "Updated insights about productivity",
  "nextWeekFocus": "Continue current momentum with exercise",
  "gymDaysCount": 5
}
```

#### Required Fields
- **id** (number): ID of the reflection to update

#### Validation
- Reflection must exist and belong to authenticated user
- User ownership is verified before update
- Only provided fields are updated (partial update support)

#### Response (Success)
```json
HTTP 200 OK
{
  "id": 45,
  "userId": 123,
  "weekStartDate": "2025-07-01T00:00:00.000Z",
  "weekEndDate": "2025-07-07T23:59:59.999Z",
  "weekRating": 9,
  "lessonsLearned": "Updated insights about productivity",
  "nextWeekFocus": "Continue current momentum with exercise",
  "gymDaysCount": 5,
  // ... all other fields with previous or updated values
  "updatedAt": "2025-07-08T15:45:00.000Z"
}
```

#### Response (Reflection Not Found)
```json
HTTP 404 Not Found
{
  "error": "Reflection not found"
}
```

#### Response (Unauthorized Access)
```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

#### Response (Missing ID)
```json
HTTP 400 Bad Request
{
  "error": "Reflection ID is required"
}
```

### Delete Weekly Reflection

**Endpoint**: `/api/weekly-reflections`  
**Method**: DELETE  
**Authentication**: Required  
**Runtime**: Node.js  

#### Description
Permanently deletes a weekly reflection entry. User ownership is verified before deletion.

#### Query Parameters
- **id** (required): ID of the reflection to delete

#### Request Example
```bash
DELETE /api/weekly-reflections?id=45
```

#### Response (Success)
```json
HTTP 200 OK
{
  "success": true
}
```

#### Response (Reflection Not Found)
```json
HTTP 404 Not Found
{
  "error": "Reflection not found"
}
```

#### Response (Unauthorized Access)
```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

#### Response (Missing ID)
```json
HTTP 400 Bad Request
{
  "error": "Reflection ID is required"
}
```

## Data Model

### Weekly Reflection Schema
```typescript
interface WeeklyReflection {
  id: number;
  userId: number;
  weekStartDate: Date;
  weekEndDate: Date;
  questionedLeavingJob: boolean;
  weekRating: number | null;
  mentalState: string | null;
  weekHighlights: string | null;
  weekChallenges: string | null;
  lessonsLearned: string | null;
  nextWeekFocus: string | null;
  gymDaysCount: number;
  dietRating: number;
  memorableFamilyActivities: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Field Descriptions

### Core Reflection Fields
- **weekStartDate**: Beginning of the reflection week period
- **weekEndDate**: End of the reflection week period
- **weekRating**: Overall quality rating for the week (0-10 scale)
- **mentalState**: Descriptive assessment of mental/emotional state

### Reflection Content
- **weekHighlights**: Positive events, achievements, or notable moments
- **weekChallenges**: Difficulties, obstacles, or challenging situations
- **lessonsLearned**: Key insights, realizations, or learning outcomes
- **nextWeekFocus**: Goals, intentions, or focus areas for upcoming week

### Goal Tracking
- **gymDaysCount**: Number of days with physical exercise/gym activity
- **dietRating**: Assessment of diet quality and adherence (0-10 scale)
- **memorableFamilyActivities**: Notable family time or activities

### Career/Life Assessment
- **questionedLeavingJob**: Boolean indicator of job satisfaction concerns

## Rating Scales

### Week Rating (0-10 scale)
- **0-2**: Very poor week, significant challenges
- **3-4**: Below average, more challenges than positives
- **5**: Average week, balanced challenges and positives
- **6-7**: Good week, mostly positive with some challenges
- **8-9**: Excellent week, highly positive and productive
- **10**: Perfect week, exceptional in all areas

### Diet Rating (0-10 scale)
- **0-2**: Poor dietary choices, not meeting health goals
- **3-4**: Below average diet quality
- **5**: Average adherence to dietary goals
- **6-7**: Good diet quality, mostly meeting goals
- **8-9**: Excellent dietary adherence
- **10**: Perfect diet week, all goals exceeded

## Usage Patterns

### Weekly Review Process
1. **Data Collection**: Review daily logs from the week
2. **Pattern Analysis**: Identify trends and recurring themes
3. **Reflection Writing**: Document insights and observations
4. **Goal Assessment**: Evaluate progress on weekly goals
5. **Forward Planning**: Set intentions for the upcoming week

### Integration with Daily Logs
- Weekly reflections summarize patterns from daily logs
- Correlation analysis between daily metrics and weekly outcomes
- Long-term trend identification across multiple weeks
- Goal tracking continuity between daily and weekly data

## Business Rules

### Unique Week Constraint
- Only one reflection per week period per user
- Week periods defined by start and end dates
- Overlapping weeks are allowed (different date ranges)

### User Data Isolation
- All reflections scoped to authenticated user
- Cross-user access prevented
- Ownership validation on all operations

### Date Handling
- Week dates stored as full DateTime objects
- Date range queries inclusive of boundaries
- Timezone handling consistent with user preferences

## Error Handling

### Common Error Scenarios

#### Authentication Required
```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

#### Duplicate Week Period
```json
HTTP 400 Bad Request
{
  "error": "A reflection already exists for this week"
}
```

#### Missing Required Dates
```json
HTTP 400 Bad Request
{
  "error": "Week start date and end date are required"
}
```

#### Resource Not Found
```json
HTTP 404 Not Found
{
  "error": "Weekly reflection not found"
}
```

#### Server Error
```json
HTTP 500 Internal Server Error
{
  "error": "Failed to create weekly reflection"
}
```

## Integration Points

### Daily Logs Integration
- Weekly patterns derived from daily log data
- Automated trend analysis across the week
- Goal achievement tracking based on daily entries
- Correlation analysis between daily and weekly metrics

### AI Insights Generation
- Weekly reflections provide context for AI analysis
- Long-term pattern recognition across multiple weeks
- Personalized recommendations based on reflection themes
- Trend prediction for future weeks

### Progress Tracking
- Goal achievement monitoring over time
- Habit formation tracking
- Personal growth measurement
- Life satisfaction trends

## Performance Considerations

### Database Optimization
- Indexed queries by userId and week dates
- Efficient date range filtering
- Optimized for weekly batch processing
- Support for analytical queries

### API Response Optimization
- Minimal data transfer for list views
- Complete data for detailed views
- Efficient JSON serialization
- Proper caching for static data

## Security Considerations

### Data Privacy
- User data isolation at API level
- No cross-user reflection access
- Personal reflection content protection
- Audit logging for data operations

### Input Validation
- Date format validation
- Field length limits for text content
- SQL injection prevention via Prisma ORM
- XSS prevention in reflection text

## Testing Examples

### Create Weekly Reflection
```bash
curl -X POST http://localhost:3000/api/weekly-reflections \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{
    "weekStartDate": "2025-07-01",
    "weekEndDate": "2025-07-07",
    "weekRating": 8,
    "mentalState": "Positive and focused",
    "weekHighlights": "Great productivity",
    "gymDaysCount": 4,
    "dietRating": 7
  }'
```

### Get Weekly Reflections with Date Range
```bash
curl -X GET "http://localhost:3000/api/weekly-reflections?startDate=2025-07-01&endDate=2025-07-31" \
  -H "Cookie: next-auth.session-token=your-token"
```

### Update Weekly Reflection
```bash
curl -X PUT http://localhost:3000/api/weekly-reflections \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{
    "id": 45,
    "weekRating": 9,
    "lessonsLearned": "Updated insights"
  }'
```

### Delete Weekly Reflection
```bash
curl -X DELETE "http://localhost:3000/api/weekly-reflections?id=45" \
  -H "Cookie: next-auth.session-token=your-token"
```

## Related Documents
- [API Overview](01-overview.md)
- [Authentication API](02-authentication.md)
- [Daily Logs API](04-daily-logs.md)
- [AI Insights API](06-insights.md)
- [Database Schema](../02-architecture/04-database.md)

## Changelog
- 2025-07-06: Initial weekly reflections API documentation created
