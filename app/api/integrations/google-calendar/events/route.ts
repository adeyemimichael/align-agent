import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleCalendarClient, refreshGoogleToken } from '@/lib/google-calendar';
import { encryptToken } from '@/lib/encryption';

/**
 * GET /api/integrations/google-calendar/events
 * Fetch calendar events for a time range
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: 'timeMin and timeMax are required' },
        { status: 400 }
      );
    }

    // Create calendar client
    const client = new GoogleCalendarClient(accessToken);

    // Fetch events
    const events = await client.listEvents(
      new Date(timeMin),
      new Date(timeMax)
    );

    return NextResponse.json({
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('Fetch calendar events error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
