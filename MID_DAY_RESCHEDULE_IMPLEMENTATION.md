# Mid-Day Re-Scheduling Engine Implementation

## Overview

Successfully implemented Task 26: Mid-Day Re-Scheduling Engine, which provides intelligent schedule adaptation throughout the day based on actual progress, momentum state, and skip risk.

## Implementation Summary

### ✅ Task 26.1: Create Progress Analyzer

**File:** `lib/reschedule-engine.ts`

**Features Implemented:**
- **Progress Analysis Function** (`analyzeProgress`)
  - Analyzes current progress vs original plan
  - Calculates minutes ahead/behind schedule
  - Identifies protected tasks (high-priority P1-P2)
  - Identifies deferrable tasks (low-priority P3-P4)
  - Calculates remaining available time
  - Integrates momentum state and skip risk
  - Determines if reschedule is needed

**Key Metrics Tracked:**
- Total tasks, completed, skipped, remaining
- Minutes ahead/behind schedule
- Current task status
- Protected vs deferrable tasks
- Remaining available minutes
- Capacity exceeded status
- Momentum state (strong, normal, weak, collapsed)
- Overall skip risk (low, medium, high)

**Requirements Validated:**
- ✅ 19.1: Analyze current progress vs original plan
- ✅ 19.2: Calculate minutes ahead or behind schedule
- ✅ 19.5: Identify protected tasks (high-priority, due soon)

---

### ✅ Task 26.2: Implement Re-Scheduling Algorithm

**File:** `lib/reschedule-engine.ts`

**Features Implemented:**
- **Rule-Based Rescheduling** (`rescheduleAfternoon`)
  - Handles "ahead of schedule" scenarios
  - Handles "behind schedule" scenarios
  - Handles "at risk" scenarios (rescue schedule)
  - Protects high-priority tasks
  - Defers low-priority tasks when capacity exceeded
  - Schedules tasks with 15-minute buffers

**Adaptation Types:**
1. **Ahead**: User is >30 minutes ahead with strong momentum
   - Suggests continuing or adding tasks
   - Maintains all scheduled tasks

2. **Behind**: User is 15-30 minutes behind
   - Adjusts afternoon schedule
   - Prioritizes protected tasks
   - Defers some low-priority tasks if needed

3. **At Risk/Rescue**: User is >30 minutes behind or high skip risk
   - Simplifies schedule dramatically
   - Only schedules protected tasks
   - Defers all non-essential tasks

**Requirements Validated:**
- ✅ 19.4: Rebuild afternoon schedule based on progress
- ✅ 19.5: Protect high-priority and due-soon tasks
- ✅ 19.6: Defer low-priority tasks when capacity exceeded

---

### ✅ Task 26.3: Integrate AI Agent for Re-Scheduling Decisions

**File:** `lib/reschedule-engine.ts`

**Features Implemented:**
- **AI-Powered Rescheduling** (`rescheduleWithAI`)
  - Sends current progress to Gemini AI
  - Includes historical data (time buffers, completion rates)
  - Includes user goals for context
  - Requests AI to make intelligent scheduling decisions
  - Applies AI recommendations to schedule
  - Falls back to rule-based if AI fails

**AI Context Provided:**
- Current capacity score and mode
- Available time remaining
- Historical time blindness buffer
- Productivity windows (completion rates by hour)
- User goals
- Task details (priority, estimates, descriptions)

**AI Decision Making:**
- Decides which tasks to schedule
- Adjusts time estimates based on historical buffer
- Schedules high-priority tasks during peak hours
- Provides reasoning for each decision
- Respects capacity limits

**Requirements Validated:**
- ✅ 19.3: Send current progress to Gemini AI
- ✅ 19.7: Apply AI recommendations

---

### ✅ Task 26.4: Build Re-Scheduling UI

**Files Created:**
1. `components/RescheduleProposal.tsx` - Main UI component
2. `app/api/plan/reschedule/route.ts` - API endpoint
3. `app/api/plan/adaptations/route.ts` - History endpoint
4. `scripts/test-reschedule-engine.ts` - Test script

**UI Features:**
- **Status Display**
  - Shows ahead/behind/at-risk status with color coding
  - Displays progress metrics (completed/total tasks)
  - Shows time status (minutes ahead/behind)
  - Displays momentum state with emoji indicators

- **Progress Summary**
  - Grid layout with key metrics
  - Visual indicators for status
  - Momentum state display

- **AI Reasoning Display**
  - Shows AI analysis and reasoning
  - Explains why reschedule is needed
  - Provides context for decisions

- **Scheduled Tasks List**
  - Shows tasks that will be scheduled
  - Indicates protected tasks with shield icon
  - Displays time blocks for each task
  - Shows priority levels

- **Deferred Tasks List**
  - Shows tasks being deferred
  - Explains reason for deferral
  - Displays priority levels

- **Time Summary**
  - Total scheduled time
  - Available time remaining
  - Utilization percentage

- **Action Buttons**
  - "Keep Current Plan" - Reject reschedule
  - "Accept Reschedule" - Apply new schedule
  - Loading states during processing

**API Endpoints:**

1. **POST /api/plan/reschedule**
   - Triggers reschedule analysis
   - Optionally applies reschedule
   - Returns analysis and reschedule result

2. **GET /api/plan/reschedule?planId=xxx**
   - Gets reschedule analysis without applying
   - Returns whether reschedule is needed

3. **GET /api/plan/adaptations**
   - Gets schedule adaptation history
   - Shows past reschedules
   - Tracks adaptation patterns

**Requirements Validated:**
- ✅ 19.3: Display re-scheduling reasoning
- ✅ 19.4: Show "ahead of schedule" suggestions
- ✅ 19.4: Show "behind schedule" rescue plan
- ✅ 19.8: Allow user to accept/reject re-schedule

---

## Architecture

### Data Flow

```
User Progress
    ↓
Progress Analyzer
    ↓
Reschedule Decision
    ↓
┌─────────────┬─────────────┐
│             │             │
Rule-Based    AI-Powered    
Reschedule    Reschedule    
    │             │         
    └──────┬──────┘         
           ↓                
    Reschedule Result       
           ↓                
    UI Proposal             
           ↓                
    User Decision           
           ↓                
    Apply to Database       
```

### Key Components

1. **Progress Analyzer**
   - Analyzes current state
   - Identifies protected/deferrable tasks
   - Calculates time metrics
   - Determines reschedule need

2. **Rule-Based Reschedule**
   - Simple priority-based logic
   - Fast and reliable
   - No external dependencies
   - Fallback option

3. **AI-Powered Reschedule**
   - Intelligent decision making
   - Considers historical patterns
   - Optimizes for productivity windows
   - Provides detailed reasoning

4. **UI Component**
   - Visual progress display
   - Before/after comparison
   - Accept/reject workflow
   - Real-time updates

---

## Integration Points

### Existing Systems Used

1. **Progress Tracker** (`lib/progress-tracker.ts`)
   - `getCurrentProgress()` - Get current progress snapshot
   - Provides minutes ahead/behind
   - Tracks task completion status

2. **Momentum Tracker** (`lib/momentum-tracker.ts`)
   - `calculateMomentumState()` - Get momentum metrics
   - Provides state (strong, normal, weak, collapsed)
   - Tracks completion patterns

3. **Skip Risk Calculator** (`lib/skip-risk.ts`)
   - `calculateSkipRisk()` - Calculate skip risk
   - Provides risk level and percentage
   - Considers multiple factors

4. **Gemini AI Client** (`lib/gemini.ts`)
   - `scheduleTasksWithAI()` - AI scheduling
   - Provides intelligent decisions
   - Includes reasoning

---

## Usage Examples

### 1. Analyze Progress

```typescript
import { analyzeProgress } from '@/lib/reschedule-engine';

const analysis = await analyzeProgress(planId);

console.log(`Minutes ${analysis.minutesAheadBehind >= 0 ? 'ahead' : 'behind'}: ${Math.abs(analysis.minutesAheadBehind)}`);
console.log(`Needs reschedule: ${analysis.needsReschedule}`);
console.log(`Protected tasks: ${analysis.protectedTasks.length}`);
```

### 2. Rule-Based Reschedule

```typescript
import { rescheduleAfternoon } from '@/lib/reschedule-engine';

const result = await rescheduleAfternoon(planId);

if (result.success) {
  console.log(`Scheduled ${result.newSchedule.scheduledTasks.length} tasks`);
  console.log(`Deferred ${result.newSchedule.deferredTasks.length} tasks`);
}
```

### 3. AI-Powered Reschedule

```typescript
import { rescheduleWithAI } from '@/lib/reschedule-engine';

const result = await rescheduleWithAI(planId, {
  includeHistoricalData: true,
});

console.log(`AI Reasoning: ${result.reasoning}`);
```

### 4. Apply Reschedule

```typescript
import { applyReschedule } from '@/lib/reschedule-engine';

await applyReschedule(planId, rescheduleResult);
console.log('Reschedule applied to database');
```

### 5. Use UI Component

```tsx
import RescheduleProposal from '@/components/RescheduleProposal';

<RescheduleProposal
  planId={planId}
  analysis={analysis}
  onAccept={() => {
    // Handle accept
    router.refresh();
  }}
  onReject={() => {
    // Handle reject
    setShowProposal(false);
  }}
  onClose={() => {
    setShowProposal(false);
  }}
/>
```

---

## Testing

### Test Script

**File:** `scripts/test-reschedule-engine.ts`

**Tests:**
1. Progress analysis with sample data
2. Rule-based rescheduling
3. AI-powered rescheduling (if API configured)
4. Reschedule application (dry run)

**Run Tests:**
```bash
npx tsx scripts/test-reschedule-engine.ts
```

**Note:** Requires database connection and test user.

---

## Requirements Coverage

### Requirement 19: Mid-Day Re-Scheduling

| Requirement | Status | Implementation |
|------------|--------|----------------|
| 19.1 Analyze current progress vs original plan | ✅ | `analyzeProgress()` |
| 19.2 Calculate minutes ahead or behind schedule | ✅ | Progress metrics in analysis |
| 19.3 Send current progress to Gemini AI | ✅ | `rescheduleWithAI()` |
| 19.4 Rebuild afternoon schedule based on progress | ✅ | `rescheduleAfternoon()` |
| 19.5 Protect high-priority and due-soon tasks | ✅ | Protected tasks filtering |
| 19.6 Defer low-priority tasks when capacity exceeded | ✅ | Deferrable tasks logic |
| 19.7 Apply AI recommendations | ✅ | AI result application |
| 19.8 Allow user to accept/reject re-schedule | ✅ | `RescheduleProposal` UI |

---

## Key Features

### 1. Intelligent Progress Analysis
- Real-time progress tracking
- Minutes ahead/behind calculation
- Protected task identification
- Capacity assessment

### 2. Adaptive Rescheduling
- Three adaptation types (ahead, behind, at-risk)
- Priority-based task protection
- Automatic deferral of low-priority tasks
- Time buffer management

### 3. AI Integration
- Historical data consideration
- Productivity window optimization
- Goal-aligned scheduling
- Detailed reasoning

### 4. User-Friendly UI
- Visual progress indicators
- Clear before/after comparison
- Accept/reject workflow
- Real-time updates

### 5. Fallback Mechanisms
- Rule-based fallback if AI fails
- Graceful error handling
- Consistent behavior

---

## Next Steps

### Recommended Enhancements

1. **Automatic Triggers**
   - Auto-trigger reschedule at 1pm, 3:30pm
   - Trigger on high skip risk detection
   - Trigger on momentum collapse

2. **Notification Integration**
   - Send notification when reschedule is recommended
   - Include quick accept/reject buttons
   - Show preview in notification

3. **Learning System**
   - Track reschedule acceptance rate
   - Learn user preferences
   - Adjust thresholds based on patterns

4. **Analytics Dashboard**
   - Show reschedule frequency
   - Track adaptation success rate
   - Display time saved/lost

5. **Mobile Optimization**
   - Responsive UI for mobile
   - Swipe gestures for accept/reject
   - Simplified view for small screens

---

## Files Created/Modified

### New Files
- ✅ `lib/reschedule-engine.ts` - Core reschedule logic
- ✅ `components/RescheduleProposal.tsx` - UI component
- ✅ `app/api/plan/reschedule/route.ts` - API endpoint
- ✅ `app/api/plan/adaptations/route.ts` - History endpoint
- ✅ `scripts/test-reschedule-engine.ts` - Test script
- ✅ `MID_DAY_RESCHEDULE_IMPLEMENTATION.md` - This document

### Modified Files
- None (all new implementations)

---

## Conclusion

The Mid-Day Re-Scheduling Engine is now fully implemented and ready for use. It provides intelligent, adaptive scheduling that responds to real-time progress, protects important tasks, and leverages AI for optimal decision-making.

The system successfully addresses all requirements (19.1-19.8) and integrates seamlessly with existing progress tracking, momentum tracking, and skip risk systems.

**Status:** ✅ Complete and ready for testing
