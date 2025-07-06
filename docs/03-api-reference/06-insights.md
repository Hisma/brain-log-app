---
title: AI Insights API
description: AI-powered analysis and insights generation endpoints
created: 2025-07-06
updated: 2025-07-06
version: 1.0.0
status: final
---

# AI Insights API

## Overview

The AI Insights API provides AI-powered analysis and insights generation for both daily logs and weekly reflections. This system uses OpenAI's language models to analyze user data and generate personalized insights, patterns, and recommendations.

## Insight Types

The API supports two types of insights:

1. **Daily Insights**: Generated from individual daily log entries
2. **Weekly Insights**: Generated from weekly reflection data and aggregated daily patterns

## Endpoints

### Daily Insights

#### Get Daily Insights

**Endpoint**: `/api/insights`  
**Method**: GET  
**Authentication**: Required  
**Runtime**: Node.js  

##### Description
Retrieves AI-generated insights for a specific daily log or all insights for the authenticated user.

##### Query Parameters
- **dailyLogId** (optional): Specific daily log ID to get insights for

##### Query Examples
```bash
# Get all insights for user
GET /api/insights

# Get insights for specific daily log
GET /api/insights?dailyLogId=123
```

##### Response (Specific Daily Log)
```json
HTTP 200 OK
{
  "insightText": "Based on your daily log, here are some key observations:\n\n1. **Sleep Quality Impact**: Your 8/10 sleep quality score correlates well with your high morning mood (7/10) and sustained energy levels throughout the day.\n\n2. **Medication Effectiveness**: Taking your 18mg dose at 9:15 AM with food appears optimal, as evidenced by your strong focus levels (8/10) during mid-day.\n\n3. **Energy Pattern**: Your energy remained stable (7/10) through midday, with no significant crash symptoms reported in the afternoon - this suggests good medication timing.\n\n4. **Recommendations**:\n   - Continue your current sleep schedule as it's supporting good daily outcomes\n   - Maintain the morning medication routine with food\n   - Consider light afternoon exercise to address the slight energy dip you mentioned"
}
```

##### Response (All User Insights)
```json
HTTP 200 OK
{
  "insights": [
    {
      "id": 45,
      "dailyLogId": 123,
      "userId": 456,
      "insightText": "Your daily patterns show strong correlation between sleep quality and overall day performance...",
      "createdAt": "2025-07-06T14:30:00.000Z",
      "updatedAt": "2025-07-06T14:30:00.000Z"
    },
    {
      "id": 44,
      "dailyLogId": 122,
      "userId": 456,
      "insightText": "Today's data suggests that your medication timing optimization is working well...",
      "createdAt": "2025-07-05T14:30:00.000Z",
      "updatedAt": "2025-07-05T14:30:00.000Z"
    }
  ]
}
```

##### Response (Daily Log Not Found)
```json
HTTP 404 Not Found
{
  "error": "Daily log not found"
}
```

##### Response (Unauthorized)
```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

#### Generate Daily Insights

**Endpoint**: `/api/insights`  
**Method**: POST  
**Authentication**: Required  
**Runtime**: Node.js  

##### Description
Generates new AI insights for a specific daily log using OpenAI's language models.

##### Request Body
```json
{
  "dailyLogId": 123
}
```

##### Request Fields
- **dailyLogId** (required): ID of the daily log to generate insights for

##### Validation
- Daily log must exist and belong to authenticated user
- User ownership verified before processing
- OpenAI API integration for insight generation

##### Response (Success)
```json
HTTP 200 OK
{
  "insightText": "Based on your daily log analysis:\n\n**Positive Patterns:**\n- Excellent sleep quality (8/10) leading to strong morning mood\n- Consistent medication timing with optimal food intake\n- Sustained focus and energy levels throughout the day\n\n**Areas of Attention:**\n- Minor afternoon energy dip noted\n- Consider timing of afternoon snack for sustained energy\n\n**Recommendations:**\n- Maintain current sleep schedule (working well)\n- Consider light physical activity in early afternoon\n- Continue current medication timing - showing good effectiveness\n\n**Tomorrow's Focus:**\n- Monitor if afternoon energy patterns persist\n- Experiment with protein-rich afternoon snack timing"
}
```

##### Response (Daily Log Not Found)
```json
HTTP 404 Not Found
{
  "error": "Daily log not found"
}
```

##### Response (Missing Daily Log ID)
```json
HTTP 400 Bad Request
{
  "error": "Daily log ID is required"
}
```

##### Response (Unauthorized Access)
```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

### Weekly Insights

#### Get Weekly Insights

**Endpoint**: `/api/weekly-insights`  
**Method**: GET  
**Authentication**: Required  
**Runtime**: Node.js  

##### Description
Retrieves AI-generated insights for a specific weekly reflection or all weekly insights for the authenticated user.

##### Query Parameters
- **weeklyReflectionId** (optional): Specific weekly reflection ID to get insights for

##### Query Examples
```bash
# Get all weekly insights for user
GET /api/weekly-insights

# Get insights for specific weekly reflection
GET /api/weekly-insights?weeklyReflectionId=45
```

##### Response (Specific Weekly Reflection)
```json
HTTP 200 OK
{
  "insightText": "## Weekly Analysis Summary\n\n### Overall Performance\nYour week rating of 8/10 reflects a highly productive and positive period. This aligns with your reported mental state of being 'positive and productive.'\n\n### Key Strengths This Week\n- **Physical Activity**: 4 gym days shows excellent commitment to health goals\n- **Diet Quality**: 7/10 diet rating indicates good nutritional choices\n- **Family Balance**: Meaningful family activities including hiking and board games\n- **Professional Progress**: Major project milestone completion\n\n### Pattern Analysis\n- Strong correlation between physical activity and mental well-being\n- Effective work-life balance management\n- Consistent self-care routines supporting overall success\n\n### Recommendations for Next Week\n1. **Maintain Momentum**: Current routines are working well\n2. **Energy Management**: Address slight afternoon fatigue with strategic breaks\n3. **Goal Consistency**: Continue 4+ gym days target\n4. **Family Time**: Sustain quality family activities as stress buffer\n\n### Focus Areas\nBased on your 'Focus on maintaining exercise routine' goal, prioritize consistency over intensity in physical activities."
}
```

##### Response (All User Weekly Insights)
```json
HTTP 200 OK
{
  "weeklyInsights": [
    {
      "id": 12,
      "weeklyReflectionId": 45,
      "userId": 123,
      "insightText": "This week shows strong patterns of productivity and well-being...",
      "createdAt": "2025-07-08T10:30:00.000Z",
      "updatedAt": "2025-07-08T10:30:00.000Z"
    },
    {
      "id": 11,
      "weeklyReflectionId": 44,
      "userId": 123,
      "insightText": "Previous week analysis reveals growing trend of improvement...",
      "createdAt": "2025-07-01T10:30:00.000Z",
      "updatedAt": "2025-07-01T10:30:00.000Z"
    }
  ]
}
```

##### Response (Weekly Reflection Not Found)
```json
HTTP 404 Not Found
{
  "error": "Weekly reflection not found or unauthorized"
}
```

#### Generate Weekly Insights

**Endpoint**: `/api/weekly-insights`  
**Method**: POST  
**Authentication**: Required  
**Runtime**: Node.js  

##### Description
Generates new AI insights for a specific weekly reflection using comprehensive analysis of weekly patterns and daily log data.

##### Request Body
```json
{
  "weeklyReflectionId": 45
}
```

##### Request Fields
- **weeklyReflectionId** (required): ID of the weekly reflection to generate insights for

##### Validation
- Weekly reflection must exist and belong to authenticated user
- User ownership verified before processing
- Comprehensive data analysis including related daily logs

##### Response (Success)
```json
HTTP 200 OK
{
  "insightText": "## Comprehensive Weekly Analysis\n\n### Week Overview (July 1-7, 2025)\nThis week demonstrates exceptional balance and productivity with an 8/10 overall rating.\n\n### Detailed Pattern Analysis\n\n**Physical Health Metrics:**\n- Gym attendance: 4/7 days (Excellent consistency)\n- Diet quality: 7/10 (Strong adherence to nutritional goals)\n- Energy patterns: Stable with minor afternoon fluctuations\n\n**Mental & Emotional Well-being:**\n- Mental state: Positive and productive throughout week\n- Stress management: Effective use of family time and exercise\n- Work satisfaction: High, with major milestone completion\n\n**Key Success Factors:**\n1. **Routine Consistency**: Medication timing and sleep schedule optimization\n2. **Active Recovery**: Family activities providing mental restoration\n3. **Goal Achievement**: Professional progress maintaining motivation\n4. **Physical Foundation**: Regular exercise supporting mental clarity\n\n### Comparative Analysis\n*Compared to previous weeks, this represents your strongest performance in:*\n- Work-life balance integration\n- Consistent physical activity\n- Family engagement quality\n\n### Strategic Recommendations\n\n**Continue These Practices:**\n- 4+ gym days per week (sweet spot identified)\n- Weekend family adventure activities\n- Current medication and sleep routine\n\n**Areas for Optimization:**\n- Afternoon energy management (consider 2-3pm movement break)\n- Weekday family time integration\n- Proactive stress prevention during busy periods\n\n### Next Week Focus Areas\n1. **Routine Maintenance**: Sustain current successful patterns\n2. **Energy Optimization**: Experiment with afternoon activity timing\n3. **Continued Growth**: Build on project success momentum\n\n### Long-term Trend Notes\nThis week's data contributes to a positive trajectory in overall life satisfaction and health management. Consider this week's approach as a template for future planning."
}
```

##### Response (Weekly Reflection Not Found)
```json
HTTP 404 Not Found
{
  "error": "Weekly reflection not found or unauthorized"
}
```

##### Response (Missing Weekly Reflection ID)
```json
HTTP 400 Bad Request
{
  "error": "Weekly reflection ID is required"
}
```

##### Response (Unauthorized Access)
```json
HTTP 401 Unauthorized
{
  "error": "Unauthorized"
}
```

## AI Analysis Framework

### Daily Log Analysis Components

#### Data Points Analyzed
- **Sleep Patterns**: Hours, quality, and impact on daily performance
- **Medication Effectiveness**: Timing, dosage, and resulting focus/energy levels
- **Mood Tracking**: Morning mood, overall mood, and emotional events
- **Energy Patterns**: Energy levels throughout the day and crash symptoms
- **Physical Health**: Diet quality, exercise, and physical status
- **Productivity Metrics**: Focus levels, distractions, and accomplishments

#### Insight Categories
1. **Pattern Recognition**: Identification of recurring patterns and correlations
2. **Optimization Suggestions**: Recommendations for improving daily routines
3. **Trend Analysis**: Comparison with previous days and overall trajectory
4. **Health Correlations**: Connections between different health metrics
5. **Predictive Insights**: Anticipation of potential issues or opportunities

### Weekly Reflection Analysis Components

#### Comprehensive Data Integration
- **Daily Log Aggregation**: Analysis of all daily logs within the week
- **Reflection Content**: User-provided highlights, challenges, and learnings
- **Goal Progress**: Assessment of physical activity, diet, and life goals
- **Longitudinal Patterns**: Comparison with previous weeks and months

#### Advanced Analysis Features
1. **Multi-dimensional Assessment**: Holistic view across all life areas
2. **Success Factor Identification**: What contributed to positive outcomes
3. **Challenge Analysis**: Understanding and addressing difficult periods
4. **Strategic Planning**: Actionable recommendations for future weeks
5. **Trend Extrapolation**: Long-term pattern recognition and forecasting

## AI Model Integration

### OpenAI Service Architecture
The insights are generated through a specialized OpenAI service layer that:

- **Contextualizes Data**: Formats user data into meaningful prompts
- **Applies Health Knowledge**: Uses health and wellness best practices
- **Personalizes Analysis**: Tailors insights to individual patterns
- **Ensures Privacy**: Processes data securely without permanent storage
- **Optimizes Output**: Structures insights for actionability

### Prompt Engineering
The AI prompts are designed to:
- Analyze data objectively and comprehensively
- Provide specific, actionable recommendations
- Maintain empathetic and supportive tone
- Focus on pattern recognition and optimization
- Respect user privacy and data sensitivity

## Data Model

### Daily Insight Schema
```typescript
interface DailyInsight {
  id: number;
  dailyLogId: number;
  userId: number;
  insightText: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Weekly Insight Schema
```typescript
interface WeeklyInsight {
  id: number;
  weeklyReflectionId: number;
  userId: number;
  insightText: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Business Rules

### Data Privacy
- All insights are generated in real-time
- User data never leaves the secure processing environment
- Insights are stored locally and scoped to the user
- No cross-user data analysis or comparison

### Access Control
- Insights can only be generated for user's own data
- Ownership validation occurs before any processing
- Authentication required for all insight operations

### Rate Limiting
- AI generation requests may be rate-limited to manage costs
- Caching mechanisms reduce duplicate processing
- Batch processing optimizes API usage

## Error Handling

### Common Error Scenarios

#### AI Service Unavailable
```json
HTTP 503 Service Unavailable
{
  "error": "AI insights service temporarily unavailable"
}
```

#### Insufficient Data
```json
HTTP 400 Bad Request
{
  "error": "Insufficient data for insight generation"
}
```

#### Rate Limit Exceeded
```json
HTTP 429 Too Many Requests
{
  "error": "Rate limit exceeded, please try again later"
}
```

#### Processing Error
```json
HTTP 500 Internal Server Error
{
  "error": "Failed to generate insights"
}
```

## Performance Considerations

### AI Processing Optimization
- Intelligent caching reduces redundant API calls
- Batch processing for multiple insights
- Asynchronous generation for better user experience
- Optimized prompts minimize token usage

### Response Time Management
- Streaming responses for long insights
- Progress indicators for generation status
- Fallback mechanisms for service disruptions
- Client-side caching of generated insights

## Security Considerations

### Data Protection
- End-to-end encryption for AI processing
- No persistent storage of sensitive data in AI services
- Secure API key management for OpenAI integration
- Audit logging for all AI operations

### Content Safety
- Content filtering for appropriate insights
- Bias detection and mitigation in AI responses
- Medical disclaimer inclusion where appropriate
- Privacy-preserving analysis techniques

## Testing Examples

### Generate Daily Insight
```bash
curl -X POST http://localhost:3000/api/insights \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{
    "dailyLogId": 123
  }'
```

### Get Daily Insight for Specific Log
```bash
curl -X GET "http://localhost:3000/api/insights?dailyLogId=123" \
  -H "Cookie: next-auth.session-token=your-token"
```

### Generate Weekly Insight
```bash
curl -X POST http://localhost:3000/api/weekly-insights \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-token" \
  -d '{
    "weeklyReflectionId": 45
  }'
```

### Get All Weekly Insights
```bash
curl -X GET http://localhost:3000/api/weekly-insights \
  -H "Cookie: next-auth.session-token=your-token"
```

## Integration Points

### Frontend Integration
- Real-time insight generation from dashboard
- Progressive loading for long insights
- Insight history and review capabilities
- Export functionality for insights

### Data Pipeline
- Automatic insight suggestions based on data completeness
- Scheduled batch processing for regular insights
- Integration with notification system for new insights
- Analytics tracking for insight usage patterns

## Cost Management

### OpenAI API Optimization
- Token usage monitoring and reporting
- Intelligent prompt optimization
- Caching strategies to reduce API calls
- Rate limiting to control costs

### Usage Analytics
- Track insight generation frequency
- Monitor token consumption patterns
- Analyze user engagement with insights
- Cost per user calculations

## Related Documents
- [API Overview](01-overview.md)
- [Authentication API](02-authentication.md)
- [Daily Logs API](04-daily-logs.md)
- [Weekly Reflections API](05-weekly-reflections.md)
- [AI Insights Implementation Plan](../../brain-log-app/docs/AI-INSIGHTS-IMPLEMENTATION-PLAN.md)

## Changelog
- 2025-07-06: Initial AI insights API documentation created
