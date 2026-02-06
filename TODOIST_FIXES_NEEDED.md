# Todoist Integration Fixes

## Issues Identified

### 1. "Unknown Task" Appearing
**Root Cause:** When the auto-scheduler creates tasks, it's using `t.title` which might be undefined if the task mapping fails.

**Location:** `app/api/plan/generate/route.ts` line ~197

**Fix:** Ensure task title defaults to task.content from Todoist

### 2. Phantom Tasks (Unknown Origin)
**Root Cause:** The fallback scheduler creates dummy tasks when AI fails, using generic task IDs like "task_1_p3_45m"

**Location:** `app/api/plan/generate/route.ts` fallback logic

**Fix:** Better error handling and clearer messaging when using fallback

### 3. No Refresh Button
**Current:** Tasks only sync when plan is generated
**Needed:** Manual refresh button to fetch latest Todoist tasks

**Fix:** Add refresh button that calls `/api/integrations/todoist/tasks`

### 4. Task Completion Not Syncing from Todoist
**Current:** When you complete a task in Todoist app, Align doesn't know
**Needed:** Polling or webhook to detect Todoist completions

**Fix:** Add periodic sync or webhook handler

### 5. Can't Mark Tasks Complete in Align
**Current:** No UI to mark tasks complete
**Needed:** Checkbox on each task card

**Fix:** Add checkbox that calls `/api/integrations/todoist/tasks/[id]/complete`

## Implementation Plan

1. Fix "Unknown Task" title mapping
2. Add refresh button to Plan page
3. Add task completion checkboxes
4. Add auto-sync on page load
5. Show completion status from Todoist
