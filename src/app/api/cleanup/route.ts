import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET() {
  try {
    // Get the authenticated user from the session
    const session = await auth();
    
    if (!session || !session.user || session.user.email !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find logs that don't have a valid userId (using a very large ID that doesn't exist)
    const orphanedLogs = await prisma.dailyLog.findMany({
      where: {
        userId: {
          gt: 999999 // Use a very large number that's unlikely to be a valid user ID
        }
      }
    });
    
    // Delete all orphaned logs
    await prisma.dailyLog.deleteMany({
      where: {
        userId: {
          gt: 999999
        }
      }
    });
    
    // Find reflections that don't have a valid userId
    const orphanedReflections = await prisma.weeklyReflection.findMany({
      where: {
        userId: {
          gt: 999999
        }
      }
    });
    
    // Delete all orphaned reflections
    await prisma.weeklyReflection.deleteMany({
      where: {
        userId: {
          gt: 999999
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${orphanedLogs.length} orphaned logs and ${orphanedReflections.length} orphaned reflections.` 
    });
  } catch (error) {
    console.error('Error cleaning up orphaned logs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to clean up orphaned logs.' },
      { status: 500 }
    );
  }
}
