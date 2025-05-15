import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';

/**
 * POST /api/daily-logs
 * Creates a new daily log
 */
export async function POST(request: Request) {
  try {
    // Get the authenticated user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const data = await request.json();
    
    // Validate required fields
    if (!data.date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }
    
    // Check if a log already exists for this date
    const existingLog = await prisma.dailyLog.findFirst({
      where: {
        userId,
        date: new Date(data.date)
      }
    });
    
    if (existingLog) {
      return NextResponse.json(
        { error: 'A log already exists for this date' },
        { status: 400 }
      );
    }
    
    // Create the daily log
    const dailyLog = await prisma.dailyLog.create({
      data: {
        userId,
        date: new Date(data.date),
        sleepHours: data.sleepHours || 0,
        sleepQuality: data.sleepQuality || 0,
        dreams: data.dreams || '',
        morningMood: data.morningMood || 0,
        physicalStatus: data.physicalStatus || '',
        medicationTakenAt: data.medicationTakenAt || '',
        medicationDose: data.medicationDose || 0,
        ateWithinHour: data.ateWithinHour || false,
        firstHourFeeling: data.firstHourFeeling || '',
        focusLevel: data.focusLevel || 0,
        energyLevel: data.energyLevel || 0,
        ruminationLevel: data.ruminationLevel || 0,
        mainTrigger: data.mainTrigger || '',
        responseMethod: data.responseMethod || [],
        hadTriggeringInteraction: data.hadTriggeringInteraction || false,
        interactionDetails: data.interactionDetails || '',
        selfWorthTiedToPerformance: data.selfWorthTiedToPerformance || '',
        overextended: data.overextended || '',
        overallMood: data.overallMood || 0,
        medicationEffectiveness: data.medicationEffectiveness || '',
        helpfulFactors: data.helpfulFactors || '',
        distractingFactors: data.distractingFactors || '',
        thoughtForTomorrow: data.thoughtForTomorrow || '',
        isComplete: data.isComplete || false,
        dayRating: data.dayRating,
        accomplishments: data.accomplishments,
        challenges: data.challenges,
        gratitude: data.gratitude,
        improvements: data.improvements
      }
    });
    
    return NextResponse.json(dailyLog, { status: 201 });
  } catch (error) {
    console.error('Error creating daily log:', error);
    return NextResponse.json(
      { error: 'Failed to create daily log' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/daily-logs
 * Returns all daily logs for the authenticated user
 * Can filter by date using query parameters
 */
export async function GET(request: Request) {
  try {
    // Get the authenticated user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let dailyLogs;
    
    if (date) {
      // Get log for a specific date
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      dailyLogs = await prisma.dailyLog.findMany({
        where: {
          userId,
          date: {
            gte: targetDate,
            lt: nextDate
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
    } else if (startDate && endDate) {
      // Get logs for a date range
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      dailyLogs = await prisma.dailyLog.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lte: end
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
    } else {
      // Get all logs
      dailyLogs = await prisma.dailyLog.findMany({
        where: {
          userId
        },
        orderBy: {
          date: 'desc'
        }
      });
    }
    
    return NextResponse.json(dailyLogs);
  } catch (error) {
    console.error('Error fetching daily logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily logs' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/daily-logs/:id
 * Updates a daily log
 */
export async function PUT(request: Request) {
  try {
    // Get the authenticated user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the log exists and belongs to the user
    const existingLog = await prisma.dailyLog.findUnique({
      where: {
        id: data.id
      }
    });
    
    if (!existingLog) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }
    
    if (existingLog.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Update the log
    const updatedLog = await prisma.dailyLog.update({
      where: {
        id: data.id
      },
      data: {
        sleepHours: data.sleepHours !== undefined ? data.sleepHours : existingLog.sleepHours,
        sleepQuality: data.sleepQuality !== undefined ? data.sleepQuality : existingLog.sleepQuality,
        dreams: data.dreams !== undefined ? data.dreams : existingLog.dreams,
        morningMood: data.morningMood !== undefined ? data.morningMood : existingLog.morningMood,
        physicalStatus: data.physicalStatus !== undefined ? data.physicalStatus : existingLog.physicalStatus,
        medicationTakenAt: data.medicationTakenAt !== undefined ? data.medicationTakenAt : existingLog.medicationTakenAt,
        medicationDose: data.medicationDose !== undefined ? data.medicationDose : existingLog.medicationDose,
        ateWithinHour: data.ateWithinHour !== undefined ? data.ateWithinHour : existingLog.ateWithinHour,
        firstHourFeeling: data.firstHourFeeling !== undefined ? data.firstHourFeeling : existingLog.firstHourFeeling,
        focusLevel: data.focusLevel !== undefined ? data.focusLevel : existingLog.focusLevel,
        energyLevel: data.energyLevel !== undefined ? data.energyLevel : existingLog.energyLevel,
        ruminationLevel: data.ruminationLevel !== undefined ? data.ruminationLevel : existingLog.ruminationLevel,
        mainTrigger: data.mainTrigger !== undefined ? data.mainTrigger : existingLog.mainTrigger,
        responseMethod: data.responseMethod !== undefined ? data.responseMethod : existingLog.responseMethod,
        hadTriggeringInteraction: data.hadTriggeringInteraction !== undefined ? data.hadTriggeringInteraction : existingLog.hadTriggeringInteraction,
        interactionDetails: data.interactionDetails !== undefined ? data.interactionDetails : existingLog.interactionDetails,
        selfWorthTiedToPerformance: data.selfWorthTiedToPerformance !== undefined ? data.selfWorthTiedToPerformance : existingLog.selfWorthTiedToPerformance,
        overextended: data.overextended !== undefined ? data.overextended : existingLog.overextended,
        overallMood: data.overallMood !== undefined ? data.overallMood : existingLog.overallMood,
        medicationEffectiveness: data.medicationEffectiveness !== undefined ? data.medicationEffectiveness : existingLog.medicationEffectiveness,
        helpfulFactors: data.helpfulFactors !== undefined ? data.helpfulFactors : existingLog.helpfulFactors,
        distractingFactors: data.distractingFactors !== undefined ? data.distractingFactors : existingLog.distractingFactors,
        thoughtForTomorrow: data.thoughtForTomorrow !== undefined ? data.thoughtForTomorrow : existingLog.thoughtForTomorrow,
        isComplete: data.isComplete !== undefined ? data.isComplete : existingLog.isComplete,
        dayRating: data.dayRating !== undefined ? data.dayRating : existingLog.dayRating,
        accomplishments: data.accomplishments !== undefined ? data.accomplishments : existingLog.accomplishments,
        challenges: data.challenges !== undefined ? data.challenges : existingLog.challenges,
        gratitude: data.gratitude !== undefined ? data.gratitude : existingLog.gratitude,
        improvements: data.improvements !== undefined ? data.improvements : existingLog.improvements
      }
    });
    
    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error('Error updating daily log:', error);
    return NextResponse.json(
      { error: 'Failed to update daily log' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/daily-logs/:id
 * Deletes a daily log
 */
export async function DELETE(request: Request) {
  try {
    // Get the authenticated user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the log exists and belongs to the user
    const existingLog = await prisma.dailyLog.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!existingLog) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }
    
    if (existingLog.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Delete the log
    await prisma.dailyLog.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting daily log:', error);
    return NextResponse.json(
      { error: 'Failed to delete daily log' },
      { status: 500 }
    );
  }
}
