import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProgressHistory } from '@/lib/progress-tracker';
import { handleAPIError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/progress/history
 * Get progress history for the last N days
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    const history = await getProgressHistory(user.id, days);

    return NextResponse.json({
      history,
      days,
    });
  } catch (error) {
    return handleAPIError(error, 'Failed to get progress history');
  }
}
