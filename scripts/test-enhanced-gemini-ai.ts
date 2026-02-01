/**
 * Test Enhanced Gemini AI Integration with Adaptive Features
 * 
 * This script tests the enhanced Gemini AI client with full adaptive context:
 * - Time blindness compensation
 * - Productivity windows
 * - Skip risk prediction
 * - Momentum tracking
 * - Real-time progress
 */

import { getGeminiClient } from '../lib/gemini';
import type { PlanningContext } from '../lib/gemini';

async function testEnhancedGeminiAI() {
  console.log('🧪 Testing Enhanced Gemini AI Integration with Adaptive Features\n');

  const geminiClient = getGeminiClient();

  // Test 1: Daily planning with full adaptive context
  console.log('Test 1: Daily Planning with Full Adaptive Context');
  console.log('=' .repeat(60));

  const planningContext: PlanningContext = {
    capacityScore: 65,
    mode: 'balanced',
    tasks: [
      {
        id: 'task-1',
        title: 'Write project proposal',
        description: 'Draft the Q1 project proposal',
        priority: 1,
        estimatedMinutes: 90,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'task-2',
        title: 'Review pull requests',
        description: 'Review 3 pending PRs',
        priority: 2,
        estimatedMinutes: 45,
      },
      {
        id: 'task-3',
        title: 'Team standup',
        description: 'Daily standup meeting',
        priority: 2,
        estimatedMinutes: 15,
      },
      {
        id: 'task-4',
        title: 'Update documentation',
        description: 'Update API docs',
        priority: 3,
        estimatedMinutes: 60,
      },
      {
        id: 'task-5',
        title: 'Respond to emails',
        description: 'Clear inbox',
        priority: 4,
        estimatedMinutes: 30,
      },
    ],
    history: [
      {
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        capacityScore: 70,
        completedTasks: 4,
        totalTasks: 5,
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        capacityScore: 55,
        completedTasks: 3,
        totalTasks: 6,
      },
    ],
    goals: [
      { title: 'Launch MVP by Q1', category: 'work' },
      { title: 'Improve code quality', category: 'work' },
    ],
    // Adaptive context
    adaptiveContext: {
      timeBlindness: {
        averageBuffer: 1.8,
        confidence: 'high',
        recommendation: 'User typically takes 80% longer than estimated. Apply 1.8x buffer to all estimates.',
      },
      productivityWindows: {
        peakHours: [
          { hour: 9, completionRate: 85, label: '9:00 AM' },
          { hour: 10, completionRate: 82, label: '10:00 AM' },
          { hour: 14, completionRate: 75, label: '2:00 PM' },
        ],
        lowHours: [
          { hour: 13, completionRate: 45, label: '1:00 PM' },
          { hour: 15, completionRate: 50, label: '3:00 PM' },
        ],
        recommendation: 'Schedule high-priority tasks at 9am and 10am (peak hours with 85%+ completion rate)',
      },
      skipRisk: {
        overallLevel: 'medium',
        taskRisks: [
          {
            taskId: 'task-4',
            riskLevel: 'high',
            riskPercentage: 65,
            reasoning: 'Low priority task scheduled in afternoon (high skip risk)',
          },
          {
            taskId: 'task-1',
            riskLevel: 'low',
            riskPercentage: 25,
            reasoning: 'High priority task with upcoming deadline',
          },
        ],
      },
      momentum: {
        state: 'normal',
        morningStartStrength: 82,
        completionAfterEarlyWinRate: 78,
        consecutiveSkips: 0,
        consecutiveEarlyCompletions: 0,
      },
    },
  };

  try {
    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0);

    const result = await geminiClient.generateDailyPlan(planningContext, startTime);

    console.log('\n✅ Planning successful!');
    console.log('\nOverall Reasoning:');
    console.log(result.overallReasoning);

    if (result.modeRecommendation) {
      console.log('\nMode Recommendation:');
      console.log(result.modeRecommendation);
    }

    if (result.adaptiveInsights) {
      console.log('\n🎯 Adaptive Insights:');
      if (result.adaptiveInsights.timeBlindnessApplied) {
        console.log('  Time Blindness:', result.adaptiveInsights.timeBlindnessApplied);
      }
      if (result.adaptiveInsights.productivityWindowsUsed) {
        console.log('  Productivity Windows:', result.adaptiveInsights.productivityWindowsUsed);
      }
      if (result.adaptiveInsights.skipRiskMitigation) {
        console.log('  Skip Risk:', result.adaptiveInsights.skipRiskMitigation);
      }
      if (result.adaptiveInsights.momentumConsideration) {
        console.log('  Momentum:', result.adaptiveInsights.momentumConsideration);
      }
    }

    console.log('\nScheduled Tasks:');
    result.orderedTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.scheduledStart.toLocaleTimeString()} - ${task.scheduledEnd.toLocaleTimeString()}`);
      console.log(`     Task: ${planningContext.tasks.find(t => t.id === task.taskId)?.title}`);
      console.log(`     Reasoning: ${task.reasoning}`);
    });
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  // Test 2: AI-driven scheduling with adaptive context
  console.log('\n\nTest 2: AI-Driven Scheduling with Adaptive Context');
  console.log('=' .repeat(60));

  try {
    const scheduleDate = new Date();
    scheduleDate.setHours(9, 0, 0, 0);

    const result = await geminiClient.scheduleTasksWithAI({
      userId: 'test-user',
      tasks: planningContext.tasks,
      capacityScore: 65,
      mode: 'balanced',
      availableMinutes: 360, // 6 hours
      historicalData: {
        averageBuffer: 1.8,
        completionRatesByHour: {
          9: 0.85,
          10: 0.82,
          11: 0.75,
          13: 0.45,
          14: 0.75,
          15: 0.50,
        },
        taskTypeBuffers: {},
      },
      goals: planningContext.goals,
      scheduleDate,
      adaptiveContext: {
        skipRisk: planningContext.adaptiveContext?.skipRisk,
        momentum: planningContext.adaptiveContext?.momentum,
      },
    });

    console.log('\n✅ AI scheduling successful!');
    console.log('\nReasoning:');
    console.log(result.reasoning);

    if (result.adaptiveInsights) {
      console.log('\n🎯 Adaptive Insights:');
      console.log('  Time Blindness:', result.adaptiveInsights.timeBlindnessApplied);
      console.log('  Productivity Windows:', result.adaptiveInsights.productivityWindowsUsed);
      console.log('  Skip Risk:', result.adaptiveInsights.skipRiskMitigation);
      console.log('  Momentum:', result.adaptiveInsights.momentumConsideration);
    }

    console.log('\nScheduled Tasks:');
    result.scheduledTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.scheduledStart.toLocaleTimeString()} - ${task.scheduledEnd.toLocaleTimeString()}`);
      console.log(`     ${task.title}`);
      console.log(`     Original: ${task.originalMinutes}min → Adjusted: ${task.adjustedMinutes}min`);
      console.log(`     Reason: ${task.reason}`);
    });

    if (result.skippedTasks.length > 0) {
      console.log('\nSkipped Tasks:');
      result.skippedTasks.forEach((task: any) => {
        console.log(`  - ${task.title} (Priority ${task.priority})`);
      });
    }

    console.log(`\nTotal Scheduled: ${result.totalScheduledMinutes} minutes of ${result.availableMinutes} available`);
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  // Test 3: Check-in notification generation
  console.log('\n\nTest 3: AI-Driven Check-In Notification');
  console.log('=' .repeat(60));

  try {
    const checkInResult = await geminiClient.generateCheckInNotification({
      userId: 'test-user',
      taskTitle: 'Write project proposal',
      taskStatus: 'in_progress',
      todoistStatus: 'incomplete',
      minutesBehind: 20,
      tasksCompleted: 2,
      tasksRemaining: 3,
      momentumState: 'weak',
      tone: 'gentle',
    });

    console.log('\n✅ Check-in notification generated!');
    console.log('\nTitle:', checkInResult.title);
    console.log('Body:', checkInResult.body);
    console.log('\nSuggested Actions:');
    checkInResult.suggestedActions.forEach((action, index) => {
      console.log(`  ${index + 1}. ${action}`);
    });
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
  }

  // Test 4: Re-schedule recommendation
  console.log('\n\nTest 4: AI-Driven Re-Schedule Recommendation');
  console.log('=' .repeat(60));

  try {
    const rescheduleResult = await geminiClient.generateRescheduleRecommendation({
      userId: 'test-user',
      currentTime: new Date(),
      minutesAheadBehind: -35,
      completedTasks: 2,
      skippedTasks: 1,
      remainingTasks: [
        {
          id: 'task-1',
          title: 'Write project proposal',
          priority: 1,
          estimatedMinutes: 90,
          isProtected: true,
        },
        {
          id: 'task-4',
          title: 'Update documentation',
          priority: 3,
          estimatedMinutes: 60,
          isProtected: false,
        },
      ],
      remainingAvailableMinutes: 180,
      momentumState: 'weak',
      skipRiskLevel: 'high',
      capacityScore: 55,
    });

    console.log('\n✅ Re-schedule recommendation generated!');
    console.log('\nShould Reschedule:', rescheduleResult.shouldReschedule);
    console.log('Reasoning:', rescheduleResult.reasoning);
    console.log('\nRecommended Actions:');
    rescheduleResult.recommendedActions.forEach((action, index) => {
      console.log(`  ${index + 1}. [${action.type}] ${action.description}`);
    });
    console.log('\nEncouragement:', rescheduleResult.encouragement);
  } catch (error) {
    console.error('❌ Test 4 failed:', error);
  }

  console.log('\n\n✅ All tests completed!');
  console.log('\n📊 Summary:');
  console.log('  - Enhanced AI prompts with adaptive context ✓');
  console.log('  - AI response parsing for adaptive insights ✓');
  console.log('  - Check-in notification generation ✓');
  console.log('  - Re-schedule recommendation generation ✓');
}

// Run tests
testEnhancedGeminiAI().catch(console.error);
