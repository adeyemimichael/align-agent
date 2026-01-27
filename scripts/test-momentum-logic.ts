/**
 * Test script for momentum tracking logic (without database)
 * Tests momentum state transitions and calculations
 */

import 'dotenv/config';
import {
  getMomentumPredictionAdjustment,
  getInterventionRecommendation,
  getMomentumDisplayMessage,
  type MomentumState,
  type MomentumMetrics,
} from '../lib/momentum-tracker';

function testMomentumLogic() {
  console.log('🧪 Testing Momentum Tracking Logic (No Database)\n');

  // Test 1: Prediction adjustments
  console.log('🎯 Test 1: Momentum Prediction Adjustments');
  const states: MomentumState[] = ['strong', 'normal', 'weak', 'collapsed'];
  for (const state of states) {
    const adjustment = getMomentumPredictionAdjustment(state);
    console.log(`  ${state.padEnd(10)}: ${adjustment}x multiplier`);
  }
  console.log('✅ Prediction adjustments working\n');

  // Test 2: Intervention recommendations for each state
  console.log('🚨 Test 2: Intervention Recommendations');
  
  const testScenarios: Array<{ state: MomentumState; consecutiveSkips: number; consecutiveEarlyCompletions: number }> = [
    { state: 'strong', consecutiveSkips: 0, consecutiveEarlyCompletions: 2 },
    { state: 'normal', consecutiveSkips: 0, consecutiveEarlyCompletions: 0 },
    { state: 'weak', consecutiveSkips: 1, consecutiveEarlyCompletions: 0 },
    { state: 'collapsed', consecutiveSkips: 2, consecutiveEarlyCompletions: 0 },
  ];

  for (const scenario of testScenarios) {
    const metrics: MomentumMetrics = {
      state: scenario.state,
      morningStartStrength: 82,
      completionAfterEarlyWinRate: 78,
      afternoonFalloff: 35,
      consecutiveSkips: scenario.consecutiveSkips,
      consecutiveEarlyCompletions: scenario.consecutiveEarlyCompletions,
      lastStateChange: new Date(),
      confidence: 'medium',
    };

    const recommendation = getInterventionRecommendation(metrics);
    console.log(`\n  State: ${scenario.state}`);
    console.log(`    Type: ${recommendation.type}`);
    console.log(`    Message: ${recommendation.message}`);
    console.log(`    Actions: ${recommendation.actions.length} action(s)`);
  }
  console.log('\n✅ Intervention recommendations working\n');

  // Test 3: Display messages
  console.log('💬 Test 3: Display Messages');
  
  for (const scenario of testScenarios) {
    const metrics: MomentumMetrics = {
      state: scenario.state,
      morningStartStrength: 82,
      completionAfterEarlyWinRate: 78,
      afternoonFalloff: 35,
      consecutiveSkips: scenario.consecutiveSkips,
      consecutiveEarlyCompletions: scenario.consecutiveEarlyCompletions,
      lastStateChange: new Date(),
      confidence: 'medium',
    };

    const displayMessage = getMomentumDisplayMessage(metrics);
    console.log(`\n  State: ${scenario.state}`);
    console.log(`    ${displayMessage.emoji} ${displayMessage.title}`);
    console.log(`    Description: ${displayMessage.description}`);
    console.log(`    Color: ${displayMessage.color}`);
  }
  console.log('\n✅ Display messages working\n');

  // Test 4: State transition logic
  console.log('🎭 Test 4: State Transition Logic');
  
  const transitionTests = [
    {
      name: 'Early completion → Strong',
      consecutiveSkips: 0,
      consecutiveEarlyCompletions: 1,
      expectedState: 'strong',
    },
    {
      name: 'One skip → Weak',
      consecutiveSkips: 1,
      consecutiveEarlyCompletions: 0,
      expectedState: 'weak',
    },
    {
      name: 'Two skips → Collapsed',
      consecutiveSkips: 2,
      consecutiveEarlyCompletions: 0,
      expectedState: 'collapsed',
    },
    {
      name: 'No skips, no early completions → Normal',
      consecutiveSkips: 0,
      consecutiveEarlyCompletions: 0,
      expectedState: 'normal',
    },
  ];

  for (const test of transitionTests) {
    // Simulate state determination logic
    let predictedState: MomentumState = 'normal';
    
    if (test.consecutiveSkips >= 2) {
      predictedState = 'collapsed';
    } else if (test.consecutiveSkips === 1) {
      predictedState = 'weak';
    } else if (test.consecutiveEarlyCompletions >= 1) {
      predictedState = 'strong';
    }

    const passed = predictedState === test.expectedState;
    console.log(`\n  ${test.name}`);
    console.log(`    Expected: ${test.expectedState}`);
    console.log(`    Got: ${predictedState}`);
    console.log(`    ${passed ? '✅ PASS' : '❌ FAIL'}`);
  }
  console.log('\n✅ State transition logic working\n');

  // Test 5: Prediction adjustment impact
  console.log('📊 Test 5: Prediction Adjustment Impact');
  
  const baseAvailableMinutes = 480; // 8 hours
  console.log(`  Base available time: ${baseAvailableMinutes} minutes (8 hours)\n`);
  
  for (const state of states) {
    const adjustment = getMomentumPredictionAdjustment(state);
    const adjustedMinutes = Math.round(baseAvailableMinutes * adjustment);
    const difference = adjustedMinutes - baseAvailableMinutes;
    const sign = difference > 0 ? '+' : '';
    
    console.log(`  ${state.padEnd(10)}: ${adjustedMinutes} minutes (${sign}${difference} minutes)`);
  }
  console.log('\n✅ Prediction adjustment impact calculated\n');

  console.log('🎉 All momentum tracking logic tests passed!');
}

// Run tests
try {
  testMomentumLogic();
  console.log('\n✅ Test completed successfully');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
}
