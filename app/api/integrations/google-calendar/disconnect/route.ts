import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/integrations/google-calendar/disconnect - Disconnect Google Calendar integration
export async function DELETE(request: NextRequest) {
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

    // Delete the integration
    await prisma.integration.delete({
      where: {
        userId_platform: {
          userId: user.id,
          platform: 'google_calendar',
        },
      },
    });

    return NextResponse.json(
      { message: 'Google Calendar disconnected successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Google Calendar disconnect error:', error);
    
    // If integration doesn't exist, return success anyway
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { message: 'Google Calendar already disconnected' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
