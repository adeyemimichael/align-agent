import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getCapacityInsights,
  adjustCapacityScore,
} from '@/lib/capacity-adjustment';

// GET /api/capacity/insights - Get capacity insights and adjustments
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

    // Get latest check-in for current capacity
    const latestCheckIn = await prisma.checkIn.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    const insights = await getCapacityInsights(user.id);

    let adjustment = null;
    if (latestCheckIn) {
      adjustment = await adjustCapacityScore(
        user.id,
        latestCheckIn.capacityScore
      );
    }

    return NextResponse.json({
      insights,
      adjustment,
      currentCapacity: latestCheckIn?.capacityScore || null,
    });
  } catch (error) {
    console.error('Capacity insights error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get capacity insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
