import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { prisma } from '@/lib/prisma'

// Feature: adaptive-productivity-agent, Property 2: Check-in round-trip persistence
// Validates: Requirements 1.3, 11.2

describe('Check-in Round-Trip Persistence', () => {
  let testUserId: string

  beforeEach(async () => {
    // Create a test user for check-ins
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}-${Math.random()}@example.com`,
        name: 'Test User',
      },
    })
    testUserId = user.id
  })

  afterEach(async () => {
    // Clean up: delete check-ins and user
    await prisma.checkIn.deleteMany({
      where: { userId: testUserId },
    })
    await prisma.user.delete({
      where: { id: testUserId },
    })
  })

  it('should persist and retrieve check-in data with equivalent values', async () => {
    // Property 2: Check-in round-trip persistence
    // For any valid check-in data, storing it to the database and then retrieving it
    // should return data equivalent to the original input (with system-generated fields added)

    await fc.assert(
      fc.asyncProperty(
        // Generate random check-in data
        fc.record({
          energyLevel: fc.integer({ min: 1, max: 10 }),
          sleepQuality: fc.integer({ min: 1, max: 10 }),
          stressLevel: fc.integer({ min: 1, max: 10 }),
          mood: fc.constantFrom('positive', 'neutral', 'negative'),
          capacityScore: fc.float({ min: 0, max: 100 }),
          mode: fc.constantFrom('recovery', 'balanced', 'deep_work'),
          date: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
        }),
        async (checkInData) => {
          // Store the check-in
          const created = await prisma.checkIn.create({
            data: {
              userId: testUserId,
              energyLevel: checkInData.energyLevel,
              sleepQuality: checkInData.sleepQuality,
              stressLevel: checkInData.stressLevel,
              mood: checkInData.mood,
              capacityScore: checkInData.capacityScore,
              mode: checkInData.mode,
              date: checkInData.date,
            },
          })

          // Retrieve the check-in
          const retrieved = await prisma.checkIn.findUnique({
            where: {
              id: created.id,
            },
          })

          // Assert that retrieved data matches the original input
          expect(retrieved).not.toBeNull()
          expect(retrieved!.energyLevel).toBe(checkInData.energyLevel)
          expect(retrieved!.sleepQuality).toBe(checkInData.sleepQuality)
          expect(retrieved!.stressLevel).toBe(checkInData.stressLevel)
          expect(retrieved!.mood).toBe(checkInData.mood)
          expect(retrieved!.capacityScore).toBeCloseTo(checkInData.capacityScore, 5)
          expect(retrieved!.mode).toBe(checkInData.mode)
          
          // Date comparison (normalize to same precision)
          const originalDate = new Date(checkInData.date).getTime()
          const retrievedDate = new Date(retrieved!.date).getTime()
          expect(Math.abs(originalDate - retrievedDate)).toBeLessThan(1000) // Within 1 second

          // System-generated fields should exist
          expect(retrieved!.id).toBeDefined()
          expect(retrieved!.userId).toBe(testUserId)
          expect(retrieved!.createdAt).toBeInstanceOf(Date)

          // Clean up this specific check-in for next iteration
          await prisma.checkIn.delete({
            where: { id: created.id },
          })
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in the design
    )
  }, 60000) // 60 second timeout for property test
})
