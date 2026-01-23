/**
 * Plan Adjustment Learning
 * Tracks user adjustments to AI-generated plans and learns from patterns
 * Requirements: 8.7
 */

import { prisma } from './prisma';

export interface PlanAdjustment {
  id: string;
  planId: string;
  userId: string;
  adjustmentType:
    | 'task_reordered'
    | 'task_removed'
    | 'task_added'
    | 'time_changed'
    | 'priority_changed';
  taskId?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
}

export interface AdjustmentPattern {
  type: string;
  frequency: number;
  examples: string[];
  insight: string;
}

/**
 * Log a plan adjustment made by the user
 * Requirements: 8.7
 */
export async function logPlanAdjustment(
  userId: string,
  planId: string,
  adjustmentType: PlanAdjustment['adjustmentType'],
  details: {
    taskId?: string;
    oldValue?: string;
    newValue?: string;
  }
): Promise<void> {
  try {
    // Store adjustment in database
    // Note: This requires a PlanAdjustment model in Prisma schema
    // For now, we'll use a simple approach with JSON in the plan notes

    const plan = await prisma.dailyPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      console.error('Plan not found for adjustment logging');
      return;
    }

    // Store adjustment metadata (in a real implementation, this would be a separate table)
    console.log('Plan adjustment logged:', {
      userId,
      planId,
      adjustmentType,
      ...details,
      timestamp: new Date(),
    });

    // In production, you would:
    // await prisma.planAdjustment.create({
    //   data: {
    //     userId,
    //     planId,
    //     adjustmentType,
    //     taskId: details.taskId,
    //     oldValue: details.oldValue,
    //     newValue: details.newValue,
    //     timestamp: new Date(),
    //   },
    // });
  } catch (error) {
    console.error('Error logging plan adjustment:', error);
  }
}

/**
 * Analyze adjustment patterns for a user
 * Requirements: 8.7
 */
export async function analyzeAdjustmentPatterns(
  userId: string
): Promise<AdjustmentPattern[]> {
  // In a full implementation, this would query the PlanAdjustment table
  // For now, we'll return mock patterns based on plan completion data

  const recentPlans = await prisma.dailyPlan.findMany({
    where: { userId },
    include: { tasks: true },
    orderBy: { date: 'desc' },
    take: 14, // Last 2 weeks
  });

  const patterns: AdjustmentPattern[] = [];

  // Analyze task completion patterns
  const incompleteTasks = recentPlans.flatMap((plan) =>
    plan.tasks.filter((t) => !t.completed)
  );

  if (incompleteTasks.length > 0) {
    // Check if certain priorities are consistently incomplete
    const priorityCounts: Record<number, number> = {};
    incompleteTasks.forEach((task) => {
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
    });

    const mostIncomplete = Object.entries(priorityCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    if (mostIncomplete && mostIncomplete[1] > 3) {
      patterns.push({
        type: 'priority_mismatch',
        frequency: mostIncomplete[1],
        examples: incompleteTasks
          .filter((t) => t.priority === parseInt(mostIncomplete[0]))
          .slice(0, 3)
          .map((t) => t.title),
        insight: `You often don't complete P${mostIncomplete[0]} tasks. Consider adjusting task priorities or reducing the number of these tasks in your plans.`,
      });
    }
  }

  // Analyze time allocation patterns
  const overestimatedTasks = recentPlans.flatMap((plan) =>
    plan.tasks.filter(
      (t) =>
        t.completed &&
        t.scheduledStart &&
        t.scheduledEnd &&
        t.estimatedMinutes > 60
    )
  );

  if (overestimatedTasks.length > 5) {
    patterns.push({
      type: 'time_overestimation',
      frequency: overestimatedTasks.length,
      examples: overestimatedTasks.slice(0, 3).map((t) => t.title),
      insight:
        'You tend to complete longer tasks successfully. The AI can schedule more ambitious tasks for you.',
    });
  }

  // Analyze capacity vs completion patterns
  const lowCapacityHighCompletion = recentPlans.filter((plan) => {
    const completionRate =
      plan.tasks.length > 0
        ? plan.tasks.filter((t) => t.completed).length / plan.tasks.length
        : 0;
    return plan.capacityScore < 50 && completionRate > 0.8;
  });

  if (lowCapacityHighCompletion.length > 2) {
    patterns.push({
      type: 'capacity_underestimation',
      frequency: lowCapacityHighCompletion.length,
      examples: lowCapacityHighCompletion
        .slice(0, 3)
        .map((p) => `${p.date.toLocaleDateString()}: ${p.capacityScore}%`),
      insight:
        'You often complete tasks well even on low-capacity days. Your capacity might be higher than you think.',
    });
  }

  return patterns;
}

/**
 * Get AI planning recommendations based on learned patterns
 * Requirements: 8.7
 */
export async function getPlanningRecommendations(
  userId: string
): Promise<string[]> {
  const patterns = await analyzeAdjustmentPatterns(userId);
  const recommendations: string[] = [];

  for (const pattern of patterns) {
    switch (pattern.type) {
      case 'priority_mismatch':
        recommendations.push(
          'Consider reducing the number of low-priority tasks in your daily plans.'
        );
        break;
      case 'time_overestimation':
        recommendations.push(
          'You handle longer tasks well - the AI can schedule more ambitious work.'
        );
        break;
      case 'capacity_underestimation':
        recommendations.push(
          'Your actual capacity often exceeds your self-assessment. Trust yourself more!'
        );
        break;
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Keep completing your daily plans to help the AI learn your patterns.'
    );
  }

  return recommendations;
}

/**
 * Apply learned patterns to improve future plan generation
 * Requirements: 8.7
 */
export async function applyLearnedPatterns(
  userId: string,
  basePlan: {
    capacityScore: number;
    tasks: Array<{
      id: string;
      priority: number;
      estimatedMinutes: number;
    }>;
  }
): Promise<{
  adjustedCapacity: number;
  taskAdjustments: Array<{
    taskId: string;
    suggestedPriority?: number;
    suggestedDuration?: number;
    reason: string;
  }>;
}> {
  const patterns = await analyzeAdjustmentPatterns(userId);

  let adjustedCapacity = basePlan.capacityScore;
  const taskAdjustments: Array<{
    taskId: string;
    suggestedPriority?: number;
    suggestedDuration?: number;
    reason: string;
  }> = [];

  // Apply capacity adjustments based on patterns
  const capacityPattern = patterns.find(
    (p) => p.type === 'capacity_underestimation'
  );
  if (capacityPattern && capacityPattern.frequency > 2) {
    adjustedCapacity = Math.min(100, basePlan.capacityScore * 1.1);
  }

  // Apply task-level adjustments
  const priorityPattern = patterns.find((p) => p.type === 'priority_mismatch');
  if (priorityPattern) {
    // Suggest reducing low-priority tasks
    basePlan.tasks
      .filter((t) => t.priority >= 3)
      .slice(0, 2)
      .forEach((task) => {
        taskAdjustments.push({
          taskId: task.id,
          suggestedPriority: task.priority - 1,
          reason: 'Based on your completion patterns, this task might be more important than initially assessed.',
        });
      });
  }

  return {
    adjustedCapacity: Math.round(adjustedCapacity),
    taskAdjustments,
  };
}
