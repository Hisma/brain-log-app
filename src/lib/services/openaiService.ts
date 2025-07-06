import OpenAI from 'openai';
import { DailyLog, WeeklyReflection } from '@prisma/client';
import prisma from '@/lib/prisma';


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Format daily log data into a prompt for the AI for daily insights
 */
const formatPrompt = (dailyLog: DailyLog): string => {
  // Format date
  const date = new Date(dailyLog.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build the prompt
  return `
You are an AI assistant specialized in mental health and ADHD. Analyze the following daily log data for ${date} and provide personalized insights, patterns, and recommendations.

DAILY LOG DATA:

Morning Check-in:
- Sleep hours: ${dailyLog.sleepHours}
- Sleep quality (1-10): ${dailyLog.sleepQuality}
- Dreams: ${dailyLog.dreams || 'None reported'}
- Morning mood (1-10): ${dailyLog.morningMood}
- Physical status: ${dailyLog.physicalStatus || 'Not specified'}
- Breakfast: ${dailyLog.breakfast || 'Not specified'}

Medication (Concerta):
- Medication taken: ${dailyLog.medicationTaken ? 'Yes' : 'No'}
${dailyLog.medicationTaken ? `- Time taken: ${new Date(dailyLog.medicationTakenAt!).toLocaleTimeString()}` : ''}
${dailyLog.medicationTaken ? `- Dose: ${dailyLog.medicationDose}mg` : ''}
${dailyLog.medicationTaken ? `- Ate within hour: ${dailyLog.ateWithinHour ? 'Yes' : 'No'}` : ''}
${dailyLog.medicationTaken ? `- First hour feeling: ${dailyLog.firstHourFeeling || 'Not specified'}` : ''}
${!dailyLog.medicationTaken ? `- Reason for skipping: ${dailyLog.reasonForSkipping || 'Not specified'}` : ''}

Mid-day Check-in:
- Lunch: ${dailyLog.lunch || 'Not specified'}
- Focus level (1-10): ${dailyLog.focusLevel}
- Energy level (1-10): ${dailyLog.energyLevel}
- Rumination level (1-10): ${dailyLog.ruminationLevel}
- Current activity: ${dailyLog.currentActivity || 'Not specified'}
- Distractions: ${dailyLog.distractions || 'None reported'}
${dailyLog.hadEmotionalEvent 
  ? `- Emotional event: ${dailyLog.emotionalEvent || 'Not described'}\n- Coping strategies: ${dailyLog.copingStrategies || 'None reported'}`
  : '- No emotional events reported'}

Afternoon Check-in:
- Afternoon snack: ${dailyLog.afternoonSnack || 'Not specified'}
- Experiencing medication crash: ${dailyLog.isCrashing ? 'Yes' : 'No'}
${dailyLog.isCrashing ? `- Crash symptoms: ${dailyLog.crashSymptoms || 'Not specified'}` : ''}
- Anxiety level (1-10): ${dailyLog.anxietyLevel || 'Not specified'}
- Current feeling: ${dailyLog.isFeeling || 'Not specified'}
- Had triggering interaction: ${dailyLog.hadTriggeringInteraction ? 'Yes' : 'No'}
${dailyLog.hadTriggeringInteraction ? `- Interaction details: ${dailyLog.interactionDetails || 'Not specified'}` : ''}
- Self-worth tied to performance: ${dailyLog.selfWorthTiedToPerformance || 'Not specified'}
- Feeling overextended: ${dailyLog.overextended || 'Not specified'}

Evening Reflection:
- Dinner: ${dailyLog.dinner || 'Not specified'}
- Overall mood (1-10): ${dailyLog.overallMood}
- Sleepiness level (1-10): ${dailyLog.sleepiness || 'Not specified'}
- Medication effectiveness: ${dailyLog.medicationEffectiveness || 'Not specified'}
- Helpful factors: ${dailyLog.helpfulFactors || 'Not specified'}
- Distracting factors: ${dailyLog.distractingFactors || 'Not specified'}
- Thought for tomorrow: ${dailyLog.thoughtForTomorrow || 'Not specified'}

Overall Day:
- Day rating (1-10): ${dailyLog.dayRating || 'Not specified'}
- Accomplishments: ${dailyLog.accomplishments || 'None reported'}
- Challenges: ${dailyLog.challenges || 'None reported'}
- Gratitude: ${dailyLog.gratitude || 'Not specified'}
- Areas for improvement: ${dailyLog.improvements || 'Not specified'}

Based on this information, provide:
1. A summary of patterns and observations
2. Connections between sleep, medication, mood, and productivity
3. Personalized recommendations for improvement
4. Insights about emotional regulation and coping strategies
5. Observations about ADHD symptom management
6. A concise "Action Plan" with 2-3 specific, actionable suggestions based on your analysis

Format your response in clear sections with markdown formatting. Keep your insights concise, empathetic, and actionable. Make sure to include both a comprehensive summary of your analysis and the action plan.
`;
};

/**
 * Generate insights for a daily log
 */
export const generateInsights = async (dailyLogId: number): Promise<string> => {
  try {
    // Fetch the daily log with user information
    const dailyLog = await prisma.dailyLog.findUnique({
      where: { id: dailyLogId },
      include: { user: true },
    });

    if (!dailyLog) {
      throw new Error(`Daily log with ID ${dailyLogId} not found`);
    }

    // Format the prompt
    const prompt = formatPrompt(dailyLog);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "You are a mental health assistant specializing in ADHD, anxiety, and depression. Provide empathetic, insightful analysis of daily logs." },
        { role: "user", content: prompt }
      ]
    });

    // Extract the generated insights
    const insightText = response.choices[0].message.content || "Unable to generate insights.";

    // Delete any existing insights for this daily log
    await prisma.insight.deleteMany({
      where: {
        userId: dailyLog.userId,
        dailyLogId: dailyLog.id,
      },
    });

    // Create a new insight record
    await prisma.insight.create({
      data: {
        userId: dailyLog.userId,
        dailyLogId: dailyLog.id,
        insightText,
      },
    });

    return insightText;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw new Error('Failed to generate insights');
  }
};

/**
 * Get insights for a daily log
 */
export const getInsights = async (dailyLogId: number): Promise<string> => {
  try {
    // Check if insights already exist
    const existingInsight = await prisma.insight.findFirst({
      where: { dailyLogId },
    });

    // If insights exist, return them
    if (existingInsight) {
      return existingInsight.insightText;
    }

    // Otherwise, return empty string - don't auto-generate
    return '';
  } catch (error) {
    console.error('Error getting insights:', error);
    throw new Error('Failed to get insights');
  }
};

/**
 * Get all insights for a user
 */
export const getUserInsights = async (userId: number) => {
  try {
    return await prisma.insight.findMany({
      where: { userId },
      include: {
        dailyLog: {
          select: {
            date: true,
            dayRating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error getting user insights:', error);
    throw new Error('Failed to get user insights');
  }
};

/**
 * Format weekly reflection and daily logs into a prompt for the AI for weekly insights
 */
const formatWeeklyPrompt = async (weeklyReflection: WeeklyReflection): Promise<string> => {
  // Format date range
  const startDate = new Date(weeklyReflection.weekStartDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const endDate = new Date(weeklyReflection.weekEndDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch daily logs for the week
  const dailyLogs = await prisma.dailyLog.findMany({
    where: {
      userId: weeklyReflection.userId,
      date: {
        gte: weeklyReflection.weekStartDate,
        lte: weeklyReflection.weekEndDate,
      },
      isComplete: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  // Build daily logs summary
  let dailyLogsSummary = '';
  if (dailyLogs.length > 0) {
    dailyLogsSummary = `
DAILY LOGS SUMMARY (${dailyLogs.length} logs):

${dailyLogs.map(log => {
  const date = new Date(log.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  
  return `- ${date}:
  * Sleep: ${log.sleepHours} hours, Quality: ${log.sleepQuality}/10
  * Medication taken: ${log.medicationTaken ? 'Yes' : 'No'}
  * Focus level: ${log.focusLevel}/10
  * Energy level: ${log.energyLevel}/10
  * Rumination level: ${log.ruminationLevel}/10
  * Overall mood: ${log.overallMood}/10
  * Day rating: ${log.dayRating || 'Not specified'}/10
  * Met physical activity goals: ${(log as DailyLog & { metPhysicalActivityGoals?: boolean }).metPhysicalActivityGoals ? 'Yes' : 'No'}
  * Met dietary goals: ${(log as DailyLog & { metDietaryGoals?: boolean }).metDietaryGoals ? 'Yes' : 'No'}
  * Never felt excessively isolated: ${(log as DailyLog & { neverFeltIsolated?: boolean }).neverFeltIsolated ? 'Yes' : 'No'}`;
}).join('\n\n')}`;
  } else {
    dailyLogsSummary = "No daily logs were completed during this week.";
  }

  // Build the prompt
  return `
You are an AI assistant specialized in mental health and ADHD. Analyze the following weekly reflection data for the week of ${startDate} to ${endDate} and provide personalized insights, patterns, and recommendations.

WEEKLY REFLECTION DATA:

Week Rating (1-10): ${weeklyReflection.weekRating || 'Not specified'}
Mental State: ${weeklyReflection.mentalState || 'Not specified'}
Week Highlights: ${weeklyReflection.weekHighlights || 'None reported'}
Week Challenges: ${weeklyReflection.weekChallenges || 'None reported'}
Lessons Learned: ${weeklyReflection.lessonsLearned || 'None reported'}
Next Week Focus: ${weeklyReflection.nextWeekFocus || 'Not specified'}
Questioned Leaving Job: ${weeklyReflection.questionedLeavingJob ? 'Yes' : 'No'}
Gym Days This Week: ${(weeklyReflection as WeeklyReflection & { gymDaysCount?: number }).gymDaysCount || 0}/7
Diet Rating (1-10): ${(weeklyReflection as WeeklyReflection & { dietRating?: number }).dietRating || 'Not specified'}
Memorable Family Activities: ${(weeklyReflection as WeeklyReflection & { memorableFamilyActivities?: string }).memorableFamilyActivities || 'None reported'}

${dailyLogsSummary}

Based on this information, provide:
1. A summary of the week's overall patterns and trends
2. Insights about physical health (sleep, exercise, diet) and their impact on mental well-being
3. Observations about work-life balance and stress management
4. Connections between activities, habits, and mood/energy levels
5. Personalized recommendations for the upcoming week
6. Recognition of achievements and progress
7. A concise "Action Plan" with 2-3 specific, actionable suggestions for the coming week

Format your response in clear sections with markdown formatting. Keep your insights concise, empathetic, and actionable. Make sure to include both a comprehensive summary of your analysis and the action plan.
`;
};

/**
 * Generate insights for a weekly reflection
 */
export const generateWeeklyInsights = async (weeklyReflectionId: number): Promise<string> => {
  try {
    // Fetch the weekly reflection with user information
    const weeklyReflection = await prisma.weeklyReflection.findUnique({
      where: { id: weeklyReflectionId },
      include: { user: true },
    });

    if (!weeklyReflection) {
      throw new Error(`Weekly reflection with ID ${weeklyReflectionId} not found`);
    }

    // Format the prompt
    const prompt = await formatWeeklyPrompt(weeklyReflection);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "You are a mental health assistant specializing in ADHD, anxiety, and depression. Provide empathetic, insightful analysis of weekly reflections." },
        { role: "user", content: prompt }
      ]
    });

    // Extract the generated insights
    const insightText = response.choices[0].message.content || "Unable to generate weekly insights.";

    // Delete any existing insights for this weekly reflection
    await prisma.weeklyInsight.deleteMany({
      where: {
        userId: weeklyReflection.userId,
        weeklyReflectionId: weeklyReflection.id,
      },
    });

    // Create a new insight record
    await prisma.weeklyInsight.create({
      data: {
        userId: weeklyReflection.userId,
        weeklyReflectionId: weeklyReflection.id,
        insightText,
      },
    });

    return insightText;
  } catch (error) {
    console.error('Error generating weekly insights:', error);
    throw new Error('Failed to generate weekly insights');
  }
};

/**
 * Get insights for a weekly reflection
 */
export const getWeeklyInsights = async (weeklyReflectionId: number): Promise<string> => {
  try {
    // Check if insights already exist
    const existingInsight = await prisma.weeklyInsight.findFirst({
      where: { weeklyReflectionId },
    });

    // If insights exist, return them
    if (existingInsight) {
      return existingInsight.insightText;
    }

    // Otherwise, return empty string - don't auto-generate
    return '';
  } catch (error) {
    console.error('Error getting weekly insights:', error);
    throw new Error('Failed to get weekly insights');
  }
};

/**
 * Get all weekly insights for a user
 */
export const getUserWeeklyInsights = async (userId: number) => {
  try {
    return await prisma.weeklyInsight.findMany({
      where: { userId },
      include: {
        weeklyReflection: {
          select: {
            weekStartDate: true,
            weekEndDate: true,
            weekRating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Error getting user weekly insights:', error);
    throw new Error('Failed to get user weekly insights');
  }
};
