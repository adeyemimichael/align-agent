# Debug Plan Generation Error

## You're seeing: 500 Internal Server Error

This means the server is crashing when trying to generate the plan. The actual error message is in your **server terminal** (where `npm run dev` is running).

## Step 1: Check Your Server Terminal

Look at the terminal where you ran `npm run dev`. When you clicked "Generate Plan", you should see error messages there.

**Look for lines that say**:
- `Plan generation error:`
- `Gemini AI error:`
- `Error:`
- Any red text or stack traces

## Step 2: Common Errors & Solutions

### Error: "No tasks available"
**Cause**: No tasks from Todoist or existing plans

**Solution**: 
The diagnostic showed Todoist is connected, but maybe there are no tasks in your Todoist account.

**Quick fix**:
1. Go to https://todoist.com
2. Add a few tasks (any tasks)
3. Try generating plan again

OR run this to see if tasks are being fetched:
```bash
# This will show if Todoist tasks are accessible
curl http://localhost:3000/api/integrations/todoist/tasks \
  -H "Cookie: $(cat .cookies)" \
  -v
```

### Error: "models/gemini-2.5-flash is not found"
**Cause**: Server didn't restart properly

**Solution**:
```bash
# Kill the server completely
pkill -f "next dev"

# Restart
npm run dev
```

### Error: "GEMINI_API_KEY not configured"
**Cause**: Environment variable not loaded

**Solution**:
```bash
# Verify it's in .env
grep GEMINI_API_KEY .env

# Should show:
# GEMINI_API_KEY="AIzaSyDy3ADoaVtQd7c1SNv_Gz7XH1tH4EQ7E4A"
```

### Error: "No check-in found for today"
**Cause**: Check-in expired or wrong date

**Solution**:
1. Go to http://localhost:3000/checkin
2. Complete a new check-in
3. Try generating plan again

## Step 3: Get Detailed Error

Run this command to see exactly what's failing:

```bash
npx tsx scripts/test-plan-generation.ts
```

This will show the full error with stack trace.

## Step 4: Share the Error

If you're still stuck, share:
1. The error from your server terminal (where `npm run dev` is running)
2. The output from `npx tsx scripts/test-plan-generation.ts`

I can then tell you exactly what's wrong!

## Quick Checklist

Before generating a plan, verify:

- [ ] Server is running (`npm run dev`)
- [ ] You see "Ready" in the terminal
- [ ] You completed a check-in today
- [ ] You have tasks in Todoist (or at least 1 task)
- [ ] You're logged in to the app

## Most Likely Issue

Based on the diagnostic showing Todoist is connected but you have no plans yet, the most likely issue is:

**You have no tasks in your Todoist account**

The plan generator needs tasks to schedule. If your Todoist is empty, it will fail with "No tasks available".

**Quick fix**:
1. Go to https://todoist.com
2. Add 3-5 tasks (anything like "Review emails", "Write report", etc.)
3. Go back to your app
4. Try generating plan again

---

**The actual error message in your server terminal will tell us exactly what's wrong!**
