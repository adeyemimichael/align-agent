import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { recordTaskStart, recordTaskCompletion } from '@/lib/progress-tracker';
import { handleAPIError } from '@/lib/api-error-handler';

/**
 * POST /api/progress/update
 * Update task progress (start or complete)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, action, timestamp } = body;

    if (!taskId || !action) {
      return NextResponse.json(
        { error: 'taskId and action are required' },
        { status: 400 }
      );
    }

    const actionTime = timestamp ? new Date(timestamp) : new Date();

    if (action === 'start') {
      const taskProgress = await recordTaskStart(taskId, actionTime);
      return NextResponse.json({
        success: true,
        action: 'started',
        taskProgress,
      });
    } else if (action === 'complete') {
      const result = await recordTaskCompletion(taskId, actionTime);
      return NextResponse.json({
        success: true,
        action: 'completed',
        ...result,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "start" or "complete"' },
        { status: 400 }
      );
    }
  } catch (error) {
    return handleAPIError(error, {
      operation: 'POST /api/progress/update',
      userId: undefined
    });
  }
}
