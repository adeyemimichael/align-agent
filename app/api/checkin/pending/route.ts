/**
 * Pending Check-Ins API Route
 * 
 * GET /api/checkin/pending - Get pending check-ins for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPendingCheckIns, getCheckInHistory } from '@/lib/intelligent-checkin';
import { handleAPIError } from '@/lib/api-error-handler';

/**
 * GET /api/checkin/pending
 * Get pending check-ins for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('includeHistory') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    const pending = await getPendingCheckIns(session.user.id);

    if (includeHistory) {
      const history = await getCheckInHistory(session.user.id, limit);
      return NextResponse.json({
        pending,
        history,
      });
    }

    return NextResponse.json(pending);
  } catch (error) {
    return handleAPIError(error, {
      operation: 'GET /api/checkin/pending',
      userId: undefined
    });
  }
}
