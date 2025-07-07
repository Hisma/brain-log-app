import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { requireAdmin } from '../../../../../auth';
import { auditLog } from '@/lib/audit';

export async function GET() {
  try {
    // Get system settings
    const settings = await sql`
      SELECT "registrationEnabled", "siteName", "adminEmail", "maxFailedLogins", "lockoutDurationMinutes"
      FROM "SystemSettings" 
      WHERE id = 'system'
    `;

    if (settings.length === 0) {
      // Return default settings if none exist
      return NextResponse.json({
        registrationEnabled: true,
        siteName: 'Brain Log App',
        adminEmail: 'admin@brainlogapp.com',
        maxFailedLogins: 5,
        lockoutDurationMinutes: 15
      });
    }

    const setting = settings[0];
    return NextResponse.json({
      registrationEnabled: setting.registrationEnabled,
      siteName: setting.siteName,
      adminEmail: setting.adminEmail,
      maxFailedLogins: setting.maxFailedLogins,
      lockoutDurationMinutes: setting.lockoutDurationMinutes
    });

  } catch (error) {
    console.error('System settings error:', error);
    return NextResponse.json(
      { message: 'Failed to get system settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin access
    const user = await requireAdmin();
    
    const { 
      registrationEnabled, 
      siteName, 
      adminEmail, 
      maxFailedLogins, 
      lockoutDurationMinutes 
    } = await request.json();

    // Validate required fields
    if (siteName && siteName.trim().length === 0) {
      return NextResponse.json(
        { message: 'Site name cannot be empty' },
        { status: 400 }
      );
    }

    if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      return NextResponse.json(
        { message: 'Invalid admin email format' },
        { status: 400 }
      );
    }

    if (maxFailedLogins && (maxFailedLogins < 1 || maxFailedLogins > 20)) {
      return NextResponse.json(
        { message: 'Max failed logins must be between 1 and 20' },
        { status: 400 }
      );
    }

    if (lockoutDurationMinutes && (lockoutDurationMinutes < 1 || lockoutDurationMinutes > 1440)) {
      return NextResponse.json(
        { message: 'Lockout duration must be between 1 and 1440 minutes' },
        { status: 400 }
      );
    }

    // Check if settings record exists
    const existing = await sql`
      SELECT id FROM "SystemSettings" WHERE id = 'system'
    `;

    const settingsData = {
      registrationEnabled: registrationEnabled ?? true,
      siteName: siteName || 'Brain Log App',
      adminEmail: adminEmail || 'admin@brainlogapp.com',
      maxFailedLogins: maxFailedLogins ?? 5,
      lockoutDurationMinutes: lockoutDurationMinutes ?? 15
    };

    if (existing.length === 0) {
      // Create new settings record
      await sql`
        INSERT INTO "SystemSettings" (
          id, "registrationEnabled", "siteName", "adminEmail", "maxFailedLogins", "lockoutDurationMinutes"
        ) VALUES (
          'system', 
          ${settingsData.registrationEnabled}, 
          ${settingsData.siteName}, 
          ${settingsData.adminEmail}, 
          ${settingsData.maxFailedLogins}, 
          ${settingsData.lockoutDurationMinutes}
        )
      `;
    } else {
      // Update existing settings
      await sql`
        UPDATE "SystemSettings" 
        SET 
          "registrationEnabled" = ${settingsData.registrationEnabled},
          "siteName" = ${settingsData.siteName},
          "adminEmail" = ${settingsData.adminEmail},
          "maxFailedLogins" = ${settingsData.maxFailedLogins},
          "lockoutDurationMinutes" = ${settingsData.lockoutDurationMinutes}
        WHERE id = 'system'
      `;
    }

    // Get client IP and user agent for audit log
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Audit log
    await auditLog({
      userId: user.id,
      action: 'SYSTEM_SETTINGS_UPDATED',
      resource: 'SYSTEM',
      details: settingsData,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'System settings updated successfully',
      settings: settingsData
    });

  } catch (error) {
    console.error('System settings update error:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to update system settings' },
      { status: 500 }
    );
  }
}
