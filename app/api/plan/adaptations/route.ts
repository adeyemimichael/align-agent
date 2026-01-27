import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { handleAPIError } from '@/lib/api-error-handler';

/**
 * GET /api/plan/adaptations
 * Get schedule adaptation history
 * Requirement 19.8
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get plans that were updated (rescheduled)
    const plans = await prisma.dailyPlan.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
        },
        updatedAt: {
          not: undefined,
        },
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            priority: true,
            scheduledStart: true,
            scheduledEnd: true,
            completed: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Filter to only plans that were actually rescheduled
    const adaptations = plans
      .filter((plan) => {
        // Check if geminiReasoning contains reschedule marker
        return (
          plan.geminiReasoning &&
          plan.geminiReasoning.includes('[Rescheduled at')
        );
      })
      .map((plan) => {
        // Extract reschedule time from reasoning
        const rescheduleMatch = plan.geminiReasoning.match(
          /\[Rescheduled at (.+?)\]/
        );
        const rescheduleTime = rescheduleMatch ? rescheduleMatch[1] : null;

        return {
          planId: plan.id,
          date: plan.date,
          rescheduleTime,
          reasoning: plan.geminiReasoning,
          tasksCount: plan.tasks.length,
          completedCount: plan.tasks.filter((t) => t.completed).length,
        };
      });

    return NextResponse.json({
      adaptations,
      totalAdaptations: adaptations.length,
      daysAnalyzed: days,
    });
  } catch (error) {
    return handleAPIError(error, { operation: 'GET /api/plan/adaptations' });
  }
}
