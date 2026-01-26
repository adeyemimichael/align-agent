# Execution Tasks: Transform to Real AI Agent

## Phase 1: Fix Critical Bugs (MUST DO - 4-6 hours)

### Task 1.1: Fix Analytics NaN Errors
**Problem:** Analytics page references wrong field names from database
**Fix:** Update field references to match Prisma schema
- [ ] Fix `h.energy` → `h.energyLevel`
- [ ] Fix `h.sleep` → `h.sleepQuality`
- [ ] Fix `h.stress` → `h.stressLevel`
- [ ] Test analytics page displays correctly
- **File:** `app/analytics/page.tsx`
- **Time:** 30 minutes

### Task 1.2: Add Task Deletion Endpoint
**Problem:** No way to delete tasks from Todoist integration
**Fix:** Create DELETE endpoint
- [ ] Create `app/api/integrations/todoist/tasks/[id]/route.ts` with DELETE method
- [ ] Delete from local database
- [ ] it should be done and  sync deletion to Todoist
- [ ] Add delete button to task UI
- **Files:** New API route + `app/plan/page.tsx`
- **Time:** 1 hour

### Task 1.3: Fix Notification Preferences
**Problem:** UI doesn't match backend schema
**Fix:** Align UI with database structure
- [ ] Check actual NotificationPreference schema in Prisma
- [ ] Update `components/NotificationSettings.tsx` to match
- [ ] Fix API route to handle correct fields
- [ ] Test save/load preferences
- **Files:** `components/NotificationSettings.tsx`, `app/api/notifications/preferences/route.ts`
- **Time:** 1.5 hours

### Task 1.4: Add Calendar Integration Guidance
**Problem:** Users don't understand what calendar integration does
**Fix:** Add clear instructions and status
- [ ] Update `app/integrations/page.tsx` with clear explanations
- [ ] Add "What this does" section for each integration
- [ ] Show connection status clearly
- [ ] Add troubleshooting tips
- **Files:** `app/integrations/page.tsx`
- **Time:** 1 hour

---

## Phase 2: Core Agent Behaviors (CRITICAL - 12-16 hours)

### Task 2.1: Automatic Time Tracking System
**Goal:** Track actual vs estimated time for tasks

#### 2.1.1: Update Database Schema
- [ ] Add `actualStartTime DateTime?` to PlanTask model
- [ ] Add `actualEndTime DateTime?` to PlanTask model
- [ ] Add `actualMinutes Int?` to PlanTask model
- [ ] Run migration: `npx prisma migrate dev --name add-time-tracking`
- **File:** `prisma/schema.prisma`
- **Time:** 30 minutes

#### 2.1.2: Create Time Tracking Library
- [ ] Create `lib/time-tracking.ts`
- [ ] Function: `calculateActualDuration(startTime, endTime)`
- [ ] Function: `calculateTimeBlindnessBuffer(estimated, actual)`
- [ ] Function: `getHistoricalTimeAccuracy(userId, taskType)`
- [ ] Function: `adjustFutureEstimate(baseEstimate, userBuffer)`
- **File:** `lib/time-tracking.ts`
- **Time:** 2 hours

#### 2.1.3: Track Completion Times
- [ ] Update task completion endpoint to record timestamps
- [ ] Calculate actual duration on completion
- [ ] Store in database
- [ ] Return time tracking data in response
- **File:** `app/api/plan/[id]/tasks/[taskId]/complete/route.ts` (create new)
- **Time:** 1.5 hours

#### 2.1.4: Time Blindness Insights Component
- [ ] Create `components/TimeBlindnessInsights.tsx`
- [ ] Show estimated vs actual time comparison
- [ ] Display buffer multiplier (e.g., "2x")
- [ ] Show trend over time
- [ ] Add to analytics page
- **File:** `components/TimeBlindnessInsights.tsx`
- **Time:** 2 hours

**Total for 2.1:** 6 hours

### Task 2.2: Automatic Scheduling Engine
**Goal:** Schedule tasks automatically based on learned patterns

#### 2.2.1: Productivity Windows Analysis
- [ ] Create `lib/productivity-windows.ts`
- [ ] Function: `analyzeCompletionTimePatterns(userId)`
- [ ] Function: `identifyPeakProductivityHours(completionData)`
- [ ] Function: `calculateTimeSlotCompletionRate(hour, userId)`
- [ ] Return productivity windows with confidence scores
- **File:** `lib/productivity-windows.ts`
- **Time:** 2 hours

#### 2.2.2: Auto-Scheduler Core Logic
- [ ] Create `lib/auto-scheduler.ts`
- [ ] Function: `autoScheduleTasks(tasks, capacityScore, productivityWindows)`
- [ ] Schedule high-priority tasks in peak windows
- [ ] Apply time blindness buffers
- [ ] Respect calendar conflicts
- [ ] Return scheduled tasks with reasoning
- **File:** `lib/auto-scheduler.ts`
- **Time:** 3 hours

#### 2.2.3: Automatic Plan Generation Endpoint
- [ ] Create `app/api/plan/auto-generate/route.ts`
- [ ] Trigger automatically after check-in
- [ ] Use auto-scheduler logic
- [ ] Save plan to database
- [ ] Sync to calendar automatically
- [ ] Return plan with AI reasoning
- **File:** `app/api/plan/auto-generate/route.ts`
- **Time:** 2 hours

#### 2.2.4: Productivity Insights Component
- [ ] Create `components/ProductivityInsights.tsx`
- [ ] Show peak productivity hours
- [ ] Display completion rates by time
- [ ] Show auto-scheduling decisions
- [ ] Add to dashboard
- **File:** `components/ProductivityInsights.tsx`
- **Time:** 1.5 hours

**Total for 2.2:** 8.5 hours

### Task 2.3: Intelligent Auto-Rescheduling
**Goal:** Automatically reschedule incomplete tasks

#### 2.3.1: Rescheduling Logic
- [ ] Create `lib/auto-reschedule.ts`
- [ ] Function: `detectIncompleteTasks(userId, date)`
- [ ] Function: `analyzeFailureReason(task, capacityScore, timeSlot)`
- [ ] Function: `findBetterTimeSlot(task, productivityWindows)`
- [ ] Function: `rescheduleTask(task, newTimeSlot, reason)`
- **File:** `lib/auto-reschedule.ts`
- **Time:** 2 hours

#### 2.3.2: Daily Rescheduling Job
- [ ] Create `app/api/cron/daily-reschedule/route.ts`
- [ ] Run at end of day (11:59 PM)
- [ ] Detect incomplete tasks
- [ ] Automatically reschedule
- [ ] Create notifications
- [ ] Log to Opik
- **File:** `app/api/cron/daily-reschedule/route.ts`
- **Time:** 1.5 hours

#### 2.3.3: Reschedule Notification Component
- [ ] Create `components/RescheduleNotification.tsx`
- [ ] Show what was rescheduled
- [ ] Explain why (AI reasoning)
- [ ] Show new time slot
- [ ] Allow user to override
- **File:** `components/RescheduleNotification.tsx`
- **Time:** 1 hour

**Total for 2.3:** 4.5 hours

### Task 2.4: Proactive Pattern Detection
**Goal:** Surface insights automatically

#### 2.4.1: Integrate Pattern Detection into Check-in
- [ ] Update `app/api/checkin/route.ts`
- [ ] Call `detectCapacityPatterns()` after check-in
- [ ] Generate proactive recommendations
- [ ] Store insights in database
- [ ] Return insights in response
- **File:** `app/api/checkin/route.ts`
- **Time:** 1 hour

#### 2.4.2: Proactive Insights Component
- [ ] Create `components/ProactiveInsights.tsx`
- [ ] Display pattern-based recommendations
- [ ] Show trend indicators
- [ ] Highlight automatic actions taken
- [ ] Add to dashboard
- **File:** `components/ProactiveInsights.tsx`
- **Time:** 1.5 hours

#### 2.4.3: Enhanced AI Reasoning
- [ ] Update `lib/gemini.ts`
- [ ] Add prompt for explaining patterns
- [ ] Add prompt for proactive recommendations
- [ ] Include time tracking data in context
- [ ] Include productivity windows in context
- **File:** `lib/gemini.ts`
- **Time:** 1 hour

**Total for 2.4:** 3.5 hours

---

## Phase 3: Polish & Demo Prep (NICE-TO-HAVE - 6-8 hours)

### Task 3.1: Visual Learning Indicators
- [ ] Create `components/LearningProgress.tsx`
- [ ] Show before/after comparisons
- [ ] Display confidence levels
- [ ] Highlight improvements over time
- [ ] Add to analytics page
- **Time:** 2 hours

### Task 3.2: Smooth Transitions & Loading States
- [ ] Add skeleton loaders to all pages
- [ ] Add smooth animations for insights
- [ ] Add progress indicators for AI operations
- [ ] Test all loading states
- **Time:** 2 hours

### Task 3.3: Demo Flow Preparation
- [ ] Create `scripts/generate-demo-data.ts`
- [ ] Generate realistic check-in history
- [ ] Generate tasks with completion data
- [ ] Show clear learning progression
- [ ] Test complete demo flow
- **Time:** 2 hours

### Task 3.4: Documentation & Explainability
- [ ] Update README with agent capabilities
- [ ] Add inline help text throughout UI
- [ ] Create demo video script
- [ ] Document all AI decisions
- **Time:** 2 hours

---

## Execution Order (Priority)

### Day 1 (8-10 hours):
1. ✅ Task 1.1: Fix Analytics NaN (30 min)
2. ✅ Task 1.2: Add Task Deletion (1 hour)
3. ✅ Task 1.3: Fix Notification Preferences (1.5 hours)
4. ✅ Task 1.4: Calendar Guidance (1 hour)
5. ✅ Task 2.1.1: Update Database Schema (30 min)
6. ✅ Task 2.1.2: Time Tracking Library (2 hours)
7. ✅ Task 2.1.3: Track Completion Times (1.5 hours)

### Day 2 (10-12 hours):
1. ✅ Task 2.1.4: Time Blindness Insights (2 hours)
2. ✅ Task 2.2.1: Productivity Windows (2 hours)
3. ✅ Task 2.2.2: Auto-Scheduler Logic (3 hours)
4. ✅ Task 2.2.3: Auto-Generate Endpoint (2 hours)
5. ✅ Task 2.2.4: Productivity Insights Component (1.5 hours)

### Day 3 (8-10 hours):
1. ✅ Task 2.3: All Rescheduling Tasks (4.5 hours)
2. ✅ Task 2.4: All Pattern Detection Tasks (3.5 hours)
3. ✅ Task 3.1: Visual Learning Indicators (2 hours)
4. ✅ Task 3.2: Polish & Loading States (2 hours)

### Day 4 (4-6 hours):
1. ✅ Task 3.3: Demo Preparation (2 hours)
2. ✅ Task 3.4: Documentation (2 hours)
3. ✅ Final testing and bug fixes (2 hours)

---

## Success Criteria

### Minimum Viable Agent (Must Have):
- [x] Analytics works without NaN
- [ ] Automatic time tracking works
- [ ] Automatic scheduling based on patterns works
- [ ] Visual before/after comparisons work
- [ ] Opik tracking shows all decisions

### Full Agent (Should Have):
- [ ] Automatic rescheduling works
- [ ] Proactive insights displayed
- [ ] Smooth UI with loading states
- [ ] Complete demo flow ready

### Impressive Demo (Nice to Have):
- [ ] Demo data generator
- [ ] Video script prepared
- [ ] All documentation complete
- [ ] Polish and animations

---

## Notes

- Focus on Phase 1 and Phase 2 first
- Phase 3 is polish - only if time permits
- Test each feature as you build it
- Commit frequently
- Keep the demo narrative in mind

**The killer feature:** Show side-by-side comparison:
- "You estimated 2 hours → Actually took 4 hours → Agent now schedules 4 hours"
- "Completion rate at 3pm: 40% → Agent moved tasks to 9am → Completion rate: 85%"

This is what will impress judges.
