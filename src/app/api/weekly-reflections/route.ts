import { NextResponse } from 'next/server';
import { auth } from '@auth';
import prisma from '@/lib/prisma';

/**
 * POST /api/weekly-reflections
 * Creates a new weekly reflection
 */
export async function POST(request: Request) {
  try {
    // Get the authenticated user from the session
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const data = await request.json();
    
    // Validate required fields
    if (!data.weekStartDate || !data.weekEndDate) {
      return NextResponse.json(
        { error: 'Week start date and end date are required' },
        { status: 400 }
      );
    }
    
    // Check if a reflection already exists for this week
    const existingReflection = await prisma.weeklyReflection.findFirst({
      where: {
        userId,
        weekStartDate: new Date(data.weekStartDate),
        weekEndDate: new Date(data.weekEndDate)
      }
    });
    
    if (existingReflection) {
      return NextResponse.json(
        { error: 'A reflection already exists for this week' },
        { status: 400 }
      );
    }
    
    // Create the weekly reflection
    const weeklyReflection = await prisma.weeklyReflection.create({
      data: {
        userId,
        weekStartDate: new Date(data.weekStartDate),
        weekEndDate: new Date(data.weekEndDate),
        questionedLeavingJob: data.questionedLeavingJob || false,
        weekRating: data.weekRating,
        mentalState: data.mentalState,
        weekHighlights: data.weekHighlights,
        weekChallenges: data.weekChallenges,
        lessonsLearned: data.lessonsLearned,
        nextWeekFocus: data.nextWeekFocus,
        gymDaysCount: data.gymDaysCount || 0,
        dietRating: data.dietRating || 0,
        memorableFamilyActivities: data.memorableFamilyActivities || ''
      }
    });
    
    return NextResponse.json(weeklyReflection, { status: 201 });
  } catch (error) {
    console.error('Error creating weekly reflection:', error);
    return NextResponse.json(
      { error: 'Failed to create weekly reflection' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/weekly-reflections
 * Returns all weekly reflections for the authenticated user
 * Can filter by date range using query parameters
 */
export async function GET(request: Request) {
  try {
    // Get the authenticated user from the session
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let weeklyReflections;
    
    if (id) {
      // Get a specific reflection by ID
      weeklyReflections = await prisma.weeklyReflection.findUnique({
        where: {
          id: parseInt(id),
          userId
        }
      });
      
      if (!weeklyReflections) {
        return NextResponse.json(
          { error: 'Weekly reflection not found' },
          { status: 404 }
        );
      }
    } else if (startDate && endDate) {
      // Get reflections for a date range
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      weeklyReflections = await prisma.weeklyReflection.findMany({
        where: {
          userId,
          weekStartDate: {
            gte: start
          },
          weekEndDate: {
            lte: end
          }
        },
        orderBy: {
          weekStartDate: 'desc'
        }
      });
    } else {
      // Get all reflections
      weeklyReflections = await prisma.weeklyReflection.findMany({
        where: {
          userId
        },
        orderBy: {
          weekStartDate: 'desc'
        }
      });
    }
    
    return NextResponse.json(weeklyReflections);
  } catch (error) {
    console.error('Error fetching weekly reflections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly reflections' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/weekly-reflections/:id
 * Updates a weekly reflection
 */
export async function PUT(request: Request) {
  try {
    // Get the authenticated user from the session
    const session = await auth();
    
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
        { error: 'Reflection ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the reflection exists and belongs to the user
    const existingReflection = await prisma.weeklyReflection.findUnique({
      where: {
        id: data.id
      }
    });
    
    if (!existingReflection) {
      return NextResponse.json(
        { error: 'Reflection not found' },
        { status: 404 }
      );
    }
    
    if (existingReflection.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Update the reflection
    const updatedReflection = await prisma.weeklyReflection.update({
      where: {
        id: data.id
      },
      data: {
        weekStartDate: data.weekStartDate ? new Date(data.weekStartDate) : existingReflection.weekStartDate,
        weekEndDate: data.weekEndDate ? new Date(data.weekEndDate) : existingReflection.weekEndDate,
        questionedLeavingJob: data.questionedLeavingJob !== undefined ? data.questionedLeavingJob : existingReflection.questionedLeavingJob,
        weekRating: data.weekRating !== undefined ? data.weekRating : existingReflection.weekRating,
        mentalState: data.mentalState !== undefined ? data.mentalState : existingReflection.mentalState,
        weekHighlights: data.weekHighlights !== undefined ? data.weekHighlights : existingReflection.weekHighlights,
        weekChallenges: data.weekChallenges !== undefined ? data.weekChallenges : existingReflection.weekChallenges,
        lessonsLearned: data.lessonsLearned !== undefined ? data.lessonsLearned : existingReflection.lessonsLearned,
        nextWeekFocus: data.nextWeekFocus !== undefined ? data.nextWeekFocus : existingReflection.nextWeekFocus,
        gymDaysCount: data.gymDaysCount !== undefined ? data.gymDaysCount : existingReflection.gymDaysCount,
        dietRating: data.dietRating !== undefined ? data.dietRating : existingReflection.dietRating,
        memorableFamilyActivities: data.memorableFamilyActivities !== undefined ? data.memorableFamilyActivities : existingReflection.memorableFamilyActivities
      }
    });
    
    return NextResponse.json(updatedReflection);
  } catch (error) {
    console.error('Error updating weekly reflection:', error);
    return NextResponse.json(
      { error: 'Failed to update weekly reflection' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/weekly-reflections/:id
 * Deletes a weekly reflection
 */
export async function DELETE(request: Request) {
  try {
    // Get the authenticated user from the session
    const session = await auth();
    
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
        { error: 'Reflection ID is required' },
        { status: 400 }
      );
    }
    
    // Check if the reflection exists and belongs to the user
    const existingReflection = await prisma.weeklyReflection.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!existingReflection) {
      return NextResponse.json(
        { error: 'Reflection not found' },
        { status: 404 }
      );
    }
    
    if (existingReflection.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Delete the reflection
    await prisma.weeklyReflection.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting weekly reflection:', error);
    return NextResponse.json(
      { error: 'Failed to delete weekly reflection' },
      { status: 500 }
    );
  }
}
