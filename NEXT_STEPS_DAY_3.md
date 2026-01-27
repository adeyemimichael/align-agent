# Next Steps: Day 3 - Email Notifications

## Current Status

### ✅ COMPLETED (Days 1-2):
- Fixed broken features (analytics, task deletion)
- Built time tracking system
- Built productivity windows analysis
- **Made AI do REAL scheduling (not just messages)**
- AI now makes all scheduling decisions with full reasoning

### 🎯 NEXT UP (Day 3):
Build email notifications so AI can learn from actual completion data

---

## Day 3 Goal: Proactive Email Notifications

### What We're Building:
```
Morning:
1. User does check-in
2. AI generates schedule
3. User sees tasks with scheduled times

During Day:
4. At task end time: Email sent "Did you finish X?"
5. User clicks: "Yes" / "Still working" / "Skipped"
6. System records actual completion time

Next Morning:
7. AI analyzes yesterday's data
8. AI adjusts today's schedule based on learning
```

---

## Implementation Plan

### Step 1: Set Up Email Service (30 min)

**Choose Email Provider:**
- **Resend** (Recommended - free tier, simple API)
- SendGrid (alternative)
- AWS SES (if you have AWS)

**Install Resend:**
```bash
npm install resend
```

**Get API Key:**
1. Sign up at https://resend.com
2. Get API key
3. Add to `.env`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Create Email Client:**
```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTaskCompletionCheck(
  userEmail: string,
  task: {
    id: string;
    title: string;
    scheduledEnd: Date;
  }
) {
  const checkUrl = `${process.env.NEXTAUTH_URL}/api/tasks/${task.id}/completion-check`;
  
  await resend.emails.send({
    from: 'Align Agent <agent@yourdomain.com>',
    to: userEmail,
    subject: `Did you finish: ${task.title}?`,
    html: `
      <h2>Task Check-In</h2>
      <p>Your task "${task.title}" was scheduled to end at ${task.scheduledEnd.toLocaleTimeString()}.</p>
      <p>Did you finish it?</p>
      <p>
        <a href="${checkUrl}?status=completed">✅ Yes, completed</a> |
        <a href="${checkUrl}?status=in-progress">⏳ Still working</a> |
        <a href="${checkUrl}?status=skipped">⏭️ Skipped</a>
      </p>
    `
  });
}
```

---

### Step 2: Create Completion Check Endpoint (45 min)

**Create API Route:**
```typescript
// app/api/tasks/[id]/completion-check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const taskId = params.id;
  const status = request.nextUrl.searchParams.get('status');
  
  if (!status || !['completed', 'in-progress', 'skipped'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const task = await prisma.planTask.findUnique({
    where: { id: taskId }
  });

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const now = new Date();

  if (status === 'completed') {
    // Calculate actual time
    const actualMinutes = task.actualStartTime
      ? Math.round((now.getTime() - task.actualStartTime.getTime()) / (1000 * 60))
      : task.estimatedMinutes;

    await prisma.planTask.update({
      where: { id: taskId },
      data: {
        completed: true,
        completedAt: now,
        actualEndTime: now,
        actualMinutes,
        actualStartTime: task.actualStartTime || task.scheduledStart
      }
    });
  } else if (status === 'in-progress') {
    // Extend the task
    await prisma.planTask.update({
      where: { id: taskId },
      data: {
        // Don't mark as complete, just record that it's taking longer
        actualStartTime: task.actualStartTime || task.scheduledStart
      }
    });
  } else if (status === 'skipped') {
    await prisma.planTask.update({
      where: { id: taskId },
      data: {
        completed: false,
        // Mark as skipped somehow (you might want to add a field)
      }
    });
  }

  // Redirect to a thank you page
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/tasks/check-in-complete`);
}
```

---

### Step 3: Schedule Email Sending (1 hour)

**Option A: Vercel Cron (Recommended)**

Create cron endpoint:
```typescript
// app/api/cron/send-task-checks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTaskCompletionCheck } from '@/lib/email';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  // Find tasks that ended in the last 5 minutes
  const tasks = await prisma.planTask.findMany({
    where: {
      scheduledEnd: {
        gte: fiveMinutesAgo,
        lte: now
      },
      completed: false,
      // Don't send if already sent
      emailSent: false
    },
    include: {
      plan: {
        include: {
          user: true
        }
      }
    }
  });

  for (const task of tasks) {
    try {
      await sendTaskCompletionCheck(task.plan.user.email, {
        id: task.id,
        title: task.title,
        scheduledEnd: task.scheduledEnd!
      });

      // Mark email as sent
      await prisma.planTask.update({
        where: { id: task.id },
        data: { emailSent: true }
      });
    } catch (error) {
      console.error(`Failed to send email for task ${task.id}:`, error);
    }
  }

  return NextResponse.json({ 
    message: 'Task checks sent',
    count: tasks.length 
  });
}
```

**Add to `vercel.json`:**
```json
{
  "crons": [
    {
      "path": "/api/cron/send-task-checks",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Add to `.env`:**
```
CRON_SECRET=your-random-secret-here
```

---

### Step 4: Update Database Schema (15 min)

**Add to `prisma/schema.prisma`:**
```prisma
model PlanTask {
  // ... existing fields ...
  
  emailSent         Boolean   @default(false)
  completionStatus  String?   // 'completed', 'in-progress', 'skipped'
  
  // ... rest of model ...
}
```

**Run migration:**
```bash
npx prisma migrate dev --name add-email-tracking
```

---

### Step 5: Create Thank You Page (15 min)

```typescript
// app/tasks/check-in-complete/page.tsx
export default function CheckInComplete() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Thanks for checking in!</h1>
        <p className="text-gray-600 mb-8">
          Your response helps the AI learn and improve your future schedules.
        </p>
        <a 
          href="/dashboard" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
```

---

## Testing Plan

### Local Testing:
1. Create a test task with scheduledEnd = now + 2 minutes
2. Wait 2 minutes
3. Manually trigger cron: `curl http://localhost:3000/api/cron/send-task-checks -H "Authorization: Bearer your-secret"`
4. Check email
5. Click link
6. Verify database updated

### Production Testing:
1. Deploy to Vercel
2. Set up cron job
3. Complete check-in
4. Generate plan
5. Wait for task end time
6. Check email
7. Click link
8. Verify learning applied next day

---

## Success Criteria

### Must Work:
- ✅ Email sent at task end time
- ✅ User can click "Completed" / "Still working" / "Skipped"
- ✅ Database records actual completion time
- ✅ AI uses this data in next day's schedule

### Should Show:
- ✅ Clear email with task details
- ✅ Simple one-click response
- ✅ Thank you page after response
- ✅ Visible learning in next schedule

---

## Time Estimate

- Step 1: Set up email service (30 min)
- Step 2: Create completion check endpoint (45 min)
- Step 3: Schedule email sending (1 hour)
- Step 4: Update database schema (15 min)
- Step 5: Create thank you page (15 min)
- Testing (45 min)

**Total: ~3.5 hours**

---

## After Day 3

You'll have:
- ✅ AI that makes real scheduling decisions
- ✅ Email notifications that check completion
- ✅ Data collection for AI learning

Next (Day 4):
- Build AI learning loop
- Analyze completion patterns
- Adapt future schedules

---

## Quick Start Commands

```bash
# Install email service
npm install resend

# Add to .env
echo "RESEND_API_KEY=re_xxxxxxxxxxxxx" >> .env
echo "CRON_SECRET=$(openssl rand -base64 32)" >> .env

# Update database
npx prisma migrate dev --name add-email-tracking

# Test locally
npm run dev
```

---

## Questions to Answer

1. **Which email service?** Resend (recommended) or SendGrid?
2. **Email frequency?** Every task or just high-priority?
3. **Reminder timing?** At end time or 5 minutes after?
4. **Fallback?** What if user doesn't respond?

---

## Ready to Start?

Let me know when you want to begin Day 3, and I'll help you implement the email notification system!
