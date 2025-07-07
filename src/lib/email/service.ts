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

  private static async sendEmail(email: Record<string, string>) {
    const template = EmailTemplates[email.template];
    if (!template) {
      throw new Error(`Template ${email.template} not found`);
    }

    const variables = JSON.parse(email.variables || '{}');
    const { subject, html, text } = template(variables);

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Brain Log App <noreply@brainlogapp.com>',
      to: email.to,
      subject: subject || email.subject,
      html,
      text,
    });
  }

  static async sendDirectEmail(to: string, subject: string, template: string, variables: Record<string, string | number | boolean>) {
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
