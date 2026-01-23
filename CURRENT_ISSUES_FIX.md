# Current Issues & Fixes

## Issue 1: Google Calendar OAuth Error ❌

**Error**: `Error 400: redirect_uri_mismatch`

### Quick Fix
1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   http://localhost:3000/api/integrations/google-calendar/callback
   ```
4. Click **Save**
5. Wait 2-3 minutes for changes to propagate
6. Try connecting again

**Detailed guide**: See `GOOGLE_OAUTH_FIX.md`

---

## Issue 2: Plan Generation Still Failing ❌

**Error**: "Failed to generate plan"

### Most Likely Cause: Server Not Restarted

The code was fixed, but your dev server needs to restart to load the changes.

### Fix Steps:

#### 1. Stop Your Dev Server
In the terminal where `npm run dev` is running:
```bash
# Press Ctrl+C
```

#### 2. Restart Dev Server
```bash
npm run dev
```

Wait for the "Ready" message.

#### 3. Hard Refresh Browser
```bash
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R
```

#### 4. Try Generating Plan Again
1. Go to http://localhost:3000/plan
2. Click "Generate Plan"
3. **Watch your terminal** for any error messages

### If Still Failing: Get the Actual Error

**Option A: Check Terminal**
Look at your terminal where `npm run dev` is running. When you click "Generate Plan", you'll see the actual error message.

**Option B: Check Browser Console**
1. Press F12 to open DevTools
2. Go to Console tab
3. Click "Generate Plan"
4. Look for error messages in red

**Option C: Run Test Script**
```bash
npx tsx scripts/test-plan-generation.ts
```

This will show you exactly what's happening.

### Common Errors & Solutions

| Error Message | Solution |
|--------------|----------|
| `models/gemini-pro is not found` | Server not restarted - restart dev server |
| `No check-in found for today` | Go to /checkin and complete check-in |
| `No tasks available` | Connect Todoist at /integrations |
| `GEMINI_API_KEY not configured` | Check .env file has GEMINI_API_KEY |
| `Database connection error` | Check DATABASE_URL in .env |

---

## Quick Verification Checklist

Before generating a plan, verify:

- [ ] Dev server is running (`npm run dev`)
- [ ] Server was restarted after code changes
- [ ] Check-in completed for today (go to /checkin)
- [ ] Todoist is connected (go to /integrations)
- [ ] Browser cache cleared (hard refresh)

---

## Need More Help?

### Run the Diagnostic
```bash
npx tsx scripts/diagnose-plan-error.ts
```

This will check:
- ✅ Database connection
- ✅ User exists
- ✅ Check-in completed
- ✅ Integrations connected
- ✅ Environment variables set

### Share Error Details
If still not working, share:
1. The exact error from your terminal (where `npm run dev` is running)
2. The error from browser console (F12 → Console)
3. Output from the diagnostic script above

This will help identify the exact issue!
