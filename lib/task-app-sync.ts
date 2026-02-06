/**
 * Task App Sync for Progress Detection
 * 
 * Syncs with Todoist to detect task completions, unplanned completions,
 * and updates momentum state based on progress.
 * 
 * Requirements: 14.7, 14.8
 */

import { prisma } from './prisma';
import { TodoistClient } from './todoist';
import { recordTaskCompletion, recordTaskStart } from './progress-tracker';
import { calculateMomentumState, updateTaskMomentumState } from './momentum-tracker';

export interface SyncResult {
  syncedAt: Date;
  tasksChecked: number;
  completionsDetected: number;
  unplannedCompletions: number;
  newTasksDetected: number;
  momentumUpdated: boolean;
  changes: SyncChange[];
}

export interface SyncChange {
  type: 'completion' | 'unplanned_completion' | 'new_task' | 'reopened';
  taskId: string;
  taskTitle: string;
  externalId: string;
  timestamp: Date;
  details?: any;
}

export interface UnplannedCompletion {
  externalId: string;
  title: string;
  completedAt: Date;
  wasInPlan: boolean;
}

/**
 * Sync with Todoist to detect task completions
 * Requirement 14.7: Sync with Todoist to detect completions
 */
export async function syncTaskAppProgress(
  userId: string,
  planId?: string
): Promise<SyncResult> {
  // Get user's Todoist integration
  const integration = await prisma.integration.findUnique({
    where: {
      userId_platform: {
        userId,
        platform: 'todoist',
      },
    },
  });

  if (!integration) {
    // Return empty result if Todoist is not connected
    return {
      syncedAt: new Date(),
      tasksChecked: 0,
      completionsDetected: 0,
      unplannedCompletions: 0,
      newTasksDetected: 0,
      momentumUpdated: false,
      changes: [],
    };
  }

  // Get current plan
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const plan = planId
    ? await prisma.dailyPlan.findUnique({
        where: { id: planId },
        include: {
          tasks: true,
        },
      })
    : await prisma.dailyPlan.findFirst({
        where: {
          userId,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        include: {
          tasks: true,
        },
      });

  if (!plan) {
    // Return empty result if no plan exists
    return {
      syncedAt: new Date(),
      tasksChecked: 0,
      completionsDetected: 0,
      unplannedCompletions: 0,
      newTasksDetected: 0,
      momentumUpdated: false,
      changes: [],
    };
  }

  // Fetch tasks from Todoist
  const todoistClient = new TodoistClient(integration.accessToken);
  let todoistTasks;
  
  try {
    todoistTasks = await todoistClient.getTasks();
  } catch (apiError) {
    console.error('[Sync] Todoist API error:', apiError);
    // Return empty result if API call fails
    return {
      syncedAt: new Date(),
      tasksChecked: 0,
      completionsDetected: 0,
      unplannedCompletions: 0,
      newTasksDetected: 0,
      momentumUpdated: false,
      changes: [],
    };
  }

  const changes: SyncChange[] = [];
  let completionsDetected = 0;
  let unplannedCompletions = 0;
  let newTasksDetected = 0;

  // Check each task in the plan
  for (const planTask of plan.tasks) {
    if (!planTask.externalId) continue;

    // Find corresponding Todoist task
    const todoistTask = todoistTasks.find((t) => t.id === planTask.externalId);

    if (!todoistTask) {
      // Task not found in Todoist - might be deleted
      continue;
    }

    // Check if task was completed in Todoist but not in our system
    if (todoistTask.is_completed && !planTask.completed) {
      // Task completed in Todoist - sync to our system
      await recordTaskCompletion(planTask.id);
      completionsDetected++;

      changes.push({
        type: 'completion',
        taskId: planTask.id,
        taskTitle: planTask.title,
        externalId: planTask.externalId,
        timestamp: new Date(),
        details: {
          source: 'todoist',
        },
      });
    } else if (!todoistTask.is_completed && planTask.completed) {
      // Task was marked complete in our system but reopened in Todoist
      await prisma.planTask.update({
        where: { id: planTask.id },
        data: {
          completed: false,
          completedAt: null,
          actualEndTime: null,
        },
      });

      changes.push({
        type: 'reopened',
        taskId: planTask.id,
        taskTitle: planTask.title,
        externalId: planTask.externalId,
        timestamp: new Date(),
        details: {
          source: 'todoist',
        },
      });
    }
  }

  // Detect unplanned completions (tasks completed in Todoist but not in plan)
  // Requirement 14.8: Detect unplanned completions
  const plannedExternalIds = new Set(
    plan.tasks.filter((t) => t.externalId).map((t) => t.externalId)
  );

  for (const todoistTask of todoistTasks) {
    if (todoistTask.is_completed && !plannedExternalIds.has(todoistTask.id)) {
      // This task was completed but wasn't in today's plan
      unplannedCompletions++;

      changes.push({
        type: 'unplanned_completion',
        taskId: '', // No plan task ID
        taskTitle: todoistTask.content,
        externalId: todoistTask.id,
        timestamp: new Date(),
        details: {
          source: 'todoist',
          wasInPlan: false,
        },
      });
    }
  }

  // Update momentum state based on progress
  // Requirement 14.8: Update momentum state based on progress
  const momentumMetrics = await calculateMomentumState(userId, plan.id);
  let momentumUpdated = false;

  // Update momentum state for all tasks in the plan
  for (const planTask of plan.tasks) {
    if (planTask.momentumState !== momentumMetrics.state) {
      await prisma.planTask.update({
        where: { id: planTask.id },
        data: {
          momentumState: momentumMetrics.state,
        },
      });
      momentumUpdated = true;
    }
  }

  return {
    syncedAt: new Date(),
    tasksChecked: plan.tasks.length,
    completionsDetected,
    unplannedCompletions,
    newTasksDetected,
    momentumUpdated,
    changes,
  };
}

/**
 * Get unplanned completions for a user
 * Requirement 14.8: Detect unplanned completions
 */
export async function getUnplannedCompletions(
  userId: string,
  date: Date = new Date()
): Promise<UnplannedCompletion[]> {
  // Get user's Todoist integration
  const integration = await prisma.integration.findUnique({
    where: {
      userId_platform: {
        userId,
        platform: 'todoist',
      },
    },
  });

  if (!integration) {
    return [];
  }

  // Get today's plan
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const plan = await prisma.dailyPlan.findFirst({
    where: {
      userId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      tasks: true,
    },
  });

  if (!plan) {
    return [];
  }

  // Fetch completed tasks from Todoist
  const todoistClient = new TodoistClient(integration.accessToken);
  const todoistTasks = await todoistClient.getTasks();

  const plannedExternalIds = new Set(
    plan.tasks.filter((t) => t.externalId).map((t) => t.externalId)
  );

  const unplannedCompletions: UnplannedCompletion[] = [];

  for (const todoistTask of todoistTasks) {
    if (todoistTask.is_completed && !plannedExternalIds.has(todoistTask.id)) {
      unplannedCompletions.push({
        externalId: todoistTask.id,
        title: todoistTask.content,
        completedAt: new Date(), // Todoist doesn't provide completion time in basic API
        wasInPlan: false,
      });
    }
  }

  return unplannedCompletions;
}

/**
 * Sync task completion from external app to our system
 */
export async function syncExternalCompletion(
  userId: string,
  externalId: string,
  platform: 'todoist' | 'notion' | 'linear'
): Promise<{
  synced: boolean;
  taskId?: string;
  wasInPlan: boolean;
}> {
  // Find task in today's plan
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const plan = await prisma.dailyPlan.findFirst({
    where: {
      userId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      tasks: true,
    },
  });

  if (!plan) {
    return {
      synced: false,
      wasInPlan: false,
    };
  }

  // Find task with matching external ID
  const task = plan.tasks.find((t) => t.externalId === externalId);

  if (!task) {
    return {
      synced: false,
      wasInPlan: false,
    };
  }

  // Mark task as complete if not already
  if (!task.completed) {
    await recordTaskCompletion(task.id);
  }

  return {
    synced: true,
    taskId: task.id,
    wasInPlan: true,
  };
}

/**
 * Auto-sync progress at regular intervals
 * This should be called periodically (e.g., every 5-10 minutes)
 */
export async function autoSyncProgress(userId: string): Promise<SyncResult> {
  try {
    const result = await syncTaskAppProgress(userId);
    
    // Log sync result for debugging
    console.log(`[Auto-sync] User ${userId}: ${result.completionsDetected} completions, ${result.unplannedCompletions} unplanned`);
    
    return result;
  } catch (error) {
    console.error(`[Auto-sync] Failed for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Check if sync is needed based on last sync time
 */
export async function shouldSync(
  userId: string,
  minIntervalMinutes: number = 5
): Promise<boolean> {
  // Get user's last sync time from metadata
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return false;

  const preferences = (user.notificationPreferences as any) || {};
  const lastSyncTime = preferences.lastTaskAppSync
    ? new Date(preferences.lastTaskAppSync)
    : null;

  if (!lastSyncTime) return true;

  const minutesSinceLastSync =
    (new Date().getTime() - lastSyncTime.getTime()) / (1000 * 60);

  return minutesSinceLastSync >= minIntervalMinutes;
}

/**
 * Update last sync time for a user
 */
export async function updateLastSyncTime(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const preferences = (user.notificationPreferences as any) || {};

  await prisma.user.update({
    where: { id: userId },
    data: {
      notificationPreferences: {
        ...preferences,
        lastTaskAppSync: new Date().toISOString(),
      },
    },
  });
}
