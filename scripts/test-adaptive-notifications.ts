/**
 * Test script for adaptive notification system
 * Tests tone adaptation, smart timing, and notification types
 */

import {
  generateAdaptiveNotification,
  shouldSendNotificationNow,
  calculateOptimalNotificationTime,
  NotificationTone,
  NotificationContext,
  DEFAULT_TIMING_RULES,
} from '../lib/notifications';
import {
  NotificationScheduler,
  createMorningCheckInReminder,
  createTaskStartReminder,
  createCelebrationNotification,
  createBehindScheduleNotification,
} from '../lib/adaptive-notifications';

console.log('🔔 Testing Adaptive Notification System\n');

// Test 1: Tone Adaptation
console.log('=== Test 1: Tone Adaptation ===');
const tones: NotificationTone[] = ['gentle', 'direct', 'minimal'];
const context: NotificationContext = {
  taskTitle: 'Write proposal',
  minutesBehind: 15,
  taskAppStatus: 'incomplete',
};

tones.forEach((tone) => {
  console.log(`\n${tone.toUpperCase()} tone:`);
  const notification = generateAdaptiveNotification('behind_schedule', context, tone);
  console.log(`  Title: ${notification.title}`);
  console.log(`  Body: ${notification.body}`);
});

// Test 2: Morning Check-in with Goal
console.log('\n\n=== Test 2: Morning Check-in Reminders ===');
const goalTitle = 'Launch MVP by end of month';
tones.forEach((tone) => {
  console.log(`\n${tone.toUpperCase()} tone:`);
  const notification = createMorningCheckInReminder(goalTitle, tone);
  console.log(`  Title: ${notification.title}`);
  console.log(`  Body: ${notification.body}`);
});

// Test 3: Task Start Reminders
console.log('\n\n=== Test 3: Task Start Reminders ===');
tones.forEach((tone) => {
  console.log(`\n${tone.toUpperCase()} tone:`);
  const notification = createTaskStartReminder('Review code', 30, tone);
  console.log(`  Title: ${notification.title}`);
  console.log(`  Body: ${notification.body}`);
});

// Test 4: Celebration Notifications
console.log('\n\n=== Test 4: Celebration Notifications ===');
tones.forEach((tone) => {
  console.log(`\n${tone.toUpperCase()} tone:`);
  const notification = createCelebrationNotification('Admin tasks', 10, tone);
  console.log(`  Title: ${notification.title}`);
  console.log(`  Body: ${notification.body}`);
});

// Test 5: Behind Schedule Notifications
console.log('\n\n=== Test 5: Behind Schedule Notifications ===');
tones.forEach((tone) => {
  console.log(`\n${tone.toUpperCase()} tone:`);
  const notification = createBehindScheduleNotification(
    'Write proposal',
    20,
    'incomplete',
    tone
  );
  console.log(`  Title: ${notification.title}`);
  console.log(`  Body: ${notification.body}`);
});

// Test 6: Smart Timing - Don't interrupt first 15 minutes
console.log('\n\n=== Test 6: Smart Timing - Task Start Protection ===');
const taskStartTime = new Date();
taskStartTime.setMinutes(taskStartTime.getMinutes() - 10); // Task started 10 min ago

const check1 = shouldSendNotificationNow(taskStartTime, null, DEFAULT_TIMING_RULES);
console.log(`Task started 10 minutes ago:`);
console.log(`  Should send: ${check1.shouldSend}`);
console.log(`  Reason: ${check1.reason || 'N/A'}`);

const taskStartTime2 = new Date();
taskStartTime2.setMinutes(taskStartTime2.getMinutes() - 20); // Task started 20 min ago

const check2 = shouldSendNotificationNow(taskStartTime2, null, DEFAULT_TIMING_RULES);
console.log(`\nTask started 20 minutes ago:`);
console.log(`  Should send: ${check2.shouldSend}`);
console.log(`  Reason: ${check2.reason || 'N/A'}`);

// Test 7: Smart Timing - Batching
console.log('\n\n=== Test 7: Smart Timing - Notification Batching ===');
const lastNotification = new Date();
lastNotification.setMinutes(lastNotification.getMinutes() - 5); // Last notification 5 min ago

const check3 = shouldSendNotificationNow(null, lastNotification, DEFAULT_TIMING_RULES);
console.log(`Last notification sent 5 minutes ago:`);
console.log(`  Should send: ${check3.shouldSend}`);
console.log(`  Reason: ${check3.reason || 'N/A'}`);

const lastNotification2 = new Date();
lastNotification2.setMinutes(lastNotification2.getMinutes() - 15); // Last notification 15 min ago

const check4 = shouldSendNotificationNow(null, lastNotification2, DEFAULT_TIMING_RULES);
console.log(`\nLast notification sent 15 minutes ago:`);
console.log(`  Should send: ${check4.shouldSend}`);
console.log(`  Reason: ${check4.reason || 'N/A'}`);

// Test 8: Smart Timing - Do Not Disturb
console.log('\n\n=== Test 8: Smart Timing - Do Not Disturb ===');
const dndRules = {
  ...DEFAULT_TIMING_RULES,
  doNotDisturbStart: '22:00',
  doNotDisturbEnd: '08:00',
};

// Simulate 11 PM
const nightTime = new Date();
nightTime.setHours(23, 0, 0, 0);

const check5 = shouldSendNotificationNow(null, null, dndRules, nightTime);
console.log(`Current time: 11:00 PM (DND: 10 PM - 8 AM):`);
console.log(`  Should send: ${check5.shouldSend}`);
console.log(`  Reason: ${check5.reason || 'N/A'}`);

// Simulate 9 AM
const morningTime = new Date();
morningTime.setHours(9, 0, 0, 0);

const check6 = shouldSendNotificationNow(null, null, dndRules, morningTime);
console.log(`\nCurrent time: 9:00 AM (DND: 10 PM - 8 AM):`);
console.log(`  Should send: ${check6.shouldSend}`);
console.log(`  Reason: ${check6.reason || 'N/A'}`);

// Test 9: Notification Scheduler
console.log('\n\n=== Test 9: Notification Scheduler ===');
const scheduler = new NotificationScheduler();

// Start a task
const taskStart = new Date();
scheduler.setTaskStartTime(taskStart);
console.log('Task started just now');

// Try to send notification immediately
const result1 = scheduler.scheduleNotification(
  'behind_schedule',
  { taskTitle: 'Write proposal', minutesBehind: 5 },
  'gentle'
);
console.log(`  Notification sent: ${result1.sent}`);
console.log(`  Reason: ${result1.reason || 'N/A'}`);
if (result1.scheduledFor) {
  console.log(`  Scheduled for: ${result1.scheduledFor.toLocaleTimeString()}`);
}

// Wait 20 minutes (simulated)
const taskStart2 = new Date();
taskStart2.setMinutes(taskStart2.getMinutes() - 20);
scheduler.setTaskStartTime(taskStart2);
console.log('\n20 minutes later...');

const result2 = scheduler.scheduleNotification(
  'behind_schedule',
  { taskTitle: 'Write proposal', minutesBehind: 20 },
  'gentle'
);
console.log(`  Notification sent: ${result2.sent}`);
if (result2.notification) {
  console.log(`  Title: ${result2.notification.title}`);
  console.log(`  Body: ${result2.notification.body}`);
}

// Test 10: Optimal Notification Time Calculation
console.log('\n\n=== Test 10: Optimal Notification Time ===');
const desiredTime = new Date();
const recentTaskStart = new Date();
recentTaskStart.setMinutes(recentTaskStart.getMinutes() - 5);

const optimalTime = calculateOptimalNotificationTime(
  desiredTime,
  recentTaskStart,
  null,
  DEFAULT_TIMING_RULES
);

console.log(`Desired time: ${desiredTime.toLocaleTimeString()}`);
console.log(`Task started: ${recentTaskStart.toLocaleTimeString()}`);
console.log(`Optimal time: ${optimalTime.toLocaleTimeString()}`);
console.log(`Delay: ${Math.round((optimalTime.getTime() - desiredTime.getTime()) / 60000)} minutes`);

console.log('\n✅ All tests completed!');
