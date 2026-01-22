import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/integrations/todoist/disconnect - Disconnect Todoist integration
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

    // Delete integration
    await prisma.integration.deleteMany({
      where: {
        userId: user.id,
        platform: 'todoist',
      },
    });

    return NextResponse.json(
      { message: 'Todoist integration disconnected' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Todoist disconnect error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
