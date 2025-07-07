import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { requireAdmin } from '../../../../../auth';
import { auditLog } from '@/lib/audit';

export async function GET() {
  try {
    // Require admin access
    const user = await requireAdmin();

    // Fetch email queue with most recent first
    const emails = await sql`
      SELECT 
        id,
        "to",
        subject,
        template,
        status,
        attempts,
        "maxAttempts",
        error,
        "sentAt",
        "createdAt"
      FROM "EmailQueue"
      ORDER BY "createdAt" DESC
      LIMIT 100
    `;

    // Audit log
    await auditLog({
      userId: user.id,
      action: 'EMAIL_QUEUE_VIEWED',
      resource: 'EMAIL_QUEUE',
    });

    return NextResponse.json({
      success: true,
      emails: emails.map(email => ({
        id: email.id,
        to: email.to,
        subject: email.subject,
        template: email.template,
        status: email.status,
        attempts: email.attempts,
        maxAttempts: email.maxAttempts,
        error: email.error,
        sentAt: email.sentAt,
        createdAt: email.createdAt,
      }))
    });

  } catch (error) {
    console.error('Email queue fetch error:', error);
    
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to fetch email queue' },
      { status: 500 }
    );
  }
}
