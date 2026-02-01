/**
 * Notification Service
 * Handles scheduling and sending notifications for check-in reminders and task deadlines
 * Requirements: 14.1, 14.2, 14.3, 14.4, 21.6, 21.7, 21.8, 21.9
 */

export type NotificationTone = 'gentle' | 'direct' | 'minimal';

export interface NotificationPreferences {
  enabled: boolean;
  checkInReminderTime: string; // HH:MM format (e.g., "09:00")
  taskReminders: boolean;
  taskReminderMinutes: number; // Minutes before task start
  tone: NotificationTone; // User's preferred notification style
  channels: {
    browser: boolean;
    email: boolean;
  };
}

export interface ScheduledNotification {
  id: string;
  userId: string;
  type: 'check_in_reminder' | 'task_reminder';
  scheduledFor: Date;
  title: string;
  body: string;
  data?: any;
  sent: boolean;
}

/**
 * Generate a personalized check-in reminder message
 * Requirements: 14.1, 14.2
 */
export function generateCheckInReminderMessage(goals: Array<{ title: string }>): {
  title: string;
  body: string;
} {
  if (goals.length === 0) {
    return {
      title: '🌅 Time for your daily check-in',
      body: 'How are you feeling today? Check in to plan your day based on your capacity.',
    };
  }

  // Pick a random goal to feature
  const featuredGoal = goals[Math.floor(Math.random() * goals.length)];

  const messages = [
    {
      title: `🎯 Ready to make progress on "${featuredGoal.title}"?`,
      body: 'Check in to plan your day and take meaningful steps toward your goals.',
    },
    {
      title: '🌟 Your goals are waiting',
      body: `Let's work on "${featuredGoal.title}" today. Check in to get started!`,
    },
    {
      title: '💪 Time to plan your day',
      body: `Ready to make progress on "${featuredGoal.title}"? Check in now!`,
    },
    {
      title: '🚀 Let\'s make today count',
      body: `Your goal "${featuredGoal.title}" needs you. Check in to plan your day!`,
    },
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Generate a task reminder message
 * Requirements: 14.3
 */
export function generateTaskReminderMessage(task: {
  title: string;
  estimatedMinutes: number;
}): {
  title: string;
  body: string;
} {
  return {
    title: '⏰ Task starting soon',
    body: `"${task.title}" is scheduled to start in 5 minutes (${task.estimatedMinutes} min estimated).`,
  };
}

/**
 * Check if it's time to send a check-in reminder
 * Requirements: 14.1
 */
export function shouldSendCheckInReminder(
  lastCheckIn: Date | null,
  reminderTime: string, // HH:MM format
  now: Date = new Date()
): boolean {
  // Parse reminder time
  const [hours, minutes] = reminderTime.split(':').map(Number);
  
  // Check if current time matches reminder time (within 5 minute window)
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  
  const isReminderTime =
    currentHours === hours &&
    currentMinutes >= minutes &&
    currentMinutes < minutes + 5;

  if (!isReminderTime) {
    return false;
  }

  // Check if user already checked in today
  if (lastCheckIn) {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const checkInDate = new Date(lastCheckIn);
    checkInDate.setHours(0, 0, 0, 0);
    
    // Don't send reminder if already checked in today
    if (checkInDate.getTime() === today.getTime()) {
      return false;
    }
  }

  return true;
}

/**
 * Check if it's time to send a task reminder
 * Requirements: 14.3
 */
export function shouldSendTaskReminder(
  taskStartTime: Date,
  reminderMinutes: number,
  now: Date = new Date()
): boolean {
  const reminderTime = new Date(taskStartTime);
  reminderTime.setMinutes(reminderTime.getMinutes() - reminderMinutes);

  // Check if current time is within 1 minute of reminder time
  const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
  return timeDiff < 60 * 1000; // Within 1 minute
}

/**
 * Send browser push notification
 * Requirements: 14.5
 */
export async function sendBrowserNotification(
  title: string,
  body: string,
  data?: any
): Promise<boolean> {
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  // Check permission
  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'adaptive-productivity',
        data,
        requireInteraction: false,
      });

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      return true;
    } catch (error) {
      console.error('Failed to send browser notification:', error);
      return false;
    }
  } else if (Notification.permission !== 'denied') {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return sendBrowserNotification(title, body, data);
    }
  }

  return false;
}

/**
 * Request notification permission
 * Requirements: 14.5
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

/**
 * Check if notifications are supported and enabled
 */
export function areNotificationsSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!('Notification' in window)) {
    return null;
  }
  return Notification.permission;
}

/**
 * Default notification preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  checkInReminderTime: '09:00',
  taskReminders: true,
  taskReminderMinutes: 5,
  tone: 'gentle',
  channels: {
    browser: true,
    email: false,
  },
};

/**
 * Notification context for adaptive message generation
 * Requirements: 21.1, 21.2, 21.3, 21.4, 21.5
 */
export interface NotificationContext {
  taskTitle?: string;
  minutesBehind?: number;
  minutesAhead?: number;
  goalTitle?: string;
  taskAppStatus?: 'complete' | 'incomplete' | 'unknown';
  momentumState?: 'strong' | 'normal' | 'weak' | 'collapsed';
  skipRisk?: 'low' | 'medium' | 'high';
}

/**
 * Generate adaptive notification message based on tone preference
 * Requirements: 21.6, 21.7, 21.8, 21.9
 */
export function generateAdaptiveNotification(
  type: 'morning_checkin' | 'task_start' | 'celebration' | 'behind_schedule' | 'supportive_checkin',
  context: NotificationContext,
  tone: NotificationTone = 'gentle'
): { title: string; body: string } {
  const templates = {
    morning_checkin: {
      gentle: {
        title: context.goalTitle 
          ? `🌅 Ready to make progress on "${context.goalTitle}"?`
          : '🌅 Time for your daily check-in',
        body: context.goalTitle
          ? 'Check in to plan your day and take meaningful steps toward your goals. 💙'
          : 'How are you feeling today? Check in to plan your day based on your capacity.',
      },
      direct: {
        title: 'Daily Check-In',
        body: context.goalTitle
          ? `Check in now to work on "${context.goalTitle}"`
          : 'Check in to plan your day',
      },
      minimal: {
        title: 'Check-in',
        body: context.goalTitle ? `Goal: ${context.goalTitle}` : 'Check in?',
      },
    },
    task_start: {
      gentle: {
        title: '⏰ Task starting soon',
        body: context.taskTitle
          ? `About to start "${context.taskTitle}"—how's your focus level? 💪`
          : 'Your next task is starting soon. You have got this!',
      },
      direct: {
        title: 'Task Starting',
        body: context.taskTitle
          ? `"${context.taskTitle}" starts in 5min. Ready?`
          : 'Next task starts in 5 minutes',
      },
      minimal: {
        title: 'Task in 5min',
        body: context.taskTitle || 'Next task',
      },
    },
    celebration: {
      gentle: {
        title: '🎉 Amazing work!',
        body: context.taskTitle
          ? `You crushed "${context.taskTitle}" ${context.minutesAhead ? `${context.minutesAhead}min early` : 'ahead of schedule'}! Want to jump into the next task now?`
          : 'You completed that task early! Great momentum! 🚀',
      },
      direct: {
        title: 'Task Complete',
        body: context.taskTitle
          ? `"${context.taskTitle}" done ${context.minutesAhead ? `${context.minutesAhead}min early` : 'early'}. Continue?`
          : 'Task done early. Next task?',
      },
      minimal: {
        title: 'Done early',
        body: context.minutesAhead ? `+${context.minutesAhead}min` : 'Next?',
      },
    },
    behind_schedule: {
      gentle: {
        title: '💙 Just checking in',
        body: context.taskTitle
          ? `How's it going with "${context.taskTitle}"? ${context.taskAppStatus === 'incomplete' ? "I see it's not marked complete yet. " : ''}No pressure, just want to help you finish strong!`
          : `You're ${context.minutesBehind || 15}min behind schedule. No worries—let's adjust the plan together.`,
      },
      direct: {
        title: 'Behind Schedule',
        body: context.taskTitle
          ? `"${context.taskTitle}" status? ${context.taskAppStatus === 'incomplete' ? 'Todoist shows incomplete. ' : ''}Done/Working/Stuck?`
          : `${context.minutesBehind || 15}min behind. Defer tasks or extend time?`,
      },
      minimal: {
        title: context.taskTitle || 'Behind',
        body: context.taskTitle
          ? `${context.taskTitle} done?`
          : `${context.minutesBehind || 15}min behind`,
      },
    },
    supportive_checkin: {
      gentle: {
        title: '💙 How are you doing?',
        body: context.taskTitle
          ? `No worries about running over—"${context.taskTitle}" is tricky! I'm giving you more time. Want to continue or switch to something easier?`
          : 'Taking longer than expected? That happens! Let me adjust your schedule to be more realistic.',
      },
      direct: {
        title: 'Schedule Adjustment',
        body: context.taskTitle
          ? `"${context.taskTitle}" taking longer. Extend time or defer?`
          : 'Running behind. Adjust schedule?',
      },
      minimal: {
        title: 'Adjust?',
        body: context.taskTitle ? `${context.taskTitle}: extend?` : 'Extend time?',
      },
    },
  };

  return templates[type][tone];
}

/**
 * Generate task reminder with tone adaptation
 * Requirements: 21.3
 */
export function generateTaskReminderWithTone(
  task: { title: string; estimatedMinutes: number },
  tone: NotificationTone = 'gentle'
): { title: string; body: string } {
  return generateAdaptiveNotification('task_start', { taskTitle: task.title }, tone);
}

/**
 * Generate celebration notification
 * Requirements: 21.4
 */
export function generateCelebrationNotification(
  taskTitle: string,
  minutesAhead: number,
  tone: NotificationTone = 'gentle'
): { title: string; body: string } {
  return generateAdaptiveNotification(
    'celebration',
    { taskTitle, minutesAhead },
    tone
  );
}

/**
 * Generate behind schedule notification
 * Requirements: 21.5
 */
export function generateBehindScheduleNotification(
  context: NotificationContext,
  tone: NotificationTone = 'gentle'
): { title: string; body: string } {
  return generateAdaptiveNotification('behind_schedule', context, tone);
}

/**
 * Generate supportive check-in notification
 * Requirements: 21.5
 */
export function generateSupportiveCheckin(
  taskTitle: string,
  tone: NotificationTone = 'gentle'
): { title: string; body: string } {
  return generateAdaptiveNotification('supportive_checkin', { taskTitle }, tone);
}

/**
 * Smart notification timing configuration
 * Requirements: 21.3
 */
export interface NotificationTimingRules {
  noInterruptFirstMinutes: number; // Don't interrupt during first X minutes of task
  batchWindowMinutes: number; // Batch notifications within X minute windows
  doNotDisturbStart?: string; // HH:MM format
  doNotDisturbEnd?: string; // HH:MM format
}

export const DEFAULT_TIMING_RULES: NotificationTimingRules = {
  noInterruptFirstMinutes: 15,
  batchWindowMinutes: 10,
};

/**
 * Check if notification should be sent based on smart timing rules
 * Requirements: 21.3
 */
export function shouldSendNotificationNow(
  taskStartTime: Date | null,
  lastNotificationTime: Date | null,
  timingRules: NotificationTimingRules = DEFAULT_TIMING_RULES,
  now: Date = new Date()
): { shouldSend: boolean; reason?: string } {
  // Check Do Not Disturb hours
  if (timingRules.doNotDisturbStart && timingRules.doNotDisturbEnd) {
    const [dndStartHour, dndStartMin] = timingRules.doNotDisturbStart.split(':').map(Number);
    const [dndEndHour, dndEndMin] = timingRules.doNotDisturbEnd.split(':').map(Number);
    
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeMinutes = currentHour * 60 + currentMin;
    const dndStartMinutes = dndStartHour * 60 + dndStartMin;
    const dndEndMinutes = dndEndHour * 60 + dndEndMin;
    
    // Handle DND period that crosses midnight
    const inDndPeriod = dndStartMinutes < dndEndMinutes
      ? currentTimeMinutes >= dndStartMinutes && currentTimeMinutes < dndEndMinutes
      : currentTimeMinutes >= dndStartMinutes || currentTimeMinutes < dndEndMinutes;
    
    if (inDndPeriod) {
      return {
        shouldSend: false,
        reason: 'Do Not Disturb hours',
      };
    }
  }

  // Don't interrupt during first 15 minutes of task
  if (taskStartTime) {
    const minutesSinceTaskStart = (now.getTime() - taskStartTime.getTime()) / (1000 * 60);
    if (minutesSinceTaskStart < timingRules.noInterruptFirstMinutes) {
      return {
        shouldSend: false,
        reason: `Task started ${Math.floor(minutesSinceTaskStart)}min ago (waiting ${timingRules.noInterruptFirstMinutes}min)`,
      };
    }
  }

  // Batch notifications within 10-minute windows
  if (lastNotificationTime) {
    const minutesSinceLastNotification = (now.getTime() - lastNotificationTime.getTime()) / (1000 * 60);
    if (minutesSinceLastNotification < timingRules.batchWindowMinutes) {
      return {
        shouldSend: false,
        reason: `Last notification sent ${Math.floor(minutesSinceLastNotification)}min ago (batching within ${timingRules.batchWindowMinutes}min)`,
      };
    }
  }

  return { shouldSend: true };
}

/**
 * Calculate optimal notification time based on timing rules
 * Requirements: 21.3
 */
export function calculateOptimalNotificationTime(
  desiredTime: Date,
  taskStartTime: Date | null,
  lastNotificationTime: Date | null,
  timingRules: NotificationTimingRules = DEFAULT_TIMING_RULES
): Date {
  let optimalTime = new Date(desiredTime);

  // If task just started, delay notification
  if (taskStartTime) {
    const minNotificationTime = new Date(taskStartTime);
    minNotificationTime.setMinutes(
      minNotificationTime.getMinutes() + timingRules.noInterruptFirstMinutes
    );
    
    if (optimalTime < minNotificationTime) {
      optimalTime = minNotificationTime;
    }
  }

  // If notification was sent recently, delay to batch
  if (lastNotificationTime) {
    const minNotificationTime = new Date(lastNotificationTime);
    minNotificationTime.setMinutes(
      minNotificationTime.getMinutes() + timingRules.batchWindowMinutes
    );
    
    if (optimalTime < minNotificationTime) {
      optimalTime = minNotificationTime;
    }
  }

  // Avoid Do Not Disturb hours
  if (timingRules.doNotDisturbStart && timingRules.doNotDisturbEnd) {
    const [dndEndHour, dndEndMin] = timingRules.doNotDisturbEnd.split(':').map(Number);
    const optimalHour = optimalTime.getHours();
    const optimalMin = optimalTime.getMinutes();
    const optimalTimeMinutes = optimalHour * 60 + optimalMin;
    const dndEndMinutes = dndEndHour * 60 + dndEndMin;
    
    // If optimal time is during DND, schedule for end of DND period
    const [dndStartHour, dndStartMin] = timingRules.doNotDisturbStart.split(':').map(Number);
    const dndStartMinutes = dndStartHour * 60 + dndStartMin;
    
    const inDndPeriod = dndStartMinutes < dndEndMinutes
      ? optimalTimeMinutes >= dndStartMinutes && optimalTimeMinutes < dndEndMinutes
      : optimalTimeMinutes >= dndStartMinutes || optimalTimeMinutes < dndEndMinutes;
    
    if (inDndPeriod) {
      optimalTime.setHours(dndEndHour, dndEndMin, 0, 0);
    }
  }

  return optimalTime;
}
