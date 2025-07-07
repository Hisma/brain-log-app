import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../auth';
import { sql } from '@/lib/neon';
import { auditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const adminUser = await requireAdmin();
    
    // Get all users with their roles and statuses
    const users = await sql`
      SELECT 
        id, 
        username, 
        email,
        "displayName", 
        role, 
        "isActive", 
        "createdAt", 
        "lastLoginAt", 
        "failedLoginAttempts"
      FROM "User" 
      ORDER BY "createdAt" DESC
    `;

    // Log the admin action
    await auditLog({
      userId: adminUser.id,
      action: 'ADMIN_USERS_VIEWED',
      resource: 'USER_MANAGEMENT',
      details: { userCount: users.length },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        failedLoginAttempts: user.failedLoginAttempts || 0,
      }))
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to load users' },
      { status: 500 }
    );
  }
}
