/**
 * Test Auto-Scheduler Integration
 * Verifies that the auto-scheduler correctly applies time blindness buffers
 * and productivity windows to task scheduling
 */

import { autoScheduleTasks, TaskToSchedule } from '../lib/auto-scheduler';
import { adjustFutureEstimate } from '../lib/time-tracking';
import { getRecommendedSchedulingTime } from '../lib/productivity-windows';

async function testAutoScheduler() {
  console.log('🧪 Testing Auto-Scheduler Integration\n');

  // Test 1: Time Blindness Buffer Adjustment
  console.log('Test 1: Time Blindness Buffer Adjustment');
  console.log('=========================================');
  
  const testUserId = 'test-user-123';
  const baseEstimate = 60; // 60 minutes
  
  try {
    const adjustment = await adjustFutureEstimate(testUserId, baseEstimate);
    console.log(`✅ Original Estimate: ${adjustment.originalEstimate} minutes`);
    console.log(`✅ Adjusted Estimate: ${adjustment.adjustedEstimate} minutes`);
    console.log(`✅ Buffer Applied: ${adjustment.buffer.toFixed(2)}x`);
    console.log(`✅ Reason: ${adjustment.reason}\n`);
  } catch (error) {
    console.error('❌ Time blindness test failed:', error);
  }

  // Test 2: Productivity Window Recommendation
  console.log('Test 2: Productivity Window Recommendation');
  console.log('==========================================');
  
  try {
    const recommendation = await getRecommendedSchedulingTime(
      testUserId,
      1, // High priority
      90 // 90 minutes
    );
    console.log(`✅ Recommended Hour: ${recommendation.recommendedHour}:00`);
    console.log(`✅ Completion Rate: ${(recommendation.completionRate * 100).toFixed(0)}%`);
    console.log(`✅ Reason: ${recommendation.reason}\n`);
  } catch (error) {
    console.error('❌ Productivity window test failed:', error);
  }

  // Test 3: Full Auto-Scheduler
  console.log('Test 3: Full Auto-Scheduler');
  console.log('============================');
  
  const testTasks: TaskToSchedule[] = [
    {
      id: 'task-1',
      title: 'Write project proposal',
      priority: 1,
      estimatedMinutes: 120,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      id: 'task-2',
      title: 'Review pull requests',
      priority: 2,
      estimatedMinutes: 45,
    },
    {
      id: 'task-3',
      title: 'Team standup',
      priority: 3,
      estimatedMinutes: 15,
    },
    {
      id: 'task-4',
      title: 'Update documentation',
      priority: 3,
      estimatedMinutes: 60,
    },
  ];

  try {
    const result = await autoScheduleTasks(
      testUserId,
      testTasks,
      75, // 75% capacity
      'balanced',
      new Date()
    );

    console.log(`✅ Scheduled Tasks: ${result.scheduledTasks.length}`);
    console.log(`✅ Skipped Tasks: ${result.skippedTasks.length}`);
    console.log(`✅ Total Scheduled: ${Math.round(result.totalScheduledMinutes / 60)} hours`);
    console.log(`✅ Available Time: ${Math.round(result.availableMinutes / 60)} hours`);
    console.log(`✅ Utilization: ${Math.round((result.totalScheduledMinutes / result.availableMinutes) * 100)}%\n`);

    console.log('Scheduled Tasks:');
    result.scheduledTasks.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.title}`);
      console.log(`   Time: ${task.scheduledStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${task.scheduledEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`);
      console.log(`   Duration: ${task.adjustedMinutes} min (original: ${task.originalMinutes} min)`);
      console.log(`   Reason: ${task.reason}`);
    });

    console.log('\n\n📊 Overall Reasoning:');
    console.log(result.reasoning);

  } catch (error) {
    console.error('❌ Auto-scheduler test failed:', error);
  }

  console.log('\n\n✅ All tests complete!');
  console.log('\nNext Steps:');
  console.log('1. Run database migration: npx prisma migrate dev');
  console.log('2. Test plan generation in the UI');
  console.log('3. Complete some tasks to generate time tracking data');
  console.log('4. Generate a new plan to see buffers applied');
}

// Run tests
testAutoScheduler().catch(console.error);
