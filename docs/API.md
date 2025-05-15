# Brain Log App - API Documentation

This document provides comprehensive documentation for the API endpoints in the Brain Log App.

## API Overview

The Brain Log App uses a RESTful API architecture for communication between the client and server. All API endpoints are located under the `/api` path and are implemented using Next.js API routes.

Key features of the API:

- **Authentication**: All API endpoints are protected with NextAuth.js authentication
- **JSON Format**: All requests and responses use JSON format
- **Error Handling**: Consistent error response format
- **Status Codes**: Standard HTTP status codes are used

## Authentication

All API endpoints require authentication using NextAuth.js. The authentication flow is as follows:

1. User logs in using the `/api/auth/signin` endpoint
2. NextAuth.js creates a session and sets cookies
3. Subsequent API requests include these cookies for authentication
4. API routes verify the session using `getServerSession()`

## API Endpoints

### User Management

#### Get User

```
GET /api/users/:id
```

Retrieves a user by ID.

**Response**:
```json
{
  "id": 1,
  "username": "johndoe",
  "displayName": "John Doe",
  "theme": "dark",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastLogin": "2025-05-15T12:00:00.000Z"
}
```

#### Update User Profile

```
PATCH /api/users/:id
```

Updates a user's profile information.

**Request Body**:
```json
{
  "displayName": "John Smith",
  "theme": "light"
}
```

**Response**:
```json
{
  "id": 1,
  "username": "johndoe",
  "displayName": "John Smith",
  "theme": "light",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastLogin": "2025-05-15T12:00:00.000Z"
}
```

#### Update User Password

```
PATCH /api/users/:id
```

Updates a user's password.

**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response**:
```json
{
  "id": 1,
  "username": "johndoe",
  "displayName": "John Doe",
  "theme": "dark",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastLogin": "2025-05-15T12:00:00.000Z"
}
```

### Daily Logs

#### Create Daily Log

```
POST /api/daily-logs
```

Creates a new daily log.

**Request Body**:
```json
{
  "date": "2025-05-15T00:00:00.000Z",
  "sleepHours": 7.5,
  "sleepQuality": 8,
  "dreams": "Vivid dreams about flying",
  "morningMood": 7,
  "physicalStatus": "Slight headache",
  "medicationTakenAt": "08:00",
  "medicationDose": 18,
  "ateWithinHour": true,
  "firstHourFeeling": "Clear"
}
```

**Response**:
```json
{
  "id": 1,
  "userId": 1,
  "date": "2025-05-15T00:00:00.000Z",
  "sleepHours": 7.5,
  "sleepQuality": 8,
  "dreams": "Vivid dreams about flying",
  "morningMood": 7,
  "physicalStatus": "Slight headache",
  "medicationTakenAt": "08:00",
  "medicationDose": 18,
  "ateWithinHour": true,
  "firstHourFeeling": "Clear",
  "focusLevel": 0,
  "energyLevel": 0,
  "ruminationLevel": 0,
  "mainTrigger": "",
  "responseMethod": [],
  "hadTriggeringInteraction": false,
  "interactionDetails": "",
  "selfWorthTiedToPerformance": "",
  "overextended": "",
  "overallMood": 0,
  "medicationEffectiveness": "",
  "helpfulFactors": "",
  "distractingFactors": "",
  "thoughtForTomorrow": "",
  "isComplete": false
}
```

#### Get Daily Logs

```
GET /api/daily-logs
```

Retrieves all daily logs for the authenticated user.

**Query Parameters**:
- `date`: (optional) Filter by specific date
- `startDate`: (optional) Filter by start date
- `endDate`: (optional) Filter by end date

**Response**:
```json
[
  {
    "id": 1,
    "userId": 1,
    "date": "2025-05-15T00:00:00.000Z",
    "sleepHours": 7.5,
    "sleepQuality": 8,
    "dreams": "Vivid dreams about flying",
    "morningMood": 7,
    "physicalStatus": "Slight headache",
    "medicationTakenAt": "08:00",
    "medicationDose": 18,
    "ateWithinHour": true,
    "firstHourFeeling": "Clear",
    "focusLevel": 6,
    "energyLevel": 7,
    "ruminationLevel": 3,
    "mainTrigger": "Work deadline",
    "responseMethod": ["Redirected attention", "Journaled"],
    "hadTriggeringInteraction": false,
    "interactionDetails": "",
    "selfWorthTiedToPerformance": "Mildly",
    "overextended": "No",
    "overallMood": 7,
    "medicationEffectiveness": "Yes",
    "helpfulFactors": "Regular breaks, deep breathing",
    "distractingFactors": "Social media",
    "thoughtForTomorrow": "Start with the most important task",
    "isComplete": true
  }
]
```

#### Update Daily Log

```
PUT /api/daily-logs
```

Updates an existing daily log.

**Request Body**:
```json
{
  "id": 1,
  "focusLevel": 6,
  "energyLevel": 7,
  "ruminationLevel": 3,
  "mainTrigger": "Work deadline",
  "responseMethod": ["Redirected attention", "Journaled"]
}
```

**Response**:
```json
{
  "id": 1,
  "userId": 1,
  "date": "2025-05-15T00:00:00.000Z",
  "sleepHours": 7.5,
  "sleepQuality": 8,
  "dreams": "Vivid dreams about flying",
  "morningMood": 7,
  "physicalStatus": "Slight headache",
  "medicationTakenAt": "08:00",
  "medicationDose": 18,
  "ateWithinHour": true,
  "firstHourFeeling": "Clear",
  "focusLevel": 6,
  "energyLevel": 7,
  "ruminationLevel": 3,
  "mainTrigger": "Work deadline",
  "responseMethod": ["Redirected attention", "Journaled"],
  "hadTriggeringInteraction": false,
  "interactionDetails": "",
  "selfWorthTiedToPerformance": "",
  "overextended": "",
  "overallMood": 0,
  "medicationEffectiveness": "",
  "helpfulFactors": "",
  "distractingFactors": "",
  "thoughtForTomorrow": "",
  "isComplete": false
}
```

#### Delete Daily Log

```
DELETE /api/daily-logs?id=1
```

Deletes a daily log.

**Response**:
```json
{
  "success": true
}
```

### Weekly Reflections

#### Create Weekly Reflection

```
POST /api/weekly-reflections
```

Creates a new weekly reflection.

**Request Body**:
```json
{
  "weekStartDate": "2025-05-09T00:00:00.000Z",
  "weekEndDate": "2025-05-15T23:59:59.999Z",
  "averageRuminationScore": 3.5,
  "stableDaysCount": 5,
  "medicationEffectiveDays": 6,
  "questionedLeavingJob": false,
  "weeklyInsight": "I handle stress better when I exercise regularly",
  "weekRating": 8,
  "mentalState": "Mostly calm with occasional anxiety",
  "physicalState": "Energetic, some tension in shoulders",
  "weekHighlights": "Completed major project, had dinner with friends",
  "weekChallenges": "Difficult meeting on Tuesday, sleep issues on Wednesday",
  "lessonsLearned": "Taking breaks improves my productivity",
  "nextWeekFocus": "Maintain regular exercise routine"
}
```

**Response**:
```json
{
  "id": 1,
  "userId": 1,
  "weekStartDate": "2025-05-09T00:00:00.000Z",
  "weekEndDate": "2025-05-15T23:59:59.999Z",
  "averageRuminationScore": 3.5,
  "stableDaysCount": 5,
  "medicationEffectiveDays": 6,
  "questionedLeavingJob": false,
  "weeklyInsight": "I handle stress better when I exercise regularly",
  "weekRating": 8,
  "mentalState": "Mostly calm with occasional anxiety",
  "physicalState": "Energetic, some tension in shoulders",
  "weekHighlights": "Completed major project, had dinner with friends",
  "weekChallenges": "Difficult meeting on Tuesday, sleep issues on Wednesday",
  "lessonsLearned": "Taking breaks improves my productivity",
  "nextWeekFocus": "Maintain regular exercise routine"
}
```

#### Get Weekly Reflections

```
GET /api/weekly-reflections
```

Retrieves all weekly reflections for the authenticated user.

**Query Parameters**:
- `id`: (optional) Filter by specific ID
- `startDate`: (optional) Filter by start date
- `endDate`: (optional) Filter by end date

**Response**:
```json
[
  {
    "id": 1,
    "userId": 1,
    "weekStartDate": "2025-05-09T00:00:00.000Z",
    "weekEndDate": "2025-05-15T23:59:59.999Z",
    "averageRuminationScore": 3.5,
    "stableDaysCount": 5,
    "medicationEffectiveDays": 6,
    "questionedLeavingJob": false,
    "weeklyInsight": "I handle stress better when I exercise regularly",
    "weekRating": 8,
    "mentalState": "Mostly calm with occasional anxiety",
    "physicalState": "Energetic, some tension in shoulders",
    "weekHighlights": "Completed major project, had dinner with friends",
    "weekChallenges": "Difficult meeting on Tuesday, sleep issues on Wednesday",
    "lessonsLearned": "Taking breaks improves my productivity",
    "nextWeekFocus": "Maintain regular exercise routine"
  }
]
```

#### Update Weekly Reflection

```
PUT /api/weekly-reflections
```

Updates an existing weekly reflection.

**Request Body**:
```json
{
  "id": 1,
  "weeklyInsight": "I handle stress better when I exercise regularly and get enough sleep",
  "nextWeekFocus": "Maintain regular exercise routine and improve sleep hygiene"
}
```

**Response**:
```json
{
  "id": 1,
  "userId": 1,
  "weekStartDate": "2025-05-09T00:00:00.000Z",
  "weekEndDate": "2025-05-15T23:59:59.999Z",
  "averageRuminationScore": 3.5,
  "stableDaysCount": 5,
  "medicationEffectiveDays": 6,
  "questionedLeavingJob": false,
  "weeklyInsight": "I handle stress better when I exercise regularly and get enough sleep",
  "weekRating": 8,
  "mentalState": "Mostly calm with occasional anxiety",
  "physicalState": "Energetic, some tension in shoulders",
  "weekHighlights": "Completed major project, had dinner with friends",
  "weekChallenges": "Difficult meeting on Tuesday, sleep issues on Wednesday",
  "lessonsLearned": "Taking breaks improves my productivity",
  "nextWeekFocus": "Maintain regular exercise routine and improve sleep hygiene"
}
```

#### Delete Weekly Reflection

```
DELETE /api/weekly-reflections?id=1
```

Deletes a weekly reflection.

**Response**:
```json
{
  "success": true
}
```

## Client-Side API Services

The application includes client-side service functions for interacting with the API endpoints:

### API Service

Located in `src/lib/services/api.ts`, this service provides utility functions for making API requests:

- `fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T>`: Base function for making API requests
- `get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T>`: Function for making GET requests
- `post<T>(endpoint: string, data: any): Promise<T>`: Function for making POST requests
- `put<T>(endpoint: string, data: any): Promise<T>`: Function for making PUT requests
- `del<T>(endpoint: string): Promise<T>`: Function for making DELETE requests

### User Service

Located in `src/lib/services/userService.ts`, this service provides functions for user-related operations:

- `getUser(userId: number): Promise<User>`: Get a user by ID
- `updateUserProfile(userId: number, data: { displayName?: string; theme?: string }): Promise<User>`: Update a user's profile
- `updateUserPassword(userId: number, currentPassword: string, newPassword: string): Promise<User>`: Update a user's password

### Daily Log Service

Located in `src/lib/services/dailyLogService.ts`, this service provides functions for daily log operations:

- `createMorningCheckIn(userId: number, data: {...}): Promise<number>`: Create a morning check-in
- `updateMedicationRoutine(userId: number, id: number, data: {...}): Promise<number>`: Update medication routine
- `updateMiddayFocusEmotion(userId: number, id: number, data: {...}): Promise<number>`: Update midday focus and emotion
- `updateAfternoonCheckpoint(userId: number, id: number, data: {...}): Promise<number>`: Update afternoon checkpoint
- `updateEndOfDayReflection(userId: number, id: number, data: {...}): Promise<number>`: Update end of day reflection
- `getDailyLogById(userId: number, id: number): Promise<DailyLog | null>`: Get a daily log by ID
- `getDailyLogByDate(userId: number, date: Date): Promise<DailyLog | null>`: Get a daily log by date
- `getAllDailyLogs(userId: number): Promise<DailyLog[]>`: Get all daily logs
- `getCompletedDailyLogs(userId: number): Promise<DailyLog[]>`: Get completed daily logs
- `deleteDailyLog(userId: number, id: number): Promise<boolean>`: Delete a daily log
- `getRecent(userId: number, limit: number): Promise<DailyLog[]>`: Get recent daily logs

### Weekly Reflection Service

Located in `src/lib/services/weeklyReflectionService.ts`, this service provides functions for weekly reflection operations:

- `createWeeklyReflection(userId: number, data: {...}): Promise<number>`: Create a weekly reflection
- `getWeeklyReflectionById(userId: number, id: number): Promise<WeeklyReflection | null>`: Get a weekly reflection by ID
- `getWeeklyReflectionByDateRange(userId: number, startDate: Date, endDate: Date): Promise<WeeklyReflection | null>`: Get a weekly reflection by date range
- `getAllWeeklyReflections(userId: number): Promise<WeeklyReflection[]>`: Get all weekly reflections
- `updateWeeklyReflection(userId: number, id: number, data: {...}): Promise<number>`: Update a weekly reflection
- `deleteWeeklyReflection(userId: number, id: number): Promise<boolean>`: Delete a weekly reflection
- `getMostRecentWeeklyReflection(userId: number): Promise<WeeklyReflection | null>`: Get the most recent weekly reflection
- `getWeeklyReflectionsForMonth(userId: number, year: number, month: number): Promise<WeeklyReflection[]>`: Get weekly reflections for a month
- `getAverageMentalStateRating(userId: number): Promise<number>`: Get average mental state rating
- `getAverageWeeklyRating(userId: number): Promise<number>`: Get average weekly rating
- `getRecent(userId: number, limit: number): Promise<WeeklyReflection[]>`: Get recent weekly reflections

## Error Handling

All API endpoints use consistent error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

Error responses include a JSON object with an `error` property containing a descriptive message:

```json
{
  "error": "Failed to create daily log"
}
```

## API Security

The API implements several security measures:

1. **Authentication**: All endpoints require authentication
2. **CSRF Protection**: NextAuth.js provides CSRF protection
3. **Input Validation**: All input data is validated before processing
4. **Error Handling**: Error messages don't expose sensitive information
5. **Rate Limiting**: (Planned for future implementation)
