/**
 * Momentum Tracking System
 * 
 * Tracks user momentum state (strong, normal, weak, collapsed) based on task completion patterns.
 * Helps predict future performance and trigger interventions when momentum collapses.
 * 
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5
 */

import { prisma } from './prisma';

export type MomentumState = 'strong' | 'normal' | 'weak' | 'collapsed';

export interface MomentumMetrics {
  state: MomentumState;
  morningStartStrength: number; // % of morning tasks that get started (baseline: 82%)
  completionAfterEarlyWinRate: number; // Likelihood of completing next task after early completion (baseline: 78%)
  afternoonFalloff: number; // % of afternoon tasks completed when morning runs over (baseline: 35%)
  consecutiveSkips: number; // Number of consecutive skipped tasks
  consecutiveEarlyCompletions: number; // Number of consecutive early completions
  lastStateChange: Date;
  confidence: 'low' | 'medium' | 'high'; // Based on sample size
}

export interface MomentumTransition {
  fromState: MomentumState;
  toState: MomentumState;
  trigger: string;
  timestamp: Date;
  reason: string;
}

export interface TaskCompletionEvent {
  taskId: string;
  completed: boolean;
  skipped: boolean;
  completedEarly: boolean; // Completed before scheduled end time
  scheduledStart?: Date;
  scheduledEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  estimatedMinutes: number;
  actualMinutes?: number;
}

/**
 * Calculate momentum state based on recent task completion patterns
 */
export async function calculateMomentumState(
  userId: string,
  currentPlanId?: string
): Promise<MomentumMetrics> {
  // Get today's plan and tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const plan = currentPlanId
    ? await prisma.dailyPlan.findUnique({
        where: { id: currentPlanId },
        include: {
          tasks: {
            orderBy: { scheduledStart: 'asc' },
          },
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
          tasks: {
            orderBy: { scheduledStart: 'asc' },
          },
        },
      });

  if (!plan) {
    return {
      state: 'normal',
      morningStartStrength: 0,
      completionAfterEarlyWinRate: 0,
      afternoonFalloff: 0,
      consecutiveSkips: 0,
      consecutiveEarlyCompletions: 0,
      lastStateChange: new Date(),
      confidence: 'low',
    };
  }

  // Analyze task completion patterns
  const tasks = plan.tasks;
  const completedTasks = tasks.filter((t) => t.completed);
  const skippedTasks = tasks.filter(
    (t) => !t.completed && t.scheduledEnd && new Date() > t.scheduledEnd
  );

  // Calculate consecutive skips (from most recent tasks)
  let consecutiveSkips = 0;
  for (let i = tasks.length - 1; i >= 0; i--) {
    const task = tasks[i];
    if (task.scheduledEnd && new Date() > task.scheduledEnd && !task.completed) {
      consecutiveSkips++;
    } else if (task.completed) {
      break;
    }
  }

  // Calculate consecutive early completions
  let consecutiveEarlyCompletions = 0;
  for (let i = tasks.length - 1; i >= 0; i--) {
    const task = tasks[i];
    if (
      task.completed &&
      task.completedAt &&
      task.scheduledEnd &&
      task.completedAt < task.scheduledEnd
    ) {
      consecutiveEarlyCompletions++;
    } else if (task.completed) {
      break;
    }
  }

  // Determine momentum state based on patterns
  let state: MomentumState = 'normal';

  // Requirement 20.5: WHEN 2+ tasks are skipped in a row, THE Agent SHALL set momentum to "collapsed"
  if (consecutiveSkips >= 2) {
    state = 'collapsed';
  }
  // Requirement 20.4: WHEN a task is skipped, THE Agent SHALL downgrade momentum state
  else if (consecutiveSkips === 1) {
    state = 'weak';
  }
  // Requirement 20.2: WHEN a task is completed early, THE Agent SHALL set momentum state to "strong"
  else if (consecutiveEarlyCompletions >= 1) {
    state = 'strong';
  }

  // Calculate historical metrics (last 7 days)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const historicalPlans = await prisma.dailyPlan.findMany({
    where: {
      userId,
      date: {
        gte: sevenDaysAgo,
        lt: today,
      },
    },
    include: {
      tasks: true,
    },
  });

  // Calculate morning start strength (% of morning tasks that get started)
  let morningTasksTotal = 0;
  let morningTasksStarted = 0;

  for (const historicalPlan of historicalPlans) {
    for (const task of historicalPlan.tasks) {
      if (task.scheduledStart) {
        const hour = task.scheduledStart.getHours();
        if (hour >= 6 && hour < 12) {
          // Morning: 6am-12pm
          morningTasksTotal++;
          if (task.actualStartTime || task.completed) {
            morningTasksStarted++;
          }
        }
      }
    }
  }

  const morningStartStrength =
    morningTasksTotal > 0 ? (morningTasksStarted / morningTasksTotal) * 100 : 0;

  // Calculate completion-after-early-win rate
  let earlyWins = 0;
  let completionsAfterEarlyWin = 0;

  for (const historicalPlan of historicalPlans) {
    const sortedTasks = historicalPlan.tasks.sort((a, b) => {
      if (!a.scheduledStart || !b.scheduledStart) return 0;
      return a.scheduledStart.getTime() - b.scheduledStart.getTime();
    });

    for (let i = 0; i < sortedTasks.length - 1; i++) {
      const task = sortedTasks[i];
      const nextTask = sortedTasks[i + 1];

      // Check if current task was an early win
      if (
        task.completed &&
        task.completedAt &&
        task.scheduledEnd &&
        task.completedAt < task.scheduledEnd
      ) {
        earlyWins++;
        // Check if next task was completed
        if (nextTask.completed) {
          completionsAfterEarlyWin++;
        }
      }
    }
  }

  const completionAfterEarlyWinRate =
    earlyWins > 0 ? (completionsAfterEarlyWin / earlyWins) * 100 : 0;

  // Calculate afternoon falloff (% of afternoon tasks completed when morning runs over)
  let afternoonTasksWhenMorningOver = 0;
  let afternoonCompletionsWhenMorningOver = 0;

  for (const historicalPlan of historicalPlans) {
    const morningTasks = historicalPlan.tasks.filter((t) => {
      if (!t.scheduledStart) return false;
      const hour = t.scheduledStart.getHours();
      return hour >= 6 && hour < 12;
    });

    const afternoonTasks = historicalPlan.tasks.filter((t) => {
      if (!t.scheduledStart) return false;
      const hour = t.scheduledStart.getHours();
      return hour >= 12 && hour < 18;
    });

    // Check if morning ran over (any morning task completed late)
    const morningRanOver = morningTasks.some(
      (t) =>
        t.completed &&
        t.completedAt &&
        t.scheduledEnd &&
        t.completedAt > t.scheduledEnd
    );

    if (morningRanOver && afternoonTasks.length > 0) {
      afternoonTasksWhenMorningOver += afternoonTasks.length;
      afternoonCompletionsWhenMorningOver += afternoonTasks.filter(
        (t) => t.completed
      ).length;
    }
  }

  const afternoonFalloff =
    afternoonTasksWhenMorningOver > 0
      ? (afternoonCompletionsWhenMorningOver / afternoonTasksWhenMorningOver) * 100
      : 0;

  // Determine confidence based on sample size
  const totalHistoricalTasks = historicalPlans.reduce(
    (sum, plan) => sum + plan.tasks.length,
    0
  );
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (totalHistoricalTasks >= 30) {
    confidence = 'high';
  } else if (totalHistoricalTasks >= 10) {
    confidence = 'medium';
  }

  return {
    state,
    morningStartStrength,
    completionAfterEarlyWinRate,
    afternoonFalloff,
    consecutiveSkips,
    consecutiveEarlyCompletions,
    lastStateChange: new Date(),
    confidence,
  };
}

/**
 * Update momentum state for a specific task
 */
export async function updateTaskMomentumState(
  taskId: string,
  event: TaskCompletionEvent
): Promise<MomentumState> {
  const task = await prisma.planTask.findUnique({
    where: { id: taskId },
    include: {
      plan: true,
    },
  });

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  // Calculate momentum for the user's current plan
  const metrics = await calculateMomentumState(task.plan.userId, task.planId);

  // Update the task with the current momentum state
  await prisma.planTask.update({
    where: { id: taskId },
    data: {
      momentumState: metrics.state,
    },
  });

  return metrics.state;
}

/**
 * Get momentum boost/penalty for predictions
 * Requirement 20.3: WHEN momentum is strong, THE Agent SHALL boost completion predictions
 */
export function getMomentumPredictionAdjustment(state: MomentumState): number {
  switch (state) {
    case 'strong':
      return 1.15; // 15% boost to completion predictions
    case 'normal':
      return 1.0; // No adjustment
    case 'weak':
      return 0.8; // 20% penalty to completion predictions
    case 'collapsed':
      return 0.5; // 50% penalty - very unlikely to complete remaining tasks
  }
}

/**
 * Check if intervention is needed based on momentum state
 * Requirement 20.6: WHEN momentum collapses, THE Agent SHALL trigger intervention
 */
export function shouldTriggerIntervention(metrics: MomentumMetrics): boolean {
  return metrics.state === 'collapsed' || metrics.consecutiveSkips >= 2;
}

/**
 * Get intervention recommendation based on momentum state
 */
export function getInterventionRecommendation(
  metrics: MomentumMetrics
): {
  type: 'simplify' | 'encourage' | 'reschedule' | 'none';
  message: string;
  actions: string[];
} {
  if (metrics.state === 'collapsed') {
    return {
      type: 'reschedule',
      message:
        "I notice you've skipped a couple tasks. That's totally okay - let's simplify the rest of your day.",
      actions: [
        'Defer all but 1-2 core tasks',
        'Add a 15-minute break',
        'Suggest easier wins',
        'Offer to reschedule tomorrow',
      ],
    };
  }

  if (metrics.state === 'weak') {
    return {
      type: 'encourage',
      message:
        "You're doing great! Let's make sure the rest of the day feels manageable.",
      actions: [
        'Extend time for current task',
        'Add buffer to remaining tasks',
        'Suggest a quick break',
      ],
    };
  }

  if (metrics.state === 'strong') {
    return {
      type: 'simplify',
      message:
        "You're crushing it today! 🎉 Want to tackle something extra?",
      actions: [
        'Suggest pulling forward tomorrow\'s tasks',
        'Offer to add stretch goals',
        'Celebrate the momentum',
      ],
    };
  }

  return {
    type: 'none',
    message: '',
    actions: [],
  };
}

/**
 * Get momentum state display message for user
 * Requirement 20.8: THE Agent SHALL display momentum state to user with appropriate messaging
 */
export function getMomentumDisplayMessage(metrics: MomentumMetrics): {
  emoji: string;
  title: string;
  description: string;
  color: string;
} {
  switch (metrics.state) {
    case 'strong':
      return {
        emoji: '🚀',
        title: 'Strong Momentum',
        description:
          "You're on fire! Keep this energy going - you're completing tasks ahead of schedule.",
        color: 'green',
      };
    case 'normal':
      return {
        emoji: '✅',
        title: 'Steady Progress',
        description:
          "You're making good progress. Keep going at your current pace.",
        color: 'blue',
      };
    case 'weak':
      return {
        emoji: '⚠️',
        title: 'Momentum Slowing',
        description:
          "Things are getting a bit harder. That's normal - let's adjust the plan if needed.",
        color: 'yellow',
      };
    case 'collapsed':
      return {
        emoji: '🛑',
        title: 'Momentum Collapsed',
        description:
          "It's okay to have tough days. Let's simplify and focus on just one or two wins.",
        color: 'red',
      };
  }
}

/**
 * Track momentum transition for learning
 */
export async function trackMomentumTransition(
  userId: string,
  transition: MomentumTransition
): Promise<void> {
  // Store transition in user's notification preferences (as metadata)
  // This could be expanded to a separate MomentumHistory table if needed
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  const preferences = (user.notificationPreferences as any) || {};
  const momentumHistory = preferences.momentumHistory || [];

  momentumHistory.push({
    ...transition,
    timestamp: transition.timestamp.toISOString(),
  });

  // Keep only last 30 transitions
  if (momentumHistory.length > 30) {
    momentumHistory.shift();
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      notificationPreferences: {
        ...preferences,
        momentumHistory,
      },
    },
  });
}
