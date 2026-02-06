# Email Notifications Guide

## ✅ COMPLETE: Email Notification System Implemented

Email notifications are now fully integrated as a fallback mechanism for browser notifications.

**Task 19.4 Status**: ✅ Complete

---

## Overview

The email notification system sends email reminders when browser notifications fail or are unavailable. This ensures users never miss important check-ins or task reminders.

### Features

- ✅ Check-in reminders with goal references
- ✅ Task start reminders (5 minutes before)
- ✅ Celebration emails for early completions
- ✅ Behind schedule notifications
- ✅ Supportive check-in emails
- ✅ Adaptive tone (gentle/direct/minimal)
- ✅ Beautiful HTML email templates
- ✅ Automatic fallback when browser notifications fail

---

## Setup

### 1. Get Resend API Key

1. Sign up at [https://resend.com](https://resend.com)
2. Verify your email address
3. Get your API key from the dashboard
4. (Optional) Add and verify your custom domain for branded emails

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Email Notifications
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="Adaptive Productivity Agent <notifications@yourdomain.com>"
```

**Note**: If you don't set `EMAIL_FROM`, it defaults to:
```
Adaptive Productivity Agent <notifications@adaptiveproductivity.app>
```

### 3. Test Configuration

Run the test script to verify your setup:

```bash
npm run test:email your-email@example.com
```

This will send a test email to verify everything is working.

---

## How It Works

### Automatic Fallback

The notification system tries browser notifications first, then falls back to email:

```typescript
// Try browser notification first
const browserSent = await sendNotification(title, body, data);

// If browser notification failed and email is enabled, send email
if (!browserSent && preferences.channels?.email) {
  await fetch('/api/notifications/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...data }),
  });
}
```

### Email Types

#### 1. Check-in Reminder
Sent daily at user-configured time (default: 9 AM)

**Gentle tone:**
```
Subject: Ready to make progress on "Launch MVP"?
Body: Check in to plan your day and take meaningful steps toward your goals.
      Your goal "Launch MVP" is waiting for you!
```

**Direct tone:**
```
Subject: Daily Check-In
Body: Check in now to work on "Launch MVP"
```

**Minimal tone:**
```
Subject: Check-in
Body: Goal: Launch MVP
```

#### 2. Task Reminder
Sent 5 minutes before task starts

**Gentle tone:**
```
Subject: Task starting soon
Body: About to start "Write proposal"—how's your focus level? 💪
      Estimated time: 60 minutes
```

**Direct tone:**
```
Subject: Task Starting
Body: "Write proposal" starts in 5min. Ready?
      Estimated: 60min
```

**Minimal tone:**
```
Subject: Task in 5min
Body: Write proposal
      60min
```

#### 3. Celebration
Sent when task is completed early

**Gentle tone:**
```
Subject: Amazing work!
Body: You crushed "Write proposal" 15min early! 🎉
      Great momentum! Want to jump into the next task now?
```

#### 4. Behind Schedule
Sent when user is behind schedule

**Gentle tone:**
```
Subject: Just checking in
Body: How's it going with "Write proposal"? 💙
      You're 20min behind schedule, but no pressure—let's adjust the plan together!
```

#### 5. Supportive Check-in
Sent when task is taking longer than expected

**Gentle tone:**
```
Subject: How are you doing?
Body: No worries about running over—"Write proposal" is tricky! 💙
      I'm giving you more time. Want to continue or switch to something easier?
```

---

## Email Templates

All emails use a beautiful, responsive HTML template with:

- ✅ Branded header with emoji
- ✅ Clean, readable typography
- ✅ Emerald green accent color (#10B981)
- ✅ Call-to-action button to open app
- ✅ Footer with unsubscribe/settings link
- ✅ Mobile-responsive design

### Template Structure

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      /* Clean, modern styling */
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="emoji">🌅</div>
        <h1>Subject Line</h1>
      </div>
      
      <div class="body">
        <p>Email body content...</p>
      </div>
      
      <div class="cta">
        <a href="..." class="button">Open App</a>
      </div>
      
      <div class="footer">
        <p>Manage notification preferences</p>
      </div>
    </div>
  </body>
</html>
```

---

## User Settings

Users can enable/disable email notifications in Settings:

1. Navigate to Settings page
2. Scroll to "Notification Channels"
3. Toggle "Email Notifications"
4. Emails will be sent as fallback when browser notifications fail

**Note**: Email notifications are disabled by default. Users must explicitly enable them.

---

## API Routes

### POST /api/notifications/send-email

Send an email notification.

**Authentication**: Required (session)

**Request Body**:
```json
{
  "type": "check_in_reminder" | "task_reminder" | "celebration" | "behind_schedule" | "supportive_checkin",
  "goalTitle": "string (optional)",
  "taskTitle": "string (required for task types)",
  "estimatedMinutes": "number (required for task_reminder)",
  "minutesAhead": "number (required for celebration)",
  "minutesBehind": "number (required for behind_schedule)",
  "tone": "gentle" | "direct" | "minimal"
}
```

**Response**:
```json
{
  "success": true,
  "sent": true
}
```

---

## Email Service Functions

### Core Functions

```typescript
// Send check-in reminder
await sendCheckInReminderEmail(
  userEmail: string,
  goalTitle?: string
): Promise<boolean>

// Send task reminder
await sendTaskReminderEmail(
  userEmail: string,
  taskTitle: string,
  estimatedMinutes: number,
  tone?: NotificationTone
): Promise<boolean>

// Send celebration
await sendCelebrationEmail(
  userEmail: string,
  taskTitle: string,
  minutesAhead: number,
  tone?: NotificationTone
): Promise<boolean>

// Send behind schedule notification
await sendBehindScheduleEmail(
  userEmail: string,
  taskTitle: string,
  minutesBehind: number,
  tone?: NotificationTone
): Promise<boolean>

// Send supportive check-in
await sendSupportiveCheckinEmail(
  userEmail: string,
  taskTitle: string,
  tone?: NotificationTone
): Promise<boolean>

// Test configuration
await testEmailConfiguration(
  testEmail: string
): Promise<boolean>
```

---

## Testing

### Manual Testing

1. **Enable email notifications**:
   - Go to Settings
   - Enable "Email Notifications"

2. **Test check-in reminder**:
   - Set check-in reminder time to current time + 1 minute
   - Wait for notification
   - Check email inbox

3. **Test task reminder**:
   - Create a plan with a task starting in 6 minutes
   - Wait for notification
   - Check email inbox

### Automated Testing

Run the test script:

```bash
npm run test:email your-email@example.com
```

Expected output:
```
🧪 Testing Email Notification Configuration...

✅ RESEND_API_KEY is set
📧 Email from: Adaptive Productivity Agent <notifications@adaptiveproductivity.app>

📨 Sending test email to: your-email@example.com...

✅ Test email sent successfully!
Check your inbox (and spam folder) for the test email.
```

---

## Troubleshooting

### Email Not Received

**Check 1**: Verify API key is set
```bash
echo $RESEND_API_KEY
```

**Check 2**: Check spam folder
Emails from new domains often go to spam initially.

**Check 3**: Verify email address
Ensure the user's email address is correct in their profile.

**Check 4**: Check Resend dashboard
Log in to Resend and check the email logs for delivery status.

### Email Sending Failed

**Check console logs**:
```
Failed to send email: { error: "..." }
```

**Common errors**:
- Invalid API key
- Domain not verified (for custom domains)
- Rate limit exceeded (free tier: 100 emails/day)
- Invalid recipient email address

### Email Formatting Issues

**Check HTML rendering**:
1. Send test email
2. View source in email client
3. Verify HTML structure is intact

**Test in multiple clients**:
- Gmail
- Outlook
- Apple Mail
- Mobile clients

---

## Rate Limits

### Resend Free Tier

- **100 emails per day**
- **3,000 emails per month**
- **1 verified domain**

### Resend Pro Tier ($20/month)

- **50,000 emails per month**
- **Unlimited verified domains**
- **Priority support**

### Optimization Tips

1. **Batch notifications**: Don't send multiple emails within 10 minutes
2. **Respect DND hours**: Don't send emails during user's sleep hours
3. **Smart fallback**: Only send email if browser notification fails
4. **User preferences**: Respect user's email notification toggle

---

## Security

### Email Address Protection

- User email addresses are never exposed in logs
- Emails are sent server-side only
- No client-side email handling

### API Key Security

- API key stored in environment variables
- Never exposed to client
- Server-side only access

### Spam Prevention

- Unsubscribe link in every email
- Respect user preferences
- Rate limiting built-in
- No unsolicited emails

---

## Files Modified

- `lib/email.ts` - Email service module
- `components/NotificationScheduler.tsx` - Added email fallback
- `components/NotificationSettings.tsx` - Enabled email toggle
- `app/api/notifications/send-email/route.ts` - Email API endpoint
- `.env` - Added Resend configuration
- `package.json` - Added test:email script
- `scripts/test-email-notifications.ts` - Email test script

---

## Requirements Satisfied

✅ **Requirement 14.6**: Email notifications implemented
✅ **Requirement 21.10**: Support browser push and email notifications
✅ **Task 19.4**: Implement email notifications

---

## Next Steps

1. ✅ Email notifications implemented
2. 🎯 Get Resend API key
3. 🎯 Configure environment variables
4. 🎯 Test email delivery
5. 🎯 Enable in production

---

## Support

- **Resend Docs**: https://resend.com/docs
- **Resend Dashboard**: https://resend.com/dashboard
- **Support**: support@resend.com
