import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  sendCheckInReminderEmail,
  sendTaskReminderEmail,
  sendCelebrationEmail,
  sendBehindScheduleEmail,
  sendSupportiveCheckinEmail,
} from '@/lib/email';
import type { NotificationTone } from '@/lib/notifications';

/**
 * POST /api/notifications/send
 * Send notification to ALL enabled channels (browser AND email)
 * NO FALLBACK - sends to both if both are enabled
 * Requirements: 14.6, 21.10
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { notificationPreferences: true },
    });

    const preferences = user?.notificationPreferences as any;
    const channels = preferences?.channels || { browser: true, email: false };
    const tone = (preferences?.tone || 'gentle') as NotificationTone;

    const body = await request.json();
    const { type, goalTitle, taskTitle, estimatedMinutes, minutesAhead, minutesBehind } = body;

    const results = {
      browser: { enabled: channels.browser, sent: false, error: null as string | null },
      email: { enabled: channels.email, sent: false, error: null as string | null },
    };

    // Send to EMAIL if enabled
    if (channels.email) {
      try {
        let emailSent = false;

        switch (type) {
          case 'check_in_reminder':
            emailSent = await sendCheckInReminderEmail(session.user.email, goalTitle);
            break;

          case 'task_reminder':
            if (!taskTitle || !estimatedMinutes) {
              throw new Error('Missing required fields: taskTitle, estimatedMinutes');
            }
            emailSent = await sendTaskReminderEmail(
              session.user.email,
              taskTitle,
              estimatedMinutes,
              tone
            );
            break;

          case 'celebration':
            if (!taskTitle || minutesAhead === undefined) {
              throw new Error('Missing required fields: taskTitle, minutesAhead');
            }
            emailSent = await sendCelebrationEmail(
              session.user.email,
              taskTitle,
              minutesAhead,
              tone
            );
            break;

          case 'behind_schedule':
            if (!taskTitle || minutesBehind === undefined) {
              throw new Error('Missing required fields: taskTitle, minutesBehind');
            }
            emailSent = await sendBehindScheduleEmail(
              session.user.email,
              taskTitle,
              minutesBehind,
              tone
            );
            break;

          case 'supportive_checkin':
            if (!taskTitle) {
              throw new Error('Missing required field: taskTitle');
            }
            emailSent = await sendSupportiveCheckinEmail(
              session.user.email,
              taskTitle,
              tone
            );
            break;

          default:
            throw new Error('Invalid notification type');
        }

        results.email.sent = emailSent;
      } catch (error) {
        results.email.error = error instanceof Error ? error.message : 'Unknown error';
        console.error('Email notification error:', error);
      }
    }

    // Browser notifications are handled client-side
    // This endpoint just returns the status
    if (channels.browser) {
      results.browser.sent = true; // Client will handle actual sending
    }

    // Return results for both channels
    return NextResponse.json({
      success: true,
      results,
      message: `Notification sent to ${[
        channels.browser && 'browser',
        channels.email && 'email',
      ]
        .filter(Boolean)
        .join(' and ')}`,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
