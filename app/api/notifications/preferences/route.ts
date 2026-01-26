import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/lib/notifications';

// GET /api/notifications/preferences - Get user's notification preferences
export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, notificationPreferences: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return preferences or defaults
    const preferences = user.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get notification preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences - Update notification preferences
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { preferences } = body;

    // Validate preferences
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        notificationPreferences: preferences,
      },
      select: { notificationPreferences: true },
    });

    return NextResponse.json({
      message: 'Notification preferences updated',
      preferences: updatedUser.notificationPreferences,
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update notification preferences',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
