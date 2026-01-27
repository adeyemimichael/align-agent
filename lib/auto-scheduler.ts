/**
 * Auto-Scheduler Core Logic
 * Automatically schedules tasks based on:
 * 1. Time blindness buffers (learned from history)
 * 2. Productivity windows (when user completes tasks)
 * 3. Capacity score (current energy/stress/sleep)
 * 4. Task priority and deadlines
 * 5. Skip risk prediction (likelihood of abandoning tasks)
 * 
 * This is the BRAIN of the agent - makes it truly autonomous
 */

import { getTimeBlindnessInsights } from './time-tracking';
import { getProductivityInsights } from './productivity-windows';
import { getGeminiClient } from './gemini';
import { 
  calculateSkipRisk, 
  shouldTriggerIntervention,
  type SkipRiskFactors,
  type MomentumState 
} from './skip-risk';
import {
  calculateMomentumState,
  getMomentumPredictionAdjustment,
  shouldTriggerIntervention as shouldTriggerMomentumIntervention,
  getInterventionRecommendation,
  type MomentumMetrics,
} from './momentum-tracker';

export interface TaskToSchedule {
  id: string;
  title: string;
  description?: string;
  priority: number; // 1-4 (1 = highest)
  estimatedMinutes: number;
  dueDate?: Date;
  project?: string;
}

export interface ScheduledTask {
  taskId: string;
  title: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  adjustedMinutes: number; // After applying time blindness buffer
  originalMinutes: number;
  reason: string; // Why it was scheduled at this time
  skipRisk?: 'low' | 'medium' | 'high'; // Skip risk level
  skipRiskPercentage?: number; // Skip risk percentage (0-100)
  momentumState?: MomentumState; // Momentum state at time of scheduling
}

export interface AutoScheduleResult {
  scheduledTasks: ScheduledTask[];
  skippedTasks: TaskToSchedule[];
  reasoning: string;
  totalScheduledMinutes: number;
  availableMinutes: number;
  momentumMetrics?: MomentumMetrics; // Current momentum state and metrics
  interventions?: Array<{
    taskId: string;
    interventionType: 'supportive_checkin' | 'rescue_schedule' | 'none';
    message: string;
  }>;
}

/**
 * Calculate skip risk for scheduled tasks
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7
 */
export function calculateSkipRiskForTasks(
  scheduledTasks: ScheduledTask[],
  currentProgress?: {
    completedTasks: number;
    skippedTasks: number;
    minutesBehind: number;
    momentumState: MomentumState;
  }
): {
  tasksWithRisk: ScheduledTask[];
  interventions: Array<{
    taskId: string;
    interventionType: 'supportive_checkin' | 'rescue_schedule' | 'none';
    message: string;
  }>;
} {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Default progress if not provided
  const progress = currentProgress || {
    completedTasks: 0,
    skippedTasks: 0,
    minutesBehind: 0,
    momentumState: 'normal' as MomentumState,
  };

  // Check if morning ran over (any task before noon started late)
  const morningRanOver = scheduledTasks.some((task) => {
    if (!task.scheduledStart) return false;
    const taskHour = task.scheduledStart.getHours();
    return taskHour < 12 && currentHour > taskHour + 1; // More than 1 hour late
  });

  const tasksWithRisk: ScheduledTask[] = [];
  const interventions: Array<{
    taskId: string;
    interventionType: 'supportive_checkin' | 'rescue_schedule' | 'none';
    message: string;
  }> = [];

  scheduledTasks.forEach((task, index) => {
    const taskHour = task.scheduledStart?.getHours() || 9;
    
    // Build skip risk factors
    const factors: SkipRiskFactors = {
      minutesBehind: progress.minutesBehind,
      tasksSkipped: progress.skippedTasks,
      momentumState: progress.momentumState,
      timeOfDay: taskHour,
      taskPriority: 2, // Default priority, should come from task data
      morningRunOver: morningRanOver,
    };

    // Calculate skip risk
    const riskResult = calculateSkipRisk(factors);
    
    // Add risk data to task
    tasksWithRisk.push({
      ...task,
      skipRisk: riskResult.riskLevel,
      skipRiskPercentage: riskResult.riskPercentage,
      momentumState: progress.momentumState,
    });

    // Check if intervention is needed
    const intervention = shouldTriggerIntervention(
      riskResult,
      index,
      scheduledTasks.length
    );

    if (intervention.shouldIntervene) {
      interventions.push({
        taskId: task.taskId,
        interventionType: intervention.interventionType,
        message: intervention.message,
      });
    }
  });

  return {
    tasksWithRisk,
    interventions,
  };
}

/**
 * Auto-schedule tasks using AI + historical data
 * AI makes the actual scheduling decisions based on context
 * 
 * Requirements: 20.3, 20.6, 20.7 - Integrate momentum tracking into scheduling
 */
export async function autoScheduleTasks(
  userId: string,
  tasks: TaskToSchedule[],
  capacityScore: number,
  mode: 'recovery' | 'balanced' | 'deep_work',
  scheduleDate: Date = new Date(),
  currentProgress?: {
    completedTasks: number;
    skippedTasks: number;
    minutesBehind: number;
    momentumState: MomentumState;
  }
): Promise<AutoScheduleResult> {
  // Step 1: Calculate current momentum state
  // Requirement 20.1: Track momentum state
  const momentumMetrics = await calculateMomentumState(userId);
  
  // Use momentum state from current progress if provided, otherwise use calculated
  const effectiveMomentumState = currentProgress?.momentumState || momentumMetrics.state;
  
  // Step 2: Gather context for AI
  let availableMinutes = calculateAvailableMinutes(capacityScore, mode);
  
  // Requirement 20.3: Boost predictions when momentum is strong
  const momentumAdjustment = getMomentumPredictionAdjustment(effectiveMomentumState);
  availableMinutes = Math.round(availableMinutes * momentumAdjustment);
  
  // Get historical data
  const timeBlindnessInsights = await getTimeBlindnessInsights(userId);
  const productivityInsights = await getProductivityInsights(userId);
  
  // Format historical data for AI
  const historicalData = {
    averageBuffer: timeBlindnessInsights.averageBuffer,
    completionRatesByHour: {} as Record<number, number>,
    taskTypeBuffers: {} as Record<string, number>,
    momentumMetrics: {
      state: effectiveMomentumState,
      morningStartStrength: momentumMetrics.morningStartStrength,
      completionAfterEarlyWinRate: momentumMetrics.completionAfterEarlyWinRate,
      afternoonFalloff: momentumMetrics.afternoonFalloff,
      consecutiveSkips: momentumMetrics.consecutiveSkips,
      consecutiveEarlyCompletions: momentumMetrics.consecutiveEarlyCompletions,
    },
  };

  // Convert productivity windows to completion rates by hour
  for (const window of productivityInsights.allWindows) {
    historicalData.completionRatesByHour[window.hour] = window.completionRate / 100;
  }
  
  // Step 3: Check if momentum intervention is needed
  // Requirement 20.6: Trigger intervention when momentum collapses
  const needsMomentumIntervention = shouldTriggerMomentumIntervention(momentumMetrics);
  const momentumIntervention = getInterventionRecommendation(momentumMetrics);
  
  // If momentum collapsed, adjust task list and available time
  let adjustedTasks = tasks;
  if (needsMomentumIntervention && momentumIntervention.type === 'reschedule') {
    // Defer all but 1-2 core tasks
    adjustedTasks = tasks
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 2); // Keep only top 2 priority tasks
    
    // Reduce available time to prevent overcommitment
    availableMinutes = Math.round(availableMinutes * 0.5);
  }
  
  // Step 4: Let AI schedule tasks with full context (including momentum)
  const gemini = getGeminiClient();
  const aiSchedule = await gemini.scheduleTasksWithAI({
    userId,
    tasks: adjustedTasks,
    capacityScore,
    mode,
    availableMinutes,
    historicalData,
    scheduleDate,
  });

  // Step 5: Calculate skip risk for scheduled tasks
  const { tasksWithRisk, interventions } = calculateSkipRiskForTasks(
    aiSchedule.scheduledTasks,
    {
      completedTasks: currentProgress?.completedTasks || 0,
      skippedTasks: currentProgress?.skippedTasks || 0,
      minutesBehind: currentProgress?.minutesBehind || 0,
      momentumState: effectiveMomentumState,
    }
  );
  
  // Step 6: Add momentum-specific interventions
  const allInterventions = [...interventions];
  
  if (needsMomentumIntervention) {
    // Map momentum intervention type to existing intervention types
    let interventionType: 'supportive_checkin' | 'rescue_schedule' | 'none' = 'none';
    
    if (momentumIntervention.type === 'reschedule') {
      interventionType = 'rescue_schedule';
    } else if (momentumIntervention.type === 'encourage' || momentumIntervention.type === 'simplify') {
      interventionType = 'supportive_checkin';
    }
    
    allInterventions.push({
      taskId: 'momentum-intervention',
      interventionType,
      message: momentumIntervention.message,
    });
  }

  return {
    ...aiSchedule,
    scheduledTasks: tasksWithRisk,
    momentumMetrics,
    interventions: allInterventions,
  };
}

/**
 * Calculate available minutes based on capacity score and mode
 * This prevents overcommitting
 */
function calculateAvailableMinutes(
  capacityScore: number,
  mode: 'recovery' | 'balanced' | 'deep_work'
): number {
  // Base work day is 8 hours (480 minutes)
  const baseMinutes = 480;

  // Adjust based on capacity score
  const capacityMultiplier = capacityScore / 100;

  // Adjust based on mode
  let modeMultiplier = 1.0;
  if (mode === 'recovery') {
    modeMultiplier = 0.5; // Only 50% of normal capacity
  } else if (mode === 'deep_work') {
    modeMultiplier = 1.2; // 120% of normal capacity
  }

  return Math.round(baseMinutes * capacityMultiplier * modeMultiplier);
}

/**
 * Prioritize tasks by priority level and due date
 */
function prioritizeTasks(tasks: TaskToSchedule[]): TaskToSchedule[] {
  return [...tasks].sort((a, b) => {
    // First, sort by priority (1 = highest)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }

    // Then by due date (soonest first)
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime();
    }

    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return 0;
  });
}

/**
 * Filter tasks based on current mode
 */
function filterTasksByMode(
  tasks: Array<TaskToSchedule & { adjustedMinutes: number }>,
  mode: 'recovery' | 'balanced' | 'deep_work'
): Array<TaskToSchedule & { adjustedMinutes: number; bufferReason: string }> {
  if (mode === 'recovery') {
    // In recovery mode, only schedule low-priority, short tasks
    return tasks.filter((t) => t.priority >= 3 && t.adjustedMinutes <= 60).map(t => ({
      ...t,
      bufferReason: ''
    }));
  }

  if (mode === 'deep_work') {
    // In deep work mode, prioritize high-priority tasks
    return tasks.filter((t) => t.priority <= 2).map(t => ({
      ...t,
      bufferReason: ''
    }));
  }

  // Balanced mode: all tasks
  return tasks.map(t => ({
    ...t,
    bufferReason: ''
  }));
}

/**
 * Get start of work day (default 9 AM)
 */
function getStartOfWorkDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(9, 0, 0, 0);
  return start;
}

/**
 * Format time for display
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Generate overall scheduling reasoning
 */
function generateSchedulingReasoning(
  mode: string,
  capacityScore: number,
  scheduledCount: number,
  skippedCount: number,
  totalMinutes: number,
  availableMinutes: number
): string {
  let reasoning = `🤖 **Agent Auto-Scheduled ${scheduledCount} tasks** based on your patterns.\n\n`;

  reasoning += `**Mode:** ${mode.replace('_', ' ').toUpperCase()} (Capacity: ${Math.round(capacityScore)}%)\n`;
  reasoning += `**Available Time:** ${Math.round(availableMinutes / 60)} hours\n`;
  reasoning += `**Scheduled Time:** ${Math.round(totalMinutes / 60)} hours\n\n`;

  if (mode === 'recovery') {
    reasoning += `⚠️ **Recovery Mode Active:** Scheduled only light tasks to prevent burnout. `;
    reasoning += `${skippedCount} tasks deferred to when your capacity improves.\n\n`;
  } else if (mode === 'deep_work') {
    reasoning += `🚀 **Deep Work Mode Active:** Prioritized high-value, demanding tasks during your peak capacity.\n\n`;
  }

  reasoning += `**Agent Learning Applied:**\n`;
  reasoning += `- ✅ Time blindness buffers added based on your history\n`;
  reasoning += `- ✅ Tasks scheduled during your peak productivity hours\n`;
  reasoning += `- ✅ Workload adjusted to match your current capacity\n\n`;

  if (skippedCount > 0) {
    reasoning += `📋 **${skippedCount} tasks not scheduled** due to capacity limits. They'll be rescheduled automatically tomorrow.`;
  }

  return reasoning;
}

/**
 * Check if tasks can fit in available time slots
 * Used to avoid calendar conflicts
 */
export function checkTimeSlotAvailability(
  existingEvents: Array<{ start: Date; end: Date }>,
  proposedStart: Date,
  proposedEnd: Date
): boolean {
  for (const event of existingEvents) {
    // Check for overlap
    if (
      (proposedStart >= event.start && proposedStart < event.end) ||
      (proposedEnd > event.start && proposedEnd <= event.end) ||
      (proposedStart <= event.start && proposedEnd >= event.end)
    ) {
      return false; // Conflict found
    }
  }
  return true; // No conflicts
}
