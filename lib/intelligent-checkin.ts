/**
 * Intelligent Check-In System
 * 
 * Schedules check-ins at configured times and triggers based on progress.
 * Generates context-aware messages and handles user responses.
 * 
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8
 */

import { prisma } from './prisma';
import { getCurrentProgress, type ProgressSnapshot } from './progress-tracker';
import { syncTaskAppProgress, type SyncResult } from './task-app-sync';
import { calculateMomentumState, type MomentumState } from './momentum-tracker';

export type CheckInTrigger = 'scheduled' | 'behind_schedule' | 'momentum_collapse' | 'manual';
export type CheckInTone = 'gentle' | 'direct' | 'minimal';
export type CheckInResponse = 'done' | 'still_working' | 'stuck' | 'skip';

export interface CheckInSchedule {
  userId: string;
  times: string[]; // HH:MM format (e.g., ["10:00", "13:00", "15:30"])
  enabled: boolean;
  tone: CheckInTone;
}

export interface CheckInNotification {
  id: string;
  userId: string;
  planId: string;
  trigger: CheckInTrigger;
  scheduledFor: Date;
  sentAt: Date | null;
  message: CheckInMessage;
  response: CheckInResponse | null;
  respondedAt: Date | null;
  actionsTaken: string[];
}

export interface CheckInMessage {
  title: string;
  body: string;
  taskReference: {
    taskId: string;
    taskTitle: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    todoistStatus?: 'complete' | 'incomplete';
  } | null;
  responseOptions: Array<{
    value: CheckInResponse;
    label: string;
    description: string;
  }>;
  context: {
    minutesBehind: number;
    tasksCompleted: number;
    tasksRemaining: number;
    momentumState: MomentumState;
  };
}

export interface CheckInResponseAction {
  type: 'extend_time' | 'defer_task' | 'suggest_easier_win' | 'celebrate' | 'reschedule';
  description: string;
  taskId?: string;
  newScheduledEnd?: Date;
  deferredTaskIds?: string[];
  suggestedTaskIds?: string[];
}

/**
 * Get check-in schedule for a user
 * Requirement 18.1: Schedule check-ins at configured times
 */
export async function getCheckInSchedule(userId: string): Promise<CheckInSchedule> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const preferences = (user.notificationPreferences as any) || {};

  return {
    userId,
    times: preferences.checkInTimes || ['10:00', '13:00', '15:30'],
    enabled: preferences.checkInsEnabled !== false,
    tone: preferences.checkInTone || 'gentle',
  };
}

/**
 * Update check-in schedule for a user
 */
export async function updateCheckInSchedule(
  userId: string,
  schedule: Partial<CheckInSchedule>
): Promise<CheckInSchedule> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const preferences = (user.notificationPreferences as any) || {};

  const updatedPreferences = {
    ...preferences,
    checkInTimes: schedule.times || preferences.checkInTimes || ['10:00', '13:00', '15:30'],
    checkInsEnabled: schedule.enabled !== undefined ? schedule.enabled : preferences.checkInsEnabled !== false,
    checkInTone: schedule.tone || preferences.checkInTone || 'gentle',
  };

  await prisma.user.update({
    where: { id: userId },
    data: {
      notificationPreferences: updatedPreferences,
    },
  });

  return {
    userId,
    times: updatedPreferences.checkInTimes,
    enabled: updatedPreferences.checkInsEnabled,
    tone: updatedPreferences.checkInTone,
  };
}

/**
 * Check if a scheduled check-in should be triggered
 * Requirement 18.1: Schedule check-ins at configured times
 */
export function shouldTriggerScheduledCheckIn(
  schedule: CheckInSchedule,
  now: Date = new Date()
): boolean {
  if (!schedule.enabled) {
    return false;
  }

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

  // Check if current time matches any scheduled time (within 5-minute window)
  return schedule.times.some((scheduledTime) => {
    const [hour, minute] = scheduledTime.split(':').map(Number);
    return (
      currentHour === hour &&
      currentMinute >= minute &&
      currentMinute < minute + 5
    );
  });
}

/**
 * Check if a progress-based check-in should be triggered
 * Requirement 18.1: Trigger check-ins based on progress (behind schedule, momentum collapse)
 */
export async function shouldTriggerProgressCheckIn(
  userId: string,
  planId: string
): Promise<{
  shouldTrigger: boolean;
  trigger: CheckInTrigger | null;
  reason: string;
}> {
  const progress = await getCurrentProgress(planId);
  const momentumMetrics = await calculateMomentumState(userId, planId);

  // Trigger if momentum collapsed (2+ consecutive skips)
  if (momentumMetrics.state === 'collapsed') {
    return {
      shouldTrigger: true,
      trigger: 'momentum_collapse',
      reason: `Momentum collapsed: ${momentumMetrics.consecutiveSkips} consecutive skips`,
    };
  }

  // Trigger if significantly behind schedule (>30 minutes)
  if (progress.minutesAheadBehind < -30) {
    return {
      shouldTrigger: true,
      trigger: 'behind_schedule',
      reason: `Behind schedule by ${Math.abs(progress.minutesAheadBehind)} minutes`,
    };
  }

  return {
    shouldTrigger: false,
    trigger: null,
    reason: 'No trigger conditions met',
  };
}

/**
 * Schedule a check-in notification
 */
export async function scheduleCheckIn(
  userId: string,
  planId: string,
  trigger: CheckInTrigger,
  scheduledFor: Date = new Date()
): Promise<CheckInNotification> {
  // Sync with task app before generating check-in
  // Requirement 18.2: Sync with Todoist before each check-in
  let syncResult: SyncResult | null = null;
  try {
    syncResult = await syncTaskAppProgress(userId, planId);
  } catch (error) {
    console.warn('Failed to sync task app before check-in:', error);
  }

  // Get current progress
  const progress = await getCurrentProgress(planId);

  // Get user's check-in tone preference
  const schedule = await getCheckInSchedule(userId);

  // Generate check-in message
  const message = await generateCheckInMessage(
    userId,
    planId,
    progress,
    schedule.tone,
    syncResult
  );

  // Create notification record (stored in user preferences for now)
  const notification: CheckInNotification = {
    id: `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    planId,
    trigger,
    scheduledFor,
    sentAt: null,
    message,
    response: null,
    respondedAt: null,
    actionsTaken: [],
  };

  // Store in user preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (user) {
    const preferences = (user.notificationPreferences as any) || {};
    const checkInHistory = preferences.checkInHistory || [];

    checkInHistory.push({
      ...notification,
      scheduledFor: notification.scheduledFor.toISOString(),
    });

    // Keep only last 30 check-ins
    if (checkInHistory.length > 30) {
      checkInHistory.shift();
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: {
          ...preferences,
          checkInHistory,
        },
      },
    });
  }

  return notification;
}

/**
 * Mark check-in as sent
 */
export async function markCheckInSent(
  userId: string,
  checkInId: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const preferences = (user.notificationPreferences as any) || {};
  const checkInHistory = preferences.checkInHistory || [];

  const checkInIndex = checkInHistory.findIndex((c: any) => c.id === checkInId);
  if (checkInIndex !== -1) {
    checkInHistory[checkInIndex].sentAt = new Date().toISOString();

    await prisma.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: {
          ...preferences,
          checkInHistory,
        },
      },
    });
  }
}

/**
 * Get pending check-ins for a user
 */
export async function getPendingCheckIns(userId: string): Promise<CheckInNotification[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return [];

  const preferences = (user.notificationPreferences as any) || {};
  const checkInHistory = preferences.checkInHistory || [];

  return checkInHistory
    .filter((c: any) => !c.sentAt && new Date(c.scheduledFor) <= new Date())
    .map((c: any) => ({
      ...c,
      scheduledFor: new Date(c.scheduledFor),
      sentAt: c.sentAt ? new Date(c.sentAt) : null,
      respondedAt: c.respondedAt ? new Date(c.respondedAt) : null,
    }));
}

export default {
  getCheckInSchedule,
  updateCheckInSchedule,
  shouldTriggerScheduledCheckIn,
  shouldTriggerProgressCheckIn,
  scheduleCheckIn,
  markCheckInSent,
  getPendingCheckIns,
};

/**
 * Generate context-aware check-in message
 * Requirement 18.3: Generate context-aware check-in messages
 * Requirement 18.4: Provide response options
 * Requirement 18.8: Adapt tone based on user preference
 */
async function generateCheckInMessage(
  userId: string,
  planId: string,
  progress: ProgressSnapshot,
  tone: CheckInTone,
  syncResult: SyncResult | null
): Promise<CheckInMessage> {
  // Get current or next task
  const targetTask = progress.currentTask || progress.nextTask;

  // Build task reference with Todoist status
  let taskReference: CheckInMessage['taskReference'] = null;
  if (targetTask) {
    // Check Todoist status from sync result
    let todoistStatus: 'complete' | 'incomplete' | undefined;
    if (syncResult) {
      const taskChange = syncResult.changes.find(
        (c) => c.taskId === targetTask.id
      );
      if (taskChange) {
        todoistStatus = taskChange.type === 'completion' ? 'complete' : 'incomplete';
      }
    }

    // Map status to valid CheckInMessage status type
    const mappedStatus: 'not_started' | 'in_progress' | 'completed' | 'overdue' = 
      targetTask.status === 'delayed' ? 'overdue' :
      targetTask.status === 'skipped' ? 'not_started' :
      targetTask.status;

    taskReference = {
      taskId: targetTask.id,
      taskTitle: targetTask.title,
      status: mappedStatus,
      todoistStatus,
    };
  }

  // Build context
  const context = {
    minutesBehind: Math.max(0, -progress.minutesAheadBehind),
    tasksCompleted: progress.completedTasks,
    tasksRemaining: progress.upcomingTasks + progress.inProgressTasks,
    momentumState: progress.momentumState,
  };

  // Generate message based on tone and context
  const { title, body } = generateMessageContent(
    tone,
    progress,
    targetTask,
    syncResult
  );

  // Define response options
  const responseOptions = [
    {
      value: 'done' as CheckInResponse,
      label: 'Done',
      description: 'Task is complete',
    },
    {
      value: 'still_working' as CheckInResponse,
      label: 'Still working',
      description: 'Need more time',
    },
    {
      value: 'stuck' as CheckInResponse,
      label: 'Stuck',
      description: 'Having trouble',
    },
    {
      value: 'skip' as CheckInResponse,
      label: 'Skip',
      description: 'Move to next task',
    },
  ];

  return {
    title,
    body,
    taskReference,
    responseOptions,
    context,
  };
}

/**
 * Generate message content based on tone and context
 * Requirement 18.8: Adapt tone based on user preference (gentle, direct, minimal)
 */
function generateMessageContent(
  tone: CheckInTone,
  progress: ProgressSnapshot,
  targetTask: any,
  syncResult: SyncResult | null
): { title: string; body: string } {
  const taskTitle = targetTask?.title || 'your current task';
  const minutesBehind = Math.max(0, -progress.minutesAheadBehind);
  const isBehind = minutesBehind > 15;
  const momentumCollapsed = progress.momentumState === 'collapsed';

  // Reference Todoist status if available
  const todoistReference = syncResult && targetTask
    ? ` I see it's not marked complete in Todoist yet.`
    : '';

  if (tone === 'gentle') {
    if (momentumCollapsed) {
      return {
        title: '💙 Just checking in',
        body: `How's it going with "${taskTitle}"?${todoistReference} No pressure, just want to help you finish strong. Take your time and let me know how I can help.`,
      };
    } else if (isBehind) {
      return {
        title: '🤗 How are things going?',
        body: `Just checking in on "${taskTitle}".${todoistReference} You're about ${minutesBehind} minutes behind schedule, but that's totally okay. How's it going?`,
      };
    } else {
      return {
        title: '✨ Quick check-in',
        body: `How's "${taskTitle}" coming along?${todoistReference} You're doing great! Let me know if you need anything.`,
      };
    }
  } else if (tone === 'direct') {
    if (momentumCollapsed) {
      return {
        title: 'Status check',
        body: `"${taskTitle}" status check.${todoistReference} Done, still working, or stuck? Reply and I'll adjust the schedule.`,
      };
    } else if (isBehind) {
      return {
        title: 'Behind schedule',
        body: `You're ${minutesBehind}min behind. "${taskTitle}" status?${todoistReference} Should I defer other tasks or extend your time?`,
      };
    } else {
      return {
        title: 'Progress check',
        body: `"${taskTitle}" status?${todoistReference} Done, still working, or stuck?`,
      };
    }
  } else {
    // minimal
    if (momentumCollapsed) {
      return {
        title: 'Check-in',
        body: `"${taskTitle}" done?${todoistReference}`,
      };
    } else if (isBehind) {
      return {
        title: `${minutesBehind}min behind`,
        body: `"${taskTitle}" status?${todoistReference}`,
      };
    } else {
      return {
        title: 'Status?',
        body: `"${taskTitle}" done?${todoistReference}`,
      };
    }
  }
}

/**
 * Handle check-in response
 * Requirement 18.5: Handle "Still working" response (extend time, defer tasks)
 * Requirement 18.6: Handle "Stuck" response (defer task, suggest easier wins)
 * Requirement 18.7: Handle "Done" response (celebrate, continue plan)
 */
export async function handleCheckInResponse(
  userId: string,
  checkInId: string,
  response: CheckInResponse
): Promise<{
  actions: CheckInResponseAction[];
  message: string;
  updatedPlan?: any;
}> {
  // Get check-in from history
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  const preferences = (user.notificationPreferences as any) || {};
  const checkInHistory = preferences.checkInHistory || [];

  const checkInIndex = checkInHistory.findIndex((c: any) => c.id === checkInId);
  if (checkInIndex === -1) {
    throw new Error(`Check-in ${checkInId} not found`);
  }

  const checkIn = checkInHistory[checkInIndex];
  const planId = checkIn.planId;
  const taskId = checkIn.message.taskReference?.taskId;

  // Update check-in with response
  checkInHistory[checkInIndex].response = response;
  checkInHistory[checkInIndex].respondedAt = new Date().toISOString();

  const actions: CheckInResponseAction[] = [];
  let message = '';

  // Handle response based on type
  if (response === 'done') {
    // Requirement 18.7: Handle "Done" response (celebrate, continue plan)
    if (taskId) {
      // Mark task as complete
      const { taskProgress, isEarlyCompletion, minutesSaved } = await require('./progress-tracker').recordTaskCompletion(taskId);

      if (isEarlyCompletion) {
        message = `🎉 Amazing! You finished "${taskProgress.title}" ${minutesSaved} minutes early! Keep this momentum going!`;
        actions.push({
          type: 'celebrate',
          description: `Celebrated early completion (${minutesSaved} min saved)`,
          taskId,
        });
      } else {
        message = `✅ Great work on "${taskProgress.title}"! Moving on to the next task.`;
        actions.push({
          type: 'celebrate',
          description: 'Celebrated task completion',
          taskId,
        });
      }
    } else {
      message = '✅ Great! Keep up the good work!';
    }
  } else if (response === 'still_working') {
    // Requirement 18.5: Handle "Still working" response (extend time, defer tasks)
    if (taskId) {
      const task = await prisma.planTask.findUnique({
        where: { id: taskId },
        include: {
          plan: {
            include: {
              tasks: {
                orderBy: { scheduledStart: 'asc' },
              },
            },
          },
        },
      });

      if (task && task.scheduledEnd) {
        // Extend current task by 30 minutes
        const newScheduledEnd = new Date(task.scheduledEnd);
        newScheduledEnd.setMinutes(newScheduledEnd.getMinutes() + 30);

        await prisma.planTask.update({
          where: { id: taskId },
          data: {
            scheduledEnd: newScheduledEnd,
            estimatedMinutes: task.estimatedMinutes + 30,
          },
        });

        actions.push({
          type: 'extend_time',
          description: 'Extended task time by 30 minutes',
          taskId,
          newScheduledEnd,
        });

        // Defer next low-priority task
        const nextTasks = task.plan.tasks.filter(
          (t) =>
            !t.completed &&
            t.scheduledStart &&
            t.scheduledStart > task.scheduledEnd!
        );

        const lowPriorityTask = nextTasks.find((t) => t.priority >= 3);
        if (lowPriorityTask) {
          await prisma.planTask.update({
            where: { id: lowPriorityTask.id },
            data: {
              scheduledStart: null,
              scheduledEnd: null,
            },
          });

          actions.push({
            type: 'defer_task',
            description: `Deferred low-priority task: ${lowPriorityTask.title}`,
            deferredTaskIds: [lowPriorityTask.id],
          });

          message = `No problem! I've given you 30 more minutes for "${task.title}" and deferred "${lowPriorityTask.title}" to keep your schedule manageable.`;
        } else {
          message = `No problem! I've given you 30 more minutes for "${task.title}". Take your time!`;
        }
      }
    } else {
      message = 'No worries! Take the time you need.';
    }
  } else if (response === 'stuck') {
    // Requirement 18.6: Handle "Stuck" response (defer task, suggest easier wins)
    if (taskId) {
      const task = await prisma.planTask.findUnique({
        where: { id: taskId },
        include: {
          plan: {
            include: {
              tasks: {
                orderBy: { priority: 'asc' },
              },
            },
          },
        },
      });

      if (task) {
        // Defer the stuck task
        await prisma.planTask.update({
          where: { id: taskId },
          data: {
            scheduledStart: null,
            scheduledEnd: null,
          },
        });

        actions.push({
          type: 'defer_task',
          description: `Deferred stuck task: ${task.title}`,
          deferredTaskIds: [taskId],
        });

        // Find easier wins (lower priority, shorter duration)
        const easierTasks = task.plan.tasks.filter(
          (t) =>
            !t.completed &&
            t.id !== taskId &&
            t.estimatedMinutes < task.estimatedMinutes &&
            t.priority > task.priority
        );

        if (easierTasks.length > 0) {
          const suggestedTask = easierTasks[0];
          actions.push({
            type: 'suggest_easier_win',
            description: `Suggested easier task: ${suggestedTask.title}`,
            suggestedTaskIds: [suggestedTask.id],
          });

          message = `That's okay! I've moved "${task.title}" to later. How about trying "${suggestedTask.title}" instead? It's shorter and might give you a quick win.`;
        } else {
          message = `That's okay! I've moved "${task.title}" to later. Take a break if you need one, or let me know what you'd like to work on next.`;
        }
      }
    } else {
      message = 'No worries! Sometimes tasks are harder than expected. Want to try something else?';
    }
  } else if (response === 'skip') {
    // Skip the task and move to next
    if (taskId) {
      const task = await prisma.planTask.findUnique({
        where: { id: taskId },
      });

      if (task) {
        await prisma.planTask.update({
          where: { id: taskId },
          data: {
            scheduledStart: null,
            scheduledEnd: null,
          },
        });

        actions.push({
          type: 'defer_task',
          description: `Skipped task: ${task.title}`,
          deferredTaskIds: [taskId],
        });

        message = `Okay, I've moved "${task.title}" to later. Moving on to the next task!`;
      }
    } else {
      message = 'Okay, moving on!';
    }
  }

  // Store actions in check-in history
  checkInHistory[checkInIndex].actionsTaken = actions.map((a) => a.description);

  await prisma.user.update({
    where: { id: userId },
    data: {
      notificationPreferences: {
        ...preferences,
        checkInHistory,
      },
    },
  });

  return {
    actions,
    message,
  };
}

/**
 * Get check-in history for a user
 */
export async function getCheckInHistory(
  userId: string,
  limit: number = 10
): Promise<CheckInNotification[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return [];

  const preferences = (user.notificationPreferences as any) || {};
  const checkInHistory = preferences.checkInHistory || [];

  return checkInHistory
    .slice(-limit)
    .reverse()
    .map((c: any) => ({
      ...c,
      scheduledFor: new Date(c.scheduledFor),
      sentAt: c.sentAt ? new Date(c.sentAt) : null,
      respondedAt: c.respondedAt ? new Date(c.respondedAt) : null,
    }));
}
