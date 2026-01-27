import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByEmail, getCheckInHistory } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database (with caching)
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get 7-day history (with caching)
    const history = await getCheckInHistory(user.id, 7);

    return NextResponse.json(history, { status: 200 });
  } catch (error) {
    console.error('Get check-in history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
