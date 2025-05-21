import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@auth';
import prisma from '@/lib/prisma';
import { generateWeeklyInsights, getWeeklyInsights, getUserWeeklyInsights } from '@/lib/services/openaiService';

/**
 * GET /api/weekly-insights
 * Get weekly insights for a user or a specific weekly reflection
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const weeklyReflectionId = searchParams.get('weeklyReflectionId');
    
    // If weeklyReflectionId is provided, get insights for that specific weekly reflection
    if (weeklyReflectionId) {
      const reflectionId = parseInt(weeklyReflectionId, 10);
      
      // Verify the weekly reflection belongs to the user
      const weeklyReflection = await prisma.weeklyReflection.findUnique({
        where: { id: reflectionId },
      });
      
      if (!weeklyReflection || weeklyReflection.userId !== userId) {
        return NextResponse.json({ error: 'Weekly reflection not found or unauthorized' }, { status: 404 });
      }
      
      // Get insights for the weekly reflection
      const insightText = await getWeeklyInsights(reflectionId);
      
      return NextResponse.json({ insightText });
    }
    
    // Otherwise, get all weekly insights for the user
    const weeklyInsights = await getUserWeeklyInsights(userId);
    
    return NextResponse.json({ weeklyInsights });
  } catch (error) {
    console.error('Error in GET /api/weekly-insights:', error);
    return NextResponse.json({ error: 'Failed to get weekly insights' }, { status: 500 });
  }
}

/**
 * POST /api/weekly-insights
 * Generate insights for a weekly reflection
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { weeklyReflectionId } = await request.json();
    
    if (!weeklyReflectionId) {
      return NextResponse.json({ error: 'Weekly reflection ID is required' }, { status: 400 });
    }
    
    // Verify the weekly reflection belongs to the user
    const weeklyReflection = await prisma.weeklyReflection.findUnique({
      where: { id: weeklyReflectionId },
    });
    
    if (!weeklyReflection || weeklyReflection.userId !== userId) {
      return NextResponse.json({ error: 'Weekly reflection not found or unauthorized' }, { status: 404 });
    }
    
    // Generate insights for the weekly reflection
    const insightText = await generateWeeklyInsights(parseInt(weeklyReflectionId, 10));
    
    return NextResponse.json({ insightText });
  } catch (error) {
    console.error('Error in POST /api/weekly-insights:', error);
    return NextResponse.json({ error: 'Failed to generate weekly insights' }, { status: 500 });
  }
}
