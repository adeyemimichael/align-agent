import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGeminiClient, PlanningContext } from '@/lib/gemini';
import { syncPlanToCalendar } from '@/lib/calendar-sync';

// POST /api/plan/generate - Generate AI-powered daily plan
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, syncToCalendar = false } = body;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get today's check-in
    const planDate = date ? new Date(date) : new Date();
    planDate.setHours(0, 0, 0, 0);

    const checkIn = await prisma.checkIn.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: planDate,
          lt: new Date(planDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { date: 'desc' },
    });

    if (!checkIn) {
      return NextResponse.json(
        { error: 'No check-in found for today. Please complete your check-in first.' },
        { status: 400 }
      );
    }

    // Get 7-day history
    const sevenDaysAgo = new Date(planDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const history = await prisma.checkIn.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sevenDaysAgo,
          lt: planDate,
        },
      },
      orderBy: { date: 'desc' },
      take: 7,
    });

    // Get user's goals
    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      select: {
        title: true,
        category: true,
      },
    });

    // Get tasks from Todoist integration
    const todoistIntegration = await prisma.integration.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'todoist',
        },
      },
    });

    let tasks: PlanningContext['tasks'] = [];

    if (todoistIntegration) {
      // Fetch tasks from Todoist
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
        tasks = existingPlan.tasks.map((t) => ({
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
      return NextResponse.json(
        {
          error:
            'No tasks available. Please connect Todoist or add tasks manually.',
        },
        { status: 400 }
      );
    }

    // Build planning context
    const context: PlanningContext = {
      capacityScore: checkIn.capacityScore,
      mode: checkIn.mode as 'recovery' | 'balanced' | 'deep_work',
      tasks,
      history: history.map((h) => ({
        date: h.date,
        capacityScore: h.capacityScore,
        completedTasks: 0, // TODO: Track this
        totalTasks: 0, // TODO: Track this
      })),
      goals: goals.length > 0 ? goals : undefined,
    };

    // Generate plan using Gemini AI
    const gemini = getGeminiClient();
    const planningResponse = await gemini.generateDailyPlan(context, new Date(), user.id);

    // Save plan to database
    const plan = await prisma.dailyPlan.create({
      data: {
        userId: user.id,
        date: planDate,
        capacityScore: checkIn.capacityScore,
        mode: checkIn.mode,
        geminiReasoning: planningResponse.overallReasoning,
        tasks: {
          create: planningResponse.orderedTasks.map((t) => {
            const task = tasks.find((task) => task.id === t.taskId);
            return {
              externalId: t.taskId,
              title: task?.title || 'Unknown Task',
              description: task?.description,
              priority: task?.priority || 3,
              estimatedMinutes: task?.estimatedMinutes || 45,
              scheduledStart: t.scheduledStart,
              scheduledEnd: t.scheduledEnd,
            };
          }),
        },
      },
      include: {
        tasks: true,
      },
    });

    // Sync to Google Calendar if requested
    let calendarSyncResult;
    if (syncToCalendar) {
      const taskSchedules = plan.tasks.map((t) => ({
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
          modeRecommendation: planningResponse.modeRecommendation,
          tasks: plan.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes,
            scheduledStart: t.scheduledStart,
            scheduledEnd: t.scheduledEnd,
            completed: t.completed,
          })),
        },
        calendarSync: calendarSyncResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Plan generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
