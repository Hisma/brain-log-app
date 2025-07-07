import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../../auth';
import { sql } from '@/lib/neon';
import { auditLog } from '@/lib/audit';
import { queueEmail } from '@/lib/email/queue';

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

    // Get the user to verify they exist and are pending
    const users = await sql`
      SELECT id, username, "displayName", role, email 
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

    if (user.role !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: 'User is not pending approval' },
        { status: 400 }
      );
    }

    // Update user role to USER and activate account
    await sql`
      UPDATE "User" 
      SET role = 'USER', "isActive" = true, "updatedAt" = NOW()
      WHERE id = ${userId}
    `;

    // Log the admin action
    await auditLog({
      userId: adminUser.id,
      action: 'USER_APPROVED',
      resource: 'USER_MANAGEMENT',
      details: { 
        targetUserId: userId,
        targetUsername: user.username,
        targetDisplayName: user.displayName,
        previousRole: 'PENDING',
        newRole: 'USER'
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Send approval email notification if user has an email
    if (user.email) {
      try {
        await queueEmail({
          to: user.email,
          subject: 'Your Brain Log App account has been approved!',
          template: 'user-approved',
          variables: {
            username: user.username,
            displayName: user.displayName,
          },
        });
      } catch (emailError) {
        console.error('Failed to queue approval email:', emailError);
        // Don't fail the approval if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `User ${user.displayName} has been approved and activated`
    });

  } catch (error) {
    console.error('Admin approve user API error:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to approve user' },
      { status: 500 }
    );
  }
}
