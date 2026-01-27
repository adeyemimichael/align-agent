import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByEmail } from '@/lib/db-utils';
import { calculateMomentumState, getMomentumDisplayMessage } from '@/lib/momentum-tracker';
import { handleAPIError } from '@/lib/api-error-handler';
import { AuthError, NotFoundError } from '@/lib/errors';

/**
 * GET /api/momentum/current - Get current momentum state
 * Requirement 20.8: Display momentum state to user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      throw new AuthError('Please sign in to view momentum');
    }

    const user = await getUserByEmail(session.user.email);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Calculate current momentum state
    const metrics = await calculateMomentumState(user.id);
    
    // Get display message
    const displayMessage = getMomentumDisplayMessage(metrics);

    return NextResponse.json({
      metrics,
      display: displayMessage,
    });
  } catch (error) {
    return handleAPIError(error, {
      operation: 'GET /api/momentum/current',
      userId: (await auth())?.user?.email || undefined,
    });
  }
}
