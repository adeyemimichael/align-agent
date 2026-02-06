import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { syncTaskAppProgress, getUnplannedCompletions } from '@/lib/task-app-sync';
import { handleAPIError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/progress/sync
 * Sync with task app (Todoist) to detect completions
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

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

    const body = await request.json();
    const { planId } = body;

    // Sync with task app
    const syncResult = await syncTaskAppProgress(user.id, planId);

    // Check if sync actually happened
    const hasIntegration = syncResult.tasksChecked > 0 || syncResult.changes.length > 0;

    return NextResponse.json({
      success: true,
      hasIntegration,
      message: hasIntegration 
        ? 'Sync completed successfully' 
        : 'No Todoist integration found or no active plan',
      ...syncResult,
    });
  } catch (error) {
    return handleAPIError(error, {
      operation: 'POST /api/progress/sync',
      userId: undefined
    });
  }
}

/**
 * GET /api/progress/sync
 * Get unplanned completions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

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

    const unplannedCompletions = await getUnplannedCompletions(user.id);

    return NextResponse.json({
      unplannedCompletions,
    });
  } catch (error) {
    return handleAPIError(error, {
      operation: 'GET /api/progress/sync',
      userId: undefined
    });
  }
}
