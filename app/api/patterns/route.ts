import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByEmail, getCheckInHistory } from '@/lib/db-utils';
import { cache, CacheKeys } from '@/lib/cache';
import {
  detectCapacityPatterns,
  predictCapacity,
  analyzeCapacityFactors,
  CheckInHistory,
} from '@/lib/pattern-detection';

// GET /api/patterns - Get capacity pattern analysis
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

    // Check cache first
    const cacheKey = CacheKeys.patterns(user.id);
    const cached = cache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Get 7-day history (with caching)
    const history = await getCheckInHistory(user.id, 7);

    if (history.length === 0) {
      return NextResponse.json({
        message: 'No check-in history available',
        patterns: null,
        prediction: null,
        factors: null,
      });
    }

    // Convert to CheckInHistory format
    const checkInHistory: CheckInHistory[] = history.map((h: {
      date: Date;
      capacityScore: number;
      energy: number;
      sleep: number;
      stress: number;
      mood: string;
    }) => ({
      date: h.date,
      capacityScore: h.capacityScore,
      energy: h.energy,
      sleep: h.sleep,
      stress: h.stress,
      mood: h.mood,
    }));

    // Analyze patterns
    const patterns = detectCapacityPatterns(checkInHistory);
    const prediction = predictCapacity(checkInHistory);
    const factors = analyzeCapacityFactors(checkInHistory);

    const result = {
      patterns,
      prediction,
      factors,
      historyCount: history.length,
    };

    // Cache for 30 minutes
    cache.set(cacheKey, result, 1800);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Pattern analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze patterns',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
