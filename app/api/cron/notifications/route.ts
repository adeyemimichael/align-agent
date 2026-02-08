import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  shouldSendCheckInReminder,
  shouldSendTaskReminder,
  generateCheckInReminderMessage,
  generateTaskReminderMessage,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '@/lib/notifications';
import {
  sendCheckInReminderEmail,
  sendTaskReminderEmail,
} from '@/lib/email';

/**
 * Cron job to check and send pending notifications
 * This should be called every minute by Vercel Cron
 * 
 * GET /api/cron/notifications
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is called by Vercel Cron (optional security)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results = {
      checkInReminders: 0,
      taskReminders: 0,
      errors: [] as string[],
    };

    // Get all users with notification preferences enabled
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        notificationPreferences: true,
      },
    });

    for (const user of users) {
      try {
        const preferences = (user.notificationPreferences as any) || DEFAULT_NOTIFICATION_PREFERENCES;
        
        if (!preferences.enabled) {
          continue;
        }

        // Check for check-in reminders
        if (preferences.channels?.email || preferences.channels?.browser) {
          // Get user's last check-in
          const lastCheckIn = await prisma.checkIn.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
          });

          const reminderTime = preferences.checkInReminderTime || '09:00';
          
          if (shouldSendCheckInReminder(lastCheckIn?.createdAt || null, reminderTime, now)) {
            // Get user's goals for personalized message
            const goals = await prisma.goal.findMany({
              where: { userId: user.id },
              select: { title: true },
              take: 5,
            });

            const message = generateCheckInReminderMessage(goals);

            // Send email if enabled
            if (preferences.channels?.email && user.email) {
              try {
                await sendCheckInReminderEmail(
                  user.email,
                  goals.length > 0 ? goals[0].title : undefined
                );
                results.checkInReminders++;
              } catch (emailError) {
                console.error(`Failed to send check-in email to ${user.email}:`, emailError);
                results.errors.push(`Check-in email failed for ${user.email}`);
              }
            }

            // Browser notifications are handled client-side
            // We just log that one should be sent
            if (preferences.channels?.browser) {
              console.log(`Browser notification should be sent to user ${user.id}`);
            }
          }
        }

        // Check for task reminders
        if (preferences.taskReminders && (preferences.channels?.email || preferences.channels?.browser)) {
          // Get today's plan
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const plan = await prisma.dailyPlan.findFirst({
            where: {
              userId: user.id,
              date: {
                gte: today,
                lt: tomorrow,
              },
            },
            include: {
              tasks: {
                where: {
                  completed: false,
                  scheduledStart: {
                    not: null,
                  },
                },
              },
            },
          });

          if (plan) {
            const reminderMinutes = preferences.taskReminderMinutes || 5;

            for (const task of plan.tasks) {
              if (!task.scheduledStart) continue;

              if (shouldSendTaskReminder(task.scheduledStart, reminderMinutes, now)) {
                const message = generateTaskReminderMessage({
                  title: task.title,
                  estimatedMinutes: task.estimatedMinutes,
                });

                // Send email if enabled
                if (preferences.channels?.email && user.email) {
                  try {
                    await sendTaskReminderEmail(
                      user.email,
                      task.title,
                      task.estimatedMinutes,
                      preferences.tone || 'gentle'
                    );
                    results.taskReminders++;
                  } catch (emailError) {
                    console.error(`Failed to send task email to ${user.email}:`, emailError);
                    results.errors.push(`Task email failed for ${user.email}`);
                  }
                }

                // Browser notifications are handled client-side
                if (preferences.channels?.browser) {
                  console.log(`Browser notification should be sent to user ${user.id} for task ${task.id}`);
                }
              }
            }
          }
        }
      } catch (userError) {
        console.error(`Error processing notifications for user ${user.id}:`, userError);
        results.errors.push(`User ${user.id}: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Allow POST as well for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
