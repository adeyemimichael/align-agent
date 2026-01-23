/**
 * Capacity Adjustment Logic
 * Tracks plan accuracy and adjusts future capacity calculations
 * Requirements: 7.5, 7.6, 7.7
 */

import { prisma } from './prisma';

export interface PlanAccuracy {
  plannedTasks: number;
  completedTasks: number;
  completionRate: number;
  capacityScore: number;
  date: Date;
}

export interface CapacityAdjustment {
  adjustedScore: number;
  originalScore: number;
  adjustmentFactor: number;
  reason: string;
}

/**
 * Calculate plan accuracy for a given date
 * Requirements: 7.5
 */
export async function calculatePlanAccuracy(
  userId: string,
  date: Date
): Promise<PlanAccuracy | null> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get the plan for this date
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
    return null;
  }

  const plannedTasks = plan.tasks.length;
  const completedTasks = plan.tasks.filter((t) => t.completed).length;
  const completionRate =
    plannedTasks > 0 ? (completedTasks / plannedTasks) * 100 : 0;

  return {
    plannedTasks,
    completedTasks,
    completionRate,
    capacityScore: plan.capacityScore,
    date: plan.date,
  };
}

/**
 * Get historical plan accuracy over the last N days
 * Requirements: 7.6
 */
export async function getHistoricalAccuracy(
  userId: string,
  days: number = 7
): Promise<PlanAccuracy[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const plans = await prisma.dailyPlan.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
      },
    },
    include: {
      tasks: true,
    },
    orderBy: {
      date: 'desc',
    },
  });

  return plans.map((plan) => {
    const plannedTasks = plan.tasks.length;
    const completedTasks = plan.tasks.filter((t) => t.completed).length;
    const completionRate =
      plannedTasks > 0 ? (completedTasks / plannedTasks) * 100 : 0;

    return {
      plannedTasks,
      completedTasks,
      completionRate,
      capacityScore: plan.capacityScore,
      date: plan.date,
    };
  });
}

/**
 * Adjust capacity score based on historical accuracy
 * Requirements: 7.7
 *
 * Logic:
 * - If user consistently completes more than expected, increase capacity
 * - If user consistently completes less than expected, decrease capacity
 * - Adjustment is gradual (max ±10 points) to avoid overcorrection
 */
export async function adjustCapacityScore(
  userId: string,
  currentScore: number
): Promise<CapacityAdjustment> {
  const accuracy = await getHistoricalAccuracy(userId, 7);

  if (accuracy.length < 3) {
    // Not enough data to adjust
    return {
      adjustedScore: currentScore,
      originalScore: currentScore,
      adjustmentFactor: 1.0,
      reason: 'Insufficient historical data for adjustment',
    };
  }

  // Calculate average completion rate
  const avgCompletionRate =
    accuracy.reduce((sum, a) => sum + a.completionRate, 0) / accuracy.length;

  // Calculate adjustment factor
  let adjustmentFactor = 1.0;
  let reason = 'No adjustment needed';

  if (avgCompletionRate >= 90) {
    // User is consistently completing tasks - they might have more capacity
    adjustmentFactor = 1.1; // +10%
    reason = 'Consistently high completion rate - capacity may be underestimated';
  } else if (avgCompletionRate >= 75) {
    // Good completion rate - slight increase
    adjustmentFactor = 1.05; // +5%
    reason = 'Good completion rate - slight capacity increase';
  } else if (avgCompletionRate < 50) {
    // Low completion rate - reduce capacity estimate
    adjustmentFactor = 0.9; // -10%
    reason = 'Low completion rate - capacity may be overestimated';
  } else if (avgCompletionRate < 65) {
    // Below average completion - slight decrease
    adjustmentFactor = 0.95; // -5%
    reason = 'Below average completion rate - slight capacity decrease';
  }

  // Apply adjustment with bounds (don't go below 0 or above 100)
  const adjustedScore = Math.max(
    0,
    Math.min(100, Math.round(currentScore * adjustmentFactor))
  );

  return {
    adjustedScore,
    originalScore: currentScore,
    adjustmentFactor,
    reason,
  };
}

/**
 * Get capacity insights for dashboard display
 * Requirements: 7.6, 7.7
 */
export async function getCapacityInsights(userId: string): Promise<{
  averageCompletionRate: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendation: string;
  recentAccuracy: PlanAccuracy[];
}> {
  const accuracy = await getHistoricalAccuracy(userId, 7);

  if (accuracy.length === 0) {
    return {
      averageCompletionRate: 0,
      trend: 'stable',
      recommendation: 'Complete more daily plans to see insights',
      recentAccuracy: [],
    };
  }

  const avgCompletionRate =
    accuracy.reduce((sum, a) => sum + a.completionRate, 0) / accuracy.length;

  // Determine trend by comparing recent vs older data
  let trend: 'improving' | 'declining' | 'stable' = 'stable';

  if (accuracy.length >= 4) {
    const recentAvg =
      accuracy
        .slice(0, 3)
        .reduce((sum, a) => sum + a.completionRate, 0) / 3;
    const olderAvg =
      accuracy
        .slice(3)
        .reduce((sum, a) => sum + a.completionRate, 0) /
      (accuracy.length - 3);

    if (recentAvg > olderAvg + 10) {
      trend = 'improving';
    } else if (recentAvg < olderAvg - 10) {
      trend = 'declining';
    }
  }

  // Generate recommendation
  let recommendation = '';
  if (avgCompletionRate >= 80) {
    recommendation =
      'Excellent! You're consistently completing your planned tasks. Consider taking on more challenging work.';
  } else if (avgCompletionRate >= 60) {
    recommendation =
      'Good progress! You're completing most of your planned tasks. Keep up the momentum.';
  } else if (avgCompletionRate >= 40) {
    recommendation =
      'Your completion rate could be improved. Consider if you're planning too many tasks or if your capacity estimates need adjustment.';
  } else {
    recommendation =
      'Your completion rate is low. Try planning fewer tasks or focusing on recovery activities to build momentum.';
  }

  if (trend === 'improving') {
    recommendation += ' Your trend is improving - great work!';
  } else if (trend === 'declining') {
    recommendation += ' Your trend is declining - consider what might be affecting your productivity.';
  }

  return {
    averageCompletionRate: Math.round(avgCompletionRate),
    trend,
    recommendation,
    recentAccuracy: accuracy,
  };
}
