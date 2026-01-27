import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserByEmail } from '@/lib/db-utils';
import { CacheInvalidation } from '@/lib/cache';
import { z } from 'zod';
import { handleAPIError } from '@/lib/api-error-handler';
import { AuthError, NotFoundError, ValidationError, DatabaseError } from '@/lib/errors';

// Validation schema for check-in data
const checkInSchema = z.object({
  energy: z.number().int().min(1).max(10),
  sleep: z.number().int().min(1).max(10),
  stress: z.number().int().min(1).max(10),
  mood: z.enum(['positive', 'neutral', 'negative']),
});

// Capacity score calculation function
function calculateCapacityScore(
  energy: number,
  sleep: number,
  stress: number,
  mood: string
): number {
  // Weights based on design document
  const energyWeight = 0.3;
  const sleepWeight = 0.3;
  const stressWeight = 0.25;
  const moodWeight = 0.15;

  // Normalize inputs to 0-1 scale
  const normalizedEnergy = (energy - 1) / 9;
  const normalizedSleep = (sleep - 1) / 9;
  const normalizedStress = (stress - 1) / 9;

  // Mood modifier
  let moodModifier = 0.5; // neutral
  if (mood === 'positive') moodModifier = 1.0;
  if (mood === 'negative') moodModifier = 0.0;

  // Calculate weighted score (stress is inverted - higher stress = lower score)
  const score =
    normalizedEnergy * energyWeight +
    normalizedSleep * sleepWeight +
    (1 - normalizedStress) * stressWeight +
    moodModifier * moodWeight;

  // Scale to 0-100
  return Math.round(score * 100);
}

// Mode selection function
function selectMode(capacityScore: number): string {
  if (capacityScore < 40) return 'recovery';
  if (capacityScore >= 70) return 'deep_work';
  return 'balanced';
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      throw new AuthError('Please sign in to submit a check-in');
    }

    const body = await request.json();

    // Validate input
    const validationResult = checkInSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationError('Invalid check-in data', validationResult.error.issues);
    }

    const { energy, sleep, stress, mood } = validationResult.data;

    // Calculate capacity score and mode
    const capacityScore = calculateCapacityScore(energy, sleep, stress, mood);
    const mode = selectMode(capacityScore);

    // Get user from database (with caching)
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Get today's date at midnight (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Upsert check-in (create or update if exists for today)
    let checkIn;
    try {
      checkIn = await prisma.checkIn.upsert({
        where: {
          userId_date: {
            userId: user.id,
            date: today,
          },
        },
        update: {
          energy,
          sleep,
          stress,
          mood,
          capacityScore,
          mode,
        },
        create: {
          userId: user.id,
          date: today,
          energy,
          sleep,
          stress,
          mood,
          capacityScore,
          mode,
        },
      });
    } catch (dbError) {
      throw new DatabaseError('Failed to save check-in', dbError);
    }

    // Invalidate related caches
    CacheInvalidation.onCheckIn(user.id);

    return NextResponse.json(checkIn, { status: 200 });
  } catch (error) {
    return handleAPIError(error, {
      operation: 'POST /api/checkin',
      userId: (await auth())?.user?.email,
    });
  }
}
