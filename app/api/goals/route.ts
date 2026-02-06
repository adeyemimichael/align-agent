import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserByEmail } from '@/lib/db-utils';
import { CacheInvalidation } from '@/lib/cache';
import { z } from 'zod';
import { handleAPIError } from '@/lib/api-error-handler';
import { AuthError, NotFoundError, ValidationError, DatabaseError } from '@/lib/errors';

// Validation schema for goal creation
const createGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum(['work', 'health', 'personal']),
  targetDate: z.string().optional(), // ISO date string
});

// Validation schema for goal update
const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.enum(['work', 'health', 'personal']).optional(),
  targetDate: z.string().optional(), // ISO date string
});

// GET /api/goals - Get all goals for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      throw new AuthError('Please sign in to view goals');
    }

    // Get user from database (with caching)
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Check if includeTasks query param is set
    const { searchParams } = new URL(request.url);
    const includeTasks = searchParams.get('includeTasks') === 'true';

    // Get all goals for the user
    let goals;
    try {
      goals = await prisma.goal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: includeTasks ? {
          tasks: {
            select: {
              id: true,
              title: true,
              completed: true,
            },
          },
        } : undefined,
      });
    } catch (dbError) {
      throw new DatabaseError('Failed to fetch goals', dbError);
    }

    return NextResponse.json(goals, { status: 200 });
  } catch (error) {
    return handleAPIError(error, {
      operation: 'GET /api/goals',
      userId: (await auth())?.user?.email ?? undefined,
    });
  }
}

// POST /api/goals - Create a new goal
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      throw new AuthError('Please sign in to create a goal');
    }

    const body = await request.json();

    // Validate input
    const validationResult = createGoalSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Invalid goal data', validationResult.error.issues);
    }

    const { title, description, category, targetDate } = validationResult.data;

    // Get user from database (with caching)
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Create goal
    let goal;
    try {
      goal = await prisma.goal.create({
        data: {
          userId: user.id,
          title,
          description: description ?? undefined,
          category,
          targetDate: targetDate ? new Date(targetDate) : null,
        },
      });
    } catch (dbError) {
      throw new DatabaseError('Failed to create goal', dbError);
    }

    // Invalidate goals cache
    CacheInvalidation.onGoalChange(user.id);

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return handleAPIError(error, {
      operation: 'POST /api/goals',
      userId: (await auth())?.user?.email ?? undefined,
    });
  }
}
