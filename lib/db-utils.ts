/**
 * Database utility functions for optimized queries
 * Reduces redundant user lookups and improves query performance
 */

import { prisma } from './prisma';
import { cache, CacheKeys } from './cache';

/**
 * Get user by email with caching
 * This is called in almost every API route, so caching provides significant benefit
 */
export async function getUserByEmail(email: string) {
  const cacheKey = CacheKeys.user(email);
  const cached = cache.get<any>(cacheKey);

  if (cached) {
    return cached;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (user) {
    // Cache for 5 minutes
    cache.set(cacheKey, user, 300);
  }

  return user;
}

/**
 * Get user by ID with caching
 */
export async function getUserById(userId: string) {
  const cacheKey = CacheKeys.userById(userId);
  const cached = cache.get<any>(cacheKey);

  if (cached) {
    return cached;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (user) {
    // Cache for 5 minutes
    cache.set(cacheKey, user, 300);
  }

  return user;
}

/**
 * Get today's check-in with caching
 */
export async function getTodayCheckIn(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateKey = today.toISOString().split('T')[0];

  const cacheKey = CacheKeys.checkIn(userId, dateKey);
  const cached = cache.get<any>(cacheKey);

  if (cached) {
    return cached;
  }

  const checkIn = await prisma.checkIn.findFirst({
    where: {
      userId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { date: 'desc' },
  });

  if (checkIn) {
    // Cache for 1 hour (check-ins don't change frequently)
    cache.set(cacheKey, checkIn, 3600);
  }

  return checkIn;
}

/**
 * Get 7-day check-in history with caching
 */
export async function getCheckInHistory(userId: string, days: number = 7) {
  const cacheKey = CacheKeys.checkInHistory(userId);
  const cached = cache.get<any[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const history = await prisma.checkIn.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: days,
  });

  // Cache for 30 minutes
  cache.set(cacheKey, history, 1800);

  return history;
}

/**
 * Get today's plan with caching
 */
export async function getTodayPlan(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateKey = today.toISOString().split('T')[0];

  const cacheKey = CacheKeys.plan(userId, dateKey);
  const cached = cache.get<any>(cacheKey);

  if (cached) {
    return cached;
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const plan = await prisma.dailyPlan.findFirst({
    where: {
      userId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      tasks: {
        orderBy: {
          scheduledStart: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (plan) {
    // Cache for 10 minutes (plans can be updated)
    cache.set(cacheKey, plan, 600);
  }

  return plan;
}

/**
 * Get user goals with caching
 */
export async function getUserGoals(userId: string) {
  const cacheKey = CacheKeys.goals(userId);
  const cached = cache.get<any[]>(cacheKey);

  if (cached) {
    return cached;
  }

  const goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Cache for 1 hour (goals don't change frequently)
  cache.set(cacheKey, goals, 3600);

  return goals;
}

/**
 * Get integration with caching
 */
export async function getIntegration(userId: string, platform: string) {
  const cacheKey = CacheKeys.integration(userId, platform);
  const cached = cache.get<any>(cacheKey);

  if (cached) {
    return cached;
  }

  const integration = await prisma.integration.findUnique({
    where: {
      userId_platform: {
        userId,
        platform,
      },
    },
  });

  if (integration) {
    // Cache for 5 minutes
    cache.set(cacheKey, integration, 300);
  }

  return integration;
}

/**
 * Batch get multiple users by IDs
 * More efficient than multiple individual queries
 */
export async function getUsersByIds(userIds: string[]) {
  return prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  });
}

/**
 * Get completed tasks with time tracking data (optimized query)
 */
export async function getCompletedTasksWithTimeTracking(
  userId: string,
  limit: number = 30
) {
  return prisma.planTask.findMany({
    where: {
      plan: {
        userId,
      },
      completed: true,
      actualMinutes: {
        not: null,
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
    take: limit,
    select: {
      id: true,
      title: true,
      estimatedMinutes: true,
      actualMinutes: true,
      completedAt: true,
      scheduledStart: true,
      scheduledEnd: true,
    },
  });
}
