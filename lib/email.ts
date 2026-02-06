/**
 * Email Notification Service
 * Sends email notifications using Resend
 * Requirements: 14.6, 21.10
 */

import { Resend } from 'resend';
import type { NotificationTone } from './notifications';

// Initialize Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set - email notifications disabled');
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

export interface EmailNotificationData {
  to: string;
  subject: string;
  body: string;
  type: 'check_in_reminder' | 'task_reminder' | 'celebration' | 'behind_schedule' | 'supportive_checkin';
  tone?: NotificationTone;
}

/**
 * Send an email notification
 * Requirements: 14.6
 */
export async function sendEmailNotification(data: EmailNotificationData): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    return false;
  }

  try {
    const html = generateEmailHTML(data);

    const result = await client.emails.send({
      from: process.env.EMAIL_FROM || 'Adaptive Productivity Agent <notifications@adaptiveproductivity.app>',
      to: data.to,
      subject: data.subject,
      html,
    });

    if (result.error) {
      console.error('Failed to send email:', result.error);
      return false;
    }

    console.log('✅ Email notification sent:', result.data?.id);
    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(data: EmailNotificationData): string {
  const { subject, body, type } = data;

  // Get emoji based on notification type
  const emoji = {
    check_in_reminder: '🌅',
    task_reminder: '⏰',
    celebration: '🎉',
    behind_schedule: '💙',
    supportive_checkin: '💙',
  }[type];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .emoji {
      font-size: 48px;
      margin-bottom: 10px;
    }
    h1 {
      color: #10B981;
      font-size: 24px;
      margin: 0 0 10px 0;
    }
    .body {
      font-size: 16px;
      color: #555;
      margin-bottom: 30px;
    }
    .cta {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #10B981;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    }
    .button:hover {
      background-color: #059669;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #999;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">${emoji}</div>
      <h1>${subject}</h1>
    </div>
    
    <div class="body">
      ${body.split('\n').map(line => `<p>${line}</p>`).join('')}
    </div>
    
    <div class="cta">
      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" class="button">
        Open App
      </a>
    </div>
    
    <div class="footer">
      <p>You're receiving this because you enabled email notifications in your Adaptive Productivity Agent settings.</p>
      <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/settings">Manage notification preferences</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send check-in reminder email
 * Requirements: 14.6, 21.1
 */
export async function sendCheckInReminderEmail(
  userEmail: string,
  goalTitle?: string
): Promise<boolean> {
  const subject = goalTitle 
    ? `Ready to make progress on "${goalTitle}"?`
    : 'Time for your daily check-in';
  
  const body = goalTitle
    ? `Check in to plan your day and take meaningful steps toward your goals.\n\nYour goal "${goalTitle}" is waiting for you!`
    : 'How are you feeling today? Check in to plan your day based on your capacity.';

  return sendEmailNotification({
    to: userEmail,
    subject,
    body,
    type: 'check_in_reminder',
  });
}

/**
 * Send task reminder email
 * Requirements: 14.6, 21.3
 */
export async function sendTaskReminderEmail(
  userEmail: string,
  taskTitle: string,
  estimatedMinutes: number,
  tone: NotificationTone = 'gentle'
): Promise<boolean> {
  const subject = tone === 'minimal' 
    ? 'Task in 5min'
    : 'Task starting soon';
  
  const body = tone === 'gentle'
    ? `About to start "${taskTitle}"—how's your focus level? 💪\n\nEstimated time: ${estimatedMinutes} minutes`
    : tone === 'direct'
    ? `"${taskTitle}" starts in 5min. Ready?\n\nEstimated: ${estimatedMinutes}min`
    : `${taskTitle}\n\n${estimatedMinutes}min`;

  return sendEmailNotification({
    to: userEmail,
    subject,
    body,
    type: 'task_reminder',
    tone,
  });
}

/**
 * Send celebration email
 * Requirements: 14.6, 21.4
 */
export async function sendCelebrationEmail(
  userEmail: string,
  taskTitle: string,
  minutesAhead: number,
  tone: NotificationTone = 'gentle'
): Promise<boolean> {
  const subject = tone === 'minimal'
    ? 'Done early'
    : tone === 'direct'
    ? 'Task Complete'
    : 'Amazing work!';
  
  const body = tone === 'gentle'
    ? `You crushed "${taskTitle}" ${minutesAhead}min early! 🎉\n\nGreat momentum! Want to jump into the next task now?`
    : tone === 'direct'
    ? `"${taskTitle}" done ${minutesAhead}min early. Continue?`
    : `+${minutesAhead}min\n\nNext?`;

  return sendEmailNotification({
    to: userEmail,
    subject,
    body,
    type: 'celebration',
    tone,
  });
}

/**
 * Send behind schedule email
 * Requirements: 14.6, 21.5
 */
export async function sendBehindScheduleEmail(
  userEmail: string,
  taskTitle: string,
  minutesBehind: number,
  tone: NotificationTone = 'gentle'
): Promise<boolean> {
  const subject = tone === 'minimal'
    ? 'Behind'
    : tone === 'direct'
    ? 'Behind Schedule'
    : 'Just checking in';
  
  const body = tone === 'gentle'
    ? `How's it going with "${taskTitle}"? 💙\n\nYou're ${minutesBehind}min behind schedule, but no pressure—let's adjust the plan together to help you finish strong!`
    : tone === 'direct'
    ? `"${taskTitle}" status?\n\n${minutesBehind}min behind. Done/Working/Stuck?`
    : `${taskTitle} done?\n\n${minutesBehind}min behind`;

  return sendEmailNotification({
    to: userEmail,
    subject,
    body,
    type: 'behind_schedule',
    tone,
  });
}

/**
 * Send supportive check-in email
 * Requirements: 14.6, 21.5
 */
export async function sendSupportiveCheckinEmail(
  userEmail: string,
  taskTitle: string,
  tone: NotificationTone = 'gentle'
): Promise<boolean> {
  const subject = tone === 'minimal'
    ? 'Adjust?'
    : tone === 'direct'
    ? 'Schedule Adjustment'
    : 'How are you doing?';
  
  const body = tone === 'gentle'
    ? `No worries about running over—"${taskTitle}" is tricky! 💙\n\nI'm giving you more time. Want to continue or switch to something easier?`
    : tone === 'direct'
    ? `"${taskTitle}" taking longer. Extend time or defer?`
    : `${taskTitle}: extend?`;

  return sendEmailNotification({
    to: userEmail,
    subject,
    body,
    type: 'supportive_checkin',
    tone,
  });
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(testEmail: string): Promise<boolean> {
  const client = getResendClient();
  if (!client) {
    console.error('Resend client not configured');
    return false;
  }

  try {
    const result = await client.emails.send({
      from: process.env.EMAIL_FROM || 'Adaptive Productivity Agent <notifications@adaptiveproductivity.app>',
      to: testEmail,
      subject: 'Test Email - Adaptive Productivity Agent',
      html: `
        <h1>Email Configuration Test</h1>
        <p>If you're seeing this, your email notifications are configured correctly!</p>
        <p>You can now receive check-in reminders, task notifications, and more.</p>
      `,
    });

    if (result.error) {
      console.error('Test email failed:', result.error);
      return false;
    }

    console.log('✅ Test email sent successfully:', result.data?.id);
    return true;
  } catch (error) {
    console.error('Test email error:', error);
    return false;
  }
}
