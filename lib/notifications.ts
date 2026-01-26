/**
 * Notification Service
 * Handles scheduling and sending notifications for check-in reminders and task deadlines
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */

export interface NotificationPreferences {
  enabled: boolean;
  checkInReminderTime: string; // HH:MM format (e.g., "09:00")
  taskReminders: boolean;
  taskReminderMinutes: number; // Minutes before task start
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
  channels: {
    browser: true,
    email: false,
  },
};
