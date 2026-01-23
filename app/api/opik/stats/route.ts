import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getOpikDashboardUrl } from '@/lib/opik';

// GET /api/opik/stats - Get Opik tracking statistics
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

    // Get statistics from database
    const totalPlans = await prisma.dailyPlan.count({
      where: { userId: user.id },
    });

    const plansWithTasks = await prisma.dailyPlan.findMany({
      where: { userId: user.id },
      include: { tasks: true },
      orderBy: { date: 'desc' },
      take: 30, // Last 30 days
    });

    // Calculate statistics
    const totalTasks = plansWithTasks.reduce(
      (sum, plan) => sum + plan.tasks.length,
      0
    );
    const completedTasks = plansWithTasks.reduce(
      (sum, plan) => sum + plan.tasks.filter((t) => t.completed).length,
      0
    );
    const avgCompletionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const avgCapacity =
      plansWithTasks.length > 0
        ? plansWithTasks.reduce((sum, plan) => sum + plan.capacityScore, 0) /
          plansWithTasks.length
        : 0;

    // Mode distribution
    const modeDistribution = plansWithTasks.reduce(
      (acc, plan) => {
        acc[plan.mode] = (acc[plan.mode] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get Opik dashboard URL
    const opikDashboardUrl = getOpikDashboardUrl();

    return NextResponse.json({
      stats: {
        totalPlans,
        totalTasks,
        completedTasks,
        avgCompletionRate: Math.round(avgCompletionRate),
        avgCapacity: Math.round(avgCapacity),
        modeDistribution,
      },
      opikDashboardUrl,
      opikEnabled: !!process.env.OPIK_API_KEY,
    });
  } catch (error) {
    console.error('Opik stats error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get Opik statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
