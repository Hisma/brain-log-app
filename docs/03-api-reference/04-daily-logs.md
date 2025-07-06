---
title: Daily Logs API
description: Daily health and medication tracking API endpoints
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# Daily Logs API

## Overview

The Daily Logs API provides comprehensive endpoints for managing daily health and medication tracking data. This is the core data collection system of the Brain Log App, capturing detailed information across five time-based check-ins throughout the day.

## Daily Log Structure

Each daily log captures data across five distinct check-in periods:

1. **Morning Check-in** (7-9am): Sleep, mood, and physical status
2. **Medication Log** (9-10am): Medication timing, dosage, and initial effects
3. **Mid-day Check-in** (11am-1pm): Focus, energy, activities, and emotional events
4. **Afternoon Check-in** (3-5pm): Crash symptoms, anxiety, and social interactions
5. **Evening Reflection** (8-10pm): Overall day assessment and goal tracking

## Endpoints

### Create Daily Log

**Endpoint**: `/api/daily-logs`  
**Method**: POST  
**Authentication**: Required  
**Runtime**: Node.js  

#### Description
Creates a new daily log entry for the authenticated user. Only one log per date per user is allowed.

#### Request Body
```json
{
  "date": "2025-07-06",
  
  // Morning Check-in (7-9am)
  "sleepHours": 7.5,
  "sleepQuality": 8,
  "dreams": "Had a vivid dream about flying",
  "morningMood": 7,
  "physicalStatus": "Feeling rested and energetic",
  "breakfast": "Oatmeal with berries",
  "morningCompleted": true,
  
  // Medication Log (9-10am)
  "medicationTaken": true,
  "medicationTakenAt": "2025-07-06T09:15:00.000Z",
  "medicationDose": 18,
  "ateWithinHour": true,
  "firstHourFeeling": "Calm and focused",
  "reasonForSkipping": "",
  "medicationCompleted": true,
  
  // Mid-day Check-in (11am-1pm)
  "lunch": "Salad with grilled chicken",
  "focusLevel": 8,
  "energyLevel": 7,
  "ruminationLevel": 3,
  "currentActivity": "Working on project documentation",
  "distractions": "Minor email notifications",
  "hadEmotionalEvent": false,
  "emotionalEvent": "",
  "copingStrategies": "",
  "middayCompleted": true,
  
  // Afternoon Check-in (3-5pm)
  "afternoonSnack": "Apple and nuts",
  "isCrashing": false,
  "crashSymptoms": "",
  "anxietyLevel": 2,
  "isFeeling": "Productive and steady",
  "hadTriggeringInteraction": false,
  "interactionDetails": "",
  "selfWorthTiedToPerformance": "Sometimes",
  "overextended": "Not today",
  "afternoonCompleted": true,
  
  // Evening Reflection (8-10pm)
  "dinner": "Grilled salmon with vegetables",
  "overallMood": 8,
  "sleepiness": 6,
  "medicationEffectiveness": "Very effective today",
  "helpfulFactors": "Good sleep, healthy meals, structured work",
  "distractingFactors": "Some afternoon fatigue",
  "thoughtForTomorrow": "Continue with current routine",
  "metPhysicalActivityGoals": true,
  "metDietaryGoals": true,
  "neverFeltIsolated": true,
  "eveningCompleted": true,
  
  // Overall Assessment
  "isComplete": true,
  "dayRating": 8,
  "accomplishments": "Completed major project milestone",
  "challenges": "Slight afternoon energy dip",
  "gratitude": "Grateful for productive day and good health",
  "improvements": "Try light afternoon exercise"
}
```

#### Field Categories

##### Morning Check-in Fields
- **sleepHours** (number): Hours of sleep (0-24)
- **sleepQuality** (number): Sleep quality rating (0-10)
- **dreams** (string): Dream content or notes
- **morningMood** (number): Morning mood rating (0-10)
- **physicalStatus** (string): Physical condition description
- **breakfast** (string): Breakfast description
- **morningCompleted** (boolean): Morning check-in completion status

##### Medication Log Fields
- **medicationTaken** (boolean): Whether medication was taken
- **medicationTakenAt** (datetime): Exact time medication was taken
- **medicationDose** (number): Medication dosage amount
- **ateWithinHour** (boolean): Whether food was consumed within an hour
- **firstHourFeeling** (string): How user felt in first hour after medication
- **reasonForSkipping** (string): Reason if medication was skipped
- **medicationCompleted** (boolean): Medication log completion status

##### Mid-day Check-in Fields
- **lunch** (string): Lunch description
- **focusLevel** (number): Focus level rating (0-10)
- **energyLevel** (number): Energy level rating (0-10)
- **ruminationLevel** (number): Rumination/overthinking level (0-10)
- **currentActivity** (string): Current activity description
- **distractions** (string): Distraction notes
- **hadEmotionalEvent** (boolean): Whether an emotional event occurred
- **emotionalEvent** (string): Description of emotional event
- **copingStrategies** (string): Coping strategies used
- **middayCompleted** (boolean): Mid-day check-in completion status

##### Afternoon Check-in Fields
- **afternoonSnack** (string): Afternoon snack description
- **isCrashing** (boolean): Whether experiencing medication crash
- **crashSymptoms** (string): Description of crash symptoms
- **anxietyLevel** (number): Anxiety level rating (0-10)
- **isFeeling** (string): Current feeling description
- **hadTriggeringInteraction** (boolean): Whether had triggering social interaction
- **interactionDetails** (string): Details of triggering interaction
- **selfWorthTiedToPerformance** (string): Self-worth/performance relationship assessment
- **overextended** (string): Whether feeling overextended
- **afternoonCompleted** (boolean): Afternoon check-in completion status

##### Evening Reflection Fields
- **dinner** (string): Dinner description
- **overallMood** (number): Overall day mood rating (0-10)
- **sleepiness** (number): Current sleepiness level (0-10)
- **medicationEffectiveness** (string): Assessment of medication effectiveness
- **helpfulFactors** (string): Factors that helped during the day
- **distractingFactors** (string): Factors that were distracting/unhelpful
- **thoughtForTomorrow** (string): Thoughts or plans for tomorrow
- **metPhysicalActivityGoals** (boolean): Whether physical activity goals were met
- **metDietaryGoals** (boolean): Whether dietary goals were met
- **neverFeltIsolated** (boolean): Whether user felt socially connected
- **eveningCompleted** (boolean): Evening reflection completion status

##### Overall Assessment Fields
- **isComplete** (boolean): Whether entire daily log is complete
- **dayRating** (number): Overall day rating (0-10)
- **accomplishments** (string): Day's accomplishments
- **challenges** (string): Day's challenges
- **gratitude** (string): Things user is grateful for
- **improvements** (string): Areas for improvement

#### Validation Rules
- **date** (required): Must be valid ISO date string
- **Duplicate Prevention**: Only one log per date per user allowed
- **Partial Updates**: All fields are optional except date
- **User Scoping**: Logs are automatically scoped to authenticated user

#### Response (Success)
```json
HTTP 201 Created
{
  "id": 123,
  "userId": 456,
  "date": "2025-07-06T00:00:00.000Z",
  "sleepHours": 7.5,
  "sleepQuality": 8,
  "dreams": "Had a vivid dream about flying",
  "morningMood": 7,
  "physicalStatus": "Feeling rested and energetic",
  "breakfast": "Oatmeal with berries",
  "morningCompleted": true,
  "medicationTaken": true,
  "medicationTakenAt": "2025-07-06T09:15:00.000Z",
  "medicationDose": 18,
  "ateWithinHour": true,
  "firstHourFeeling": "Calm and focused",
  "reasonForSkipping": "",
  "medicationCompleted": true,
  "lunch": "Salad with grilled chicken",
  "focusLevel": 8,
  "energyLevel": 7,
  "ruminationLevel": 3,
  "currentActivity": "Working on project documentation",
  "distractions": "Minor email notifications",
  "hadEmotionalEvent": false,
  "emotionalEvent": "",
  "copingStrategies": "",
  "middayCompleted": true,
  "afternoonSnack": "Apple and nuts",
  "isCrashing": false,
  "crashSymptoms": "",
  "anxietyLevel": 2,
  "isFeeling": "Productive and steady",
  "hadTriggeringInteraction": false,
  "interactionDetails": "",
  "selfWorthTiedToPerformance": "Sometimes",
  "overextended": "Not today",
  "afternoonCompleted": true,
  "dinner": "Grilled salmon with vegetables",
  "overallMood": 8,
  "sleepiness": 6,
  "medicationEffectiveness": "Very effective today",
  "helpfulFactors": "Good sleep, healthy meals, structured work",
  "distractingFactors": "Some afternoon fatigue",
  "thoughtForTomorrow": "Continue with current routine",
  "metPhysicalActivityGoals": true,
  "metDietaryGoals": true,
  "neverFeltIsolated": true,
  "eveningCompleted": true,
  "isComplete": true,
  "dayRating": 8,
  "accomplishments": "Completed major project milestone",
  "challenges": "Slight afternoon energy dip",
  "gratitude": "Grateful for productive day and good health",
  "improvements": "Try light afternoon exercise",
  "createdAt": "2025-07-06T14:30:00.000Z",
  "updatedAt": "2025-07-06T14:30:00.000Z"
}
```

#### Response (Duplicate Date)
```json
HTTP 400 Bad Request
{
  "error": "A log already exists for this date"
}
```

#### Response (Missing Date)
```json
HTTP 400 Bad Request
{
  "error": "Date is required"
}
```

### Get Daily Logs

**Endpoint**: `/api/daily-logs`  
**Method**: GET  
**Authentication**: Required  
**Runtime**: Node.js  

#### Description
Retrieves daily logs for the authenticated user. Supports filtering by specific date or date range.

#### Query Parameters
- **date** (optional): Specific date (YYYY-MM-DD format)
- **startDate** (optional): Start date for range query
- **endDate** (optional): End date for range query

#### Query Examples
```bash
# Get all logs
GET /api/daily-logs

# Get log for specific date
GET /api/daily-logs?date=2025-07-06

# Get logs for date range
GET /api/daily-logs?startDate=2025-07-01&endDate=2025-07-31
```

#### Response (All Logs)
```json
HTTP 200 OK
{
  "dailyLogs": [
    {
      "id": 123,
      "userId": 456,
      "date": "2025-07-06T00:00:00.000Z",
      "sleepHours": 7.5,
      "sleepQuality": 8,
      "isComplete": true,
      "dayRating": 8,
      "createdAt": "2025-07-06T14:30:00.000Z",
      "updatedAt": "2025-07-06T14:30:00.000Z"
      // ... all other fields
    },
    {
      "id": 122,
      "userId": 456,
      "date": "2025-07-05T00:00:00.000Z",
      // ... log data
    }
  ]
}
```

#### Response (Specific Date)
```json
HTTP 200 OK
{
  "dailyLogs": [
    {
      "id": 123,
      "userId": 456,
      "date": "2025-07-06T00:00:00.000Z",
      // ... complete log data
    }
  ]
}
```

#### Response (No Logs Found)
```json
HTTP 200 OK
{
  "dailyLogs": []
}
```

### Update Daily Log

**Endpoint**: `/api/daily-logs`  
**Method**: PUT  
**Authentication**: Required  
**Runtime**: Node.js  

#### Description
Updates an existing daily log. Supports partial updates - only provided fields will be updated.

#### Request Body
```json
{
  "id": 123,
  "focusLevel": 9,
  "energyLevel": 8,
  "eveningCompleted": true,
  "overallMood": 9,
  "dayRating": 9
}
```

#### Required Fields
- **id** (number): ID of the log to update

#### Validation
- Log must exist and belong to authenticated user
- User ownership is verified before update
- Only provided fields are updated (partial update support)

#### Response (Success)
```json
HTTP 200 OK
{
  "id": 123,
  "userId": 456,
  "date": "2025-07-06T00:00:00.000Z",
  "focusLevel": 9,
  "energyLevel": 8,
  "eveningCompleted": true,
  "overallMood": 9,
  "dayRating": 9,
  // ... all other fields with previous or updated values
  "updatedAt": "2025-07-06T15:45:00.000Z"
}
```

#### Response (Log Not Found)
```json
HTTP 404 Not Found
{
  "error": "Log not found"
}
```

#### Response (Unauthorized)
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
  "error": "Log ID is required"
}
```

### Delete Daily Log

**Endpoint**: `/api/daily-logs`  
**Method**: DELETE  
**Authentication**: Required  
**Runtime**: Node.js  

#### Description
Permanently deletes a daily log entry. User ownership is verified before deletion.

#### Query Parameters
- **id** (required): ID of the log to delete

#### Request Example
```bash
DELETE /api/daily-logs?id=123
```

#### Response (Success)
```json
HTTP 200 OK
{
  "success": true
}
```

#### Response (Log Not Found)
```json
HTTP 404 Not Found
{
  "error": "Log not found"
}
```

#### Response (Unauthorized)
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
  "error": "Log ID is required"
}
```

## Data Model

### Daily Log Schema
```typescript
interface DailyLog {
  id: number;
  userId: number;
  date: Date;
  
  // Morning Check-in (7-9am)
  sleepHours: number;
  sleepQuality: number;
  dreams: string;
  morningMood: number;
  physicalStatus: string;
  breakfast: string;
  morningCompleted: boolean;
  
  // Medication Log (9-10am)
  medicationTaken: boolean;
  medicationTakenAt: Date | null;
  medicationDose: number;
  ateWithinHour: boolean;
  firstHourFeeling: string;
  reasonForSkipping: string;
  medicationCompleted: boolean;
  
  // Mid-day Check-in (11am-1pm)
  lunch: string;
  focusLevel: number;
  energyLevel: number;
  ruminationLevel: number;
  currentActivity: string;
  distractions: string;
  hadEmotionalEvent: boolean;
  emotionalEvent: string;
  copingStrategies: string;
  middayCompleted: boolean;
  
  // Afternoon Check-in (3-5pm)
  afternoonSnack: string;
  isCrashing: boolean;
  crashSymptoms: string;
  anxietyLevel: number;
  isFeeling: string;
  hadTriggeringInteraction: boolean;
  interactionDetails: string;
  selfWorthTiedToPerformance: string;
  overextended: string;
  afternoonCompleted: boolean;
  
  // Evening Reflection (8-10pm)
  dinner: string;
  overallMood: number;
  sleepiness: number;
  medicationEffectiveness: string;
  helpfulFactors: string;
  distractingFactors: string;
  thoughtForTomorrow: string;
  metPhysicalActivityGoals: boolean;
  metDietaryGoals: boolean;
  neverFeltIsolated: boolean;
  eveningCompleted: boolean;
  
  // Overall Assessment
  isComplete: boolean;
  dayRating: number | null;
  accomplishments: string | null;
  challenges: string | null;
  gratitude: string | null;
  improvements: string | null;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

## Rating Scales

### Numerical Ratings (0-10 scale)
- **0**: Extremely poor/low/negative
- **1-2**: Very poor/low
- **3-4**: Poor/below average
- **5**: Average/neutral
- **6-7**: Good/above average
- **8-9**: Very good/high
- **10**: Excellent/perfect/maximum

### Applied Rating Fields
- **sleepQuality**: Sleep quality assessment (0-10)
- **morningMood**: Morning mood state (0-10)
- **focusLevel**: Ability to concentrate and focus (0-10)
- **energyLevel**: Physical and mental energy (0-10)
- **ruminationLevel**: Overthinking/rumination intensity (0-10)
- **anxietyLevel**: Anxiety intensity (0-10)
- **overallMood**: End-of-day mood assessment (0-10)
- **sleepiness**: Current sleepiness level (0-10)
- **dayRating**: Overall day quality rating (0-10)

## Usage Patterns

### Progressive Data Entry
Daily logs are designed to be filled progressively throughout the day:
1. Morning check-in after waking up
2. Medication log after taking medication
3. Mid-day check-in during lunch period
4. Afternoon check-in during afternoon period
5. Evening reflection before bed

### Partial Updates
- Users can update individual sections independently
- Completion flags track which sections are finished
- `isComplete` indicates entire log is finished
- Partial data is preserved and can be extended later

### Data Analysis Support
The structured data supports various analysis patterns:
- Trend analysis across date ranges
- Correlation analysis between fields
- Pattern recognition for triggers and improvements
- Weekly and monthly aggregation

## Business Rules

### Unique Date Constraint
- Only one daily log per user per date
- Duplicate date creation returns 400 error
- Updates to existing dates are supported via PUT

### User Data Isolation
- All logs are scoped to authenticated user
- Cross-user access is prevented
- Ownership validation on all operations

### Date Handling
- Dates are stored as full DateTime objects
- Date comparisons handle timezone considerations
- Query date parameters accept YYYY-MM-DD format
- Date ranges are inclusive of start and end dates

## Error Handling

### Common Error Scenarios

#### Authentication Required
```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

#### Invalid Date Format
```json
HTTP 400 Bad Request
{
  "error": "Invalid date format"
}
```

#### Duplicate Date Entry
```json
HTTP 400 Bad Request
{
  "error": "A log already exists for this date"
}
```

#### Resource Not Found
```json
HTTP 404 Not Found
{
  "error": "Log not found"
}
```

#### Server Error
```json
HTTP 500 Internal Server Error
{
  "error": "Failed to create daily log"
}
```

## Integration Points

### AI Insights Generation
Daily log data serves as input for AI-powered insights:
- Pattern recognition across multiple days
- Correlation analysis between different metrics
- Personalized recommendations based on trends
- Weekly summary generation

### Weekly Reflections
Daily logs aggregate into weekly reflection data:
- Average ratings and trends
- Notable events and patterns
- Progress toward goals
- Areas for improvement

### Data Export
Daily logs support data export for:
- Personal health tracking
- Healthcare provider sharing
- Long-term trend analysis
- Data portability

## Performance Considerations

### Database Optimization
- Indexed queries by userId and date
- Efficient date range queries
- Optimized for frequent reads and updates
- Pagination support for large datasets

### API Response Optimization
- Minimal data transfer for list views
- Full data only when requested
- Efficient JSON serialization
- Proper HTTP caching headers

## Security Considerations

### Data Privacy
- User data isolation enforced at API level
- No cross-user data access possible
- Sensitive health data protection
- Audit logging for data access

### Input Validation
- All input fields validated for type and format
- SQL injection prevention via Prisma ORM
- XSS prevention in string fields
- Rate limiting considerations

## Testing Examples

### Create Daily Log
```bash
curl -X POST http://localhost:3000/api/daily-logs \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{
    "date": "2025-07-06",
    "sleepHours": 7.5,
    "sleepQuality": 8,
    "morningMood": 7,
    "medicationTaken": true,
    "medicationDose": 18,
    "focusLevel": 8,
    "energyLevel": 7,
    "overallMood": 8,
    "dayRating": 8
  }'
```

### Get Daily Logs with Date Filter
```bash
curl -X GET "http://localhost:3000/api/daily-logs?date=2025-07-06" \
  -H "Cookie: next-auth.session-token=your-token"
```

### Update Daily Log
```bash
curl -X PUT http://localhost:3000/api/daily-logs \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{
    "id": 123,
    "overallMood": 9,
    "dayRating": 9,
    "isComplete": true
  }'
```

### Delete Daily Log
```bash
curl -X DELETE "http://localhost:3000/api/daily-logs?id=123" \
  -H "Cookie: next-auth.session-token=your-token"
```

## Related Documents
- [API Overview](01-overview.md)
- [Authentication API](02-authentication.md)
- [Weekly Reflections API](05-weekly-reflections.md)
- [AI Insights API](06-insights.md)
- [Database Schema](../02-architecture/04-database.md)

## Changelog
- 2025-07-06: Initial daily logs API documentation created
