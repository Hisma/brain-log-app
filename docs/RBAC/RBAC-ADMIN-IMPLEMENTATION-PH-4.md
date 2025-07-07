### Phase 4: Production Features & Security (Week 3-4)

#### 4.1 Email Processing Cron Job

**Create Email Processing API** (`src/app/api/cron/process-emails/route.ts`):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/service';

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await EmailService.processQueue();
    
    return NextResponse.json({
      message: 'Email queue processed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Email processing error:', error);
    return NextResponse.json(
      { message: 'Email processing failed' },
      { status: 500 }
    );
  }
}
```

#### 4.2 Environment Variables Setup

**Required Environment Variables** (`.env.local`):

```bash
# Database
DATABASE_URL="postgresql://username:password@hostname:port/database"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Email Service (Resend)
RESEND_API_KEY="re_your_resend_api_key"
FROM_EMAIL="Brain Log App <noreply@yourdomain.com>"

# Admin Settings
ADMIN_EMAIL="admin@yourdomain.com"

# Cron Security
CRON_SECRET="your-cron-secret-here"

# Optional: Rate Limiting (if using Vercel KV)
KV_URL="your-vercel-kv-url"
KV_REST_API_URL="your-vercel-kv-rest-url"
KV_REST_API_TOKEN="your-vercel-kv-token"
```

#### 4.3 Package Dependencies

**Add Required Dependencies** (`package.json`):

```json
{
  "dependencies": {
    "resend": "^3.2.0",
    "@prisma/client": "^5.8.0",
    "next-auth": "5.0.0-beta.4",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

#### 4.4 Vercel Configuration

**Create Vercel Cron Configuration** (`vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/cron/process-emails",
      "schedule": "*/5 * * * *"
    }
  ],
  "functions": {
    "src/app/api/cron/process-emails/route.ts": {
      "maxDuration": 60
    }
  }
}
```

#### 4.5 Initial Admin User Setup

**Create Admin Setup Script** (`scripts/create-admin.js`):

```javascript
#!/usr/bin/env node

const { sql } = require('@/lib/neon');
const { hashPassword } = require('@/lib/crypto');

async function createAdmin() {
  const username = process.argv[2];
  const password = process.argv[3];
  const displayName = process.argv[4] || 'Administrator';

  if (!username || !password) {
    console.error('Usage: node scripts/create-admin.js <username> <password> [displayName]');
    process.exit(1);
  }

  try {
    // Check if admin already exists
    const existing = await sql`
      SELECT id FROM "User" WHERE username = ${username}
    `;

    if (existing.length > 0) {
      console.error('User already exists');
      process.exit(1);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin user
    const admin = await sql`
      INSERT INTO "User" (
        username, "passwordHash", "displayName", role, "isActive", "createdAt"
      ) VALUES (
        ${username}, ${passwordHash}, ${displayName}, 'ADMIN', true, NOW()
      ) RETURNING id, username, "displayName", role
    `;

    console.log('Admin user created successfully:');
    console.log(admin[0]);

    // Update system settings with admin email
    await sql`
      UPDATE "SystemSettings" 
      SET "adminEmail" = ${username}
      WHERE id = 'system'
    `;

    console.log('System settings updated with admin email');

  } catch (error) {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  }
}

createAdmin().then(() => process.exit(0));
```

### Phase 4 Implementation Checklist

- [ ] Set up Resend API key and email configuration
- [ ] Configure environment variables for production
- [ ] Create email processing cron job
- [ ] Set up Vercel cron configuration
- [ ] Create initial admin user setup script
- [ ] Test email delivery in production
- [ ] Verify cron job execution
- [ ] Test complete user approval workflow
- [ ] Perform security audit and testing
- [ ] Document admin procedures

---


