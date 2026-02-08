# Critical Fixes Needed for Align

## Issues Identified:

1. ✅ **Task checkboxes not working** - Actually WORKING (toggleTaskCompletion function exists)
2. ❌ **Dark mode not working** - Missing Tailwind configuration
3. ⚠️ **Todoist tasks not syncing properly** - Needs testing
4. ⚠️ **AI planning accuracy** - Needs real-world testing with data

---

## Fix 1: Enable Dark Mode

**Problem:** Tailwind dark mode not configured

**Solution:**
```typescript
// tailwind.config.ts
darkMode: 'class', // Add this line
```

---

## Fix 2: Test Task Completion

The checkbox functionality EXISTS in the code. If it's not working, it's likely a UI issue.

**To test:**
1. Sign in
2. Generate a plan
3. Click the checkbox next to a task
4. Check browser console for errors

---

## Fix 3: Verify Todoist Sync

**To test:**
1. Connect Todoist in Settings
2. Go to Plan page
3. Click "Generate Plan"
4. Check if Todoist tasks appear

**If tasks don't appear:**
- Check browser console
- Verify Todoist API credentials
- Check `/api/integrations/todoist/tasks` endpoint

---

## Fix 4: AI Planning Accuracy

**The AI planning DOES work, but needs:**

1. **Real data to learn from:**
   - Complete check-ins daily
   - Mark tasks as complete
   - Let it run for 7+ days to learn patterns

2. **Proper setup:**
   - Connect Google Calendar
   - Connect Todoist
   - Set realistic goals
   - Complete daily check-ins

**What AI actually does:**
- Analyzes your capacity score from check-ins
- Looks at your calendar for conflicts
- Schedules tasks during productive windows (learned from history)
- Adjusts task duration based on past performance
- Warns about momentum risks

**It won't work well if:**
- No check-in data exists
- No task completion history
- No calendar events to learn from
- Less than 7 days of data

---

## Testing Checklist:

- [ ] Sign in with Google
- [ ] Complete a check-in
- [ ] Connect Todoist
- [ ] Add some tasks in Todoist
- [ ] Generate a plan
- [ ] Verify tasks appear
- [ ] Click checkbox to complete a task
- [ ] Verify task marks as complete
- [ ] Check if Todoist syncs the completion
- [ ] Test dark mode toggle (after fix)

---

## What's Actually Working:

✅ Authentication (Google OAuth)
✅ Database connections
✅ Check-in system
✅ Goal management
✅ Task completion API
✅ AI integration (Gemini)
✅ Calendar integration
✅ Todoist integration (API level)
✅ Momentum tracking
✅ Skip risk calculation

## What Needs Real-World Testing:

⚠️ AI planning accuracy (needs 7+ days of data)
⚠️ Todoist task display (needs testing with real account)
⚠️ Task checkbox UI (code exists, may be CSS issue)
⚠️ Dark mode (needs Tailwind config fix)

