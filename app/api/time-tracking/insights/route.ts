import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTimeBlindnessInsights } from '@/lib/time-tracking';

// GET /api/time-tracking/insights - Get time blindness insights for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const insights = await getTimeBlindnessInsights(user.id);

    return NextResponse.json(
      {
        insights,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Time tracking insights error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get time tracking insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
