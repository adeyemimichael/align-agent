import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/plan/current - Get today's plan
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's plan
    const plan = await prisma.dailyPlan.findFirst({
      where: {
        userId: user.id,
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

    if (!plan) {
      return NextResponse.json(
        { error: 'No plan found for today' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        plan: {
          id: plan.id,
          date: plan.date,
          capacityScore: plan.capacityScore,
          mode: plan.mode,
          reasoning: plan.geminiReasoning,
          tasks: plan.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes,
            scheduledStart: t.scheduledStart,
            scheduledEnd: t.scheduledEnd,
            completed: t.completed,
            goalId: t.goalId,
          })),
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get current plan error:', error);
    return NextResponse.json(
      { error: 'Failed to get current plan' },
      { status: 500 }
    );
  }
}
