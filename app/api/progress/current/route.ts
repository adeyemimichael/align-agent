import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCurrentProgress, getProgressSummary } from '@/lib/progress-tracker';
import { handleAPIError } from '@/lib/api-error-handler';

/**
 * GET /api/progress/current
 * Get current progress for today's plan
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json(
        { error: 'planId query parameter is required' },
        { status: 400 }
      );
    }

    // Get progress summary
    const summary = await getProgressSummary(planId);

    return NextResponse.json(summary);
  } catch (error) {
    return handleAPIError(error, 'Failed to get current progress');
  }
}
