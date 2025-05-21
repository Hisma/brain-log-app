# AI Insights Implementation Plan

## Overview

The AI Insights feature analyzes daily log data to provide personalized observations, patterns, and recommendations to users. It leverages OpenAI's GPT-4 model to generate meaningful insights based on the user's daily logs.

## Database Schema

The `Insight` model has been added to the Prisma schema with the following fields:

```prisma
model Insight {
  id              Int      @id @default(autoincrement())
  userId          Int
  dailyLogId      Int
  insightText     String   @db.Text
  createdAt       DateTime @default(now())
  
  // Relationships
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  dailyLog        DailyLog @relation(fields: [dailyLogId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([dailyLogId])
  @@unique([userId, dailyLogId])
}
```

## Components

1. **OpenAI Service**
   - `generateInsights(dailyLogId)`: Generates insights for a specific daily log
   - `getInsights(dailyLogId)`: Gets existing insights or generates new ones
   - `getUserInsights(userId)`: Gets all insights for a user

2. **API Routes**
   - `GET /api/insights`: Gets insights for a user or specific daily log
   - `POST /api/insights`: Generates and stores insights for a daily log

3. **UI Components**
   - `daily-insight-card.tsx`: Displays insights for a specific daily log
   - `insight-button.tsx`: Button to navigate to the insights page from a daily log

4. **Pages**
   - `/insights`: Main page for viewing and generating insights

## Implementation Steps

1. ✅ Update Prisma schema to include the Insight model
2. ✅ Create OpenAI service functions for generating and retrieving insights
3. ✅ Implement API routes for insights
4. ✅ Create UI components for displaying insights
5. ✅ Implement insights page
6. ✅ Add navigation to insights from daily logs
7. ✅ Update dashboard to include insights link

## Prompt Design

The prompt for generating insights is designed to:

1. Analyze sleep patterns and their impact on mood and productivity
2. Identify connections between medication timing/dosage and focus/energy levels
3. Recognize emotional triggers and effective coping strategies
4. Provide personalized recommendations based on the user's specific challenges
5. Highlight positive patterns and achievements

## Future Enhancements

1. **Trend Analysis**: Analyze multiple daily logs to identify long-term patterns
2. **Comparative Insights**: Compare current logs with historical data
3. **Customized Recommendations**: Allow users to rate insights and improve recommendations over time
4. **Visualization**: Add charts and graphs to visualize patterns identified in insights
5. **Notification System**: Alert users when new insights are available
