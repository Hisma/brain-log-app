import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username?.trim()) {
      return NextResponse.json({ 
        isLockedOut: false, 
        failedAttempts: 0 
      });
    }

    // Get current failed attempts and lockout status for the user
    const result = await sql`
      SELECT 
        "failedLoginAttempts",
        "lockedUntil"
      FROM "User" 
      WHERE username = ${username.trim()}
      LIMIT 1
    `;

    if (result.length === 0) {
      // User doesn't exist - don't reveal this info, just return clean state
      return NextResponse.json({ 
        isLockedOut: false, 
        failedAttempts: 0 
      });
    }

    const user = result[0];
    const now = new Date();
    const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil) : null;
    const isLockedOut = lockedUntil && lockedUntil > now;
    const remainingTime = isLockedOut ? Math.ceil((lockedUntil!.getTime() - now.getTime()) / 1000) : 0;

    return NextResponse.json({
      isLockedOut,
      failedAttempts: user.failedLoginAttempts || 0,
      lockoutUntil: lockedUntil?.toISOString(),
      remainingTime
    });

  } catch (error) {
    console.error('Lockout status check error:', error);
    
    // Return a clean state on error to avoid breaking the login flow
    return NextResponse.json({ 
      isLockedOut: false, 
      failedAttempts: 0 
    });
  }
}
