/**
 * Productivity Windows Analysis
 * Learns when user is most productive based on task completion patterns
 * This is HARDCODED LEARNING - pure data analysis, no AI guessing
 */

import { prisma } from './prisma';
import { cache, CacheKeys } from './cache';

export interface ProductivityWindow {
  hour: number; // 0-23 (24-hour format)
  completionRate: number; // 0-100
  tasksCompleted: number;
  totalTasks: number;
  label: string; // "9:00 AM", "2:00 PM", etc.
}

export interface ProductivityInsights {
  userId: string;
  peakHours: ProductivityWindow[]; // Top 3 most productive hours
  lowHours: ProductivityWindow[]; // Bottom 3 least productive hours
  allWindows: ProductivityWindow[]; // All hours with data
  recommendation: string;
  confidence: 'low' | 'medium' | 'high';
}

/**
 * Analyze completion patterns by time of day
 * This is the KEY function that makes scheduling intelligent
 */
export async function analyzeCompletionTimePatterns(
  userId: string
): Promise<ProductivityWindow[]> {
  // Get all completed tasks with actual completion times
  const completedTasks = await prisma.planTask.findMany({
    where: {
      plan: {
        userId,
      },
      completed: true,
      completedAt: {
        not: null,
      },
    },
    select: {
      id: true,
      completedAt: true,
      scheduledStart: true,
    },
  });

  if (completedTasks.length === 0) {
    return [];
  }

  // Group tasks by hour of completion
  const hourlyData: Map<number, { completed: number; total: number }> = new Map();

  for (const task of completedTasks) {
    if (!task.completedAt) continue;

    const hour = new Date(task.completedAt).getHours();
    
    if (!hourlyData.has(hour)) {
      hourlyData.set(hour, { completed: 0, total: 0 });
    }

    const data = hourlyData.get(hour)!;
    data.completed++;
    data.total++;
  }

  // Also count scheduled but not completed tasks
  const allScheduledTasks = await prisma.planTask.findMany({
    where: {
      plan: {
        userId,
      },
      scheduledStart: {
        not: null,
      },
    },
    select: {
      id: true,
      completed: true,
      scheduledStart: true,
    },
  });

  for (const task of allScheduledTasks) {
    if (!task.scheduledStart) continue;

    const hour = new Date(task.scheduledStart).getHours();
    
    if (!hourlyData.has(hour)) {
      hourlyData.set(hour, { completed: 0, total: 0 });
    }

    const data = hourlyData.get(hour)!;
    if (!task.completed) {
      data.total++; // Count as scheduled but not completed
    }
  }

  // Convert to ProductivityWindow array
  const windows: ProductivityWindow[] = [];

  for (const [hour, data] of hourlyData.entries()) {
    const completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
    
    windows.push({
      hour,
      completionRate,
      tasksCompleted: data.completed,
      totalTasks: data.total,
      label: formatHourLabel(hour),
    });
  }

  // Sort by hour
  windows.sort((a, b) => a.hour - b.hour);

  return windows;
}

/**
 * Get productivity insights for a user
 * Identifies peak and low productivity hours
 */
export async function getProductivityInsights(
  userId: string
): Promise<ProductivityInsights> {
  // Check cache first
  const cacheKey = CacheKeys.productivityWindows(userId);
  const cached = cache.get<ProductivityInsights>(cacheKey);
  if (cached) {
    return cached;
  }

  const windows = await analyzeCompletionTimePatterns(userId);

  if (windows.length === 0) {
    return {
      userId,
      peakHours: [],
      lowHours: [],
      allWindows: [],
      recommendation: 'Complete more tasks to identify your productivity patterns.',
      confidence: 'low',
    };
  }

  // Filter windows with at least 3 tasks for reliability
  const reliableWindows = windows.filter((w) => w.totalTasks >= 3);

  if (reliableWindows.length === 0) {
    return {
      userId,
      peakHours: [],
      lowHours: [],
      allWindows: windows,
      recommendation: 'Need more task completions to identify reliable patterns.',
      confidence: 'low',
    };
  }

  // Sort by completion rate
  const sortedByRate = [...reliableWindows].sort(
    (a, b) => b.completionRate - a.completionRate
  );

  // Get top 3 peak hours
  const peakHours = sortedByRate.slice(0, 3);

  // Get bottom 3 low hours
  const lowHours = sortedByRate.slice(-3).reverse();

  // Determine confidence based on data volume
  const totalTasks = windows.reduce((sum, w) => sum + w.totalTasks, 0);
  let confidence: 'low' | 'medium' | 'high';
  if (totalTasks < 10) {
    confidence = 'low';
  } else if (totalTasks < 30) {
    confidence = 'medium';
  } else {
    confidence = 'high';
  }

  // Generate recommendation
  const recommendation = generateProductivityRecommendation(peakHours, lowHours);

  const result = {
    userId,
    peakHours,
    lowHours,
    allWindows: windows,
    recommendation,
    confidence,
  };

  // Cache for 10 minutes
  cache.set(cacheKey, result, 600);

  return result;
}

/**
 * Calculate completion rate for a specific time slot
 * Used by auto-scheduler to pick optimal times
 */
export async function calculateTimeSlotCompletionRate(
  userId: string,
  hour: number
): Promise<number> {
  const windows = await analyzeCompletionTimePatterns(userId);
  const window = windows.find((w) => w.hour === hour);
  
  if (!window || window.totalTasks < 3) {
    // Not enough data, return neutral rate
    return 50;
  }

  return window.completionRate;
}

/**
 * Identify peak productivity hours for scheduling
 * Returns hours sorted by completion rate (best first)
 */
export async function identifyPeakProductivityHours(
  userId: string,
  minTasks: number = 3
): Promise<number[]> {
  const windows = await analyzeCompletionTimePatterns(userId);
  
  return windows
    .filter((w) => w.totalTasks >= minTasks)
    .sort((a, b) => b.completionRate - a.completionRate)
    .map((w) => w.hour);
}

/**
 * Check if a time slot is during peak productivity
 */
export async function isPeakProductivityTime(
  userId: string,
  hour: number
): Promise<boolean> {
  const completionRate = await calculateTimeSlotCompletionRate(userId, hour);
  return completionRate >= 70; // 70%+ completion rate = peak time
}

/**
 * Format hour as readable label
 */
function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}

/**
 * Generate productivity recommendation
 */
function generateProductivityRecommendation(
  peakHours: ProductivityWindow[],
  lowHours: ProductivityWindow[]
): string {
  if (peakHours.length === 0) {
    return 'Complete more tasks to identify your peak productivity hours.';
  }

  const bestHour = peakHours[0];
  const worstHour = lowHours[0];

  let recommendation = `Your peak productivity is at ${bestHour.label} with ${Math.round(bestHour.completionRate)}% completion rate. `;

  if (worstHour && worstHour.completionRate < 50) {
    recommendation += `Avoid scheduling important tasks at ${worstHour.label} (${Math.round(worstHour.completionRate)}% completion rate). `;
  }

  recommendation += 'The agent will automatically schedule high-priority tasks during your peak hours.';

  return recommendation;
}

/**
 * Get recommended scheduling time for a task
 * Returns the best hour to schedule based on priority and productivity patterns
 */
export async function getRecommendedSchedulingTime(
  userId: string,
  taskPriority: number, // 1-4 (1 = highest)
  durationMinutes: number
): Promise<{
  recommendedHour: number;
  completionRate: number;
  reason: string;
}> {
  const peakHours = await identifyPeakProductivityHours(userId);

  if (peakHours.length === 0) {
    // No data, default to morning (9 AM)
    return {
      recommendedHour: 9,
      completionRate: 50,
      reason: 'Default morning slot (no historical data yet)',
    };
  }

  // High priority tasks (1-2) get peak hours
  if (taskPriority <= 2) {
    const bestHour = peakHours[0];
    const completionRate = await calculateTimeSlotCompletionRate(userId, bestHour);
    
    return {
      recommendedHour: bestHour,
      completionRate,
      reason: `Peak productivity hour with ${Math.round(completionRate)}% completion rate`,
    };
  }

  // Lower priority tasks (3-4) can use non-peak hours
  const allWindows = await analyzeCompletionTimePatterns(userId);
  const availableHours = allWindows
    .filter((w) => w.completionRate >= 50 && w.totalTasks >= 2)
    .sort((a, b) => b.completionRate - a.completionRate);

  if (availableHours.length > 0) {
    const selectedHour = availableHours[Math.floor(availableHours.length / 2)]; // Pick middle-tier hour
    
    return {
      recommendedHour: selectedHour.hour,
      completionRate: selectedHour.completionRate,
      reason: `Good productivity hour with ${Math.round(selectedHour.completionRate)}% completion rate`,
    };
  }

  // Fallback
  return {
    recommendedHour: 10,
    completionRate: 50,
    reason: 'Default mid-morning slot',
  };
}
