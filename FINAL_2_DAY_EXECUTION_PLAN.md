# Final 2-Day Execution Plan

## Current Status
- ✅ 28/34 tasks complete
- ✅ AI scheduling with full adaptive context
- ✅ Most backend logic implemented
- ❌ Email notifications (critical gap)
- ❌ Some API routes missing
- ❌ Learning loop not fully closed

## Critical Path to Launch

### TODAY (Day 1): Email Notifications + Testing

#### Step 1: Install Resend (5 min)
```bash
# Try this when network is stable:
npm install resend --legacy-peer-deps

# Or add to package.json manually:
# "resend": "^3.0.0"
```

Get API key from: https://resend.com/api-keys (free tier: 100 emails/day)

Add to `.env`:
```
RESEND_API_KEY=re_xxxxx
```

#### Step 2: Create Email Service (30 min)
Create `lib/email-service.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTaskCompletionEmail(
  to: string,
  taskName: string,
  taskId: string,
  scheduledEndTime: Date
) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  // Generate unique response tokens
  const completedToken = Buffer.from(`${taskId}:completed:${Date.now()}`).toString('base64');
  const stillWorkingToken = Buffer.from(`${taskId}:still-working:${Date.now()}`).toString('base64');
  const skippedToken = Buffer.from(`${taskId}:skipped:${Date.now()}`).toString('base64');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Did you finish this task?</h2>
      <p style="font-size: 18px; font-weight: bold;">${taskName}</p>
      <p style="color: #666;">Scheduled to end at ${scheduledEndTime.toLocaleTimeString()}</p>
      
      <div style="margin: 30px 0;">
        <a href="${baseUrl}/api/tasks/respond?token=${completedToken}" 
           style="display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 6px; margin: 5px;">
          ✅ Yes, Done!
        </a>
        
        <a href="${baseUrl}/api/tasks/respond?token=${stillWorkingToken}" 
           style="display: inline-block; padding: 12px 24px; background: #F59E0B; color: white; text-decoration: none; border-radius: 6px; margin: 5px;">
          ⏳ Still Working
        </a>
        
        <a href="${baseUrl}/api/tasks/respond?token=${skippedToken}" 
           style="display: inline-block; padding: 12px 24px; background: #EF4444; color: white; text-decoration: none; border-radius: 6px; margin: 5px;">
          ⏭️ Skipped
        </a>
      </div>
      
      <p style="color: #999; font-size: 12px;">
        This helps your AI agent learn your actual work patterns and make better predictions.
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'Adaptive Agent <onboarding@resend.dev>', // Change after domain verification
      to,
      subject: `Task Check-in: ${taskName}`,
      html,
    });
    
    return { success: true, tokens: { completedToken, stillWorkingToken, skippedToken } };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
```

#### Step 3: Create Response Handler API (20 min)
Create `app/api/tasks/respond/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    // Decode token: format is "taskId:status:timestamp"
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [taskId, status, timestamp] = decoded.split(':');

    // Verify token is recent (within 24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return NextResponse.redirect(new URL('/expired', request.url));
    }

    // Update task in database
    const actualEndTime = new Date();
    
    await prisma.planTask.update({
      where: { id: taskId },
      data: {
        actualEndTime,
        actualMinutes: status === 'completed' 
          ? Math.round((actualEndTime.getTime() - new Date().getTime()) / 60000)
          : null,
        status: status === 'completed' ? 'COMPLETED' : 
                status === 'skipped' ? 'SKIPPED' : 'IN_PROGRESS',
      },
    });

    // Redirect to success page
    return NextResponse.redirect(new URL(`/task-response?status=${status}`, request.url));
  } catch (error) {
    console.error('Error processing task response:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
}
```

#### Step 4: Create Success Page (15 min)
Create `app/task-response/page.tsx`:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function TaskResponsePage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const messages = {
    completed: {
      emoji: '🎉',
      title: 'Great work!',
      message: 'Your completion has been recorded. The AI will learn from this.',
    },
    'still-working': {
      emoji: '💪',
      title: 'Keep going!',
      message: 'Your progress has been noted. Take your time.',
    },
    skipped: {
      emoji: '👍',
      title: 'No problem!',
      message: 'Task skipped. The AI will adjust future plans accordingly.',
    },
  };

  const content = messages[status as keyof typeof messages] || messages.completed;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">{content.emoji}</div>
        <h1 className="text-3xl font-bold mb-2">{content.title}</h1>
        <p className="text-gray-600 mb-8">{content.message}</p>
        <Link 
          href="/dashboard"
          className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
```

#### Step 5: Schedule Email Sending (30 min)
Update `app/api/plan/generate/route.ts` to schedule emails:

Add after plan creation:
```typescript
import { sendTaskCompletionEmail } from '@/lib/email-service';

// After creating plan tasks, schedule emails
for (const task of createdTasks) {
  if (task.scheduledEndTime && session.user.email) {
    // Schedule email to be sent at task end time
    // For now, we'll use a simple setTimeout (in production, use a job queue)
    const delay = task.scheduledEndTime.getTime() - Date.now();
    
    if (delay > 0 && delay < 24 * 60 * 60 * 1000) { // Within 24 hours
      setTimeout(async () => {
        await sendTaskCompletionEmail(
          session.user.email!,
          task.title,
          task.id,
          task.scheduledEndTime!
        );
      }, delay);
    }
  }
}
```

#### Step 6: Test Email Flow (30 min)
```bash
# 1. Start the app
npm run dev

# 2. Do a check-in
# 3. Generate a plan
# 4. Wait for email (or manually trigger for testing)
# 5. Click response link
# 6. Verify database updated
```

---

### TOMORROW (Day 2): Learning Loop + Polish

#### Step 1: Close the Learning Loop (1 hour)
Update `lib/gemini.ts` to use actual completion data:

```typescript
// Add method to analyze completion patterns
export async function analyzeCompletionPatterns(userId: string) {
  const recentTasks = await prisma.planTask.findMany({
    where: {
      plan: { userId },
      actualEndTime: { not: null },
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    include: { plan: true },
  });

  // Calculate actual vs estimated time
  const timeAccuracy = recentTasks.map(task => ({
    estimated: task.estimatedMinutes,
    actual: task.actualMinutes || 0,
    ratio: (task.actualMinutes || 0) / task.estimatedMinutes,
  }));

  const avgRatio = timeAccuracy.reduce((sum, t) => sum + t.ratio, 0) / timeAccuracy.length;

  // Calculate completion rate by time of day
  const completionByHour = new Map<number, { completed: number; total: number }>();
  
  recentTasks.forEach(task => {
    const hour = task.scheduledStartTime?.getHours() || 9;
    const stats = completionByHour.get(hour) || { completed: 0, total: 0 };
    stats.total++;
    if (task.status === 'COMPLETED') stats.completed++;
    completionByHour.set(hour, stats);
  });

  return {
    timeBlindnessBuffer: avgRatio,
    productivityWindows: Array.from(completionByHour.entries()).map(([hour, stats]) => ({
      hour,
      completionRate: stats.completed / stats.total,
    })),
  };
}
```

Use in plan generation:
```typescript
// In scheduleTasksWithAI, add:
const patterns = await analyzeCompletionPatterns(userId);

// Include in adaptive context
adaptiveContext: {
  timeBlindness: {
    averageBuffer: patterns.timeBlindnessBuffer,
    confidence: patterns.timeBlindnessBuffer > 1 ? 'high' : 'medium',
    recommendation: `Apply ${patterns.timeBlindnessBuffer}x buffer to all estimates`,
  },
  productivityWindows: {
    peakHours: patterns.productivityWindows
      .filter(w => w.completionRate > 0.7)
      .map(w => ({ hour: w.hour, rate: w.completionRate })),
    // ... rest
  },
}
```

#### Step 2: Add Loading States (30 min)
Update key pages to show loading states:
- Dashboard: Show skeleton while loading
- Plan page: Show "Generating plan..." with spinner
- Check-in: Show "Submitting..." on button

#### Step 3: Test End-to-End (1 hour)
```bash
# Complete user flow:
1. Sign in
2. Do check-in
3. Generate plan
4. Receive email
5. Respond to email
6. Next day: check-in again
7. Generate new plan
8. Verify AI learned from yesterday
```

#### Step 4: Deploy to Vercel (1 hour)
```bash
# 1. Push to GitHub
git add .
git commit -m "Complete email notifications and learning loop"
git push

# 2. Deploy on Vercel
# - Connect GitHub repo
# - Add environment variables
# - Deploy

# 3. Set up Resend domain (optional)
# - Verify domain in Resend
# - Update from address in email-service.ts
```

#### Step 5: Create Demo Video (1 hour)
Record showing:
1. Check-in flow
2. AI generates plan with reasoning
3. Email notification received
4. User responds
5. Next day: AI adapts based on yesterday
6. Show Opik dashboard with AI decisions

---

## Quick Wins (If Time Permits)

### Add "Before/After" Comparison
Show users how AI improved:
```typescript
// In dashboard, show:
- Day 1: Planned 8 tasks, completed 3
- Day 7: Planned 4 tasks, completed 4
- "AI learned you work best with fewer, focused tasks"
```

### Add Manual Task Completion
In plan page, add buttons to mark tasks complete without email:
```typescript
<button onClick={() => markComplete(task.id)}>
  Mark Complete
</button>
```

### Improve Error Messages
Add user-friendly errors:
- "Couldn't send email - check your settings"
- "AI is thinking... this may take a moment"
- "No tasks found - connect Todoist first"

---

## Environment Variables Checklist

Make sure these are set:
```bash
# Database
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI
GEMINI_API_KEY=

# Email (NEW!)
RESEND_API_KEY=

# Integrations
TODOIST_CLIENT_ID=
TODOIST_CLIENT_SECRET=
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=

# Opik (optional)
OPIK_API_KEY=
OPIK_WORKSPACE=
```

---

## Success Metrics

By end of Day 2, you should have:
- ✅ Users receive email at task end time
- ✅ Users can respond via email link
- ✅ AI learns from actual completion data
- ✅ Next day's plan reflects learning
- ✅ Deployed and accessible online
- ✅ Demo video recorded

---

## Fallback Plan

If email service doesn't work:
1. Use in-app notifications only
2. Add manual "Mark Complete" buttons
3. Still collect completion data
4. Show learning in dashboard

The learning loop is more important than the email delivery method!

---

## Notes

- Email scheduling with setTimeout is fine for demo/hackathon
- For production, use a job queue (BullMQ, Inngest, etc.)
- Resend free tier: 100 emails/day (plenty for demo)
- Focus on the learning loop - that's the real AI agent part
