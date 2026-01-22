import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get the most recent check-in
    const latestCheckIn = await prisma.checkIn.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    if (!latestCheckIn) {
      return NextResponse.json({ error: 'No check-ins found' }, { status: 404 });
    }

    return NextResponse.json(latestCheckIn, { status: 200 });
  } catch (error) {
    console.error('Get latest check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
