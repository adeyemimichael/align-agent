# Testing Plan Generation

## Issue
Plan generation is still failing after the fix.

## Possible Causes

### 1. Server Not Restarted
The most common issue - the dev server needs to be restarted to load the updated code.

**Solution**:
```bash
# In your terminal where npm run dev is running:
# Press Ctrl+C to stop the server
# Then restart:
npm run dev
```

### 2. Check Server Logs
When you click "Generate Plan", look at your terminal where `npm run dev` is running. You should see:
- Any error messages
- The actual error from Gemini API
- Database queries

**What to look for**:
- ❌ `models/gemini-pro is not found` → Server not restarted
- ❌ `No check-in found` → Need to complete check-in first
- ❌ `No tasks available` → Need to connect Todoist or add tasks
- ✅ `Plan generated successfully` → It's working!

### 3. Browser Cache
Sometimes the browser caches the old error response.

**Solution**:
```bash
# Hard refresh in browser:
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R

# Or open DevTools (F12) and:
# Right-click the refresh button → "Empty Cache and Hard Reload"
```

## Step-by-Step Troubleshooting

### Step 1: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

Wait for it to fully start (you'll see "Ready" message).

### Step 2: Check Your Check-in
Go to http://localhost:3000/checkin and verify you have a check-in for today.

### Step 3: Verify Todoist Connection
Go to http://localhost:3000/integrations and check if Todoist shows "Connected".

### Step 4: Try Generating Plan
1. Go to http://localhost:3000/plan
2. Click "Generate Plan"
3. **Watch your terminal** for error messages

### Step 5: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any error messages
4. Go to Network tab
5. Find the `/api/plan/generate` request
6. Click on it and check the Response

## Manual Test

Run this command to test plan generation directly:

```bash
npx tsx scripts/test-plan-generation.ts
```

This will show you exactly what's happening without the browser.

## Expected Success Output

When it works, you should see in your terminal:
```
✅ Plan generated successfully!
📋 Plan Details:
Overall Reasoning: Given your current capacity score...
Scheduled Tasks:
1. Task name (time - time)
2. Task name (time - time)
...
```

## Still Not Working?

If you've done all the above and it's still failing:

1. **Share the exact error message** from your terminal
2. **Share the browser console error** (F12 → Console tab)
3. **Run the diagnostic**:
   ```bash
   npx tsx scripts/diagnose-plan-error.ts
   ```

The error message will tell us exactly what's wrong!
