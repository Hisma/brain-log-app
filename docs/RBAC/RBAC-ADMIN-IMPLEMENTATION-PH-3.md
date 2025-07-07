### Phase 3: Comprehensive Admin Panel (Week 2-3)

#### 3.1 Admin Dashboard Implementation

**Create Admin Layout** (`src/app/admin/layout.tsx`):

```typescript
import { requireAdmin } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Create Admin Dashboard** (`src/app/admin/page.tsx`):

```typescript
import { requireAdmin } from '@/auth';
import { sql } from '@/lib/neon';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UsersIcon, ClockIcon, ShieldCheckIcon, AlertTriangleIcon } from 'lucide-react';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { RecentRegistrations } from '@/components/admin/RecentRegistrations';
import { SystemHealth } from '@/components/admin/SystemHealth';

export default async function AdminDashboard() {
  const admin = await requireAdmin();

  // Get dashboard statistics
  const stats = await Promise.all([
    sql`SELECT COUNT(*) as count FROM "User" WHERE role = 'PENDING'`,
    sql`SELECT COUNT(*) as count FROM "User" WHERE role = 'USER' AND "isActive" = true`,
    sql`SELECT COUNT(*) as count FROM "User" WHERE role = 'ADMIN'`,
    sql`SELECT COUNT(*) as count FROM "AuditLog" WHERE timestamp > NOW() - INTERVAL '24 hours'`,
    sql`SELECT COUNT(*) as count FROM "EmailQueue" WHERE status = 'pending'`,
  ]);

  const dashboardData = {
    pendingUsers: parseInt(stats[0][0].count),
    activeUsers: parseInt(stats[1][0].count),
    adminUsers: parseInt(stats[2][0].count),
    recentActivity: parseInt(stats[3][0].count),
    pendingEmails: parseInt(stats[4][0].count),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {admin.name}. Here's what's happening with your application.
        </p>
      </div>

      <AdminStatsCards data={dashboardData} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <RecentRegistrations />
        <SystemHealth />
      </div>
    </div>
  );
}
```

**Create User Management Page** (`src/app/admin/users/page.tsx`):

```typescript
import { requireAdmin } from '@/auth';
import { sql } from '@/lib/neon';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

export default async function UsersPage() {
  await requireAdmin();

  // Get all users with pagination
  const users = await sql`
    SELECT 
      u.id,
      u.username,
      u."displayName",
      u.role,
      u."isActive",
      u."createdAt",
      u."lastLoginAt",
      u."approvedAt",
      u."rejectedAt",
      approver.username as "approverUsername"
    FROM "User" u
    LEFT JOIN "User" approver ON u."approvedBy" = approver.id
    ORDER BY 
      CASE WHEN u.role = 'PENDING' THEN 0 ELSE 1 END,
      u."createdAt" DESC
    LIMIT 100
  `;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, approvals, and permissions.
          </p>
        </div>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagementTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 3.2 Admin API Endpoints

**Create User Approval API** (`src/app/api/admin/users/approve/[token]/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/auth';
import { sql } from '@/lib/neon';
import { auditLog } from '@/lib/audit';
import { queueEmail } from '@/lib/email/queue';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const admin = await requireAdmin();
    const { token } = params;

    // Find user by registration token
    const users = await sql`
      SELECT id, username, "displayName", role
      FROM "User"
      WHERE "registrationToken" = ${token} AND role = 'PENDING'
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { message: 'User not found or already processed' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Update user to approved status
    await sql`
      UPDATE "User"
      SET 
        role = 'USER',
        "isActive" = true,
        "approvedBy" = ${admin.id},
        "approvedAt" = NOW(),
        "registrationToken" = NULL
      WHERE id = ${user.id}
    `;

    // Audit log
    await auditLog({
      userId: admin.id,
      action: 'USER_APPROVED',
      resource: 'USER',
      details: { 
        approvedUserId: user.id, 
        username: user.username,
        displayName: user.displayName 
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Queue approval email to user
    await queueEmail({
      to: user.username, // Username is email
      subject: 'Your Brain Log App account has been approved!',
      template: 'user-approved',
      variables: {
        displayName: user.displayName,
        username: user.username,
      },
    });

    return NextResponse.json({
      message: 'User approved successfully',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: 'USER',
      },
    });

  } catch (error) {
    console.error('User approval error:', error);
    return NextResponse.json(
      { message: 'Failed to approve user' },
      { status: 500 }
    );
  }
}
```

**Create User Rejection API** (`src/app/api/admin/users/reject/[token]/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/auth';
import { sql } from '@/lib/neon';
import { auditLog } from '@/lib/audit';
import { queueEmail } from '@/lib/email/queue';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const admin = await requireAdmin();
    const { token } = params;
    const { reason } = await request.json();

    // Find user by registration token
    const users = await sql`
      SELECT id, username, "displayName", role
      FROM "User"
      WHERE "registrationToken" = ${token} AND role = 'PENDING'
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { message: 'User not found or already processed' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Update user to rejected status and delete
    await sql`
      UPDATE "User"
      SET 
        "rejectedAt" = NOW(),
        "rejectionReason" = ${reason || 'No reason provided'},
        "registrationToken" = NULL
      WHERE id = ${user.id}
    `;

    // Audit log
    await auditLog({
      userId: admin.id,
      action: 'USER_REJECTED',
      resource: 'USER',
      details: { 
        rejectedUserId: user.id, 
        username: user.username,
        displayName: user.displayName,
        reason: reason || 'No reason provided'
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Queue rejection email to user
    await queueEmail({
      to: user.username, // Username is email
      subject: 'Brain Log App registration update',
      template: 'user-rejected',
      variables: {
        displayName: user.displayName,
        username: user.username,
        reason: reason || undefined,
      },
    });

    // Delete user after a delay to allow email to be sent
    setTimeout(async () => {
      try {
        await sql`DELETE FROM "User" WHERE id = ${user.id}`;
      } catch (error) {
        console.error('Failed to delete rejected user:', error);
      }
    }, 5000);

    return NextResponse.json({
      message: 'User rejected successfully',
    });

  } catch (error) {
    console.error('User rejection error:', error);
    return NextResponse.json(
      { message: 'Failed to reject user' },
      { status: 500 }
    );
  }
}
```

**Create System Settings API** (`src/app/api/admin/settings/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/auth';
import { sql } from '@/lib/neon';
import { auditLog } from '@/lib/audit';

export async function GET() {
  try {
    await requireAdmin();

    const settings = await sql`
      SELECT * FROM "SystemSettings" WHERE id = 'system'
    `;

    if (settings.length === 0) {
      return NextResponse.json(
        { message: 'System settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(settings[0]);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { message: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const updates = await request.json();

    // Validate allowed fields
    const allowedFields = [
      'registrationEnabled',
      'requireEmailVerification',
      'adminEmail',
      'siteName',
      'maxFailedLoginAttempts',
      'lockoutDurationMinutes',
    ];

    const validUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json(
        { message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const updateFields = Object.keys(validUpdates)
      .map(field => `"${field}" = $${Object.keys(validUpdates).indexOf(field) + 1}`)
      .join(', ');
    
    const values = Object.values(validUpdates);

    await sql.unsafe(`
      UPDATE "SystemSettings" 
      SET ${updateFields}, "updatedAt" = NOW()
      WHERE id = 'system'
    `, values);

    // Audit log
    await auditLog({
      userId: admin.id,
      action: 'SYSTEM_SETTINGS_UPDATED',
      resource: 'SYSTEM',
      details: validUpdates,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      updates: validUpdates,
    });

  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
```

### Phase 3 Implementation Checklist

- [ ] Create admin layout with navigation
- [ ] Implement admin dashboard with statistics
- [ ] Create user management interface with approval/rejection
- [ ] Build system settings management page
- [ ] Implement admin API endpoints for user operations
- [ ] Create audit log viewer
- [ ] Add email queue monitoring
- [ ] Test admin panel functionality
- [ ] Verify admin-only access controls
- [ ] Test user approval/rejection workflow

---
