import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@auth';
import prisma from '@/lib/prisma';
import { generateInsights, getInsights, getUserInsights } from '@/lib/services/openaiService';

/**
 * GET /api/insights
 * Get insights for a user or specific daily log
 */
export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: { username: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const dailyLogId = searchParams.get('dailyLogId');
    
    // If dailyLogId is provided, get insights for that specific daily log
    if (dailyLogId) {
      const dailyLog = await prisma.dailyLog.findUnique({
        where: { id: parseInt(dailyLogId) },
      });
      
      if (!dailyLog) {
        return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
      }
      
      if (dailyLog.userId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const insightText = await getInsights(parseInt(dailyLogId));
      return NextResponse.json({ insightText });
    }
    
    // Otherwise, get all insights for the user
    const insights = await getUserInsights(user.id);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error getting insights:', error);
    return NextResponse.json({ error: 'Failed to get insights' }, { status: 500 });
  }
}

/**
 * POST /api/insights
 * Generate and store insights for a daily log
 */
export async function POST(request: NextRequest) {
  try {
    // Get the session
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: { username: session.user.email },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get request body
    const body = await request.json();
    const { dailyLogId } = body;
    
    if (!dailyLogId) {
      return NextResponse.json({ error: 'Daily log ID is required' }, { status: 400 });
    }
    
    // Check if the daily log exists and belongs to the user
    const dailyLog = await prisma.dailyLog.findUnique({
      where: { id: dailyLogId },
    });
    
    if (!dailyLog) {
      return NextResponse.json({ error: 'Daily log not found' }, { status: 404 });
    }
    
    if (dailyLog.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Generate insights
    const insightText = await generateInsights(dailyLogId);
    
    return NextResponse.json({ insightText });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
