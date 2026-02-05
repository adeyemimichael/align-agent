/**
 * Mid-Day Re-Scheduling Engine
 * 
 * Analyzes current progress vs original plan and rebuilds the schedule
 * based on actual performance, protecting high-priority tasks.
 * 
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8
 */

import { prisma } from './prisma';
import { getCurrentProgress, type ProgressSnapshot } from './progress-tracker';
import { calculateMomentumState, type MomentumMetrics } from './momentum-tracker';
import { calculateSkipRisk, type SkipRiskLevel } from './skip-risk';
import { getGeminiClient } from './gemini';

export interface ProgressAnalysis {
  planId: string;
  userId: string;
  analysisTime: Date;
  
  // Progress metrics
  minutesAheadBehind: number; // Positive = ahead, negative = behind
  totalTasks: number;
  completedTasks: number;
  skippedTasks: number;
  remainingTasks: number;
  
  // Current state
  currentTask: {
    id: string;
    title: string;
    status: 'in_progress' | 'delayed' | 'not_started';
  } | null;
  
  // Protected tasks (high-priority, due soon)
  protectedTasks: Array<{
    id: string;
    title: string;
    priority: number;
    dueDate: Date | null;
    estimatedMinutes: number;
    reason: string; // Why this task is protected
  }>;
  
  // Deferrable tasks (low-priority, no urgent deadline)
  deferrableTasks: Array<{
    id: string;
    title: string;
    priority: number;
    estimatedMinutes: number;
  }>;
  
  // Time analysis
  remainingAvailableMinutes: number;
  requiredMinutesForProtected: number;
  capacityExceeded: boolean;
  
  // Context
  momentumState: MomentumMetrics;
  overallSkipRisk: SkipRiskLevel;
  
  // Recommendations
  needsReschedule: boolean;
  rescheduleReason: string;
  rescheduleType: 'ahead' | 'behind' | 'at_risk' | 'none';
}

/**
 * Analyze current progress vs original plan
 * Requirements: 19.1, 19.2, 19.5
 */
export async function analyzeProgress(planId: string): Promise<ProgressAnalysis> {
  // Get current progress snapshot
  const progress = await getCurrentProgress(planId);
  
  // Get plan details
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
  
  // Identify remaining tasks (not completed, not skipped)
  const remainingTasks = tasks.filter((t) => {
    if (t.completed) return false;
    if (t.scheduledEnd && currentTime > t.scheduledEnd && !t.actualStartTime) {
      return false; // Skipped
    }
    return true;
  });

  // Identify protected tasks (high-priority or due soon)
  // Requirement 19.5: Identify protected tasks (high-priority, due soon)
  const protectedTasks = remainingTasks
    .filter((t) => {
      // Priority 1-2 are always protected
      if (t.priority <= 2) return true;
      
      return false;
    })
    .map((t) => {
      let reason = '';
      if (t.priority === 1) reason = 'Highest priority (P1)';
      else if (t.priority === 2) reason = 'High priority (P2)';
      
      return {
        id: t.id,
        title: t.title,
        priority: t.priority,
        dueDate: null,
        estimatedMinutes: t.estimatedMinutes,
        reason,
      };
    });

  // Identify deferrable tasks (low-priority, no urgent deadline)
  const deferrableTasks = remainingTasks
    .filter((t) => {
      // Priority 3-4 are deferrable
      return t.priority >= 3;
    })
    .map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      estimatedMinutes: t.estimatedMinutes,
    }));

  // Calculate remaining available time
  // Requirement 19.2: Calculate minutes ahead or behind schedule
  const endOfDay = new Date(currentTime);
  endOfDay.setHours(18, 0, 0, 0); // Assume workday ends at 6pm
  const remainingAvailableMinutes = Math.max(
    0,
    (endOfDay.getTime() - currentTime.getTime()) / (1000 * 60)
  );

  // Calculate required minutes for protected tasks
  const requiredMinutesForProtected = protectedTasks.reduce(
    (sum, t) => sum + t.estimatedMinutes,
    0
  );

  // Check if capacity is exceeded
  const capacityExceeded = requiredMinutesForProtected > remainingAvailableMinutes;

  // Get momentum state
  const momentumState = await calculateMomentumState(plan.userId, planId);

  // Calculate overall skip risk
  const overallSkipRisk = calculateOverallSkipRisk(
    progress.minutesAheadBehind,
    progress.skippedTasks,
    momentumState.state
  );

  // Requirement 20.6, 20.7: Trigger interventions when momentum collapses
  // Requirement 20.3: Boost predictions when momentum is strong
  const { getMomentumPredictionAdjustment, shouldTriggerIntervention } = await import('./momentum-tracker');
  const momentumAdjustment = getMomentumPredictionAdjustment(momentumState.state);
  const needsMomentumIntervention = shouldTriggerIntervention(momentumState);

  // Determine if reschedule is needed
  // Requirement 20.6: WHEN momentum collapses, THE Agent SHALL trigger intervention
  const { needsReschedule, rescheduleReason, rescheduleType } = determineRescheduleNeed(
    progress.minutesAheadBehind,
    capacityExceeded,
    momentumState.state,
    overallSkipRisk,
    needsMomentumIntervention
  );

  // Get current task
  const currentTask = progress.currentTask
    ? {
        id: progress.currentTask.id,
        title: progress.currentTask.title,
        status: progress.currentTask.status as 'in_progress' | 'delayed' | 'not_started',
      }
    : null;

  return {
    planId,
    userId: plan.userId,
    analysisTime: currentTime,
    minutesAheadBehind: progress.minutesAheadBehind,
    totalTasks: progress.totalTasks,
    completedTasks: progress.completedTasks,
    skippedTasks: progress.skippedTasks,
    remainingTasks: remainingTasks.length,
    currentTask,
    protectedTasks,
    deferrableTasks,
    remainingAvailableMinutes: Math.round(remainingAvailableMinutes),
    requiredMinutesForProtected,
    capacityExceeded,
    momentumState,
    overallSkipRisk,
    needsReschedule,
    rescheduleReason,
    rescheduleType,
  };
}

/**
 * Calculate overall skip risk level
 */
function calculateOverallSkipRisk(
  minutesBehind: number,
  skippedTasks: number,
  momentumState: string
): SkipRiskLevel {
  const riskResult = calculateSkipRisk({
    minutesBehind: Math.max(0, -minutesBehind),
    tasksSkipped: skippedTasks,
    momentumState: momentumState as any,
    timeOfDay: new Date().getHours(),
    taskPriority: 2, // Average priority
    morningRunOver: false,
  });
  
  return riskResult.riskLevel;
}

/**
 * Determine if reschedule is needed and why
 */
function determineRescheduleNeed(
  minutesAheadBehind: number,
  capacityExceeded: boolean,
  momentumState: string,
  skipRisk: SkipRiskLevel,
  needsMomentumIntervention: boolean
): {
  needsReschedule: boolean;
  rescheduleReason: string;
  rescheduleType: 'ahead' | 'behind' | 'at_risk' | 'none';
} {
  // Requirement 20.6: WHEN momentum collapses, THE Agent SHALL trigger intervention
  if (needsMomentumIntervention || momentumState === 'collapsed') {
    return {
      needsReschedule: true,
      rescheduleReason: 'Momentum has collapsed. Let\'s simplify and focus on just 1-2 achievable wins.',
      rescheduleType: 'at_risk',
    };
  }

  // Ahead of schedule - suggest adding tasks
  // Requirement 20.5: WHEN momentum is strong (early completions), THE Agent SHALL suggest pulling forward additional tasks
  if (minutesAheadBehind > 30 && momentumState === 'strong') {
    return {
      needsReschedule: true,
      rescheduleReason: `You're ${minutesAheadBehind} minutes ahead with strong momentum. You could add more tasks or take a well-deserved break.`,
      rescheduleType: 'ahead',
    };
  }

  // Behind schedule with high skip risk - rescue schedule needed
  if (minutesAheadBehind < -30 || skipRisk === 'high') {
    return {
      needsReschedule: true,
      rescheduleReason: `You're ${Math.abs(minutesAheadBehind)} minutes behind schedule with ${skipRisk} skip risk. Let's simplify the plan to protect core wins.`,
      rescheduleType: 'at_risk',
    };
  }

  // Behind schedule but manageable
  if (minutesAheadBehind < -15 || capacityExceeded) {
    return {
      needsReschedule: true,
      rescheduleReason: capacityExceeded
        ? 'Not enough time remaining for all planned tasks. Let\'s prioritize what matters most.'
        : `You're ${Math.abs(minutesAheadBehind)} minutes behind. Let's adjust the afternoon plan.`,
      rescheduleType: 'behind',
    };
  }

  // No reschedule needed
  return {
    needsReschedule: false,
    rescheduleReason: '',
    rescheduleType: 'none',
  };
}

export interface RescheduleResult {
  success: boolean;
  newSchedule: {
    scheduledTasks: Array<{
      taskId: string;
      title: string;
      scheduledStart: Date;
      scheduledEnd: Date;
      estimatedMinutes: number;
      priority: number;
      isProtected: boolean;
    }>;
    deferredTasks: Array<{
      taskId: string;
      title: string;
      priority: number;
      reason: string;
    }>;
  };
  reasoning: string;
  adaptationType: 'ahead' | 'behind' | 'rescue' | 'none';
  totalScheduledMinutes: number;
  availableMinutes: number;
}

/**
 * Rebuild afternoon schedule based on progress
 * Requirements: 19.4, 19.5, 19.6
 */
export async function rescheduleAfternoon(
  planId: string,
  userApproval: boolean = false
): Promise<RescheduleResult> {
  // Analyze current progress
  const analysis = await analyzeProgress(planId);

  if (!analysis.needsReschedule) {
    return {
      success: false,
      newSchedule: {
        scheduledTasks: [],
        deferredTasks: [],
      },
      reasoning: 'No reschedule needed - you\'re on track!',
      adaptationType: 'none',
      totalScheduledMinutes: 0,
      availableMinutes: analysis.remainingAvailableMinutes,
    };
  }

  // Get plan details
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
  const remainingTasks = plan.tasks.filter((t) => {
    if (t.completed) return false;
    if (t.scheduledEnd && currentTime > t.scheduledEnd && !t.actualStartTime) {
      return false; // Skipped
    }
    return true;
  });

  // Requirement 19.5: Protect high-priority and due-soon tasks
  const protectedTaskIds = new Set(analysis.protectedTasks.map((t) => t.id));
  const deferrableTaskIds = new Set(analysis.deferrableTasks.map((t) => t.id));

  let scheduledTasks: RescheduleResult['newSchedule']['scheduledTasks'] = [];
  let deferredTasks: RescheduleResult['newSchedule']['deferredTasks'] = [];
  let reasoning = '';
  let adaptationType: RescheduleResult['adaptationType'] = 'none';

  // Requirement 19.4: Rebuild afternoon schedule based on progress
  if (analysis.rescheduleType === 'ahead') {
    // User is ahead - suggest continuing or adding tasks
    adaptationType = 'ahead';
    reasoning = `Great work! ${analysis.rescheduleReason} Continue with your plan or take a break.`;
    
    // Keep all remaining tasks scheduled
    scheduledTasks = remainingTasks.map((t, index) => {
      const start = new Date(currentTime.getTime() + index * 60 * 60 * 1000);
      const end = new Date(start.getTime() + t.estimatedMinutes * 60 * 1000);
      
      return {
        taskId: t.id,
        title: t.title,
        scheduledStart: start,
        scheduledEnd: end,
        estimatedMinutes: t.estimatedMinutes,
        priority: t.priority,
        isProtected: protectedTaskIds.has(t.id),
      };
    });
  } else if (analysis.rescheduleType === 'at_risk' || analysis.rescheduleType === 'behind') {
    // User is behind or at risk - simplify schedule
    adaptationType = analysis.rescheduleType === 'at_risk' ? 'rescue' : 'behind';
    
    // Requirement 19.6: Defer low-priority tasks when capacity exceeded
    if (analysis.capacityExceeded) {
      // Only schedule protected tasks
      const tasksToSchedule = remainingTasks.filter((t) => protectedTaskIds.has(t.id));
      const tasksToDefer = remainingTasks.filter((t) => !protectedTaskIds.has(t.id));
      
      let currentScheduleTime = new Date(currentTime);
      currentScheduleTime.setMinutes(currentScheduleTime.getMinutes() + 15); // 15 min buffer
      
      scheduledTasks = tasksToSchedule.map((t) => {
        const start = new Date(currentScheduleTime);
        const end = new Date(start.getTime() + t.estimatedMinutes * 60 * 1000);
        currentScheduleTime = new Date(end.getTime() + 15 * 60 * 1000); // 15 min break
        
        return {
          taskId: t.id,
          title: t.title,
          scheduledStart: start,
          scheduledEnd: end,
          estimatedMinutes: t.estimatedMinutes,
          priority: t.priority,
          isProtected: true,
        };
      });
      
      deferredTasks = tasksToDefer.map((t) => ({
        taskId: t.id,
        title: t.title,
        priority: t.priority,
        reason: deferrableTaskIds.has(t.id)
          ? 'Low priority, no urgent deadline'
          : 'Insufficient time remaining',
      }));
      
      reasoning = `${analysis.rescheduleReason} I've protected ${scheduledTasks.length} high-priority tasks and deferred ${deferredTasks.length} tasks to tomorrow.`;
    } else {
      // Schedule protected tasks first, then fit in others if time allows
      const protectedTasksList = remainingTasks.filter((t) => protectedTaskIds.has(t.id));
      const otherTasks = remainingTasks.filter((t) => !protectedTaskIds.has(t.id));
      
      let currentScheduleTime = new Date(currentTime);
      currentScheduleTime.setMinutes(currentScheduleTime.getMinutes() + 15);
      let remainingMinutes = analysis.remainingAvailableMinutes;
      
      // Schedule protected tasks
      for (const task of protectedTasksList) {
        if (remainingMinutes < task.estimatedMinutes) break;
        
        const start = new Date(currentScheduleTime);
        const end = new Date(start.getTime() + task.estimatedMinutes * 60 * 1000);
        
        scheduledTasks.push({
          taskId: task.id,
          title: task.title,
          scheduledStart: start,
          scheduledEnd: end,
          estimatedMinutes: task.estimatedMinutes,
          priority: task.priority,
          isProtected: true,
        });
        
        currentScheduleTime = new Date(end.getTime() + 15 * 60 * 1000);
        remainingMinutes -= task.estimatedMinutes + 15;
      }
      
      // Try to fit in other tasks
      for (const task of otherTasks) {
        if (remainingMinutes < task.estimatedMinutes) {
          deferredTasks.push({
            taskId: task.id,
            title: task.title,
            priority: task.priority,
            reason: 'Insufficient time remaining',
          });
          continue;
        }
        
        const start = new Date(currentScheduleTime);
        const end = new Date(start.getTime() + task.estimatedMinutes * 60 * 1000);
        
        scheduledTasks.push({
          taskId: task.id,
          title: task.title,
          scheduledStart: start,
          scheduledEnd: end,
          estimatedMinutes: task.estimatedMinutes,
          priority: task.priority,
          isProtected: false,
        });
        
        currentScheduleTime = new Date(end.getTime() + 15 * 60 * 1000);
        remainingMinutes -= task.estimatedMinutes + 15;
      }
      
      reasoning = `${analysis.rescheduleReason} I've adjusted your afternoon to focus on ${scheduledTasks.length} tasks${deferredTasks.length > 0 ? ` and deferred ${deferredTasks.length} tasks` : ''}.`;
    }
  }

  const totalScheduledMinutes = scheduledTasks.reduce(
    (sum, t) => sum + t.estimatedMinutes,
    0
  );

  return {
    success: true,
    newSchedule: {
      scheduledTasks,
      deferredTasks,
    },
    reasoning,
    adaptationType,
    totalScheduledMinutes,
    availableMinutes: analysis.remainingAvailableMinutes,
  };
}

/**
 * Apply reschedule to database
 */
export async function applyReschedule(
  planId: string,
  rescheduleResult: RescheduleResult
): Promise<void> {
  if (!rescheduleResult.success) {
    throw new Error('Cannot apply unsuccessful reschedule');
  }

  // Update scheduled tasks
  for (const task of rescheduleResult.newSchedule.scheduledTasks) {
    await prisma.planTask.update({
      where: { id: task.taskId },
      data: {
        scheduledStart: task.scheduledStart,
        scheduledEnd: task.scheduledEnd,
      },
    });
  }

  // Mark deferred tasks (remove from today's schedule)
  for (const task of rescheduleResult.newSchedule.deferredTasks) {
    await prisma.planTask.update({
      where: { id: task.taskId },
      data: {
        scheduledStart: null,
        scheduledEnd: null,
      },
    });
  }

  // Update plan with reschedule reasoning
  await prisma.dailyPlan.update({
    where: { id: planId },
    data: {
      geminiReasoning: `${rescheduleResult.reasoning}\n\n[Rescheduled at ${new Date().toLocaleTimeString()}]`,
    },
  });
}

/**
 * Use AI agent to make intelligent re-scheduling decisions
 * Requirements: 19.3, 19.7
 */
export async function rescheduleWithAI(
  planId: string,
  options: {
    includeHistoricalData?: boolean;
    userPreferences?: {
      preferEarlyFinish?: boolean;
      maxTasksPerDay?: number;
    };
  } = {}
): Promise<RescheduleResult> {
  // Analyze current progress
  const analysis = await analyzeProgress(planId);

  if (!analysis.needsReschedule) {
    return {
      success: false,
      newSchedule: {
        scheduledTasks: [],
        deferredTasks: [],
      },
      reasoning: 'No reschedule needed - you\'re on track!',
      adaptationType: 'none',
      totalScheduledMinutes: 0,
      availableMinutes: analysis.remainingAvailableMinutes,
    };
  }

  // Get plan and user details
  const plan = await prisma.dailyPlan.findUnique({
    where: { id: planId },
    include: {
      tasks: {
        orderBy: { scheduledStart: 'asc' },
      },
      user: {
        include: {
          goals: true,
        },
      },
    },
  });

  if (!plan) {
    throw new Error(`Plan ${planId} not found`);
  }

  const currentTime = new Date();
  const remainingTasks = plan.tasks.filter((t) => {
    if (t.completed) return false;
    if (t.scheduledEnd && currentTime > t.scheduledEnd && !t.actualStartTime) {
      return false; // Skipped
    }
    return true;
  });

  // Get historical data if requested
  let historicalData = {
    averageBuffer: 1.5,
    completionRatesByHour: {} as Record<number, number>,
    taskTypeBuffers: {} as Record<string, number>,
  };

  if (options.includeHistoricalData) {
    // Get time tracking data
    const timeTrackingData = await prisma.planTask.findMany({
      where: {
        plan: {
          userId: plan.userId,
        },
        completed: true,
        actualMinutes: { not: null },
      },
      select: {
        estimatedMinutes: true,
        actualMinutes: true,
        scheduledStart: true,
      },
      take: 50,
    });

    if (timeTrackingData.length > 0) {
      const totalBuffer = timeTrackingData.reduce((sum, t) => {
        if (t.actualMinutes && t.estimatedMinutes > 0) {
          return sum + t.actualMinutes / t.estimatedMinutes;
        }
        return sum;
      }, 0);
      historicalData.averageBuffer = totalBuffer / timeTrackingData.length;

      // Calculate completion rates by hour
      const completionsByHour: Record<number, { completed: number; total: number }> = {};
      for (const task of timeTrackingData) {
        if (task.scheduledStart) {
          const hour = task.scheduledStart.getHours();
          if (!completionsByHour[hour]) {
            completionsByHour[hour] = { completed: 0, total: 0 };
          }
          completionsByHour[hour].completed++;
          completionsByHour[hour].total++;
        }
      }

      for (const [hour, data] of Object.entries(completionsByHour)) {
        historicalData.completionRatesByHour[parseInt(hour)] =
          data.completed / data.total;
      }
    }
  }

  // Prepare tasks for AI
  const tasksForAI = remainingTasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || undefined,
    priority: t.priority,
    estimatedMinutes: t.estimatedMinutes,
    dueDate: undefined,
    project: undefined,
  }));

  // Get user goals
  const goals = plan.user.goals.map((g) => ({
    title: g.title,
    category: g.category,
  }));

  // Requirement 19.3: Send current progress to Gemini AI
  const geminiClient = getGeminiClient();
  
  try {
    const aiSchedule = await geminiClient.scheduleTasksWithAI({
      userId: plan.userId,
      tasks: tasksForAI,
      capacityScore: plan.capacityScore,
      mode: plan.mode,
      availableMinutes: analysis.remainingAvailableMinutes,
      historicalData,
      goals,
      scheduleDate: currentTime,
    });

    // Requirement 19.7: Apply AI recommendations
    const scheduledTasks = aiSchedule.scheduledTasks.map((t) => ({
      taskId: t.taskId,
      title: t.title,
      scheduledStart: t.scheduledStart,
      scheduledEnd: t.scheduledEnd,
      estimatedMinutes: t.adjustedMinutes,
      priority: remainingTasks.find((rt) => rt.id === t.taskId)?.priority || 3,
      isProtected: analysis.protectedTasks.some((pt) => pt.id === t.taskId),
    }));

    const deferredTasks = aiSchedule.skippedTasks.map((t: any) => ({
      taskId: t.id,
      title: t.title,
      priority: t.priority,
      reason: 'AI determined insufficient time or capacity',
    }));

    // Determine adaptation type based on analysis
    let adaptationType: RescheduleResult['adaptationType'] = 'none';
    if (analysis.rescheduleType === 'ahead') {
      adaptationType = 'ahead';
    } else if (analysis.rescheduleType === 'at_risk') {
      adaptationType = 'rescue';
    } else if (analysis.rescheduleType === 'behind') {
      adaptationType = 'behind';
    }

    return {
      success: true,
      newSchedule: {
        scheduledTasks,
        deferredTasks,
      },
      reasoning: `${analysis.rescheduleReason}\n\nAI Analysis: ${aiSchedule.reasoning}`,
      adaptationType,
      totalScheduledMinutes: aiSchedule.totalScheduledMinutes,
      availableMinutes: aiSchedule.availableMinutes,
    };
  } catch (error) {
    console.error('AI reschedule failed, falling back to rule-based:', error);
    // Fallback to rule-based reschedule
    return rescheduleAfternoon(planId);
  }
}
