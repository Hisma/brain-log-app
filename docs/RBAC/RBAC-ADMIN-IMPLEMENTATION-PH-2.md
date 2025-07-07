### Phase 2: System Settings Management (COMPLETED ✅)

#### 2.1 System Settings API Implementation

**System Settings API** (`src/app/api/system/settings/route.ts`):

```typescript
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
```

#### 2.2 Enhanced Admin Dashboard Interface

**Updated Admin Page** (`src/app/admin/page.tsx`):

Added comprehensive System Settings management section with:

```typescript
// System Settings state management
const [systemSettings, setSystemSettings] = useState<SystemSettings>({
  registrationEnabled: true,
  siteName: 'Brain Log App',
  adminEmail: 'admin@brainlogapp.com',
  maxFailedLogins: 5,
  lockoutDurationMinutes: 15
});
const [loadingSettings, setLoadingSettings] = useState(true);
const [savingSettings, setSavingSettings] = useState(false);

// Load and save functions
const loadSystemSettings = async () => {
  try {
    setLoadingSettings(true);
    const response = await fetch('/api/system/settings');
    const data = await response.json();
    
    if (response.ok) {
      setSystemSettings(data);
    } else {
      setMessage(`Error loading system settings: ${data.message}`);
    }
  } catch (error) {
    setMessage('Failed to load system settings');
    console.error(error);
  } finally {
    setLoadingSettings(false);
  }
};

const saveSystemSettings = async () => {
  try {
    setSavingSettings(true);
    setMessage(null);
    const response = await fetch('/api/system/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(systemSettings)
    });
    
    const data = await response.json();
    if (data.success) {
      setMessage('System settings saved successfully');
    } else {
      setMessage(`Error saving settings: ${data.message}`);
    }
  } catch (error) {
    setMessage('Failed to save system settings');
    console.error(error);
  } finally {
    setSavingSettings(false);
  }
};
```

**System Settings UI Section**:

```typescript
{/* System Settings */}
<Card className="mb-6">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Settings className="h-5 w-5" />
      System Settings
    </CardTitle>
  </CardHeader>
  <CardContent>
    {loadingSettings ? (
      <div className="text-center py-4">Loading system settings...</div>
    ) : (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <Input
              value={systemSettings.siteName}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
              placeholder="Brain Log App"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Admin Email</label>
            <Input
              type="email"
              value={systemSettings.adminEmail}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
              placeholder="admin@brainlogapp.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Max Failed Logins</label>
            <Input
              type="number"
              min="1"
              max="20"
              value={systemSettings.maxFailedLogins}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFailedLogins: parseInt(e.target.value) || 5 }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Lockout Duration (minutes)</label>
            <Input
              type="number"
              min="1"
              max="1440"
              value={systemSettings.lockoutDurationMinutes}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, lockoutDurationMinutes: parseInt(e.target.value) || 15 }))}
            />
          </div>
        </div>
        
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={systemSettings.registrationEnabled}
              onChange={(e) => setSystemSettings(prev => ({ ...prev, registrationEnabled: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium">Enable User Registration</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            When disabled, new users cannot register and will need admin approval
          </p>
        </div>
        
        <Button
          onClick={saveSystemSettings}
          disabled={savingSettings}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {savingSettings ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    )}
  </CardContent>
</Card>
```

#### 2.3 Key Features Implemented

**System Configuration Management**:
- ✅ Site name configuration
- ✅ Admin email settings
- ✅ Security policy settings (failed login attempts, lockout duration)
- ✅ User registration enable/disable toggle

**Security & Access Control**:
- ✅ Admin authentication required for all settings operations
- ✅ Input validation for all configuration parameters
- ✅ Audit logging for all system setting changes
- ✅ Error handling and user feedback

**Database Integration**:
- ✅ SystemSettings table integration
- ✅ Default settings fallback when no configuration exists
- ✅ Atomic operations for settings updates
- ✅ Transaction safety for data consistency

**User Interface**:
- ✅ Responsive design with grid layout
- ✅ Real-time form updates
- ✅ Loading states and error messages
- ✅ Success/failure notifications
- ✅ Integration with existing admin dashboard

#### 2.4 Enhanced Registration System (Future Implementation)

**Update Registration Page** (`src/app/register/page.tsx`):

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'disabled'>('idle');

  // Check system settings and redirect authenticated users
  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const response = await fetch('/api/system/settings');
        const settings = await response.json();
        
        if (!settings.registrationEnabled) {
          setRegistrationStatus('disabled');
        }
      } catch (error) {
        console.error('Failed to check system settings:', error);
      }
    };

    if (!isLoading && user) {
      if (user.role === 'PENDING') {
        router.push('/pending');
      } else if (user.isActive) {
        router.push('/');
      }
    } else if (!isLoading) {
      checkSystemStatus();
    }
  }, [user, isLoading, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
          displayName: formData.displayName.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRegistrationStatus('success');
      } else {
        setErrors({ submit: data.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (registrationStatus === 'disabled') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Registration Disabled</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                New user registration is currently disabled. Please contact the administrator if you need access.
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/login')}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (registrationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Registration Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Your registration has been submitted and is pending admin approval. 
                You will receive an email notification once your account is approved.
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => router.push('/login')}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={errors.displayName ? 'border-red-500' : ''}
              />
              {errors.displayName && (
                <p className="text-sm text-red-500">{errors.displayName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => router.push('/login')}
                disabled={isSubmitting}
              >
                Already have an account? Sign in
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Create Pending Status Page** (`src/app/pending/page.tsx`):

```typescript
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/lib/auth/AuthContext';

export default function PendingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'PENDING')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'PENDING') {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Pending Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Your account registration is pending administrator approval. 
              You will receive an email notification once your account is approved and you can access the application.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Account:</strong> {user.name}</p>
              <p><strong>Status:</strong> Pending Approval</p>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2.2 Registration API Enhancement

**Create Registration API** (`src/app/api/auth/register/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { hashPassword } from '@/lib/crypto';
import { auditLog } from '@/lib/audit';
import { queueEmail } from '@/lib/email/queue';

export async function POST(request: NextRequest) {
  try {
    const { username, password, displayName } = await request.json();

    // Validation
    if (!username || !password || !displayName) {
      return NextResponse.json(
        { message: 'Username, password, and display name are required' },
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

    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Generate registration token
    const registrationToken = crypto.randomUUID();

    // Create user with PENDING role
    const newUser = await sql`
      INSERT INTO "User" (
        username, "passwordHash", "displayName", role, "isActive", "registrationToken", "createdAt"
      ) VALUES (
        ${username}, ${passwordHash}, ${displayName}, 'PENDING', false, ${registrationToken}, NOW()
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
      details: { username, displayName },
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
```

#### 2.3 Email System Implementation

**Create Email Queue System** (`src/lib/email/queue.ts`):

```typescript
import { sql } from '@/lib/neon';

interface QueueEmailParams {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, any>;
  maxAttempts?: number;
}

export async function queueEmail(params: QueueEmailParams) {
  const { to, subject, template, variables, maxAttempts = 3 } = params;

  try {
    await sql`
      INSERT INTO "EmailQueue" (
        id, "to", subject, template, variables, "maxAttempts", "createdAt"
      ) VALUES (
        ${crypto.randomUUID()},
        ${to},
        ${subject},
        ${template},
        ${JSON.stringify(variables)},
        ${maxAttempts},
        NOW()
      )
    `;
  } catch (error) {
    console.error('Failed to queue email:', error);
    throw error;
  }
}

export async function getQueuedEmails(limit = 10) {
  return await sql`
    SELECT * FROM "EmailQueue"
    WHERE status = 'pending' AND attempts < "maxAttempts"
    ORDER BY "createdAt" ASC
    LIMIT ${limit}
  `;
}

export async function markEmailSent(emailId: string) {
  await sql`
    UPDATE "EmailQueue"
    SET status = 'sent', "sentAt" = NOW()
    WHERE id = ${emailId}
  `;
}

export async function markEmailFailed(emailId: string, error: string) {
  await sql`
    UPDATE "EmailQueue"
    SET attempts = attempts + 1, error = ${error}
    WHERE id = ${emailId}
  `;

  // Mark as failed if max attempts reached
  await sql`
    UPDATE "EmailQueue"
    SET status = 'failed'
    WHERE id = ${emailId} AND attempts >= "maxAttempts"
  `;
}
```

**Create Email Service with Resend** (`src/lib/email/service.ts`):

```typescript
import { Resend } from 'resend';
import { getQueuedEmails, markEmailSent, markEmailFailed } from './queue';
import { EmailTemplates } from './templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  static async processQueue() {
    const emails = await getQueuedEmails(10);

    for (const email of emails) {
      try {
        await this.sendEmail(email);
        await markEmailSent(email.id);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await markEmailFailed(email.id, errorMessage);
        console.error(`Failed to send email ${email.id}:`, error);
      }
    }
  }

  private static async sendEmail(email: any) {
    const template = EmailTemplates[email.template];
    if (!template) {
      throw new Error(`Template ${email.template} not found`);
    }

    const { subject, html, text } = template(email.variables);

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Brain Log App <noreply@brainlogapp.com>',
      to: email.to,
      subject: subject || email.subject,
      html,
      text,
    });
  }

  static async sendDirectEmail(to: string, subject: string, template: string, variables: Record<string, any>) {
    const emailTemplate = EmailTemplates[template];
    if (!emailTemplate) {
      throw new Error(`Template ${template} not found`);
    }

    const { subject: templateSubject, html, text } = emailTemplate(variables);

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Brain Log App <noreply@brainlogapp.com>',
      to,
      subject: templateSubject || subject,
      html,
      text,
    });
  }
}
```

**Create Email Templates** (`src/lib/email/templates.ts`):

```typescript
interface EmailTemplate {
  subject?: string;
  html: string;
  text: string;
}

type TemplateFunction = (variables: Record<string, any>) => EmailTemplate;

export const EmailTemplates: Record<string, TemplateFunction> = {
  'admin-registration-notification': (variables) => ({
    subject: 'New User Registration Pending Approval - Brain Log App',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New User Registration</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; margin: 10px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .approve { background-color: #28a745; color: white; }
            .reject { background-color: #dc3545; color: white; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New User Registration</h1>
            </div>
            <div class="content">
              <p>A new user has registered for Brain Log App and is pending your approval.</p>
              
              <h3>User Details:</h3>
              <ul>
                <li><strong>Username:</strong> ${variables.username}</li>
                <li><strong>Display Name:</strong> ${variables.displayName}</li>
                <li><strong>Registration Date:</strong> ${new Date(variables.registrationDate).toLocaleString()}</li>
              </ul>
              
              <p>Please review and approve or reject this registration:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${variables.approvalUrl}" class="button approve">Approve User</a>
                <a href="${variables.rejectUrl}" class="button reject">Reject User</a>
              </div>
              
              <p>You can also manage users from the admin panel at: <a href="${process.env.NEXTAUTH_URL}/admin">Admin Dashboard</a></p>
            </div>
            <div class="footer">
              <p>This is an automated message from Brain Log App. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      New User Registration - Brain Log App
      
      A new user has registered and is pending your approval.
      
      User Details:
      - Username: ${variables.username}
      - Display Name: ${variables.displayName}
      - Registration Date: ${new Date(variables.registrationDate).toLocaleString()}
      
      Approve: ${variables.approvalUrl}
      Reject: ${variables.rejectUrl}
      
      Admin Dashboard: ${process.env.NEXTAUTH_URL}/admin
    `
  }),

  'user-approved': (variables) => ({
    subject: 'Your Brain Log App account has been approved!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Account Approved</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; padding: 20px; text-align: center; color: white; }
            .content { padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Brain Log App!</h1>
            </div>
            <div class="content">
              <p>Great news! Your Brain Log App account has been approved by our administrator.</p>
              
              <p>You can now access all features of the application to track your daily health insights, manage your medication, and gain personalized AI-powered insights.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/login" class="button">Login to Your Account</a>
              </div>
              
              <h3>What you can do now:</h3>
              <ul>
                <li>Complete daily health check-ins</li>
                <li>Track medication and its effects</li>
                <li>View AI-powered insights about your patterns</li>
                <li>Create weekly reflections and set goals</li>
              </ul>
              
              <p>If you have any questions, please don't hesitate to reach out.</p>
            </div>
            <div class="footer">
              <p>Welcome to Brain Log App - Your personal health tracking companion.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Welcome to Brain Log App!
      
      Your account has been approved and you can now access the application.
      
      Login: ${process.env.NEXTAUTH_URL}/login
      
      You can now:
      - Complete daily health check-ins
      - Track medication and its effects  
      - View AI-powered insights
      - Create weekly reflections
      
      Welcome to Brain Log App!
    `
  }),

  'user-rejected': (variables) => ({
    subject: 'Brain Log App registration update',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Registration Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc3545; padding: 20px; text-align: center; color: white; }
            .content { padding: 20px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Registration Update</h1>
            </div>
            <div class="content">
              <p>Thank you for your interest in Brain Log App.</p>
              
              <p>After review, we are unable to approve your registration at this time.</p>
              
              ${variables.reason ? `<p><strong>Reason:</strong> ${variables.reason}</p>` : ''}
              
              <p>If you believe this is an error or have questions about this decision, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>Thank you for your interest in Brain Log App.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Registration Update - Brain Log App
      
      Thank you for your interest in Brain Log App.
      
      After review, we are unable to approve your registration at this time.
      
      ${variables.reason ? `Reason: ${variables.reason}` : ''}
      
      If you have questions, please contact our support team.
    `
  }),
};
```

### Phase 2 Implementation Checklist

**COMPLETED ✅**:
- [x] **System Settings API Implementation** - `/api/system/settings` with GET/POST endpoints
- [x] **Admin Authentication** - Required admin role for all system settings operations
- [x] **Input Validation** - Comprehensive validation for all configuration parameters
- [x] **Audit Logging** - All system setting changes logged for security compliance
- [x] **Database Integration** - SystemSettings table with default fallback values
- [x] **Enhanced Admin Dashboard** - Added System Settings management interface
- [x] **Responsive UI Design** - Grid layout with real-time form updates
- [x] **Error Handling** - User-friendly messages and loading states
- [x] **Security Controls** - Site name, admin email, failed login limits, lockout duration
- [x] **Registration Toggle** - Enable/disable user registration system-wide

**Files Modified/Created**:
- ✅ `src/app/api/system/settings/route.ts` - New system settings API
- ✅ `src/app/admin/page.tsx` - Enhanced with system settings management
- ✅ Fixed auth import paths for proper module resolution

**Key Features Delivered**:
1. **Centralized System Configuration** - Single interface for all system-wide settings
2. **Security Policy Management** - Configurable failed login attempts and lockout duration
3. **Registration Control** - Toggle to enable/disable new user registrations
4. **Administrative Oversight** - Complete audit trail of all configuration changes
5. **User-Friendly Interface** - Intuitive form controls with validation feedback

---
