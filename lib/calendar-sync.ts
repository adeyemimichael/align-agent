import { prisma } from './prisma';
import { GoogleCalendarClient, refreshGoogleToken } from './google-calendar';
import { encryptToken } from './encryption';

export interface TaskSchedule {
  taskId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  priority: number;
}

/**
 * Sync a daily plan's tasks to Google Calendar
 */
export async function syncPlanToCalendar(
  userId: string,
  tasks: TaskSchedule[],
  timeZone: string = 'UTC'
): Promise<{
  success: boolean;
  createdEvents: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let createdEvents = 0;

  try {
    // Get Google Calendar integration
    const integration = await prisma.integration.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: 'google_calendar',
        },
      },
    });

    if (!integration) {
      return {
        success: false,
        createdEvents: 0,
        errors: ['Google Calendar not connected'],
      };
    }

    // Check if token needs refresh
    let accessToken = integration.accessToken;
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      if (!integration.refreshToken) {
        return {
          success: false,
          createdEvents: 0,
          errors: ['Token expired and no refresh token available'],
        };
      }

      // Refresh the token
      const tokenData = await refreshGoogleToken(integration.refreshToken);
      accessToken = encryptToken(tokenData.access_token);

      // Update the integration with new token
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          accessToken,
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        },
      });
    }

    // Create calendar client
    const client = new GoogleCalendarClient(accessToken);

    // Create events for each task
    for (const task of tasks) {
      try {
        // Check for conflicts
        const hasConflict = await client.hasConflict(task.startTime, task.endTime);

        if (hasConflict) {
          errors.push(
            `Conflict detected for task "${task.title}" at ${task.startTime.toISOString()}`
          );
          continue;
        }

        // Create the event
        const event = await client.createEvent('primary', {
          summary: task.title,
          description: task.description,
          start: {
            dateTime: task.startTime.toISOString(),
            timeZone,
          },
          end: {
            dateTime: task.endTime.toISOString(),
            timeZone,
          },
          colorId: getPriorityColor(task.priority),
        });

        // Update the task with the calendar event ID
        await prisma.planTask.update({
          where: { id: task.taskId },
          data: {
            externalId: event.id,
          },
        });

        createdEvents++;
      } catch (error) {
        console.error(`Error creating event for task ${task.taskId}:`, error);
        errors.push(
          `Failed to create event for task "${task.title}": ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
    }

    return {
      success: errors.length === 0,
      createdEvents,
      errors,
    };
  } catch (error) {
    console.error('Calendar sync error:', error);
    return {
      success: false,
      createdEvents,
      errors: [
        `Calendar sync failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      ],
    };
  }
}

/**
 * Update a calendar event when a task is rescheduled
 */
export async function updateCalendarEvent(
  userId: string,
  taskId: string,
  newStartTime: Date,
  newEndTime: Date,
  timeZone: string = 'UTC'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the task with its calendar event ID
    const task = await prisma.planTask.findUnique({
      where: { id: taskId },
    });

    if (!task || !task.externalId) {
      return {
        success: false,
        error: 'Task not found or not synced to calendar',
      };
    }

    // Get Google Calendar integration
    const integration = await prisma.integration.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: 'google_calendar',
        },
      },
    });

    if (!integration) {
      return {
        success: false,
        error: 'Google Calendar not connected',
      };
    }

    // Check if token needs refresh
    let accessToken = integration.accessToken;
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      if (!integration.refreshToken) {
        return {
          success: false,
          error: 'Token expired and no refresh token available',
        };
      }

      // Refresh the token
      const tokenData = await refreshGoogleToken(integration.refreshToken);
      accessToken = encryptToken(tokenData.access_token);

      // Update the integration with new token
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          accessToken,
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        },
      });
    }

    // Create calendar client
    const client = new GoogleCalendarClient(accessToken);

    // Update the event
    await client.updateEvent(task.externalId, {
      summary: task.title,
      description: task.description || undefined,
      start: {
        dateTime: newStartTime.toISOString(),
        timeZone,
      },
      end: {
        dateTime: newEndTime.toISOString(),
        timeZone,
      },
      colorId: getPriorityColor(task.priority),
    });

    // Update the task's scheduled times
    await prisma.planTask.update({
      where: { id: taskId },
      data: {
        scheduledStart: newStartTime,
        scheduledEnd: newEndTime,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Calendar event update error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update calendar event',
    };
  }
}

/**
 * Delete a calendar event when a task is removed
 */
export async function deleteCalendarEvent(
  userId: string,
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the task with its calendar event ID
    const task = await prisma.planTask.findUnique({
      where: { id: taskId },
    });

    if (!task || !task.externalId) {
      return {
        success: true, // Already not in calendar
      };
    }

    // Get Google Calendar integration
    const integration = await prisma.integration.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: 'google_calendar',
        },
      },
    });

    if (!integration) {
      return {
        success: false,
        error: 'Google Calendar not connected',
      };
    }

    // Check if token needs refresh
    let accessToken = integration.accessToken;
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      if (!integration.refreshToken) {
        return {
          success: false,
          error: 'Token expired and no refresh token available',
        };
      }

      // Refresh the token
      const tokenData = await refreshGoogleToken(integration.refreshToken);
      accessToken = encryptToken(tokenData.access_token);

      // Update the integration with new token
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          accessToken,
          expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        },
      });
    }

    // Create calendar client
    const client = new GoogleCalendarClient(accessToken);

    // Delete the event
    await client.deleteEvent(task.externalId);

    // Clear the external ID from the task
    await prisma.planTask.update({
      where: { id: taskId },
      data: {
        externalId: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Calendar event deletion error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete calendar event',
    };
  }
}

/**
 * Get Google Calendar color ID based on task priority
 * Priority 1 (highest) = Red (11)
 * Priority 2 = Orange (6)
 * Priority 3 = Yellow (5)
 * Priority 4 (lowest) = Blue (9)
 */
function getPriorityColor(priority: number): string {
  const colorMap: Record<number, string> = {
    1: '11', // Red
    2: '6',  // Orange
    3: '5',  // Yellow
    4: '9',  // Blue
  };
  return colorMap[priority] || '9'; // Default to blue
}
