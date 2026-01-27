/**
 * Check-In Scheduling API Routes
 * 
 * POST /api/checkin/schedule - Schedule a check-in notification
 * GET /api/checkin/schedule - Get check-in schedule for user
 * PATCH /api/checkin/schedule - Update check-in schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getCheckInSchedule,
  updateCheckInSchedule,
  scheduleCheckIn,
  type CheckInTrigger,
} from '@/lib/intelligent-checkin';
import { handleApiError } from '@/lib/api-error-handler';

/**
 * GET /api/checkin/schedule
 * Get check-in schedule for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schedule = await getCheckInSchedule(session.user.id);

    return NextResponse.json(schedule);
  } catch (error) {
    return handleApiError(error, 'Failed to get check-in schedule');
  }
}

/**
 * PATCH /api/checkin/schedule
 * Update check-in schedule for the authenticated user
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { times, enabled, tone } = body;

    const schedule = await updateCheckInSchedule(session.user.id, {
      times,
      enabled,
      tone,
    });

    return NextResponse.json(schedule);
  } catch (error) {
    return handleApiError(error, 'Failed to update check-in schedule');
  }
}

/**
 * POST /api/checkin/schedule
 * Schedule a check-in notification
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, trigger, scheduledFor } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      );
    }

    const notification = await scheduleCheckIn(
      session.user.id,
      planId,
      trigger as CheckInTrigger || 'manual',
      scheduledFor ? new Date(scheduledFor) : new Date()
    );

    return NextResponse.json(notification);
  } catch (error) {
    return handleApiError(error, 'Failed to schedule check-in');
  }
}
