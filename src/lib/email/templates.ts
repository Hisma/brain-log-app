interface EmailTemplate {
  subject?: string;
  html: string;
  text: string;
}

type TemplateFunction = (variables: Record<string, string | number | boolean>) => EmailTemplate;

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
                <li><strong>Registration Date:</strong> ${new Date(variables.registrationDate as string).toLocaleString()}</li>
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
      - Registration Date: ${new Date(variables.registrationDate as string).toLocaleString()}
      
      Approve: ${variables.approvalUrl}
      Reject: ${variables.rejectUrl}
      
      Admin Dashboard: ${process.env.NEXTAUTH_URL}/admin
    `
  }),

  'user-approved': () => ({
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
