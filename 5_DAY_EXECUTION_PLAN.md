# 5-Day Real AI Agent Build Plan

## Goal
Build a REAL AI agent that people can actually use, not just demo fluff.

## Core Features (Must Have)
1. ✅ AI schedules tasks (not math)
2. ✅ Email notifications check completion
3. ✅ AI learns from responses
4. ✅ Works end-to-end

## Day-by-Day Plan

### Day 1 (Today): Test & Fix Current System
**Goal:** Make sure what exists actually works

**Tasks:**
1. Run the app (`npm run dev`)
2. Test check-in flow
3. Test plan generation
4. Fix any broken features
5. Verify Todoist integration works
6. Test time tracking

**Output:** Working baseline app

---

### Day 2: AI-Driven Scheduling
**Goal:** Replace math with real AI decisions

**Tasks:**
1. Update `lib/gemini.ts` - Add AI scheduling method
2. Give AI full context (tasks, history, capacity, productivity)
3. AI returns: scheduled tasks with times and reasoning
4. Update `lib/auto-scheduler.ts` to use AI
5. Test with real tasks

**Output:** AI makes actual scheduling decisions

---

### Day 3: Email Notifications
**Goal:** Proactive agent that checks on you

**Tasks:**
1. Set up email service (Resend or SendGrid)
2. Create notification system
3. Send email at task end time: "Did you finish X?"
4. User clicks link: "Yes" / "No, still working" / "Skipped"
5. Record response in database

**Output:** Agent asks if you finished tasks

---

### Day 4: AI Learning Loop
**Goal:** AI learns from what actually happened

**Tasks:**
1. Collect completion data (scheduled vs actual)
2. Send to AI for analysis
3. AI identifies patterns
4. Store insights
5. Use insights in next day's scheduling

**Output:** AI adapts based on your behavior

---

### Day 5: Polish & Deploy
**Goal:** Make it launchable

**Tasks:**
1. Fix UI bugs
2. Add loading states
3. Write clear onboarding
4. Deploy to Vercel
5. Test with real users
6. Create demo video

**Output:** Live product people can use

---

## What We're Building

### The Flow:
```
Morning:
1. User does check-in
2. AI generates plan (real AI decisions)
3. User sees schedule with AI reasoning

During Day:
4. At task end time: Email "Did you finish X?"
5. User responds: Yes/No/Skipped
6. System records actual time

Next Morning:
7. AI analyzes yesterday's data
8. AI adjusts today's schedule based on learning
9. Repeat
```

### The AI Does:
- **Scheduling:** Decides when to schedule each task
- **Time Estimation:** Adjusts estimates based on history
- **Learning:** Analyzes patterns and adapts
- **Communication:** Explains decisions clearly

### The User Gets:
- **Realistic schedules:** Based on their actual behavior
- **Proactive check-ins:** Agent asks if tasks are done
- **Visible learning:** See how AI adapts over time
- **Less stress:** Stop overcommitting

---

## Technical Stack

### AI:
- Gemini 2.5 Flash (scheduling decisions)
- Opik (tracking all AI calls)

### Notifications:
- Resend (email service - free tier)
- Unique links for responses

### Database:
- PostgreSQL (already set up)
- Store: completions, responses, AI insights

### Deployment:
- Vercel (frontend + API)
- Vercel Postgres (database)

---

## Success Criteria

### Must Work:
1. ✅ User can check in
2. ✅ AI generates schedule
3. ✅ User receives email notifications
4. ✅ User can respond to notifications
5. ✅ AI learns and adapts

### Must Show:
1. ✅ AI reasoning for each decision
2. ✅ Learning over time (before/after)
3. ✅ Actual behavior vs planned
4. ✅ Opik tracking of AI decisions

---

## What We're NOT Building

❌ Automatic rescheduling (too complex)
❌ Push notifications (email is enough)
❌ Mobile app (web is enough)
❌ Advanced analytics (basic is enough)
❌ Multiple notification channels (email only)

---

## Risk Mitigation

### If AI scheduling is unreliable:
- Fallback to math-based scheduling
- Use AI for adjustments only

### If email notifications fail:
- Show in-app notifications
- User can manually mark complete

### If learning is slow:
- Start with demo data
- Show potential with examples

---

## Day 1 Starts NOW

First task: Test the current app and fix what's broken.

Ready?
