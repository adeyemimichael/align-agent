/**
 * Time Tracking Library
 * Tracks actual vs estimated time for tasks to handle "time blindness"
 * This is the CORE of making the agent learn from user behavior
 */

import { prisma } from './prisma';
import { cache, CacheKeys } from './cache';
import { getCompletedTasksWithTimeTracking } from './db-utils';

export interface TimeTrackingData {
  taskId: string;
  taskTitle: string;
  estimatedMinutes: number;
  actualMinutes: number;
  difference: number;
  accuracyRate: number; // 0-100, how accurate the estimate was
  buffer: number; // Multiplier for future estimates (e.g., 2.0 = 2x)
}

export interface TimeBlindnessInsight {
  userId: string;
  averageBuffer: number; // Average multiplier across all tasks
  totalTasks: number;
  underestimatedTasks: number;
  overestimatedTasks: number;
  accurateTasks: number;
  recommendation: string;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Calculate actual duration from start and end times
 */
export function calculateActualDuration(
  startTime: Date,
  endTime: Date
): number {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.round(diffMs / (1000 * 60)); // Convert to minutes
}

/**
 * Calculate time blindness buffer (multiplier for future estimates)
 * Returns how much to multiply estimates by based on actual performance
 */
export function calculateTimeBlindnessBuffer(
  estimatedMinutes: number,
  actualMinutes: number
): number {
  if (estimatedMinutes === 0) return 1.0;
  return actualMinutes / estimatedMinutes;
}

/**
 * Calculate accuracy rate (0-100)
 * 100 = perfect estimate, 0 = completely off
 */
export function calculateAccuracyRate(
  estimatedMinutes: number,
  actualMinutes: number
): number {
  if (estimatedMinutes === 0) return 0;
  
  const difference = Math.abs(actualMinutes - estimatedMinutes);
  const percentageOff = (difference / estimatedMinutes) * 100;
  
  // If within 20% of estimate, consider it accurate
  if (percentageOff <= 20) return 100;
  
  // Otherwise, scale down accuracy
  return Math.max(0, 100 - percentageOff);
}

/**
 * Get historical time accuracy for a user
 * Returns data about how accurate their estimates have been
 */
export async function getHistoricalTimeAccuracy(
  userId: string,
  limit: number = 30
): Promise<TimeTrackingData[]> {
  // Get completed tasks with actual time data (optimized query)
  const tasks = await getCompletedTasksWithTimeTracking(userId, limit);

  return tasks.map((task) => {
    const actualMinutes = task.actualMinutes || 0;
    const difference = actualMinutes - task.estimatedMinutes;
    const buffer = calculateTimeBlindnessBuffer(
      task.estimatedMinutes,
      actualMinutes
    );
    const accuracyRate = calculateAccuracyRate(
      task.estimatedMinutes,
      actualMinutes
    );

    return {
      taskId: task.id,
      taskTitle: task.title,
      estimatedMinutes: task.estimatedMinutes,
      actualMinutes,
      difference,
      accuracyRate,
      buffer,
    };
  });
}

/**
 * Get time blindness insights for a user
 * This is what we'll show in the UI to demonstrate learning
 */
export async function getTimeBlindnessInsights(
  userId: string
): Promise<TimeBlindnessInsight> {
  // Check cache first
  const cacheKey = CacheKeys.timeBlindness(userId);
  const cached = cache.get<TimeBlindnessInsight>(cacheKey);
  if (cached) {
    return cached;
  }

  const history = await getHistoricalTimeAccuracy(userId, 30);

  if (history.length === 0) {
    return {
      userId,
      averageBuffer: 1.0,
      totalTasks: 0,
      underestimatedTasks: 0,
      overestimatedTasks: 0,
      accurateTasks: 0,
      recommendation: 'Complete more tasks to see time tracking insights.',
      confidence: 'low',
    };
  }

  // Calculate statistics
  const totalTasks = history.length;
  const averageBuffer =
    history.reduce((sum, t) => sum + t.buffer, 0) / totalTasks;

  const underestimatedTasks = history.filter((t) => t.buffer > 1.2).length;
  const overestimatedTasks = history.filter((t) => t.buffer < 0.8).length;
  const accurateTasks = history.filter(
    (t) => t.buffer >= 0.8 && t.buffer <= 1.2
  ).length;

  // Determine confidence based on sample size
  let confidence: 'low' | 'medium' | 'high';
  if (totalTasks < 5) {
    confidence = 'low';
  } else if (totalTasks < 15) {
    confidence = 'medium';
  } else {
    confidence = 'high';
  }

  // Generate recommendation
  let recommendation = '';
  if (averageBuffer > 1.5) {
    recommendation = `You consistently underestimate task duration by ${Math.round((averageBuffer - 1) * 100)}%. The agent will automatically add ${Math.round((averageBuffer - 1) * 100)}% buffer to future estimates.`;
  } else if (averageBuffer > 1.2) {
    recommendation = `You tend to underestimate task duration slightly. The agent will add a ${Math.round((averageBuffer - 1) * 100)}% buffer to future estimates.`;
  } else if (averageBuffer < 0.8) {
    recommendation = `You tend to overestimate task duration. The agent will reduce future estimates by ${Math.round((1 - averageBuffer) * 100)}%.`;
  } else {
    recommendation = `Your time estimates are quite accurate! The agent will use your estimates as-is.`;
  }

  const result = {
    userId,
    averageBuffer,
    totalTasks,
    underestimatedTasks,
    overestimatedTasks,
    accurateTasks,
    recommendation,
    confidence,
  };

  // Cache for 10 minutes
  cache.set(cacheKey, result, 600);

  return result;
}

/**
 * Adjust future estimate based on user's historical buffer
 * This is the KEY function that makes the agent learn
 */
export async function adjustFutureEstimate(
  userId: string,
  baseEstimate: number
): Promise<{
  originalEstimate: number;
  adjustedEstimate: number;
  buffer: number;
  reason: string;
}> {
  const insights = await getTimeBlindnessInsights(userId);

  // Don't adjust if we don't have enough data
  if (insights.confidence === 'low') {
    return {
      originalEstimate: baseEstimate,
      adjustedEstimate: baseEstimate,
      buffer: 1.0,
      reason: 'Not enough historical data to adjust estimate',
    };
  }

  // Apply the learned buffer
  const adjustedEstimate = Math.round(baseEstimate * insights.averageBuffer);

  let reason = '';
  if (insights.averageBuffer > 1.2) {
    reason = `Based on your history, similar tasks took ${Math.round((insights.averageBuffer - 1) * 100)}% longer than estimated`;
  } else if (insights.averageBuffer < 0.8) {
    reason = `Based on your history, you tend to overestimate by ${Math.round((1 - insights.averageBuffer) * 100)}%`;
  } else {
    reason = 'Your estimates are typically accurate';
  }

  return {
    originalEstimate: baseEstimate,
    adjustedEstimate,
    buffer: insights.averageBuffer,
    reason,
  };
}

/**
 * Get time tracking comparison for display
 * Shows estimated vs actual for recent tasks
 */
export async function getTimeTrackingComparison(
  userId: string,
  limit: number = 10
): Promise<{
  tasks: TimeTrackingData[];
  summary: {
    averageEstimate: number;
    averageActual: number;
    averageDifference: number;
    averageAccuracy: number;
  };
}> {
  const tasks = await getHistoricalTimeAccuracy(userId, limit);

  if (tasks.length === 0) {
    return {
      tasks: [],
      summary: {
        averageEstimate: 0,
        averageActual: 0,
        averageDifference: 0,
        averageAccuracy: 0,
      },
    };
  }

  const summary = {
    averageEstimate:
      tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0) / tasks.length,
    averageActual:
      tasks.reduce((sum, t) => sum + t.actualMinutes, 0) / tasks.length,
    averageDifference:
      tasks.reduce((sum, t) => sum + t.difference, 0) / tasks.length,
    averageAccuracy:
      tasks.reduce((sum, t) => sum + t.accuracyRate, 0) / tasks.length,
  };

  return {
    tasks,
    summary,
  };
}

/**
 * Record task completion with time tracking
 * This is called when a user marks a task as complete
 */
export async function recordTaskCompletion(
  taskId: string,
  completedAt: Date = new Date()
): Promise<{
  success: boolean;
  timeTracking?: TimeTrackingData;
  error?: string;
}> {
  try {
    const task = await prisma.planTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    // Calculate actual duration if we have start time
    let actualMinutes: number | null = null;
    let actualStartTime = task.actualStartTime;
    let actualEndTime = completedAt;

    // If no start time recorded, use scheduled start or estimate based on completion time
    if (!actualStartTime && task.scheduledStart) {
      actualStartTime = task.scheduledStart;
    }

    if (actualStartTime) {
      actualMinutes = calculateActualDuration(actualStartTime, actualEndTime);
    }

    // Update task with completion data
    const updatedTask = await prisma.planTask.update({
      where: { id: taskId },
      data: {
        completed: true,
        completedAt,
        actualEndTime,
        actualMinutes,
        // If we don't have a start time, set it to estimated duration before completion
        actualStartTime:
          actualStartTime ||
          new Date(completedAt.getTime() - task.estimatedMinutes * 60 * 1000),
      },
    });

    // Calculate time tracking data
    const timeTracking: TimeTrackingData = {
      taskId: updatedTask.id,
      taskTitle: updatedTask.title,
      estimatedMinutes: updatedTask.estimatedMinutes,
      actualMinutes: updatedTask.actualMinutes || updatedTask.estimatedMinutes,
      difference:
        (updatedTask.actualMinutes || updatedTask.estimatedMinutes) -
        updatedTask.estimatedMinutes,
      accuracyRate: calculateAccuracyRate(
        updatedTask.estimatedMinutes,
        updatedTask.actualMinutes || updatedTask.estimatedMinutes
      ),
      buffer: calculateTimeBlindnessBuffer(
        updatedTask.estimatedMinutes,
        updatedTask.actualMinutes || updatedTask.estimatedMinutes
      ),
    };

    return {
      success: true,
      timeTracking,
    };
  } catch (error) {
    console.error('Error recording task completion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
