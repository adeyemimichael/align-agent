# Intelligent Check-In System Implementation

## Overview

The Intelligent Check-In System has been successfully implemented as part of Task 25. This system schedules check-ins at configured times, triggers based on progress, generates context-aware messages, and handles user responses adaptively.

## Implementation Summary

### Task 25.1: Create Check-In Scheduler ✅

**File:** `lib/intelligent-checkin.ts`

**Features:**
- Schedule check-ins at user-configured times (default: 10:00, 13:00, 15:30)
- Trigger check-ins based on progress (behind schedule, momentum collapse)
- Support for scheduled, progress-based, and manual triggers
- Configurable check-in schedule per user

**Key Functions:**
- `getCheckInSchedule(userId)` - Get user's check-in schedule
- `updateCheckInSchedule(userId, schedule)` - Update schedule settings
- `shouldTriggerScheduledCheckIn(schedule, now)` - Check if time-based trigger
- `shouldTriggerProgressCheckIn(userId, planId)` - Check if progress-based trigger
- `scheduleCheckIn(userId, planId, trigger)` - Schedule a check-in notification

**Requirements Satisfied:**
- ✅ 18.1: Schedule check-ins at configured times (10am, 1pm, 3:30pm)
- ✅ 18.1: Trigger check-ins based on progress (behind schedule, momentum collapse)

### Task 25.2: Implement Check-In Message Generator ✅

**File:** `lib/intelligent-checkin.ts`

**Features:**
- Context-aware message generation based on progress and momentum
- References specific tasks and their status from task app (Todoist)
- Provides response options (Done, Still working, Stuck, Skip)
- Adapts tone based on user preference (gentle, direct, minimal)

**Key Functions:**
- `generateCheckInMessage(userId, planId, progress, tone, syncResult)` - Generate message
- `generateMessageContent(tone, progress, targetTask, syncResult)` - Generate tone-specific content

**Message Tone Examples:**

**Gentle Tone:**
- "💙 Just checking in - How's it going with 'Write proposal'? I see it's not marked complete in Todoist yet. No pressure, just want to help you finish strong."

**Direct Tone:**
- "Status check - 'Write proposal' status check. I see it's not marked complete in Todoist yet. Done, still working, or stuck? Reply and I'll adjust the schedule."

**Minimal Tone:**
- "Check-in - 'Write proposal' done? I see it's not marked complete in Todoist yet."

**Requirements Satisfied:**
- ✅ 18.3: Generate context-aware check-in messages
- ✅ 18.4: Provide response options (Done, Still working, Stuck)
- ✅ 18.8: Adapt tone based on user preference (gentle, direct, minimal)

### Task 25.3: Build Check-In Response Handler ✅

**File:** `lib/intelligent-checkin.ts`

**Features:**
- Handles "Done" response: Celebrates completion, continues plan
- Handles "Still working" response: Extends time by 30 minutes, defers low-priority tasks
- Handles "Stuck" response: Defers stuck task, suggests easier wins
- Handles "Skip" response: Moves task to later, continues with next task

**Key Functions:**
- `handleCheckInResponse(userId, checkInId, response)` - Process user response
- Returns actions taken and user-friendly message

**Response Actions:**

**"Done" Response:**
- Marks task as complete
- Celebrates early completion if applicable
- Shows minutes saved
- Continues with plan

**"Still working" Response:**
- Extends current task time by 30 minutes
- Defers next low-priority task (priority >= 3)
- Maintains manageable schedule

**"Stuck" Response:**
- Defers the stuck task
- Finds easier wins (shorter duration, lower priority)
- Suggests alternative task
- Offers break option

**"Skip" Response:**
- Moves task to later (removes from schedule)
- Continues with next task

**Requirements Satisfied:**
- ✅ 18.5: Handle "Still working" response (extend time, defer tasks)
- ✅ 18.6: Handle "Stuck" response (defer task, suggest easier wins)
- ✅ 18.7: Handle "Done" response (celebrate, continue plan)

### Task 25.4: Integrate Task App Sync with Check-Ins ✅

**File:** `lib/intelligent-checkin.ts`

**Features:**
- Syncs with Todoist before each check-in
- Detects completion status from task app
- References task app status in notifications
- Includes sync results in check-in messages

**Integration Points:**
- Calls `syncTaskAppProgress(userId, planId)` before generating check-in
- Includes Todoist status in task reference
- Mentions task app status in notification body

**Example:**
```
"I see the proposal isn't marked complete in Todoist yet. How's it going?"
```

**Requirements Satisfied:**
- ✅ 18.2: Sync with Todoist before each check-in
- ✅ 18.2: Detect completion status
- ✅ 18.2: Reference task app status in notifications

## API Routes

### POST /api/checkin/schedule
Schedule a check-in notification

**Request:**
```json
{
  "planId": "plan_123",
  "trigger": "scheduled",
  "scheduledFor": "2024-01-27T10:00:00Z"
}
```

**Response:**
```json
{
  "id": "checkin_123",
  "userId": "user_123",
  "planId": "plan_123",
  "trigger": "scheduled",
  "scheduledFor": "2024-01-27T10:00:00Z",
  "message": {
    "title": "✨ Quick check-in",
    "body": "How's 'Write proposal' coming along?",
    "taskReference": { ... },
    "responseOptions": [ ... ],
    "context": { ... }
  }
}
```

### GET /api/checkin/schedule
Get check-in schedule for user

**Response:**
```json
{
  "userId": "user_123",
  "times": ["10:00", "13:00", "15:30"],
  "enabled": true,
  "tone": "gentle"
}
```

### PATCH /api/checkin/schedule
Update check-in schedule

**Request:**
```json
{
  "times": ["09:00", "14:00"],
  "enabled": true,
  "tone": "direct"
}
```

### POST /api/checkin/respond
Handle user response to check-in

**Request:**
```json
{
  "checkInId": "checkin_123",
  "response": "still_working"
}
```

**Response:**
```json
{
  "actions": [
    {
      "type": "extend_time",
      "description": "Extended task time by 30 minutes",
      "taskId": "task_123",
      "newScheduledEnd": "2024-01-27T11:30:00Z"
    },
    {
      "type": "defer_task",
      "description": "Deferred low-priority task: Email follow-ups",
      "deferredTaskIds": ["task_456"]
    }
  ],
  "message": "No problem! I've given you 30 more minutes for 'Write proposal' and deferred 'Email follow-ups' to keep your schedule manageable."
}
```

### GET /api/checkin/pending
Get pending check-ins

**Query Parameters:**
- `includeHistory=true` - Include check-in history
- `limit=10` - Number of history items to return

**Response:**
```json
[
  {
    "id": "checkin_123",
    "trigger": "scheduled",
    "scheduledFor": "2024-01-27T10:00:00Z",
    "sentAt": null,
    "message": { ... }
  }
]
```

## UI Components

### CheckInModal Component

**File:** `components/CheckInModal.tsx`

**Features:**
- Displays check-in notification with context
- Shows task reference and Todoist status
- Displays progress metrics (completed, remaining, minutes behind)
- Shows momentum state indicator
- Provides response buttons with descriptions
- Handles response submission
- Shows success message after response

**Props:**
```typescript
interface CheckInModalProps {
  checkIn: CheckInNotification;
  onRespond: (response: CheckInResponse) => Promise<void>;
  onClose: () => void;
}
```

## Data Storage

Check-in data is stored in the user's `notificationPreferences` JSON field:

```json
{
  "checkInTimes": ["10:00", "13:00", "15:30"],
  "checkInsEnabled": true,
  "checkInTone": "gentle",
  "checkInHistory": [
    {
      "id": "checkin_123",
      "planId": "plan_123",
      "trigger": "scheduled",
      "scheduledFor": "2024-01-27T10:00:00Z",
      "sentAt": "2024-01-27T10:00:05Z",
      "response": "still_working",
      "respondedAt": "2024-01-27T10:02:30Z",
      "actionsTaken": [
        "Extended task time by 30 minutes",
        "Deferred low-priority task: Email follow-ups"
      ]
    }
  ]
}
```

## Testing

### Test Script

**File:** `scripts/test-intelligent-checkin.ts`

**Tests:**
1. Get check-in schedule
2. Update check-in schedule
3. Check if scheduled check-in should trigger
4. Find or create test plan
5. Check if progress-based check-in should trigger
6. Schedule a check-in
7. Get pending check-ins
8. Handle check-in response
9. Get check-in history
10. Test different tones

**Run Tests:**
```bash
npx tsx scripts/test-intelligent-checkin.ts
```

## Integration with Existing Systems

### Progress Tracker Integration
- Uses `getCurrentProgress(planId)` to get current progress snapshot
- Includes minutes ahead/behind in check-in context
- References current and next tasks

### Task App Sync Integration
- Calls `syncTaskAppProgress(userId, planId)` before each check-in
- Includes Todoist completion status in messages
- Detects unplanned completions

### Momentum Tracker Integration
- Uses `calculateMomentumState(userId, planId)` to get momentum
- Includes momentum state in check-in context
- Triggers check-ins on momentum collapse

### Notification System Integration
- Uses existing notification preferences structure
- Supports browser push notifications
- Can be extended to email notifications

## Usage Example

```typescript
// 1. Get user's check-in schedule
const schedule = await getCheckInSchedule(userId);

// 2. Check if it's time for a scheduled check-in
const now = new Date();
if (shouldTriggerScheduledCheckIn(schedule, now)) {
  // Schedule the check-in
  const checkIn = await scheduleCheckIn(userId, planId, 'scheduled');
  
  // Send notification (browser push, email, etc.)
  await sendNotification(checkIn.message.title, checkIn.message.body);
}

// 3. Check if progress-based check-in should trigger
const progressTrigger = await shouldTriggerProgressCheckIn(userId, planId);
if (progressTrigger.shouldTrigger) {
  const checkIn = await scheduleCheckIn(userId, planId, progressTrigger.trigger);
  await sendNotification(checkIn.message.title, checkIn.message.body);
}

// 4. Handle user response
const result = await handleCheckInResponse(userId, checkInId, 'still_working');
console.log(result.message); // "No problem! I've given you 30 more minutes..."
```

## Next Steps

The Intelligent Check-In System is now complete and ready for integration with:

1. **Notification Delivery System** - Send check-ins via browser push, email, or SMS
2. **Background Job Scheduler** - Automatically trigger check-ins at scheduled times
3. **Dashboard UI** - Display pending check-ins and history
4. **Mobile App** - Support check-in notifications on mobile devices

## Requirements Coverage

All requirements for Task 25 have been satisfied:

- ✅ 18.1: Schedule check-ins at configured times (10am, 1pm, 3:30pm)
- ✅ 18.1: Trigger check-ins based on progress (behind schedule, momentum collapse)
- ✅ 18.2: Sync with Todoist before each check-in
- ✅ 18.2: Detect completion status
- ✅ 18.2: Reference task app status in notifications
- ✅ 18.3: Generate context-aware check-in messages
- ✅ 18.4: Provide response options (Done, Still working, Stuck)
- ✅ 18.5: Handle "Still working" response (extend time, defer tasks)
- ✅ 18.6: Handle "Stuck" response (defer task, suggest easier wins)
- ✅ 18.7: Handle "Done" response (celebrate, continue plan)
- ✅ 18.8: Adapt tone based on user preference (gentle, direct, minimal)

## Files Created/Modified

### New Files:
- `lib/intelligent-checkin.ts` - Core check-in system logic
- `app/api/checkin/schedule/route.ts` - Schedule management API
- `app/api/checkin/respond/route.ts` - Response handling API
- `app/api/checkin/pending/route.ts` - Pending check-ins API
- `components/CheckInModal.tsx` - Check-in UI component
- `scripts/test-intelligent-checkin.ts` - Test script
- `INTELLIGENT_CHECKIN_IMPLEMENTATION.md` - This documentation

### Integration Points:
- Uses existing `lib/progress-tracker.ts`
- Uses existing `lib/task-app-sync.ts`
- Uses existing `lib/momentum-tracker.ts`
- Uses existing `lib/prisma.ts`
- Uses existing notification preferences structure

## Conclusion

The Intelligent Check-In System is fully implemented and provides a comprehensive solution for adaptive, context-aware check-ins that help users stay on track throughout the day. The system intelligently adapts to user progress, momentum state, and preferences to provide supportive interventions at the right time.
