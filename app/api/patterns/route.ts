import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get 7-day history
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const history = await prisma.checkIn.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { date: 'desc' },
      take: 7,
    });

    if (history.length === 0) {
      return NextResponse.json({
        message: 'No check-in history available',
        patterns: null,
        prediction: null,
        factors: null,
      });
    }

    // Convert to CheckInHistory format
    const checkInHistory: CheckInHistory[] = history.map((h) => ({
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

    return NextResponse.json({
      patterns,
      prediction,
      factors,
      historyCount: history.length,
    });
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
