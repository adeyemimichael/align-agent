import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateCalendarEvent } from '@/lib/calendar-sync';
import { trackCapacityAccuracy } from '@/lib/opik';
import { recordTaskCompletion } from '@/lib/time-tracking';

// PATCH /api/plan/[id] - Update a plan (user adjustments)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tasks } = body;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify plan belongs to user
    const plan = await prisma.dailyPlan.findUnique({
      where: { id },
      include: { tasks: true },
    });

    if (!plan || plan.userId !== user.id) {
      return NextResponse.json(
        { error: 'Plan not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update tasks
    const timeTrackingResults = [];
    if (tasks && Array.isArray(tasks)) {
      for (const taskUpdate of tasks) {
        const { id, scheduledStart, scheduledEnd, completed } = taskUpdate;

        if (!id) continue;

        const updateData: any = {};
        if (scheduledStart) updateData.scheduledStart = new Date(scheduledStart);
        if (scheduledEnd) updateData.scheduledEnd = new Date(scheduledEnd);
        if (typeof completed === 'boolean') {
          updateData.completed = completed;
          
          // If marking as complete, record time tracking data
          if (completed) {
            const timeTrackingResult = await recordTaskCompletion(id);
            if (timeTrackingResult.success && timeTrackingResult.timeTracking) {
              timeTrackingResults.push(timeTrackingResult.timeTracking);
            }
          }
        }

        await prisma.planTask.update({
          where: { id },
          data: updateData,
        });

        // Update calendar event if times changed
        if (scheduledStart && scheduledEnd) {
          await updateCalendarEvent(
            user.id,
            id,
            new Date(scheduledStart),
            new Date(scheduledEnd)
          );
        }
      }
    }

    // Get updated plan
    const updatedPlan = await prisma.dailyPlan.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: {
            scheduledStart: 'asc',
          },
        },
      },
    });

    // Track capacity accuracy in Opik
    if (updatedPlan) {
      const completedTasks = updatedPlan.tasks.filter((t) => t.completed).length;
      const totalTasks = updatedPlan.tasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      await trackCapacityAccuracy({
        userId: user.id,
        predictedCapacity: updatedPlan.capacityScore,
        actualCompletionRate: completionRate,
        date: updatedPlan.date,
        mode: updatedPlan.mode,
      }).catch((err) => console.error('Opik capacity tracking failed:', err));
    }

    return NextResponse.json(
      {
        message: 'Plan updated successfully',
        plan: {
          id: updatedPlan!.id,
          date: updatedPlan!.date,
          capacityScore: updatedPlan!.capacityScore,
          mode: updatedPlan!.mode,
          reasoning: updatedPlan!.geminiReasoning,
          tasks: updatedPlan!.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes,
            scheduledStart: t.scheduledStart,
            scheduledEnd: t.scheduledEnd,
            completed: t.completed,
            completedAt: t.completedAt,
            actualMinutes: t.actualMinutes,
            goalId: t.goalId,
          })),
        },
        timeTracking: timeTrackingResults.length > 0 ? timeTrackingResults : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Plan update error:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}
