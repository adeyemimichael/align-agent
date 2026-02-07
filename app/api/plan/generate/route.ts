import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserByEmail, getTodayCheckIn, getCheckInHistory, getUserGoals, getIntegration } from '@/lib/db-utils';
import { CacheInvalidation } from '@/lib/cache';
import { getGeminiClient, PlanningContext } from '@/lib/gemini';
import { syncPlanToCalendar } from '@/lib/calendar-sync';
import { autoScheduleTasks, TaskToSchedule } from '@/lib/auto-scheduler';
import { handleAPIError, withGracefulDegradation } from '@/lib/api-error-handler';
import { AuthError, NotFoundError, ValidationError, ExternalAPIError, AIServiceError } from '@/lib/errors';

// POST /api/plan/generate - Generate AI-powered daily plan
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      throw new AuthError('Please sign in to generate a plan');
    }

    const body = await request.json();
    const { date, syncToCalendar = false } = body;

    // Get user from database (with caching)
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Get today's check-in (with caching)
    const planDate = date ? new Date(date) : new Date();
    planDate.setHours(0, 0, 0, 0);

    const checkIn = await getTodayCheckIn(user.id);

    if (!checkIn) {
      throw new ValidationError(
        'No check-in found for today. Please complete your check-in first.',
        { requiresCheckIn: true }
      );
    }

    // Get 7-day history (with caching)
    const history = await getCheckInHistory(user.id, 7);

    // Get user's goals (with caching)
    const goals = await getUserGoals(user.id);

    // Get tasks from Todoist integration (with caching)
    const todoistIntegration = await getIntegration(user.id, 'todoist');

    let tasks: PlanningContext['tasks'] = [];

    if (todoistIntegration) {
      // Fetch tasks from Todoist with graceful degradation
      try {
        const todoistResponse = await fetch(
          `${request.nextUrl.origin}/api/integrations/todoist/tasks`,
          {
            headers: {
              Cookie: request.headers.get('cookie') || '',
            },
          }
        );

        if (todoistResponse.ok) {
          const todoistTasks = await todoistResponse.json();
          tasks = todoistTasks.tasks.map((t: any) => ({
            id: t.id,
            title: t.content,
            description: t.description,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes || 45,
            dueDate: t.due?.date ? new Date(t.due.date) : undefined,
            project: t.project_id,
          }));
        } else {
          // Log but don't fail - we'll try to get tasks from existing plan
          console.warn('Failed to fetch Todoist tasks, will use existing plan tasks');
        }
      } catch (todoistError) {
        // Gracefully handle Todoist errors
        console.warn('Todoist integration error:', todoistError);
      }
    }

    // If no tasks from integrations, check for existing plan tasks
    if (tasks.length === 0) {
      const existingPlan = await prisma.dailyPlan.findFirst({
        where: {
          userId: user.id,
          date: planDate,
        },
        include: {
          tasks: true,
        },
      });

      if (existingPlan) {
        tasks = existingPlan.tasks.map((t: {
          id: string;
          title: string;
          description: string | null;
          priority: number;
          estimatedMinutes: number;
        }) => ({
          id: t.id,
          title: t.title,
          description: t.description || undefined,
          priority: t.priority,
          estimatedMinutes: t.estimatedMinutes,
        }));
      }
    }

    // If still no tasks, return error
    if (tasks.length === 0) {
      throw new ValidationError(
        'No tasks available. Please connect Todoist or add tasks manually.',
        { requiresTasks: true }
      );
    }

    // Convert tasks to auto-scheduler format
    const tasksToSchedule: TaskToSchedule[] = tasks.map((t: {
      id: string;
      title: string;
      description?: string;
      priority: number;
      estimatedMinutes: number;
      dueDate?: Date;
      project?: string;
    }) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      priority: t.priority || 3,
      estimatedMinutes: t.estimatedMinutes || 45,
      dueDate: t.dueDate,
      project: t.project,
    }));

    // Use AI-driven auto-scheduler - NO FALLBACK, AI is required
    const autoScheduleResult = await autoScheduleTasks(
      user.id,
      tasksToSchedule,
      checkIn.capacityScore,
      checkIn.mode as 'recovery' | 'balanced' | 'deep_work',
      planDate
    );

    // AI reasoning is already included in autoScheduleResult
    const combinedReasoning = autoScheduleResult.reasoning;

    // Delete existing plan for today if it exists
    await prisma.dailyPlan.deleteMany({
      where: {
        userId: user.id,
        date: planDate,
      },
    });

    // Save plan to database using auto-scheduler results
    const plan = await prisma.dailyPlan.create({
      data: {
        userId: user.id,
        date: planDate,
        capacityScore: checkIn.capacityScore,
        mode: checkIn.mode,
        geminiReasoning: combinedReasoning,
        tasks: {
          create: autoScheduleResult.scheduledTasks.map((t) => {
            const task = tasks.find((task) => task.id === t.taskId);
            return {
              externalId: t.taskId,
              title: t.title || task?.title || 'Untitled Task', // Ensure title is never undefined
              description: task?.description ?? undefined,
              priority: task?.priority || 3,
              estimatedMinutes: t.adjustedMinutes, // Use adjusted minutes with buffer
              scheduledStart: t.scheduledStart,
              scheduledEnd: t.scheduledEnd,
              skipRisk: t.skipRisk,
              skipRiskPercentage: t.skipRiskPercentage,
              momentumState: t.momentumState,
            };
          }),
        },
      },
      include: {
        tasks: true,
      },
    });

    // Invalidate plan cache
    CacheInvalidation.onPlanCreate(user.id);

    // Sync to Google Calendar if requested (with graceful degradation)
    let calendarSyncResult;
    if (syncToCalendar) {
      try {
        const taskSchedules = plan.tasks.map((t: {
          id: string;
          title: string;
          description: string | null;
          scheduledStart: Date | null;
          scheduledEnd: Date | null;
          priority: number;
        }) => ({
          taskId: t.id,
          title: t.title,
          description: t.description || undefined,
          startTime: t.scheduledStart!,
          endTime: t.scheduledEnd!,
          priority: t.priority,
        }));

        calendarSyncResult = await syncPlanToCalendar(
          user.id,
          taskSchedules,
          Intl.DateTimeFormat().resolvedOptions().timeZone
        );
      } catch (calendarError) {
        // Log but don't fail the entire request
        console.warn('Calendar sync failed:', calendarError);
        calendarSyncResult = {
          success: false,
          message: 'Plan created successfully, but calendar sync failed. You can sync manually later.',
        };
      }
    }

    return NextResponse.json(
      {
        message: 'Daily plan generated successfully',
        plan: {
          id: plan.id,
          date: plan.date,
          capacityScore: plan.capacityScore,
          mode: plan.mode,
          reasoning: plan.geminiReasoning,
          tasks: plan.tasks.map((t: {
            id: string;
            title: string;
            description: string | null;
            priority: number;
            estimatedMinutes: number;
            scheduledStart: Date | null;
            scheduledEnd: Date | null;
            completed: boolean;
            skipRisk: string | null;
            skipRiskPercentage: number | null;
            momentumState: string | null;
          }) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes,
            scheduledStart: t.scheduledStart,
            scheduledEnd: t.scheduledEnd,
            completed: t.completed,
            skipRisk: t.skipRisk,
            skipRiskPercentage: t.skipRiskPercentage,
            momentumState: t.momentumState,
          })),
          skippedTasks: autoScheduleResult.skippedTasks.length,
          momentumMetrics: autoScheduleResult.momentumMetrics,
          interventions: autoScheduleResult.interventions,
          learningApplied: {
            totalScheduledMinutes: autoScheduleResult.totalScheduledMinutes,
            availableMinutes: autoScheduleResult.availableMinutes,
            utilizationRate: Math.round(
              (autoScheduleResult.totalScheduledMinutes / autoScheduleResult.availableMinutes) * 100
            ),
          },
        },
        calendarSync: calendarSyncResult,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleAPIError(error, {
      operation: 'POST /api/plan/generate',
      userId: (await auth())?.user?.email ?? undefined,
    });
  }
}
