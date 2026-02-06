# Current Issues and Status

## ✅ Fixed Issues

### 1. Unique Constraint Error on Plan Generation
**Status:** FIXED
**Issue:** Getting "Unique constraint failed on (userId, date)" when generating a plan
**Solution:** Added code to delete existing plan before creating a new one
**File:** `app/api/plan/generate/route.ts`

### 2. Database Schema Mismatch
**Status:** FIXED
**Issue:** Column `(not available)` does not exist in database
**Solution:** Ran `prisma db push` to sync schema with database
**Action:** Database is now in sync

### 3. Unknown Argument `originalMinutes`
**Status:** FIXED
**Issue:** Trying to save `originalMinutes` field that doesn't exist in schema
**Solution:** Removed `originalMinutes` from database creation (it's only used internally)
**File:** `app/api/plan/generate/route.ts`

---

## 🔴 Outstanding Issues

### 1. Todoist Task Completion Sync (Two-Way)
**Status:** NOT IMPLEMENTED
**Issue:** 
- When you mark a task complete in Todoist app, it doesn't sync to Align AI
- When you mark a task complete in Align AI, it doesn't sync to Todoist

**What's Needed:**
1. **Todoist → Align Sync:**
   - Need to implement webhook or polling to detect Todoist task completions
   - Update corresponding PlanTask in database when Todoist task is completed
   
2. **Align → Todoist Sync:**
   - Need to add "Mark Complete" button/checkbox on task cards in Align UI
   - Call Todoist API to mark task complete when user clicks it
   - Update local database

**Files to Modify:**
- `app/plan/page.tsx` - Add complete button to UI
- `app/api/integrations/todoist/tasks/[id]/complete/route.ts` - Already exists, needs to be called from UI
- `lib/task-app-sync.ts` - Add polling or webhook handler for Todoist → Align sync

---

### 2. Goals Page Not Working
**Status:** PARTIALLY IMPLEMENTED
**Issue:** Goals page exists but may not be fully functional

**What to Check:**
- Can you create goals?
- Can you link tasks to goals?
- What specific error are you seeing?

**Files:**
- `app/goals/page.tsx`
- `app/api/goals/route.ts`
- `components/GoalForm.tsx`

**Action Needed:** Please describe what's not working specifically

---

### 3. Notifications Not Working
**Status:** PARTIALLY IMPLEMENTED
**Issue:** Notification system exists but may not be sending notifications

**What's Implemented:**
- Notification preferences API: `app/api/notifications/preferences/route.ts`
- Notification settings UI: `components/NotificationSettings.tsx`
- Intelligent check-in system: `lib/intelligent-checkin.ts`

**What's Missing:**
- Actual notification delivery (email, push, SMS)
- Background job to send scheduled notifications
- Webhook/polling to trigger notifications

**Action Needed:** 
- Decide on notification delivery method (email via SendGrid, push via Firebase, etc.)
- Implement background job scheduler (cron, Vercel Cron, etc.)

---

### 4. Dark Mode Toggle Not Working
**Status:** NOT IMPLEMENTED
**Issue:** Dark mode toggle exists but doesn't actually toggle dark mode

**What's Needed:**
- Implement dark mode state management (localStorage + context)
- Add Tailwind dark mode classes to all components
- Wire up the toggle button to actually change the theme

**Files to Modify:**
- `app/layout.tsx` - Add dark mode provider
- `components/DashboardLayout.tsx` or `components/Sidebar.tsx` - Wire up toggle
- All component files - Add `dark:` classes

**Quick Fix:** This is a UI-only feature, can be implemented quickly

---

### 5. Opik Link Missing
**Status:** IMPLEMENTED BUT NOT VISIBLE
**Issue:** Opik dashboard exists but link is not showing in UI

**What's Implemented:**
- Opik integration: `lib/opik.ts`
- Opik dashboard component: `components/OpikDashboard.tsx`
- Opik stats API: `app/api/opik/stats/route.ts`

**What's Missing:**
- Link in sidebar/navigation to Opik dashboard
- Route for Opik dashboard page

**Quick Fix:**
1. Add route: `app/opik/page.tsx`
2. Add link in `components/Sidebar.tsx`

---

## 🎯 Priority Order (Recommended)

1. **HIGH PRIORITY - Todoist Task Completion Sync**
   - This is core functionality for the app to be useful
   - Users need to see their progress reflected

2. **MEDIUM PRIORITY - Dark Mode**
   - Quick win, improves UX
   - Can be done in 30 minutes

3. **MEDIUM PRIORITY - Opik Link**
   - Quick win, just needs a route and link
   - Can be done in 10 minutes

4. **LOW PRIORITY - Notifications**
   - Complex, requires external service setup
   - Can work without it initially

5. **LOW PRIORITY - Goals (pending more info)**
   - Need to understand what's broken first

---

## 🚀 Quick Wins (Can Do Now)

### Add Opik Link (5 minutes)
1. Create `app/opik/page.tsx`
2. Add link in sidebar

### Fix Dark Mode (30 minutes)
1. Add dark mode context
2. Wire up toggle
3. Add dark: classes to key components

### Add Task Complete Button (15 minutes)
1. Add checkbox/button to task cards in plan page
2. Call existing complete API endpoint
3. Refresh plan after completion

---

## 📝 Notes

- Google Calendar OAuth redirect URI needs to be added to Google Cloud Console
- Database is now in sync with Prisma schema
- Plan generation now works (deletes old plan before creating new one)
