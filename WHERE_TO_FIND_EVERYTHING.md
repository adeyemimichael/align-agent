# Where to Find Everything in the App (Visual Guide)

## 🎯 Quick Answer: What This App Does

**In one sentence:** The app learns how long tasks ACTUALLY take you (vs what you estimate), then automatically schedules future tasks with extra time so you stop feeling overwhelmed.

**Real example:**
- Week 1: You estimate "Write report: 2 hours" → Actually takes 4 hours → You're stressed
- Week 2: You estimate "Review code: 1 hour" → Actually takes 2 hours → You're stressed again
- Week 3: App learns "You take 2x longer" → Automatically schedules 2 hours when you say 1 hour → You finish on time!

---

## 📱 The App Layout

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (Left)          │  MAIN CONTENT (Right)        │
│                          │                              │
│  🏠 Dashboard            │  [Your current page content] │
│  ✅ Check-In             │                              │
│  📋 Plan ⭐ MAIN PAGE    │                              │
│  🎯 Goals                │                              │
│  📊 Analytics ⭐ LEARNING │                              │
│  🔌 Integrations         │                              │
│  ⚙️  Settings            │                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Page-by-Page Guide

### 1. `/checkin` - Morning Check-In (START HERE EVERY DAY)

**What you see:**
```
┌──────────────────────────────────────────┐
│  Daily Check-In                          │
│                                          │
│  How's your energy today?                │
│  [========●====] 8/10                    │
│                                          │
│  How well did you sleep?                 │
│  [======●======] 7/10                    │
│                                          │
│  How stressed are you?                   │
│  [===●=========] 3/10                    │
│                                          │
│  What's your mood?                       │
│  [Dropdown: Great ▼]                     │
│                                          │
│  [Submit Check-In]                       │
└──────────────────────────────────────────┘
```

**What happens when you click Submit:**
- App calculates: (Energy 8 + Sleep 7 + Low Stress) = **75% Capacity**
- Shows: "Check-in saved! Your capacity today is 75%"
- This number determines how much work you can handle today

---

### 2. `/plan` - Your Daily Plan (⭐ MAIN PAGE)

**What you see:**
```
┌──────────────────────────────────────────────────────────┐
│  Today's Plan                                            │
│  Capacity: 75% | Mode: BALANCED                          │
│                                                          │
│  [Generate Plan] [Sync to Calendar]                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ☐ Write project proposal                          │ │
│  │   9:00 AM - 11:00 AM (2 hours)                     │ │
│  │   Priority: High                                   │ │
│  │                                                    │ │
│  │   💡 Why scheduled here:                          │ │
│  │   "Scheduled at 9am (+100% buffer) because        │ │
│  │   similar tasks took 2x longer than estimated.    │ │
│  │   This is your peak productivity time (85%        │ │
│  │   completion rate)."                              │ │
│  │                                                    │ │
│  │   [🗑️ Delete]                                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ ☐ Review pull requests                            │ │
│  │   11:15 AM - 12:00 PM (45 minutes)                │ │
│  │   Priority: Medium                                │ │
│  │                                                    │ │
│  │   💡 Why scheduled here:                          │ │
│  │   "Scheduled after deep work. No buffer needed    │ │
│  │   - you're accurate on review tasks."             │ │
│  │                                                    │ │
│  │   [🗑️ Delete]                                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  📊 Plan Summary:                                        │
│  • 5 tasks scheduled (3 hours)                          │
│  • 2 tasks skipped (not enough capacity)                │
│  • Utilization: 50% (3 of 6 available hours)            │
└──────────────────────────────────────────────────────────┘
```

**What the checkboxes do:**
- Click checkbox → Task marked complete
- App records: "You estimated X minutes, actually took Y minutes"
- This data feeds the learning system

**What "Generate Plan" does:**
1. Looks at your Todoist tasks (or manual tasks)
2. Checks your capacity (75% = 6 hours available)
3. Looks at your history: "You take 2x longer on writing tasks"
4. Schedules tasks with buffers during your best hours
5. Shows you the plan with explanations

---

### 3. `/analytics` - See the Learning (⭐ THE PROOF)

**What you see:**

#### Section 1: Key Metrics (Top)
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Avg Capacity│  Avg Energy │  Avg Sleep  │  Avg Stress │
│     75      │     8.0     │     7.0     │     3.0     │
│  Improving  │  out of 10  │  out of 10  │  out of 10  │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

#### Section 2: Capacity Trend Chart
```
┌──────────────────────────────────────────────────────────┐
│  30-Day Capacity Trend                                   │
│                                                          │
│  100% ┤                                    ●             │
│   80% ┤              ●        ●      ●                   │
│   60% ┤        ●                                         │
│   40% ┤  ●                                               │
│   20% ┤                                                  │
│    0% └──────────────────────────────────────────────────│
│       Jan 1    Jan 8    Jan 15   Jan 22   Jan 29        │
└──────────────────────────────────────────────────────────┘
```

#### Section 3: ⏱️ Time Tracking & Learning (⭐ KILLER FEATURE)
```
┌──────────────────────────────────────────────────────────┐
│  ⏱️ Time Tracking & Learning                             │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Your Time Blindness Pattern                       │ │
│  │                                                     │ │
│  │  Average Buffer: 2.0x                              │ │
│  │  You underestimate by 100%                         │ │
│  │                                                     │ │
│  │  ┌──────────┬──────────┬──────────┐               │ │
│  │  │Underest. │ Accurate │ Overest. │               │ │
│  │  │    8     │    2     │    0     │               │ │
│  │  └──────────┴──────────┴──────────┘               │ │
│  │                                                     │ │
│  │  🤖 What the Agent is Doing:                       │ │
│  │  "The agent will automatically add 100% buffer     │ │
│  │  to future estimates based on your history."       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Recent Tasks (Estimated vs Actual):                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Task              │ Estimated │ Actual │ Difference││
│  ├───────────────────┼───────────┼────────┼───────────┤│
│  │ Write proposal    │  2 hours  │ 4 hrs  │  +100%   ││
│  │ Review code       │  1 hour   │ 2 hrs  │  +100%   ││
│  │ Team meeting      │  30 min   │ 30 min │   0%     ││
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

#### Section 4: AI Performance Metrics (Opik Dashboard)
```
┌──────────────────────────────────────────────────────────┐
│  📊 AI Performance Metrics                               │
│                                                          │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │Total Plans│Completed │Completion│Avg Capacity│       │
│  │    12    │  45/60   │   75%    │    75%    │        │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                                                          │
│  Mode Distribution:                                      │
│  RECOVERY    [████░░░░░░] 4 days (33%)                  │
│  BALANCED    [████████░░] 6 days (50%)                  │
│  DEEP WORK   [██░░░░░░░░] 2 days (17%)                  │
│                                                          │
│  💡 Opik tracking is enabled. AI decisions are being    │
│  logged for transparency.                                │
└──────────────────────────────────────────────────────────┘
```

---

### 4. `/integrations` - Connect Your Tools

**What you see:**
```
┌──────────────────────────────────────────────────────────┐
│  Integrations                                            │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  📋 Todoist                                        │ │
│  │                                                     │ │
│  │  Status: ● Connected                               │ │
│  │                                                     │ │
│  │  What this does:                                   │ │
│  │  Automatically imports your to-do list from        │ │
│  │  Todoist so you don't have to manually type tasks. │ │
│  │                                                     │ │
│  │  [Disconnect]                                      │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  📅 Google Calendar                                │ │
│  │                                                     │ │
│  │  Status: ○ Not Connected                           │ │
│  │                                                     │ │
│  │  What this does:                                   │ │
│  │  Syncs your daily plan to Google Calendar so you  │ │
│  │  can see your schedule in your calendar app.       │ │
│  │                                                     │ │
│  │  [Connect Google Calendar]                         │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**How to connect Todoist:**
1. Click "Connect Todoist"
2. Login to Todoist in popup window
3. Click "Authorize"
4. Done! Your tasks will now appear in plan generation

**How to connect Google Calendar:**
1. Click "Connect Google Calendar"
2. Login to Google in popup window
3. Click "Allow"
4. Done! When you generate a plan, you can click "Sync to Calendar"

---

### 5. `/goals` - Long-Term Goals

**What you see:**
```
┌──────────────────────────────────────────────────────────┐
│  Goals                                                   │
│                                                          │
│  [+ Add New Goal]                                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  🎯 Launch MVP by Q2                               │ │
│  │  Category: Work                                    │ │
│  │  Target: March 31, 2024                            │ │
│  │                                                     │ │
│  │  Description: Complete and launch the minimum      │ │
│  │  viable product for the productivity app.          │ │
│  │                                                     │ │
│  │  [Edit] [Delete]                                   │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

**What goals do:**
- When AI generates your plan, it considers your goals
- AI adds context: "Today's tasks align with your goal of 'Launch MVP by Q2'"
- Helps prioritize tasks that move you toward your goals

---

## 🤖 What the AI Actually Does (Honest Breakdown)

### The AI (Gemini) Does 2 Things:
1. **Writes encouraging messages** about your plan
2. **Suggests mode changes** (e.g., "Consider recovery mode")

### The REAL Intelligence (Math, Not AI):

#### 1. Time Blindness Learning (Pure Math)
```
Step 1: Track Reality
You estimated: 60 minutes
Actually took: 120 minutes

Step 2: Calculate Buffer
120 ÷ 60 = 2.0x buffer

Step 3: Apply to Future
Next task you estimate 60 minutes
→ App schedules 120 minutes (60 × 2.0)
```

#### 2. Productivity Windows (Data Analysis)
```
Step 1: Track Completion Rates
9am: Completed 17/20 tasks = 85% completion rate
3pm: Completed 9/20 tasks = 45% completion rate

Step 2: Schedule Intelligently
High priority task → Schedule at 9am (85% success rate)
Low priority task → Schedule at 3pm (45% success rate)
```

#### 3. Capacity Adjustment (Formula)
```
Step 1: Calculate Capacity
Energy: 8/10
Sleep: 7/10
Stress: 3/10 (low is good)
→ Capacity = 75%

Step 2: Adjust Workload
Normal workday: 8 hours
75% capacity: 8 × 0.75 = 6 hours
→ Only schedule 6 hours of work
```

---

## 🔍 How to Verify It's Real (Test It Yourself)

### Test 1: Check-In Works (2 minutes)
1. Go to `/checkin`
2. Move sliders: Energy 8, Sleep 7, Stress 3
3. Select mood: "Great"
4. Click "Submit Check-In"
5. **Expected:** See "Check-in saved! Capacity: 75%"

### Test 2: Plan Generation Works (3 minutes)
1. Go to `/integrations` → Connect Todoist (or skip if no Todoist)
2. Go to `/plan` → Click "Generate Plan"
3. **Expected:** See list of tasks with times and reasoning
4. **Look for:** "+X% buffer based on your history" in task descriptions

### Test 3: Time Tracking Works (5 minutes)
1. Go to `/plan`
2. Check a task as complete (click checkbox)
3. Go to `/analytics`
4. Scroll to "Time Tracking & Learning"
5. **Expected:** See task in "Recent Tasks" table with estimated vs actual time

### Test 4: Opik Dashboard Works (1 minute)
1. Go to `/analytics`
2. Scroll to "AI Performance Metrics"
3. **Expected:** See:
   - Total Plans: X
   - Tasks Completed: X/Y
   - Completion Rate: X%
   - Mode Distribution chart

---

## ❓ Common Questions

### Q: Where do I see the "2x buffer" learning?
**A:** Go to `/analytics` → Scroll to "Time Tracking & Learning" section → See "Average Buffer: 2.0x"

### Q: Where do I see my Todoist tasks?
**A:** Go to `/plan` → Click "Generate Plan" → Tasks from Todoist appear in the plan

### Q: Where do I see the AI's reasoning?
**A:** Go to `/plan` → Each task has a "💡 Why scheduled here" section explaining the decision

### Q: Where do I see Opik tracking?
**A:** Go to `/analytics` → Scroll to "AI Performance Metrics" section at the bottom

### Q: How do I know if it's learning?
**A:** 
1. Complete tasks for a few days (mark checkboxes on `/plan`)
2. Go to `/analytics` → Check "Average Buffer"
3. If it says "2.0x" → App learned you take 2x longer
4. Generate new plan → Tasks will have "+100% buffer" in reasoning

### Q: What if I don't have Todoist?
**A:** You can still use the app! You'll need to manually add tasks (feature exists in code but needs UI polish)

---

## 🎯 The Bottom Line

### What's Real:
✅ Check-in system works
✅ Capacity calculation works
✅ Plan generation works
✅ Time tracking code exists
✅ Auto-scheduler code exists
✅ Todoist integration works
✅ Google Calendar integration works
✅ Opik tracking works
✅ Analytics display works

### What Needs Testing:
⚠️ Time tracking in UI (need to complete tasks to see it)
⚠️ Learning buffers (need historical data)
⚠️ Productivity windows (need completion data)

### What's Not Done:
❌ Automatic rescheduling (incomplete tasks don't auto-move to tomorrow)
❌ Proactive alerts (no notifications about patterns)
❌ Demo data (no sample data to show off features immediately)

### Can You Win a Hackathon With This?
**YES, if you:**
1. Test it thoroughly (run through the test steps above)
2. Create demo data to show the learning (optional but helpful)
3. Make a clear video showing: Problem → Solution → Proof
4. Polish the UI (loading states, smooth transitions)

**The time blindness learning is UNIQUE and VALUABLE.** No other productivity app does this. But you need to demonstrate it clearly.

---

## 🚀 Next Steps

1. **Test the basics** (30 minutes)
   - Run through Test 1-4 above
   - Verify everything displays correctly

2. **Generate real data** (3 days)
   - Do check-ins daily
   - Generate plans daily
   - Complete tasks (mark checkboxes)
   - Watch the learning happen

3. **OR create demo data** (2 hours)
   - Generate fake historical data
   - Show the learning immediately
   - Better for hackathon demo

4. **Make a video** (1 hour)
   - Show the problem (time blindness)
   - Show the solution (auto-scheduler)
   - Show the proof (analytics page)

**Want help with any of these?** Just ask.
