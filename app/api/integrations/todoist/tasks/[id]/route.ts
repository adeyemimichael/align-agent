import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTodoistClient } from '@/lib/todoist';

// DELETE /api/integrations/todoist/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const taskId = params.id;

    // Find the task in our database
    const task = await prisma.planTask.findUnique({
      where: { id: taskId },
      include: { plan: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify the task belongs to this user
    if (task.plan.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If task has an external ID (from Todoist), optionally delete from Todoist
    if (task.externalId) {
      try {
        const todoistIntegration = await prisma.integration.findUnique({
          where: {
            userId_platform: {
              userId: user.id,
              platform: 'todoist',
            },
          },
        });

        if (todoistIntegration) {
          const todoist = getTodoistClient(todoistIntegration.accessToken);
          // Note: Todoist API v2 uses close task, not delete
          // We'll just remove from our system
        }
      } catch (error) {
        console.error('Error syncing deletion to Todoist:', error);
        // Continue with local deletion even if Todoist sync fails
      }
    }

    // Delete the task from our database
    await prisma.planTask.delete({
      where: { id: taskId },
    });

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Task deletion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete task',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
