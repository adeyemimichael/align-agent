/**
 * Check-In Response API Route
 * 
 * POST /api/checkin/respond - Handle user response to check-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  handleCheckInResponse,
  type CheckInResponse,
} from '@/lib/intelligent-checkin';
import { handleApiError } from '@/lib/api-error-handler';

/**
 * POST /api/checkin/respond
 * Handle user response to a check-in notification
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { checkInId, response } = body;

    if (!checkInId || !response) {
      return NextResponse.json(
        { error: 'checkInId and response are required' },
        { status: 400 }
      );
    }

    const validResponses: CheckInResponse[] = ['done', 'still_working', 'stuck', 'skip'];
    if (!validResponses.includes(response)) {
      return NextResponse.json(
        { error: 'Invalid response. Must be one of: done, still_working, stuck, skip' },
        { status: 400 }
      );
    }

    const result = await handleCheckInResponse(
      session.user.id,
      checkInId,
      response as CheckInResponse
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, 'Failed to handle check-in response');
  }
}
