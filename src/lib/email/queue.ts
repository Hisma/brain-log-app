import { sql } from '@/lib/neon';

interface QueueEmailParams {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, string | number | boolean>;
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
