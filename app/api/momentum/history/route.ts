import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByEmail } from '@/lib/db-utils';
import { handleAPIError } from '@/lib/api-error-handler';
import { AuthError, NotFoundError } from '@/lib/errors';

/**
 * GET /api/momentum/history - Get momentum history
 * Returns momentum transitions stored in user preferences
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      throw new AuthError('Please sign in to view momentum history');
    }

    const user = await getUserByEmail(session.user.email);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Get momentum history from user preferences
    const preferences = (user.notificationPreferences as any) || {};
    const momentumHistory = preferences.momentumHistory || [];

    return NextResponse.json({
      history: momentumHistory,
    });
  } catch (error) {
    return handleAPIError(error, {
      operation: 'GET /api/momentum/history',
      userId: (await auth())?.user?.email || undefined,
    });
  }
}
