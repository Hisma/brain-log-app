import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { hashPassword } from '@/lib/crypto';
import { auditLog } from '@/lib/audit';
import { queueEmail } from '@/lib/email/queue';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, displayName, timezone } = await request.json();

    // Validation - both username and email are required
    if (!username || !email || !password || !displayName) {
      return NextResponse.json(
        { message: 'Username, email, password, and display name are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { message: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if registration is enabled
    const settings = await sql`
      SELECT "registrationEnabled" FROM "SystemSettings" WHERE id = 'system'
    `;
    
    if (settings.length === 0 || !settings[0].registrationEnabled) {
      return NextResponse.json(
        { message: 'Registration is currently disabled' },
        { status: 403 }
      );
    }

    // Check if username already exists
    const existingUser = await sql`
      SELECT id FROM "User" WHERE username = ${username}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: 'Username already exists' },
        { status: 409 }
      );
    }

    // Check if email already exists
    const existingEmail = await sql`
      SELECT id FROM "User" WHERE email = ${email}
    `;

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { message: 'Email address already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate registration token
    const registrationToken = crypto.randomUUID();

    // Create user with PENDING role
    const newUser = await sql`
      INSERT INTO "User" (
        username, email, "passwordHash", "displayName", timezone, role, "isActive", "registrationToken", "createdAt"
      ) VALUES (
        ${username}, 
        ${email},
        ${passwordHash}, 
        ${displayName}, 
        ${timezone || 'America/New_York'}, 
        'PENDING', 
        false, 
        ${registrationToken}, 
        NOW()
      ) RETURNING id, username, "displayName"
    `;

    const userId = newUser[0].id;

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Audit log
    await auditLog({
      userId,
      action: 'USER_REGISTERED',
      resource: 'USER',
      details: { username, displayName, timezone },
      ipAddress,
      userAgent,
    });

    // Get admin email for notification
    const adminSettings = await sql`
      SELECT "adminEmail" FROM "SystemSettings" WHERE id = 'system'
    `;
    const adminEmail = adminSettings[0]?.adminEmail || 'admin@brainlogapp.com';

    // Queue admin notification email
    await queueEmail({
      to: adminEmail,
      subject: 'New User Registration Pending Approval',
      template: 'admin-registration-notification',
      variables: {
        username,
        displayName,
        registrationDate: new Date().toISOString(),
        approvalUrl: `${process.env.NEXTAUTH_URL}/admin/users/approve/${registrationToken}`,
        rejectUrl: `${process.env.NEXTAUTH_URL}/admin/users/reject/${registrationToken}`,
      },
    });

    return NextResponse.json({
      message: 'Registration successful. Please wait for admin approval.',
      userId: userId,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
