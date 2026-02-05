import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TodoistClient } from '@/lib/todoist';

// POST /api/integrations/todoist/tasks/[id]/complete - Mark task as complete and sync to Todoist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
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

    // Get the task
    const task = await prisma.planTask.findUnique({
      where: { id: taskId },
      include: {
        plan: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify task belongs to user
    if (task.plan.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mark task as complete in database
    const updatedTask = await prisma.planTask.update({
      where: { id: taskId },
      data: { completed: true },
    });

    // If task has an external ID, sync to Todoist
    if (task.externalId) {
      try {
        // Get Todoist integration
        const integration = await prisma.integration.findUnique({
          where: {
            userId_platform: {
              userId: user.id,
              platform: 'todoist',
            },
          },
        });

        if (integration) {
          const todoistClient = new TodoistClient(integration.accessToken);
          await todoistClient.completeTask(task.externalId);
        }
      } catch (syncError) {
        // Log sync error but don't fail the request
        console.error('Failed to sync completion to Todoist:', syncError);
        
        return NextResponse.json(
          {
            task: updatedTask,
            warning: 'Task marked complete locally but sync to Todoist failed',
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        task: updatedTask,
        message: 'Task marked as complete',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Task completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete task' },
      { status: 500 }
    );
  }
}

// DELETE /api/integrations/todoist/tasks/[id]/complete - Mark task as incomplete and sync to Todoist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
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

    // Get the task
    const task = await prisma.planTask.findUnique({
      where: { id: taskId },
      include: {
        plan: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify task belongs to user
    if (task.plan.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mark task as incomplete in database
    const updatedTask = await prisma.planTask.update({
      where: { id: taskId },
      data: { completed: false },
    });

    // If task has an external ID, sync to Todoist
    if (task.externalId) {
      try {
        // Get Todoist integration
        const integration = await prisma.integration.findUnique({
          where: {
            userId_platform: {
              userId: user.id,
              platform: 'todoist',
            },
          },
        });

        if (integration) {
          const todoistClient = new TodoistClient(integration.accessToken);
          await todoistClient.reopenTask(task.externalId);
        }
      } catch (syncError) {
        // Log sync error but don't fail the request
        console.error('Failed to sync reopen to Todoist:', syncError);
        
        return NextResponse.json(
          {
            task: updatedTask,
            warning: 'Task marked incomplete locally but sync to Todoist failed',
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        task: updatedTask,
        message: 'Task marked as incomplete',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Task reopen error:', error);
    return NextResponse.json(
      { error: 'Failed to reopen task' },
      { status: 500 }
    );
  }
}
