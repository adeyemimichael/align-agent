import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  sendCheckInReminderEmail,
  sendTaskReminderEmail,
  sendCelebrationEmail,
  sendBehindScheduleEmail,
  sendSupportiveCheckinEmail,
} from '@/lib/email';
import type { NotificationTone } from '@/lib/notifications';

/**
 * POST /api/notifications/send-email
 * Send email notification
 * Requirements: 14.6, 21.10
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, goalTitle, taskTitle, estimatedMinutes, minutesAhead, minutesBehind, tone } = body;

    let sent = false;

    switch (type) {
      case 'check_in_reminder':
        sent = await sendCheckInReminderEmail(session.user.email, goalTitle);
        break;

      case 'task_reminder':
        if (!taskTitle || !estimatedMinutes) {
          return NextResponse.json(
            { error: 'Missing required fields: taskTitle, estimatedMinutes' },
            { status: 400 }
          );
        }
        sent = await sendTaskReminderEmail(
          session.user.email,
          taskTitle,
          estimatedMinutes,
          tone as NotificationTone
        );
        break;

      case 'celebration':
        if (!taskTitle || minutesAhead === undefined) {
          return NextResponse.json(
            { error: 'Missing required fields: taskTitle, minutesAhead' },
            { status: 400 }
          );
        }
        sent = await sendCelebrationEmail(
          session.user.email,
          taskTitle,
          minutesAhead,
          tone as NotificationTone
        );
        break;

      case 'behind_schedule':
        if (!taskTitle || minutesBehind === undefined) {
          return NextResponse.json(
            { error: 'Missing required fields: taskTitle, minutesBehind' },
            { status: 400 }
          );
        }
        sent = await sendBehindScheduleEmail(
          session.user.email,
          taskTitle,
          minutesBehind,
          tone as NotificationTone
        );
        break;

      case 'supportive_checkin':
        if (!taskTitle) {
          return NextResponse.json(
            { error: 'Missing required field: taskTitle' },
            { status: 400 }
          );
        }
        sent = await sendSupportiveCheckinEmail(
          session.user.email,
          taskTitle,
          tone as NotificationTone
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send email notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, sent: true });
  } catch (error) {
    console.error('Send email notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
