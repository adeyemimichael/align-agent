import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTimeTrackingComparison } from '@/lib/time-tracking';

// GET /api/time-tracking/comparison - Get time tracking comparison data
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

    const comparison = await getTimeTrackingComparison(user.id, 10);

    return NextResponse.json(comparison, { status: 200 });
  } catch (error) {
    console.error('Time tracking comparison error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get time tracking comparison',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
