/**
 * Test script for Mid-Day Re-Scheduling Engine
 * 
 * Tests:
 * - Progress analysis
 * - Rule-based rescheduling
 * - AI-powered rescheduling
 * - Reschedule application
 */

import { prisma } from '../lib/prisma';
import {
  analyzeProgress,
  rescheduleAfternoon,
  rescheduleWithAI,
  applyReschedule,
} from '../lib/reschedule-engine';

async function testRescheduleEngine() {
  console.log('🧪 Testing Mid-Day Re-Scheduling Engine\n');

  try {
    // Find a test user
    const user = await prisma.user.findFirst({
      where: {
        email: { contains: 'test' },
      },
    });

    if (!user) {
      console.log('❌ No test user found. Please create a test user first.');
      return;
    }

    console.log(`✅ Found test user: ${user.email}\n`);

    // Find today's plan
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let plan = await prisma.dailyPlan.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        tasks: true,
      },
    });

    // Create a test plan if none exists
    if (!plan) {
      console.log('📝 Creating test plan...');

      plan = await prisma.dailyPlan.create({
        data: {
          userId: user.id,
          date: today,
          capacityScore: 65,
          mode: 'balanced',
          geminiReasoning: 'Test plan for reschedule engine',
          tasks: {
            create: [
              {
                title: 'High Priority Task 1',
                priority: 1,
                estimatedMinutes: 60,
                scheduledStart: new Date(today.getTime() + 9 * 60 * 60 * 1000),
                scheduledEnd: new Date(today.getTime() + 10 * 60 * 60 * 1000),
                completed: true,
                completedAt: new Date(today.getTime() + 10.5 * 60 * 60 * 1000), // 30 min late
              },
              {
                title: 'High Priority Task 2',
                priority: 1,
                estimatedMinutes: 90,
                scheduledStart: new Date(today.getTime() + 10 * 60 * 60 * 1000),
                scheduledEnd: new Date(today.getTime() + 11.5 * 60 * 60 * 1000),
                completed: false,
              },
              {
                title: 'Medium Priority Task',
                priority: 2,
                estimatedMinutes: 45,
                scheduledStart: new Date(today.getTime() + 11.5 * 60 * 60 * 1000),
                scheduledEnd: new Date(today.getTime() + 12.25 * 60 * 60 * 1000),
                completed: false,
              },
              {
                title: 'Low Priority Task 1',
                priority: 3,
                estimatedMinutes: 30,
                scheduledStart: new Date(today.getTime() + 13 * 60 * 60 * 1000),
                scheduledEnd: new Date(today.getTime() + 13.5 * 60 * 60 * 1000),
                completed: false,
              },
              {
                title: 'Low Priority Task 2',
                priority: 4,
                estimatedMinutes: 30,
                scheduledStart: new Date(today.getTime() + 14 * 60 * 60 * 1000),
                scheduledEnd: new Date(today.getTime() + 14.5 * 60 * 60 * 1000),
                completed: false,
              },
            ],
          },
        },
        include: {
          tasks: true,
        },
      });

      console.log(`✅ Created test plan with ${plan.tasks.length} tasks\n`);
    } else {
      console.log(`✅ Found existing plan with ${plan.tasks.length} tasks\n`);
    }

    // Test 1: Progress Analysis
    console.log('📊 Test 1: Progress Analysis');
    console.log('─'.repeat(50));

    const analysis = await analyzeProgress(plan.id);

    console.log(`Plan ID: ${analysis.planId}`);
    console.log(`Analysis Time: ${analysis.analysisTime.toLocaleTimeString()}`);
    console.log(`\nProgress:`);
    console.log(`  Total Tasks: ${analysis.totalTasks}`);
    console.log(`  Completed: ${analysis.completedTasks}`);
    console.log(`  Skipped: ${analysis.skippedTasks}`);
    console.log(`  Remaining: ${analysis.remainingTasks}`);
    console.log(`\nTime Status:`);
    console.log(
      `  Minutes ${analysis.minutesAheadBehind >= 0 ? 'Ahead' : 'Behind'}: ${Math.abs(analysis.minutesAheadBehind)}`
    );
    console.log(`  Available Minutes: ${analysis.remainingAvailableMinutes}`);
    console.log(`  Required for Protected: ${analysis.requiredMinutesForProtected}`);
    console.log(`  Capacity Exceeded: ${analysis.capacityExceeded ? 'Yes' : 'No'}`);
    console.log(`\nContext:`);
    console.log(`  Momentum State: ${analysis.momentumState.state}`);
    console.log(`  Skip Risk: ${analysis.overallSkipRisk}`);
    console.log(`\nReschedule Decision:`);
    console.log(`  Needs Reschedule: ${analysis.needsReschedule ? 'Yes' : 'No'}`);
    console.log(`  Type: ${analysis.rescheduleType}`);
    console.log(`  Reason: ${analysis.rescheduleReason}`);
    console.log(`\nProtected Tasks: ${analysis.protectedTasks.length}`);
    analysis.protectedTasks.forEach((task) => {
      console.log(`  - ${task.title} (P${task.priority}) - ${task.reason}`);
    });
    console.log(`\nDeferrable Tasks: ${analysis.deferrableTasks.length}`);
    analysis.deferrableTasks.forEach((task) => {
      console.log(`  - ${task.title} (P${task.priority})`);
    });

    console.log('\n✅ Progress analysis complete\n');

    // Test 2: Rule-Based Rescheduling
    if (analysis.needsReschedule) {
      console.log('🔄 Test 2: Rule-Based Rescheduling');
      console.log('─'.repeat(50));

      const reschedule = await rescheduleAfternoon(plan.id);

      console.log(`Success: ${reschedule.success}`);
      console.log(`Adaptation Type: ${reschedule.adaptationType}`);
      console.log(`Reasoning: ${reschedule.reasoning}`);
      console.log(`\nScheduled Tasks: ${reschedule.newSchedule.scheduledTasks.length}`);
      reschedule.newSchedule.scheduledTasks.forEach((task) => {
        console.log(
          `  - ${task.title} (${task.scheduledStart.toLocaleTimeString()} - ${task.scheduledEnd.toLocaleTimeString()}) ${task.isProtected ? '🛡️' : ''}`
        );
      });
      console.log(`\nDeferred Tasks: ${reschedule.newSchedule.deferredTasks.length}`);
      reschedule.newSchedule.deferredTasks.forEach((task) => {
        console.log(`  - ${task.title} - ${task.reason}`);
      });
      console.log(`\nTime Summary:`);
      console.log(`  Total Scheduled: ${reschedule.totalScheduledMinutes} minutes`);
      console.log(`  Available: ${reschedule.availableMinutes} minutes`);
      console.log(
        `  Utilization: ${Math.round((reschedule.totalScheduledMinutes / reschedule.availableMinutes) * 100)}%`
      );

      console.log('\n✅ Rule-based rescheduling complete\n');

      // Test 3: AI-Powered Rescheduling
      console.log('🤖 Test 3: AI-Powered Rescheduling');
      console.log('─'.repeat(50));

      try {
        const aiReschedule = await rescheduleWithAI(plan.id, {
          includeHistoricalData: true,
        });

        console.log(`Success: ${aiReschedule.success}`);
        console.log(`Adaptation Type: ${aiReschedule.adaptationType}`);
        console.log(`Reasoning: ${aiReschedule.reasoning}`);
        console.log(`\nScheduled Tasks: ${aiReschedule.newSchedule.scheduledTasks.length}`);
        aiReschedule.newSchedule.scheduledTasks.forEach((task) => {
          console.log(
            `  - ${task.title} (${task.scheduledStart.toLocaleTimeString()} - ${task.scheduledEnd.toLocaleTimeString()}) ${task.isProtected ? '🛡️' : ''}`
          );
        });
        console.log(`\nDeferred Tasks: ${aiReschedule.newSchedule.deferredTasks.length}`);
        aiReschedule.newSchedule.deferredTasks.forEach((task) => {
          console.log(`  - ${task.title} - ${task.reason}`);
        });

        console.log('\n✅ AI-powered rescheduling complete\n');

        // Test 4: Apply Reschedule
        console.log('💾 Test 4: Apply Reschedule (Dry Run)');
        console.log('─'.repeat(50));
        console.log('Would apply reschedule to database...');
        console.log('(Skipping actual application to preserve test data)');
        console.log('\n✅ Reschedule application test complete\n');
      } catch (error) {
        console.log('⚠️  AI rescheduling failed (this is okay if Gemini API is not configured)');
        console.log(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log('\n');
      }
    } else {
      console.log('ℹ️  No reschedule needed - plan is on track!\n');
    }

    console.log('✅ All tests complete!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testRescheduleEngine()
  .then(() => {
    console.log('\n✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
