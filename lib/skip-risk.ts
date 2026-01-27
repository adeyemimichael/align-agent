/**
 * Skip Risk Prediction System
 * 
 * Predicts when users are likely to abandon tasks based on:
 * - Current progress vs schedule
 * - Tasks already skipped
 * - Momentum state
 * - Time of day
 * 
 * Requirements: 17.1, 17.2, 17.3, 17.4
 */

export type SkipRiskLevel = 'low' | 'medium' | 'high';
export type MomentumState = 'strong' | 'normal' | 'weak' | 'collapsed';

export interface SkipRiskFactors {
  minutesBehind: number;        // How far behind schedule (negative if ahead)
  tasksSkipped: number;         // Tasks skipped today
  momentumState: MomentumState; // Current momentum state
  timeOfDay: number;            // Hour of day (0-23)
  taskPriority: number;         // Task priority (1-4, 1 highest)
  morningRunOver: boolean;      // Did morning tasks run over schedule?
}

export interface SkipRiskResult {
  riskLevel: SkipRiskLevel;
  riskPercentage: number;       // 0-100
  factors: {
    scheduleDelay: number;      // Risk contribution from being behind
    skipHistory: number;        // Risk contribution from previous skips
    momentum: number;           // Risk contribution from momentum state
    timeOfDay: number;          // Risk contribution from time of day
    priority: number;           // Risk contribution from task priority
  };
  reasoning: string;
  interventionSuggested: boolean;
}

export interface SkipRiskMetrics {
  morningStartStrength: number;     // % of morning tasks that get started
  afternoonFalloff: number;         // % of afternoon tasks completed when morning runs over
  skipAfterSkipRate: number;        // % likelihood of skipping after one skip
}

/**
 * Calculate skip risk for a task based on current context
 * 
 * Requirements:
 * - 17.1: Calculate skip risk (low, medium, high) for each scheduled task
 * - 17.2: Increase skip risk when user is behind schedule
 * - 17.3: Predict 60% likelihood of skipping after one skip
 * - 17.4: Predict 75% likelihood of abandoning when >30min behind
 */
export function calculateSkipRisk(factors: SkipRiskFactors): SkipRiskResult {
  // Base risk starts at 20%
  let riskPercentage = 20;
  
  const contributions = {
    scheduleDelay: 0,
    skipHistory: 0,
    momentum: 0,
    timeOfDay: 0,
    priority: 0,
  };

  // Factor 1: Schedule delay (Requirement 17.2, 17.4)
  if (factors.minutesBehind > 0) {
    if (factors.minutesBehind > 30) {
      // >30 minutes behind = 75% total risk (Requirement 17.4)
      contributions.scheduleDelay = 55; // 20 base + 55 = 75
    } else if (factors.minutesBehind > 15) {
      // 15-30 minutes behind = moderate risk
      contributions.scheduleDelay = 30;
    } else {
      // 1-15 minutes behind = slight risk increase
      contributions.scheduleDelay = 15;
    }
  }

  // Factor 2: Skip history (Requirement 17.3)
  if (factors.tasksSkipped >= 2) {
    // 2+ skips = collapsed momentum, very high risk
    contributions.skipHistory = 55; // Brings total to 75%
  } else if (factors.tasksSkipped === 1) {
    // 1 skip = 60% likelihood of next skip (Requirement 17.3)
    contributions.skipHistory = 40; // 20 base + 40 = 60
  }

  // Factor 3: Momentum state
  switch (factors.momentumState) {
    case 'collapsed':
      contributions.momentum = 40;
      break;
    case 'weak':
      contributions.momentum = 20;
      break;
    case 'normal':
      contributions.momentum = 0;
      break;
    case 'strong':
      contributions.momentum = -10; // Strong momentum reduces risk
      break;
  }

  // Factor 4: Time of day (afternoon tasks have higher skip risk)
  if (factors.timeOfDay >= 15 && factors.morningRunOver) {
    // Afternoon + morning ran over = high risk (Requirement 17.6)
    contributions.timeOfDay = 20;
  } else if (factors.timeOfDay >= 15) {
    // Just afternoon = slight risk increase
    contributions.timeOfDay = 10;
  }

  // Factor 5: Task priority (lower priority = higher skip risk)
  if (factors.taskPriority >= 3) {
    // P3-P4 tasks are more likely to be skipped
    contributions.priority = 15;
  } else if (factors.taskPriority === 2) {
    contributions.priority = 5;
  }

  // Calculate total risk
  riskPercentage += contributions.scheduleDelay;
  riskPercentage += contributions.skipHistory;
  riskPercentage += contributions.momentum;
  riskPercentage += contributions.timeOfDay;
  riskPercentage += contributions.priority;

  // Cap at 100%
  riskPercentage = Math.min(100, Math.max(0, riskPercentage));

  // Determine risk level
  let riskLevel: SkipRiskLevel;
  if (riskPercentage >= 60) {
    riskLevel = 'high';
  } else if (riskPercentage >= 40) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // Generate reasoning
  const reasoning = generateReasoning(factors, contributions, riskPercentage);

  // Suggest intervention for medium/high risk
  const interventionSuggested = riskLevel === 'high' || riskLevel === 'medium';

  return {
    riskLevel,
    riskPercentage,
    factors: contributions,
    reasoning,
    interventionSuggested,
  };
}

/**
 * Generate human-readable reasoning for skip risk calculation
 */
function generateReasoning(
  factors: SkipRiskFactors,
  contributions: SkipRiskResult['factors'],
  totalRisk: number
): string {
  const reasons: string[] = [];

  if (contributions.scheduleDelay > 0) {
    if (factors.minutesBehind > 30) {
      reasons.push(`You're ${factors.minutesBehind} minutes behind schedule (high risk)`);
    } else {
      reasons.push(`You're ${factors.minutesBehind} minutes behind schedule`);
    }
  }

  if (contributions.skipHistory > 0) {
    if (factors.tasksSkipped >= 2) {
      reasons.push(`${factors.tasksSkipped} tasks already skipped today (momentum collapsed)`);
    } else {
      reasons.push(`1 task already skipped (60% chance of skipping next)`);
    }
  }

  if (factors.momentumState === 'collapsed') {
    reasons.push('Momentum has collapsed');
  } else if (factors.momentumState === 'weak') {
    reasons.push('Momentum is weak');
  } else if (factors.momentumState === 'strong') {
    reasons.push('Strong momentum (reduces risk)');
  }

  if (contributions.timeOfDay > 0) {
    if (factors.morningRunOver) {
      reasons.push('Afternoon task + morning ran over (high skip risk)');
    } else {
      reasons.push('Afternoon task (slightly higher skip risk)');
    }
  }

  if (contributions.priority > 0) {
    reasons.push(`Lower priority task (P${factors.taskPriority})`);
  }

  if (reasons.length === 0) {
    return `Skip risk is ${totalRisk}% (normal conditions)`;
  }

  return `Skip risk is ${totalRisk}%: ${reasons.join(', ')}`;
}

/**
 * Track skip risk metrics over time
 * Requirements: 17.5, 17.6
 */
export function calculateSkipRiskMetrics(
  tasks: Array<{
    scheduledStart: Date | null;
    completed: boolean;
    actualStartTime: Date | null;
  }>,
  morningCutoff: number = 12 // Hour that defines "morning"
): SkipRiskMetrics {
  const morningTasks = tasks.filter(
    (t) => t.scheduledStart && t.scheduledStart.getHours() < morningCutoff
  );
  const afternoonTasks = tasks.filter(
    (t) => t.scheduledStart && t.scheduledStart.getHours() >= morningCutoff
  );

  // Morning start strength: % of morning tasks that actually got started
  const morningStarted = morningTasks.filter((t) => t.actualStartTime !== null).length;
  const morningStartStrength =
    morningTasks.length > 0 ? (morningStarted / morningTasks.length) * 100 : 0;

  // Check if morning ran over (any morning task started late)
  const morningRanOver = morningTasks.some((t) => {
    if (!t.scheduledStart || !t.actualStartTime) return false;
    const delayMinutes =
      (t.actualStartTime.getTime() - t.scheduledStart.getTime()) / (1000 * 60);
    return delayMinutes > 15; // More than 15 minutes late
  });

  // Afternoon falloff: % of afternoon tasks completed when morning ran over
  const afternoonCompleted = afternoonTasks.filter((t) => t.completed).length;
  const afternoonFalloff =
    morningRanOver && afternoonTasks.length > 0
      ? (afternoonCompleted / afternoonTasks.length) * 100
      : 100; // 100% if morning didn't run over

  // Skip after skip rate: likelihood of skipping after one skip
  // This would need historical data, using baseline 60% per requirements
  const skipAfterSkipRate = 60;

  return {
    morningStartStrength,
    afternoonFalloff,
    skipAfterSkipRate,
  };
}

/**
 * Determine if intervention is needed based on skip risk
 * Requirements: 17.7
 */
export function shouldTriggerIntervention(
  riskResult: SkipRiskResult,
  currentTaskIndex: number,
  totalTasks: number
): {
  shouldIntervene: boolean;
  interventionType: 'supportive_checkin' | 'rescue_schedule' | 'none';
  message: string;
} {
  // High risk (>60%) = rescue schedule
  if (riskResult.riskLevel === 'high') {
    return {
      shouldIntervene: true,
      interventionType: 'rescue_schedule',
      message: `High skip risk detected (${riskResult.riskPercentage}%). Let's simplify your plan to protect core wins.`,
    };
  }

  // Medium risk (40-60%) = supportive check-in
  if (riskResult.riskLevel === 'medium') {
    return {
      shouldIntervene: true,
      interventionType: 'supportive_checkin',
      message: `You're doing great! ${riskResult.reasoning}. Want to adjust your plan?`,
    };
  }

  // Low risk = no intervention
  return {
    shouldIntervene: false,
    interventionType: 'none',
    message: '',
  };
}
