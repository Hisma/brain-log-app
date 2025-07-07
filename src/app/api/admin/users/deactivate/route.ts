import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../auth';
import { sql } from '@/lib/neon';
import { auditLog } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const adminUser = await requireAdmin();
    
    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Prevent admin from deactivating themselves
    if (userId === adminUser.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot deactivate your own account' },
        { status: 400 }
      );
    }

    // Get the user to verify they exist and are active
    const users = await sql`
      SELECT id, username, "displayName", role, "isActive"
      FROM "User" 
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'User is already deactivated' },
        { status: 400 }
      );
    }

    // Deactivate the user account
    await sql`
      UPDATE "User" 
      SET "isActive" = false, "updatedAt" = NOW()
      WHERE id = ${userId}
    `;

    // Log the admin action
    await auditLog({
      userId: adminUser.id,
      action: 'USER_DEACTIVATED',
      resource: 'USER_MANAGEMENT',
      details: { 
        targetUserId: userId,
        targetUsername: user.username,
        targetDisplayName: user.displayName,
        targetRole: user.role
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: `User ${user.displayName} has been deactivated`
    });

  } catch (error) {
    console.error('Admin deactivate user API error:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to deactivate user' },
      { status: 500 }
    );
  }
}
