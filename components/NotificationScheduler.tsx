'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from '@/lib/use-notifications';
import {
  shouldSendCheckInReminder,
  shouldSendTaskReminder,
  generateCheckInReminderMessage,
  generateTaskReminderWithTone,
  type NotificationTone,
  type NotificationPreferences,
} from '@/lib/notifications';

interface NotificationSchedulerProps {
  userId: string;
  preferences?: NotificationPreferences;
}

/**
 * Background notification scheduler
 * Checks every minute for notifications to send
 */
export default function NotificationScheduler({
  userId,
  preferences,
}: NotificationSchedulerProps) {
  const { sendNotification, permission } = useNotifications();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckInReminderRef = useRef<Date | null>(null);
  const sentTaskRemindersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Don't run if notifications are disabled or not granted
    if (!preferences?.enabled || permission !== 'granted') {
      return;
    }

    // Check for notifications every minute
    intervalRef.current = setInterval(async () => {
      await checkNotifications();
    }, 60 * 1000); // Every 1 minute

    // Initial check
    checkNotifications();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [preferences, permission, userId]);

  const checkNotifications = async () => {
    if (!preferences) return;

    const now = new Date();

    // Check for check-in reminder
    if (preferences.enabled) {
      await checkCheckInReminder(now);
    }

    // Check for task reminders
    if (preferences.taskReminders) {
      await checkTaskReminders(now);
    }
  };

  const checkCheckInReminder = async (now: Date) => {
    if (!preferences) return;

    try {
      // Fetch last check-in
      const response = await fetch('/api/checkin/latest');
      if (!response.ok) return;

      const data = await response.json();
      const lastCheckIn = data.checkIn ? new Date(data.checkIn.date) : null;

      // Check if it's time to send reminder
      if (shouldSendCheckInReminder(lastCheckIn, preferences.checkInReminderTime, now)) {
        // Prevent duplicate reminders
        if (
          lastCheckInReminderRef.current &&
          now.getTime() - lastCheckInReminderRef.current.getTime() < 60 * 60 * 1000 // 1 hour
        ) {
          return;
        }

        // Fetch user's goals
        const goalsResponse = await fetch('/api/goals');
        const goals = goalsResponse.ok ? await goalsResponse.json() : [];

        // Generate and send notification
        const message = generateCheckInReminderMessage(goals);
        
        // Try browser notification first
        const browserSent = await sendNotification(message.title, message.body, {
          type: 'check_in_reminder',
          url: '/checkin',
        });

        // If browser notification failed and email is enabled, send email
        if (!browserSent && preferences.channels?.email) {
          await fetch('/api/notifications/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'check_in_reminder',
              goalTitle: goals.length > 0 ? goals[0].title : undefined,
            }),
          });
        }

        if (browserSent) {
          lastCheckInReminderRef.current = now;
        }
      }
    } catch (error) {
      console.error('Check-in reminder error:', error);
    }
  };

  const checkTaskReminders = async (now: Date) => {
    if (!preferences) return;

    try {
      // Fetch current plan
      const response = await fetch('/api/plan/current');
      if (!response.ok) return;

      const data = await response.json();
      const plan = data.plan;

      if (!plan || !plan.tasks) return;

      // Check each task
      for (const task of plan.tasks) {
        if (task.completed) continue;
        if (!task.scheduledStart) continue;

        const taskStartTime = new Date(task.scheduledStart);
        const taskId = task.id;

        // Skip if already sent reminder for this task
        if (sentTaskRemindersRef.current.has(taskId)) continue;

        // Check if it's time to send reminder
        if (shouldSendTaskReminder(taskStartTime, preferences.taskReminderMinutes, now)) {
          // Generate and send notification
          const message = generateTaskReminderWithTone(
            {
              title: task.title,
              estimatedMinutes: task.estimatedMinutes,
            },
            preferences.tone
          );

          // Try browser notification first
          const browserSent = await sendNotification(message.title, message.body, {
            type: 'task_reminder',
            taskId: task.id,
            url: '/plan',
          });

          // If browser notification failed and email is enabled, send email
          if (!browserSent && preferences.channels?.email) {
            await fetch('/api/notifications/send-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'task_reminder',
                taskTitle: task.title,
                estimatedMinutes: task.estimatedMinutes,
                tone: preferences.tone,
              }),
            });
          }

          if (browserSent) {
            sentTaskRemindersRef.current.add(taskId);
          }
        }
      }

      // Clear sent reminders for tasks that are no longer in the plan
      const currentTaskIds = new Set(plan.tasks.map((t: any) => t.id));
      sentTaskRemindersRef.current.forEach((taskId) => {
        if (!currentTaskIds.has(taskId)) {
          sentTaskRemindersRef.current.delete(taskId);
        }
      });
    } catch (error) {
      console.error('Task reminder error:', error);
    }
  };

  // This component doesn't render anything
  return null;
}
