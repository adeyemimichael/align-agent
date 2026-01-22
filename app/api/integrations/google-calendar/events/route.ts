import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleCalendarClient, refreshGoogleToken } from '@/lib/google-calendar';
import { encryptToken } from '@/lib/encryption';

// POST /api/integrations/google-calendar/events - Create a calendar event
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, summary, description, startTime, endTime, timeZone } = body;

    if (!summary || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: summary, startTime, endTime' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get Google Calendar integration
    const integration = await prisma.integration.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'google_calendar',
        },
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 404 }
      );
    }

    // Check if token needs refresh
    let accessToken = integration.accessToken;
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      if (!integration.refreshToken) {
        return NextResponse.json(
          { error: 'Token expired and no refresh token available' },
          { status: 401 }
        );
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

    // Check for conflicts
    const hasConflict = await client.hasConflict(
      new Date(startTime),
      new Date(endTime)
    );

    if (hasConflict) {
      return NextResponse.json(
        {
          error: 'Scheduling conflict detected',
          hasConflict: true,
        },
        { status: 409 }
      );
    }

    // Create the event
    const event = await client.createEvent('primary', {
      summary,
      description,
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: timeZone || 'UTC',
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: timeZone || 'UTC',
      },
    });

    // If taskId is provided, update the task with the calendar event ID
    if (taskId) {
      await prisma.planTask.update({
        where: { id: taskId },
        data: {
          externalId: event.id,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Calendar event created successfully',
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Calendar event creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}

// PUT /api/integrations/google-calendar/events - Update a calendar event
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, summary, description, startTime, endTime, timeZone } = body;

    if (!eventId || !summary || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, summary, startTime, endTime' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get Google Calendar integration
    const integration = await prisma.integration.findUnique({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'google_calendar',
        },
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 404 }
      );
    }

    // Check if token needs refresh
    let accessToken = integration.accessToken;
    if (integration.expiresAt && integration.expiresAt < new Date()) {
      if (!integration.refreshToken) {
        return NextResponse.json(
          { error: 'Token expired and no refresh token available' },
          { status: 401 }
        );
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
    const event = await client.updateEvent(eventId, {
      summary,
      description,
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: timeZone || 'UTC',
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: timeZone || 'UTC',
      },
    });

    return NextResponse.json(
      {
        message: 'Calendar event updated successfully',
        event,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Calendar event update error:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}
