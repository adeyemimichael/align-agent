# AI Features in Adaptive Productivity Agent

## Overview
This application uses Google's Gemini AI (gemini-2.0-flash-001) to provide intelligent, adaptive productivity features. The AI learns from your patterns and makes personalized recommendations.

---

## 🧠 Core AI Features

### 1. Intelligent Daily Planning
**File:** `lib/gemini.ts` → `generateDailyPlan()`
**API:** `POST /api/plan/generate`

**What it does:**
- Analyzes your capacity score (energy, sleep, stress)
- Reviews your historical completion patterns
- Considers task priorities and due dates
- Applies time blindness compensation
- Schedules tasks during your peak productivity hours
- Predicts skip risk for each task
- Adjusts for your current momentum state

**Example AI reasoning:**
```
"Based on your capacity score of 65/100 and balanced mode, I've scheduled 
5 high-priority tasks during your peak hours (9-11am). Applied 1.3x time 
buffer based on your history. Deferred 2 low-priority tasks due to medium 
skip risk. Total: 5 hours of 6 available."
```

---

### 2. AI-Driven Task Scheduling
**File:** `lib/gemini.ts` → `scheduleTasksWithAI()`
**Used by:** `lib/auto-scheduler.ts`

**What it does:**
- Makes actual scheduling decisions (not just suggestions)
- Applies learned time buffers from your history
- Schedules demanding tasks during peak hours
- Avoids scheduling during low-energy periods
- Considers skip risk when ordering tasks
- Adjusts complexity based on momentum

**Adaptive Context Used:**
- ✅ Time blindness patterns (average buffer: 1.3x)
- ✅ Productivity windows (9am = 85% completion rate)
- ✅ Skip risk levels (high/medium/low)
- ✅ Momentum state (strong/normal/weak/collapsed)
- ✅ Current progress (ahead/behind schedule)

---

### 3. Capacity Insights
**File:** `lib/gemini.ts` → `getCapacityInsights()`
**API:** `GET /api/capacity/insights`

**What it does:**
- Analyzes your capacity trends over time
- Identifies patterns in your energy levels
- Provides personalized recommendations
- Suggests adjustments to your routine

**Example insight:**
```
"Your capacity has been declining over the past 3 days (75 → 68 → 62). 
This suggests you may need more recovery time. Consider scheduling lighter 
tasks tomorrow and prioritizing sleep tonight."
```

---

### 4. Smart Check-in Notifications
**File:** `lib/gemini.ts` → `generateCheckInNotification()`
**Used by:** `lib/intelligent-checkin.ts`

**What it does:**
- Creates context-aware check-in messages
- Adapts tone based on your preferences (gentle/direct/minimal)
- References your current task and progress
- Considers momentum state
- Suggests helpful actions

**Example notifications:**

**Gentle tone (momentum collapsed):**
```
Title: "Hey, just checking in 💙"
Body: "I noticed you're working on 'Write report' and running a bit behind. 
That's totally okay! Would you like to take a quick break or adjust the plan?"
Actions: ["Take 5-min break", "Simplify task", "Defer to tomorrow"]
```

**Direct tone (strong momentum):**
```
Title: "Quick check: Write report"
Body: "You're 15 minutes ahead! Keep the momentum going."
Actions: ["Mark complete", "Continue", "Add next task"]
```

---

### 5. Re-scheduling Recommendations
**File:** `lib/gemini.ts` → `generateRescheduleRecommendation()`
**API:** `POST /api/plan/reschedule`

**What it does:**
- Analyzes mid-day progress
- Determines if re-scheduling is needed
- Suggests specific actions (defer/extend/simplify)
- Provides encouraging messages
- Considers momentum and skip risk

**Example recommendation:**
```
Should Reschedule: Yes

Reasoning: "You're 45 minutes behind schedule with 3 tasks remaining and 
only 2 hours available. Your momentum is weak (2 consecutive skips). 
Recommend simplifying the afternoon plan."

Actions:
- Defer "Low priority task" to tomorrow
- Add 15-minute break before next task
- Simplify "Complex task" by breaking into smaller pieces

Encouragement: "You've completed 3 tasks today - that's progress! Let's 
adjust the plan to set you up for success this afternoon."
```

---

### 6. Skip Risk Explanations
**File:** `lib/gemini.ts` → `explainSkipRisk()`
**Used by:** `components/SkipRiskWarning.tsx`

**What it does:**
- Explains why a task has high skip risk
- Breaks down contributing factors
- Provides user-friendly explanations
- Suggests mitigation strategies

**Example explanation:**
```
"This task has HIGH skip risk (72%) because:
- You're already 30 minutes behind schedule (40% contribution)
- You've skipped similar tasks 3 times this week (25% contribution)
- Your momentum is weak with 2 consecutive skips (20% contribution)
- It's scheduled during a low-energy hour (15% contribution)

Consider moving this to tomorrow morning during your peak hours."
```

---

### 7. Momentum Interventions
**File:** `lib/gemini.ts` → `explainMomentumIntervention()`
**Used by:** `lib/momentum-tracker.ts`

**What it does:**
- Explains momentum-based system changes
- Helps users understand their patterns
- Provides supportive guidance
- Suggests recovery strategies

**Example intervention:**
```
"Your momentum has collapsed after 3 consecutive skips. This is completely 
normal and happens to everyone! The system has simplified your afternoon 
plan to focus on just 1-2 achievable wins. Small victories will help rebuild 
your momentum."
```

---

## 🔄 How AI Learns From You

### Time Blindness Compensation
**Tracked in:** `lib/time-tracking.ts`
**Applied by:** AI scheduling

The AI learns how long tasks actually take you vs. estimates:
- Tracks estimated vs. actual time for each task
- Calculates average buffer (e.g., 1.3x = you take 30% longer)
- Applies this buffer to future scheduling
- Adjusts confidence based on data quality

**Example:**
```
You estimate: 60 minutes
You actually take: 78 minutes
Buffer: 1.3x

Next time AI schedules a 60-min task, it allocates 78 minutes.
```

---

### Productivity Windows
**Tracked in:** `lib/productivity-windows.ts`
**Applied by:** AI scheduling

The AI learns when you're most productive:
- Tracks completion rates by hour of day
- Identifies peak hours (high completion rate)
- Identifies low hours (low completion rate)
- Schedules demanding tasks during peaks

**Example:**
```
9am: 85% completion rate → PEAK (schedule important tasks)
2pm: 45% completion rate → LOW (avoid demanding tasks)
```

---

### Skip Risk Prediction
**Tracked in:** `lib/skip-risk.ts`
**Applied by:** AI scheduling

The AI predicts which tasks you're likely to skip:
- Analyzes schedule delays
- Reviews skip history patterns
- Considers momentum state
- Factors in time of day
- Evaluates task priority

**Risk Levels:**
- 🟢 Low (<40%): Safe to schedule
- 🟡 Medium (40-60%): Add buffer time
- 🔴 High (>60%): Consider deferring

---

### Momentum Tracking
**Tracked in:** `lib/momentum-tracker.ts`
**Applied by:** AI scheduling

The AI monitors your momentum state:
- **Strong:** 3+ early completions → Add more tasks
- **Normal:** Standard planning
- **Weak:** 2+ skips → Add buffer time
- **Collapsed:** 3+ skips → Drastically simplify

---

## 📊 AI Observability (Opik Integration)

**File:** `lib/opik.ts`
**Dashboard:** `app/opik/page.tsx`

All AI decisions are tracked for quality monitoring:
- ✅ Every AI request and response
- ✅ Reasoning quality scores
- ✅ Capacity prediction accuracy
- ✅ Task completion rates
- ✅ User satisfaction metrics

**View your AI metrics:**
1. Go to Integrations page
2. Opik should show "Connected"
3. Visit `/opik` page to see AI performance dashboard
4. Or visit https://www.comet.com/opik to see detailed traces

---

## 🎯 AI Decision Flow

### When You Generate a Plan:

1. **Collect Context**
   - Your capacity score (from check-in)
   - Your tasks (from Todoist)
   - Your goals
   - 7-day history
   - Adaptive learning data

2. **AI Analysis**
   - Gemini analyzes all context
   - Applies learned patterns
   - Makes scheduling decisions
   - Generates reasoning

3. **Apply Adaptations**
   - Time blindness buffers
   - Productivity window scheduling
   - Skip risk mitigation
   - Momentum adjustments

4. **Create Schedule**
   - Ordered task list
   - Specific time blocks
   - Break periods
   - Reasoning for each decision

5. **Sync & Track**
   - Save to database
   - Sync to Google Calendar (optional)
   - Log to Opik for monitoring
   - Track for future learning

---

## 🔧 AI Configuration

### Required Environment Variables:
```env
GEMINI_API_KEY=your-key-here
```

### Optional (for tracking):
```env
OPIK_API_KEY=your-key-here
OPIK_WORKSPACE=your-workspace
OPIK_PROJECT_NAME=adaptive-productivity-agent
```

### Check AI Status:
- Visit `/integrations` page
- Gemini AI should show "Connected"
- Or call `GET /api/ai/status`

---

## 🚀 AI in Action

### Example: Full Day Planning

**Input:**
```json
{
  "capacityScore": 65,
  "mode": "balanced",
  "tasks": [
    { "title": "Write report", "priority": 1, "estimatedMinutes": 90 },
    { "title": "Team meeting", "priority": 2, "estimatedMinutes": 60 },
    { "title": "Code review", "priority": 3, "estimatedMinutes": 45 }
  ],
  "adaptiveContext": {
    "timeBlindness": { "averageBuffer": 1.3 },
    "productivityWindows": { "peakHours": [9, 10, 11] },
    "momentum": { "state": "normal" }
  }
}
```

**AI Output:**
```json
{
  "scheduledTasks": [
    {
      "taskId": "1",
      "title": "Write report",
      "scheduledStart": "2024-01-27T09:00:00Z",
      "scheduledEnd": "2024-01-27T11:00:00Z",
      "adjustedMinutes": 117,
      "reason": "High priority task scheduled at 9am (85% completion rate). 
                Applied 1.3x buffer (90min → 117min) based on your history."
    },
    {
      "taskId": "2",
      "title": "Team meeting",
      "scheduledStart": "2024-01-27T11:15:00Z",
      "scheduledEnd": "2024-01-27T12:30:00Z",
      "adjustedMinutes": 78,
      "reason": "Scheduled after deep work block. Added 30% buffer for meeting prep."
    }
  ],
  "reasoning": "Scheduled 2 high-priority tasks during peak hours (9-11am). 
               Applied time blindness buffer. Deferred code review to afternoon. 
               Total: 3.25 hours of 6 available.",
  "adaptiveInsights": {
    "timeBlindnessApplied": "Applied 1.3x buffer to all estimates",
    "productivityWindowsUsed": "Scheduled demanding tasks at 9-11am (peak hours)",
    "skipRiskMitigation": "All tasks have low skip risk (<40%)",
    "momentumConsideration": "Normal momentum - standard planning applied"
  }
}
```

---

## 📈 Continuous Improvement

The AI gets smarter over time by:
1. ✅ Learning your actual task durations
2. ✅ Identifying your productivity patterns
3. ✅ Predicting skip risk more accurately
4. ✅ Adapting to your momentum changes
5. ✅ Refining scheduling strategies

**The more you use it, the better it gets!**

---

## 🆘 Troubleshooting AI Features

### AI shows "Not Available"
- Check `GEMINI_API_KEY` is set in environment variables
- Verify API key is valid at https://makersuite.google.com/app/apikey
- Check `/api/ai/status` endpoint

### AI reasoning seems generic
- Complete more check-ins to build history
- Use the app for at least a week to gather data
- Connect Todoist for better task context

### Time estimates are off
- The AI learns over time - give it 1-2 weeks
- Mark tasks as complete with actual times
- Review time tracking insights

### Skip risk predictions are inaccurate
- Track task completions consistently
- The AI needs at least 10-15 tasks to learn patterns
- Review skip risk factors in the dashboard

---

## 💡 Pro Tips

1. **Complete check-ins daily** - More data = better AI decisions
2. **Mark tasks complete** - Helps AI learn your patterns
3. **Review AI reasoning** - Understand why decisions were made
4. **Adjust when needed** - AI suggestions are starting points
5. **Give it time** - AI improves with 1-2 weeks of data

---

## 🔗 Related Files

- `lib/gemini.ts` - Core AI client
- `lib/auto-scheduler.ts` - AI-driven scheduling
- `lib/time-tracking.ts` - Time blindness learning
- `lib/productivity-windows.ts` - Peak hours detection
- `lib/skip-risk.ts` - Skip prediction
- `lib/momentum-tracker.ts` - Momentum monitoring
- `lib/opik.ts` - AI observability
- `app/api/plan/generate/route.ts` - Plan generation API
- `app/plan/page.tsx` - Plan UI with AI reasoning display
