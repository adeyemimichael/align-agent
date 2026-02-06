import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TodoistClient, convertTodoistPriority, estimateTaskDuration } from '@/lib/todoist';

// GET /api/integrations/todoist/tasks - Fetch tasks from Todoist and store in database
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

    // Get Todoist integration
    const integration = await prisma.integration.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'todoist',
        },
      },
    });

    if (!integration) {
      return NextResponse.json(
        { 
          error: 'Todoist not connected',
          message: 'Please connect your Todoist account in the Integrations page',
          tasks: [],
          count: 0
        },
        { status: 200 } // Changed to 200 to avoid error state in UI
      );
    }

    // Fetch tasks from Todoist
    const todoistClient = new TodoistClient(integration.accessToken);
    
    let tasks: any[];
    let projects: any[];
    
    try {
      tasks = await todoistClient.getTasks();
      projects = await todoistClient.getProjects();
    } catch (apiError) {
      console.error('Todoist API error:', apiError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch from Todoist',
          message: 'Unable to connect to Todoist. Please check your connection and try again.',
          tasks: [],
          count: 0
        },
        { status: 200 } // Return 200 to avoid error state in UI
      );
    }

    // Create a map of project IDs to names
    const projectMap = new Map(projects.map(p => [p.id, p.name]));

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create today's plan
    let plan = await prisma.dailyPlan.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    // If no plan exists, we'll just return the tasks without storing them
    // They will be stored when a plan is generated
    if (!plan) {
      const formattedTasks = tasks.map(task => ({
        externalId: task.id,
        title: task.content,
        description: task.description || null,
        priority: convertTodoistPriority(task.priority),
        estimatedMinutes: estimateTaskDuration(task),
        dueDate: task.due?.date || null,
        project: projectMap.get(task.project_id) || 'Inbox',
        completed: task.is_completed,
      }));

      return NextResponse.json(
        {
          tasks: formattedTasks,
          count: formattedTasks.length,
          message: 'Tasks fetched successfully (not stored - no active plan)',
        },
        { status: 200 }
      );
    }

    // Store tasks in the plan
    const storedTasks = [];
    for (const task of tasks) {
      // Skip completed tasks
      if (task.is_completed) {
        continue;
      }

      // Check if task already exists in the plan
      const existingTask = await prisma.planTask.findFirst({
        where: {
          planId: plan.id,
          externalId: task.id,
        },
      });

      if (existingTask) {
        // Update existing task
        const updated = await prisma.planTask.update({
          where: { id: existingTask.id },
          data: {
            title: task.content,
            description: task.description || null,
            priority: convertTodoistPriority(task.priority),
            estimatedMinutes: estimateTaskDuration(task),
          },
        });
        storedTasks.push(updated);
      } else {
        // Create new task
        const created = await prisma.planTask.create({
          data: {
            planId: plan.id,
            externalId: task.id,
            title: task.content,
            description: task.description || null,
            priority: convertTodoistPriority(task.priority),
            estimatedMinutes: estimateTaskDuration(task),
            completed: false,
          },
        });
        storedTasks.push(created);
      }
    }

    return NextResponse.json(
      {
        tasks: storedTasks,
        count: storedTasks.length,
        message: 'Tasks synced successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Todoist task fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks from Todoist' },
      { status: 500 }
    );
  }
}
