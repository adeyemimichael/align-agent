/**
 * Adaptive Notification Service
 * Handles all notification types with context-aware messaging
 * Requirements: 21.1, 21.2, 21.3, 21.4, 21.5
 */

import {
  NotificationTone,
  NotificationContext,
  generateAdaptiveNotification,
  generateCelebrationNotification,
  generateBehindScheduleNotification,
  generateSupportiveCheckin,
  shouldSendNotificationNow,
  calculateOptimalNotificationTime,
  NotificationTimingRules,
  DEFAULT_TIMING_RULES,
} from './notifications';

export interface AdaptiveNotificationRequest {
  userId: string;
  type: 'morning_checkin' | 'task_start' | 'celebration' | 'behind_schedule' | 'supportive_checkin';
  context: NotificationContext;
  tone: NotificationTone;
  timingRules?: NotificationTimingRules;
  taskStartTime?: Date | null;
  lastNotificationTime?: Date | null;
}

export interface NotificationResult {
  sent: boolean;
  scheduledFor?: Date;
  reason?: string;
  notification?: {
    title: string;
    body: string;
  };
}

/**
 * Send adaptive notification with smart timing
 * Requirements: 21.1, 21.2, 21.3, 21.4, 21.5
 */
export async function sendAdaptiveNotification(
  request: AdaptiveNotificationRequest
): Promise<NotificationResult> {
  const {
    type,
    context,
    tone,
    timingRules = DEFAULT_TIMING_RULES,
    taskStartTime = null,
    lastNotificationTime = null,
  } = request;

  // Check if notification should be sent now
  const timingCheck = shouldSendNotificationNow(
    taskStartTime,
    lastNotificationTime,
    timingRules
  );

  if (!timingCheck.shouldSend) {
    // Calculate optimal time to send
    const optimalTime = calculateOptimalNotificationTime(
      new Date(),
      taskStartTime,
      lastNotificationTime,
      timingRules
    );

    return {
      sent: false,
      scheduledFor: optimalTime,
      reason: timingCheck.reason,
    };
  }

  // Generate notification message
  const notification = generateAdaptiveNotification(type, context, tone);

  // Send notification (browser push for now)
  // In production, this would integrate with notification service
  console.log('Sending notification:', notification);

  return {
    sent: true,
    notification,
  };
}

/**
 * Generate morning check-in reminder with goal reference
 * Requirements: 21.1, 21.2
 */
export function createMorningCheckInReminder(
  goalTitle: string | null,
  tone: NotificationTone = 'gentle'
): { title: string; body: string } {
  return generateAdaptiveNotification(
    'morning_checkin',
    { goalTitle: goalTitle || undefined },
    tone
  );
}

/**
 * Generate task start reminder (5 minutes before)
 * Requirements: 21.3
 */
export function createTaskStartReminder(
  taskTitle: string,
  estimatedMinutes: number,
  tone: NotificationTone = 'gentle'
): { title: string; body: string } {
  return generateAdaptiveNotification(
    'task_start',
    { taskTitle },
    tone
  );
}

/**
 * Generate celebration notification for early completion
 * Requirements: 21.4
 */
export function createCelebrationNotification(
  taskTitle: string,
  minutesAhead: number,
  tone: NotificationTone = 'gentle'
): { title: string; body: string } {
  return generateCelebrationNotification(taskTitle, minutesAhead, tone);
}

/**
 * Generate supportive check-in for behind schedule
 * Requirements: 21.5
 */
export function createBehindScheduleNotification(
  taskTitle: string,
  minutesBehind: number,
  taskAppStatus: 'complete' | 'incomplete' | 'unknown',
  tone: NotificationTone = 'gentle'
): { title: string; body: string } {
  return generateBehindScheduleNotification(
    {
      taskTitle,
      minutesBehind,
      taskAppStatus,
    },
    tone
  );
}

/**
 * Notification scheduler that respects timing rules
 * Requirements: 21.3
 */
export class NotificationScheduler {
  private lastNotificationTime: Date | null = null;
  private currentTaskStartTime: Date | null = null;
  private timingRules: NotificationTimingRules;

  constructor(timingRules: NotificationTimingRules = DEFAULT_TIMING_RULES) {
    this.timingRules = timingRules;
  }

  /**
   * Update task start time (resets interrupt timer)
   */
  setTaskStartTime(startTime: Date): void {
    this.currentTaskStartTime = startTime;
  }

  /**
   * Clear task start time
   */
  clearTaskStartTime(): void {
    this.currentTaskStartTime = null;
  }

  /**
   * Check if notification can be sent now
   */
  canSendNotification(): { canSend: boolean; reason?: string } {
    const check = shouldSendNotificationNow(
      this.currentTaskStartTime,
      this.lastNotificationTime,
      this.timingRules
    );

    return {
      canSend: check.shouldSend,
      reason: check.reason,
    };
  }

  /**
   * Schedule notification with smart timing
   */
  scheduleNotification(
    type: AdaptiveNotificationRequest['type'],
    context: NotificationContext,
    tone: NotificationTone
  ): NotificationResult {
    const check = this.canSendNotification();

    if (!check.canSend) {
      const optimalTime = calculateOptimalNotificationTime(
        new Date(),
        this.currentTaskStartTime,
        this.lastNotificationTime,
        this.timingRules
      );

      return {
        sent: false,
        scheduledFor: optimalTime,
        reason: check.reason,
      };
    }

    // Generate and "send" notification
    const notification = generateAdaptiveNotification(type, context, tone);
    this.lastNotificationTime = new Date();

    return {
      sent: true,
      notification,
    };
  }

  /**
   * Update timing rules
   */
  updateTimingRules(rules: Partial<NotificationTimingRules>): void {
    this.timingRules = { ...this.timingRules, ...rules };
  }
}
