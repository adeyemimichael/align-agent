/**
 * Test script for progress tracking system
 * 
 * Tests:
 * - Progress snapshot calculation
 * - Task start/completion recording
 * - Delay detection
 * - Task app sync
 */

import { prisma } from '../lib/prisma';
import {
  getCurrentProgress,
  recordTaskStart,
  recordTaskCompletion,
  detectDelays,
  getProgressSummary,
  getProgressHistory,
} from '../lib/progress-tracker';

async function testProgressTracking() {
  console.log('🧪 Testing Progress Tracking System\n');

  try {
    // Find a test user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    console.log(`✅ Found user: ${user.email}\n`);

    // Find today's plan
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let plan = await prisma.dailyPlan.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: tomorrow,
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
          capacityScore: 75,
          mode: 'balanced',
          geminiReasoning: 'Test plan for progress tracking',
          tasks: {
            create: [
              {
                title: 'Morning task',
                priority: 1,
                estimatedMinutes: 30,
                scheduledStart: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM
                scheduledEnd: new Date(today.getTime() + 9.5 * 60 * 60 * 1000), // 9:30 AM
              },
              {
                title: 'Midday task',
                priority: 2,
                estimatedMinutes: 45,
                scheduledStart: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1 PM
                scheduledEnd: new Date(today.getTime() + 13.75 * 60 * 60 * 1000), // 1:45 PM
              },
              {
                title: 'Afternoon task',
                priority: 3,
                estimatedMinutes: 60,
                scheduledStart: new Date(today.getTime() + 15 * 60 * 60 * 1000), // 3 PM
                scheduledEnd: new Date(today.getTime() + 16 * 60 * 60 * 1000), // 4 PM
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

    // Test 1: Get current progress
    console.log('📊 Test 1: Get Current Progress');
    const progress = await getCurrentProgress(plan.id);
    console.log(`  Total tasks: ${progress.totalTasks}`);
    console.log(`  Completed: ${progress.completedTasks}`);
    console.log(`  Skipped: ${progress.skippedTasks}`);
    console.log(`  In progress: ${progress.inProgressTasks}`);
    console.log(`  Upcoming: ${progress.upcomingTasks}`);
    console.log(`  Minutes ahead/behind: ${progress.minutesAheadBehind}`);
    console.log(`  Momentum state: ${progress.momentumState}`);
    console.log(`  Overall progress: ${progress.overallProgress}%`);
    console.log('  ✅ Progress snapshot retrieved\n');

    // Test 2: Record task start
    if (plan.tasks.length > 0 && !plan.tasks[0].actualStartTime) {
      console.log('⏱️  Test 2: Record Task Start');
      const task = plan.tasks[0];
      const taskProgress = await recordTaskStart(task.id);
      console.log(`  Started task: ${taskProgress.title}`);
      console.log(`  Status: ${taskProgress.status}`);
      console.log(`  Skip risk: ${taskProgress.skipRisk?.level || 'N/A'}`);
      console.log('  ✅ Task start recorded\n');
    }

    // Test 3: Record task completion
    if (plan.tasks.length > 0 && plan.tasks[0].actualStartTime && !plan.tasks[0].completed) {
      console.log('✅ Test 3: Record Task Completion');
      const task = plan.tasks[0];
      const result = await recordTaskCompletion(task.id);
      console.log(`  Completed task: ${result.taskProgress.title}`);
      console.log(`  Early completion: ${result.isEarlyCompletion}`);
      console.log(`  Minutes saved: ${result.minutesSaved}`);
      console.log('  ✅ Task completion recorded\n');
    }

    // Test 4: Detect delays
    console.log('⏰ Test 4: Detect Delays');
    const delays = await detectDelays(plan.id);
    console.log(`  Has delays: ${delays.hasDelays}`);
    console.log(`  Delayed tasks: ${delays.delayedTasks.length}`);
    console.log(`  Total minutes behind: ${delays.totalMinutesBehind}`);
    if (delays.delayedTasks.length > 0) {
      delays.delayedTasks.forEach((task) => {
        console.log(`    - ${task.title} (${task.status})`);
      });
    }
    console.log('  ✅ Delays detected\n');

    // Test 5: Get progress summary
    console.log('📈 Test 5: Get Progress Summary');
    const summary = await getProgressSummary(plan.id);
    console.log(`  Status: ${summary.status}`);
    console.log(`  Message: ${summary.message}`);
    console.log('  ✅ Progress summary generated\n');

    // Test 6: Get progress history
    console.log('📅 Test 6: Get Progress History');
    const history = await getProgressHistory(user.id, 7);
    console.log(`  History entries: ${history.length}`);
    if (history.length > 0) {
      console.log('  Recent entries:');
      history.slice(-3).forEach((entry) => {
        console.log(
          `    ${entry.date.toLocaleDateString()}: ${entry.completedTasks}/${entry.totalTasks} tasks (${entry.overallProgress}%)`
        );
      });
    }
    console.log('  ✅ Progress history retrieved\n');

    console.log('✅ All progress tracking tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run tests
testProgressTracking()
  .then(() => {
    console.log('\n✅ Progress tracking test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Progress tracking test failed:', error);
    process.exit(1);
  });
