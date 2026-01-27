import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  analyzeProgress,
  rescheduleWithAI,
  rescheduleAfternoon,
  applyReschedule,
} from '@/lib/reschedule-engine';
import { handleAPIError } from '@/lib/api-error-handler';

/**
 * POST /api/plan/reschedule
 * Trigger mid-day re-schedule
 * Requirement 19.3, 19.4, 19.8
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, useAI = true, apply = false } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      );
    }

    // Analyze progress first
    const analysis = await analyzeProgress(planId);

    // Generate reschedule proposal
    const rescheduleResult = useAI
      ? await rescheduleWithAI(planId, {
          includeHistoricalData: true,
        })
      : await rescheduleAfternoon(planId);

    // Apply if requested
    if (apply && rescheduleResult.success) {
      await applyReschedule(planId, rescheduleResult);
    }

    return NextResponse.json({
      analysis,
      reschedule: rescheduleResult,
      applied: apply && rescheduleResult.success,
    });
  } catch (error) {
    return handleAPIError(error, { operation: 'POST /api/plan/reschedule' });
  }
}

/**
 * GET /api/plan/reschedule?planId=xxx
 * Get reschedule analysis without applying
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json(
        { error: 'planId is required' },
        { status: 400 }
      );
    }

    // Analyze progress
    const analysis = await analyzeProgress(planId);

    return NextResponse.json({
      analysis,
      needsReschedule: analysis.needsReschedule,
      rescheduleType: analysis.rescheduleType,
      reasoning: analysis.rescheduleReason,
    });
  } catch (error) {
    return handleAPIError(error, { operation: 'GET /api/plan/reschedule' });
  }
}
