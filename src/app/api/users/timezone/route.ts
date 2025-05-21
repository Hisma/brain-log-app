import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import prisma from '@/lib/prisma';

/**
 * PUT /api/users/timezone
 * Updates the user's timezone
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
    
    // Validate required fields
    if (!data.timezone) {
      return NextResponse.json(
        { error: 'Timezone is required' },
        { status: 400 }
      );
    }
    
    // Update the user's timezone
    const user = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        timezone: data.timezone
      }
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      timezone: user.timezone
    });
  } catch (error) {
    console.error('Error updating user timezone:', error);
    return NextResponse.json(
      { error: 'Failed to update timezone' },
      { status: 500 }
    );
  }
}
