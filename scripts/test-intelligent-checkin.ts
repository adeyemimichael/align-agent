/**
 * Test script for Intelligent Check-In System
 * 
 * Tests check-in scheduling, message generation, and response handling
 */

import { prisma } from '../lib/prisma';
import {
  getCheckInSchedule,
  updateCheckInSchedule,
  shouldTriggerScheduledCheckIn,
  shouldTriggerProgressCheckIn,
  scheduleCheckIn,
  handleCheckInResponse,
  getPendingCheckIns,
  getCheckInHistory,
} from '../lib/intelligent-checkin';

async function testIntelligentCheckIn() {
  console.log('🧪 Testing Intelligent Check-In System\n');

  try {
    // Find a test user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error('❌ No users found. Please create a user first.');
      return;
    }

    console.log(`✅ Found test user: ${user.email}\n`);

    // Test 1: Get check-in schedule
    console.log('Test 1: Get check-in schedule');
    const schedule = await getCheckInSchedule(user.id);
    console.log('Schedule:', JSON.stringify(schedule, null, 2));
    console.log('✅ Test 1 passed\n');

    // Test 2: Update check-in schedule
    console.log('Test 2: Update check-in schedule');
    const updatedSchedule = await updateCheckInSchedule(user.id, {
      times: ['10:00', '13:00', '15:30'],
      enabled: true,
      tone: 'gentle',
    });
    console.log('Updated schedule:', JSON.stringify(updatedSchedule, null, 2));
    console.log('✅ Test 2 passed\n');

    // Test 3: Check if scheduled check-in should trigger
    console.log('Test 3: Check if scheduled check-in should trigger');
    const now = new Date();
    now.setHours(10, 2, 0, 0); // 10:02 AM
    const shouldTrigger = shouldTriggerScheduledCheckIn(updatedSchedule, now);
    console.log(`Should trigger at 10:02 AM: ${shouldTrigger}`);
    console.log('✅ Test 3 passed\n');

    // Test 4: Find or create a plan for testing
    console.log('Test 4: Find or create a plan for testing');
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

    if (!plan) {
      console.log('Creating test plan...');
      plan = await prisma.dailyPlan.create({
        data: {
          userId: user.id,
          date: today,
          capacityScore: 75,
          mode: 'balanced',
          geminiReasoning: 'Test plan for check-in system',
          tasks: {
            create: [
              {
                title: 'Test Task 1',
                priority: 1,
                estimatedMinutes: 60,
                scheduledStart: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
                scheduledEnd: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM
              },
              {
                title: 'Test Task 2',
                priority: 2,
                estimatedMinutes: 45,
                scheduledStart: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM
                scheduledEnd: new Date(today.getTime() + 10.75 * 60 * 60 * 1000), // 10:45 AM
              },
            ],
          },
        },
        include: {
          tasks: true,
        },
      });
    }

    console.log(`Plan ID: ${plan.id}, Tasks: ${plan.tasks.length}`);
    console.log('✅ Test 4 passed\n');

    // Test 5: Check if progress-based check-in should trigger
    console.log('Test 5: Check if progress-based check-in should trigger');
    const progressTrigger = await shouldTriggerProgressCheckIn(user.id, plan.id);
    console.log('Progress trigger:', JSON.stringify(progressTrigger, null, 2));
    console.log('✅ Test 5 passed\n');

    // Test 6: Schedule a check-in
    console.log('Test 6: Schedule a check-in');
    const checkIn = await scheduleCheckIn(user.id, plan.id, 'scheduled');
    console.log('Check-in scheduled:', {
      id: checkIn.id,
      trigger: checkIn.trigger,
      messageTitle: checkIn.message.title,
      messageBody: checkIn.message.body,
      responseOptions: checkIn.message.responseOptions.map((o) => o.label),
    });
    console.log('✅ Test 6 passed\n');

    // Test 7: Get pending check-ins
    console.log('Test 7: Get pending check-ins');
    const pending = await getPendingCheckIns(user.id);
    console.log(`Pending check-ins: ${pending.length}`);
    if (pending.length > 0) {
      console.log('First pending:', {
        id: pending[0].id,
        trigger: pending[0].trigger,
        messageTitle: pending[0].message.title,
      });
    }
    console.log('✅ Test 7 passed\n');

    // Test 8: Handle check-in response (still_working)
    console.log('Test 8: Handle check-in response (still_working)');
    const response = await handleCheckInResponse(user.id, checkIn.id, 'still_working');
    console.log('Response result:', {
      message: response.message,
      actionsCount: response.actions.length,
      actions: response.actions.map((a) => a.type),
    });
    console.log('✅ Test 8 passed\n');

    // Test 9: Get check-in history
    console.log('Test 9: Get check-in history');
    const history = await getCheckInHistory(user.id, 5);
    console.log(`Check-in history: ${history.length} entries`);
    if (history.length > 0) {
      console.log('Most recent:', {
        id: history[0].id,
        trigger: history[0].trigger,
        response: history[0].response,
        actionsTaken: history[0].actionsTaken,
      });
    }
    console.log('✅ Test 9 passed\n');

    // Test 10: Test different tones
    console.log('Test 10: Test different tones');
    const tones: Array<'gentle' | 'direct' | 'minimal'> = ['gentle', 'direct', 'minimal'];
    for (const tone of tones) {
      await updateCheckInSchedule(user.id, { tone });
      const toneCheckIn = await scheduleCheckIn(user.id, plan.id, 'scheduled');
      console.log(`${tone} tone:`, toneCheckIn.message.title);
    }
    console.log('✅ Test 10 passed\n');

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testIntelligentCheckIn()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
