/**
 * Real-Time Progress Tracking System
 * 
 * Tracks task start/end times in real-time, calculates minutes ahead/behind schedule,
 * and detects early completions and delays.
 * 
 * Requirements: 14.1, 14.2
 */

import { prisma } from './prisma';
import { calculateSkipRisk, type SkipRiskFactors } from './skip-risk';
import { calculateMomentumState, type MomentumState } from './momentum-tracker';

export interface ProgressSnapshot {
  planId: string;
  userId: string;
  currentTime: Date;
  totalTasks: number;
  completedTasks: number;
  skippedTasks: number;
  inProgressTasks: number;
  upcomingTasks: number;
  minutesAheadBehind: number; // Positive = ahead, negative = behind
  currentTask: TaskProgress | null;
  nextTask: TaskProgress | null;
  momentumState: MomentumState;
  overallProgress: number; // 0-100%
}

export interface TaskProgress {
  id: string;
  title: string;
  priority: number;
  estimatedMinutes: number;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  actualStartTime: Date | null;
  actualEndTime: Date | null;
  actualMinutes: number | null;
  completed: boolean;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'delayed';
  minutesAheadBehind: number; // For this specific task
  skipRisk: {
    level: 'low' | 'medium' | 'high';
    percentage: number;
    reasoning: string;
  } | null;
}

export interface ProgressUpdate {
  taskId: string;
  eventType: 'start' | 'complete' | 'skip' | 'delay';
  timestamp: Date;
  actualMinutes?: number;
}

/**
 * Get current progress snapshot for a plan
 * Requirement 14.1: Track task start/end times in real-time
 * Requirement 14.2: Calculate minutes ahead/behind schedule
 */
export async function getCurrentProgress(
  planId: string
): Promise<ProgressSnapshot> {
  const plan = await prisma.dailyPlan.findUnique({
    where: { id: planId },
    include: {
      tasks: {
        orderBy: { scheduledStart: 'asc' },
      },
    },
  });

  if (!plan) {
    throw new Error(`Plan ${planId} not found`);
  }

  const currentTime = new Date();
  const tasks = plan.tasks;

  // Categorize tasks
  const completedTasks = tasks.filter((t) => t.completed);
  const skippedTasks = tasks.filter(
    (t) =>
      !t.completed &&
      t.scheduledEnd &&
      currentTime > t.scheduledEnd &&
      !t.actualStartTime
  );
  const inProgressTasks = tasks.filter(
    (t) =>
      !t.completed &&
      t.actualStartTime &&
      (!t.scheduledEnd || currentTime <= t.scheduledEnd)
  );
  const upcomingTasks = tasks.filter(
    (t) =>
      !t.completed &&
      !t.actualStartTime &&
      (!t.scheduledStart || currentTime < t.scheduledStart)
  );

  // Calculate minutes ahead/behind schedule
  let minutesAheadBehind = 0;

  for (const task of tasks) {
    if (!task.scheduledStart || !task.scheduledEnd) continue;

    if (task.completed && task.completedAt) {
      // Task completed - compare actual vs scheduled end time
      const scheduledEndTime = task.scheduledEnd.getTime();
      const actualEndTime = task.completedAt.getTime();
      const diffMinutes = (scheduledEndTime - actualEndTime) / (1000 * 60);
      minutesAheadBehind += diffMinutes;
    } else if (currentTime > task.scheduledEnd && !task.completed) {
      // Task should be done but isn't - we're behind
      const behindMinutes =
        (currentTime.getTime() - task.scheduledEnd.getTime()) / (1000 * 60);
      minutesAheadBehind -= behindMinutes;
    }
  }

  // Find current and next tasks
  const currentTask = inProgressTasks[0] || null;
  const nextTask = upcomingTasks[0] || null;

  // Get momentum state
  const momentumMetrics = await calculateMomentumState(plan.userId, planId);

  // Calculate overall progress
  const overallProgress =
    tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  // Build task progress objects
  const currentTaskProgress = currentTask
    ? await buildTaskProgress(currentTask, minutesAheadBehind, tasks)
    : null;
  const nextTaskProgress = nextTask
    ? await buildTaskProgress(nextTask, minutesAheadBehind, tasks)
    : null;

  return {
    planId: plan.id,
    userId: plan.userId,
    currentTime,
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    skippedTasks: skippedTasks.length,
    inProgressTasks: inProgressTasks.length,
    upcomingTasks: upcomingTasks.length,
    minutesAheadBehind: Math.round(minutesAheadBehind),
    currentTask: currentTaskProgress,
    nextTask: nextTaskProgress,
    momentumState: momentumMetrics.state,
    overallProgress: Math.round(overallProgress),
  };
}

/**
 * Build detailed progress info for a single task
 */
async function buildTaskProgress(
  task: any,
  overallMinutesAheadBehind: number,
  allTasks: any[]
): Promise<TaskProgress> {
  const currentTime = new Date();

  // Determine task status
  let status: TaskProgress['status'] = 'not_started';
  if (task.completed) {
    status = 'completed';
  } else if (task.actualStartTime) {
    status = 'in_progress';
  } else if (task.scheduledEnd && currentTime > task.scheduledEnd) {
    status = 'skipped';
  } else if (
    task.scheduledStart &&
    currentTime > task.scheduledStart &&
    !task.actualStartTime
  ) {
    status = 'delayed';
  }

  // Calculate task-specific minutes ahead/behind
  let taskMinutesAheadBehind = 0;
  if (task.scheduledStart && task.actualStartTime) {
    const diffMinutes =
      (task.scheduledStart.getTime() - task.actualStartTime.getTime()) /
      (1000 * 60);
    taskMinutesAheadBehind = diffMinutes;
  } else if (task.scheduledEnd && task.completedAt) {
    const diffMinutes =
      (task.scheduledEnd.getTime() - task.completedAt.getTime()) / (1000 * 60);
    taskMinutesAheadBehind = diffMinutes;
  }

  // Calculate skip risk if task is upcoming or in progress
  let skipRisk = null;
  if (status === 'not_started' || status === 'in_progress' || status === 'delayed') {
    const skippedCount = allTasks.filter(
      (t) =>
        !t.completed &&
        t.scheduledEnd &&
        currentTime > t.scheduledEnd &&
        !t.actualStartTime
    ).length;

    // Get momentum state from task or calculate
    const momentumState = (task.momentumState as MomentumState) || 'normal';

    const skipRiskFactors: SkipRiskFactors = {
      minutesBehind: Math.max(0, -overallMinutesAheadBehind),
      tasksSkipped: skippedCount,
      momentumState,
      timeOfDay: currentTime.getHours(),
      taskPriority: task.priority,
      morningRunOver: checkMorningRunOver(allTasks),
    };

    const riskResult = calculateSkipRisk(skipRiskFactors);
    skipRisk = {
      level: riskResult.riskLevel,
      percentage: riskResult.riskPercentage,
      reasoning: riskResult.reasoning,
    };
  }

  return {
    id: task.id,
    title: task.title,
    priority: task.priority,
    estimatedMinutes: task.estimatedMinutes,
    scheduledStart: task.scheduledStart,
    scheduledEnd: task.scheduledEnd,
    actualStartTime: task.actualStartTime,
    actualEndTime: task.actualEndTime,
    actualMinutes: task.actualMinutes,
    completed: task.completed,
    status,
    minutesAheadBehind: Math.round(taskMinutesAheadBehind),
    skipRisk,
  };
}

/**
 * Check if morning tasks ran over schedule
 */
function checkMorningRunOver(tasks: any[]): boolean {
  const morningTasks = tasks.filter((t) => {
    if (!t.scheduledStart) return false;
    const hour = t.scheduledStart.getHours();
    return hour >= 6 && hour < 12;
  });

  return morningTasks.some((t) => {
    if (!t.scheduledStart || !t.actualStartTime) return false;
    const delayMinutes =
      (t.actualStartTime.getTime() - t.scheduledStart.getTime()) / (1000 * 60);
    return delayMinutes > 15;
  });
}

/**
 * Record task start time
 * Requirement 14.1: Track task start/end times in real-time
 */
export async function recordTaskStart(
  taskId: string,
  startTime: Date = new Date()
): Promise<TaskProgress> {
  const task = await prisma.planTask.update({
    where: { id: taskId },
    data: {
      actualStartTime: startTime,
    },
    include: {
      plan: {
        include: {
          tasks: true,
        },
      },
    },
  });

  // Get current progress to calculate skip risk
  const progress = await getCurrentProgress(task.planId);

  // Build and return task progress
  return buildTaskProgress(task, progress.minutesAheadBehind, task.plan.tasks);
}

/**
 * Record task completion
 * Requirement 14.1: Track task start/end times in real-time
 * Requirement 14.2: Detect early completions
 */
export async function recordTaskCompletion(
  taskId: string,
  completionTime: Date = new Date()
): Promise<{
  taskProgress: TaskProgress;
  isEarlyCompletion: boolean;
  minutesSaved: number;
}> {
  const task = await prisma.planTask.findUnique({
    where: { id: taskId },
    include: {
      plan: {
        include: {
          tasks: true,
        },
      },
    },
  });

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  // Calculate actual minutes
  const actualStartTime = task.actualStartTime || completionTime;
  const actualMinutes =
    (completionTime.getTime() - actualStartTime.getTime()) / (1000 * 60);

  // Check if early completion
  const isEarlyCompletion =
    task.scheduledEnd !== null && completionTime < task.scheduledEnd;
  const minutesSaved = isEarlyCompletion && task.scheduledEnd
    ? (task.scheduledEnd.getTime() - completionTime.getTime()) / (1000 * 60)
    : 0;

  // Update task
  const updatedTask = await prisma.planTask.update({
    where: { id: taskId },
    data: {
      completed: true,
      completedAt: completionTime,
      actualEndTime: completionTime,
      actualMinutes: Math.round(actualMinutes),
    },
    include: {
      plan: {
        include: {
          tasks: true,
        },
      },
    },
  });

  // Update momentum state
  await calculateMomentumState(task.plan.userId, task.planId);

  // Get current progress
  const progress = await getCurrentProgress(task.planId);

  // Build task progress
  const taskProgress = await buildTaskProgress(
    updatedTask,
    progress.minutesAheadBehind,
    updatedTask.plan.tasks
  );

  return {
    taskProgress,
    isEarlyCompletion,
    minutesSaved: Math.round(minutesSaved),
  };
}

/**
 * Detect delays in task execution
 * Requirement 14.2: Detect delays
 */
export async function detectDelays(planId: string): Promise<{
  hasDelays: boolean;
  delayedTasks: TaskProgress[];
  totalMinutesBehind: number;
}> {
  const progress = await getCurrentProgress(planId);
  const plan = await prisma.dailyPlan.findUnique({
    where: { id: planId },
    include: {
      tasks: {
        orderBy: { scheduledStart: 'asc' },
      },
    },
  });

  if (!plan) {
    throw new Error(`Plan ${planId} not found`);
  }

  const currentTime = new Date();
  const delayedTasks: TaskProgress[] = [];

  for (const task of plan.tasks) {
    if (
      !task.completed &&
      task.scheduledStart &&
      currentTime > task.scheduledStart &&
      !task.actualStartTime
    ) {
      const taskProgress = await buildTaskProgress(
        task,
        progress.minutesAheadBehind,
        plan.tasks
      );
      delayedTasks.push(taskProgress);
    }
  }

  return {
    hasDelays: delayedTasks.length > 0 || progress.minutesAheadBehind < 0,
    delayedTasks,
    totalMinutesBehind: Math.max(0, -progress.minutesAheadBehind),
  };
}

/**
 * Get progress summary for display
 */
export async function getProgressSummary(planId: string): Promise<{
  status: 'ahead' | 'on_track' | 'behind' | 'at_risk';
  message: string;
  progress: ProgressSnapshot;
}> {
  const progress = await getCurrentProgress(planId);

  let status: 'ahead' | 'on_track' | 'behind' | 'at_risk';
  let message: string;

  if (progress.minutesAheadBehind > 15) {
    status = 'ahead';
    message = `You're ${progress.minutesAheadBehind} minutes ahead of schedule! 🎉`;
  } else if (progress.minutesAheadBehind < -30) {
    status = 'at_risk';
    message = `You're ${Math.abs(progress.minutesAheadBehind)} minutes behind. Let's adjust the plan.`;
  } else if (progress.minutesAheadBehind < -15) {
    status = 'behind';
    message = `You're ${Math.abs(progress.minutesAheadBehind)} minutes behind schedule.`;
  } else {
    status = 'on_track';
    message = "You're on track! Keep going.";
  }

  return {
    status,
    message,
    progress,
  };
}

/**
 * Get progress history for a user (last 7 days)
 */
export async function getProgressHistory(
  userId: string,
  days: number = 7
): Promise<
  Array<{
    date: Date;
    totalTasks: number;
    completedTasks: number;
    skippedTasks: number;
    minutesAheadBehind: number;
    overallProgress: number;
  }>
> {
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
      date: 'asc',
    },
  });

  return plans.map((plan) => {
    const completedTasks = plan.tasks.filter((t) => t.completed);
    const skippedTasks = plan.tasks.filter(
      (t) =>
        !t.completed &&
        t.scheduledEnd &&
        new Date() > t.scheduledEnd &&
        !t.actualStartTime
    );

    // Calculate minutes ahead/behind for completed plan
    let minutesAheadBehind = 0;
    for (const task of plan.tasks) {
      if (task.completed && task.completedAt && task.scheduledEnd) {
        const diffMinutes =
          (task.scheduledEnd.getTime() - task.completedAt.getTime()) /
          (1000 * 60);
        minutesAheadBehind += diffMinutes;
      }
    }

    return {
      date: plan.date,
      totalTasks: plan.tasks.length,
      completedTasks: completedTasks.length,
      skippedTasks: skippedTasks.length,
      minutesAheadBehind: Math.round(minutesAheadBehind),
      overallProgress:
        plan.tasks.length > 0
          ? Math.round((completedTasks.length / plan.tasks.length) * 100)
          : 0,
    };
  });
}
