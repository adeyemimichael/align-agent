import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for check-in data
const checkInSchema = z.object({
  energyLevel: z.number().int().min(1).max(10),
  sleepQuality: z.number().int().min(1).max(10),
  stressLevel: z.number().int().min(1).max(10),
  mood: z.enum(['positive', 'neutral', 'negative']),
});

// Capacity score calculation function
function calculateCapacityScore(
  energyLevel: number,
  sleepQuality: number,
  stressLevel: number,
  mood: string
): number {
  // Weights based on design document
  const energyWeight = 0.3;
  const sleepWeight = 0.3;
  const stressWeight = 0.25;
  const moodWeight = 0.15;

  // Normalize inputs to 0-1 scale
  const normalizedEnergy = (energyLevel - 1) / 9;
  const normalizedSleep = (sleepQuality - 1) / 9;
  const normalizedStress = (stressLevel - 1) / 9;

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = checkInSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { energyLevel, sleepQuality, stressLevel, mood } = validationResult.data;

    // Calculate capacity score and mode
    const capacityScore = calculateCapacityScore(energyLevel, sleepQuality, stressLevel, mood);
    const mode = selectMode(capacityScore);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get today's date at midnight (UTC)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Upsert check-in (create or update if exists for today)
    const checkIn = await prisma.checkIn.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        energyLevel,
        sleepQuality,
        stressLevel,
        mood,
        capacityScore,
        mode,
      },
      create: {
        userId: user.id,
        date: today,
        energyLevel,
        sleepQuality,
        stressLevel,
        mood,
        capacityScore,
        mode,
      },
    });

    return NextResponse.json(checkIn, { status: 200 });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
