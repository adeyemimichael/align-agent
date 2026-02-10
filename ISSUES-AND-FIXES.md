# Current Issues and Fixes

## Issue 1: Gemini AI Showing "Not Connected"

**Problem**: The integrations page shows Gemini as "Not Connected" even though `GEMINI_API_KEY` is set in your `.env` file.

**Root Cause**: The `/api/ai/status` endpoint checks for `process.env.GEMINI_API_KEY`, but this only works if the environment variable is actually loaded in the production environment.

**Fixes Needed**:

1. **In Vercel Dashboard**:
   - Go to: https://vercel.com/your-project/settings/environment-variables
   - Add `GEMINI_API_KEY` with value: `AIzaSyCElNWOqLEK4v50gQLXm49e1JHDq1OIr7U`
   - Make sure it's set for **Production** environment (not just Preview/Development)
   - Click "Save"
   - **IMPORTANT**: After saving, you MUST redeploy for changes to take effect

2. **Redeploy**:
   - Go to Deployments tab
   - Click "..." on latest deployment → "Redeploy"
   - OR push a new commit to trigger automatic deployment

3. **Verify**:
   - After redeployment, visit: `https://align-alpha.vercel.app/api/debug/ai-env`
   - Should show: `gemini.exists: true`

---

## Issue 2: "AI Not Available" Error When Generating Plans

**Problem**: When trying to generate a plan, you get "AI not available" error both locally and in production.

**Root Cause**: The `GeminiClient` constructor throws an error if `GEMINI_API_KEY` is not found:

```typescript
constructor(apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new AIServiceError('GEMINI_API_KEY not configured');
  }
  // ...
}
```

**Why It Happens Locally**:
- Your `.env` file has `GEMINI_API_KEY` set
- BUT Next.js might not be loading it properly
- OR the dev server needs to be restarted

**Fixes**:

### For Local Development:
```bash
# 1. Stop the dev server (Ctrl+C)

# 2. Verify the env variable is set
cat .env | grep GEMINI_API_KEY

# 3. Restart the dev server
npm run dev

# 4. Test the API
curl http://localhost:3000/api/ai/status
```

### For Production:
- Same as Issue 1 - set the environment variable in Vercel and redeploy

---

## Issue 3: New Email Not Authorized for OAuth

**Problem**: When trying to sign in with a different email, you get "email was not assigned for OAuth authentication" error.

**Root Cause**: Google OAuth is configured in "Testing" mode, which only allows specific test users.

**Fix**:

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/apis/credentials/consent
   - Select your project

2. **Change Publishing Status**:
   - Find "OAuth consent screen" in the left sidebar
   - Click "PUBLISH APP" button
   - Confirm the publishing

3. **OR Add Test Users** (if you want to keep it in testing mode):
   - Stay in "OAuth consent screen"
   - Scroll to "Test users" section
   - Click "ADD USERS"
   - Add the email addresses you want to allow
   - Click "SAVE"

**Note**: Publishing the app allows ANY Google account to sign in. If you only want specific users, keep it in testing mode and add them as test users.

---

## Issue 4: Calendar Connected But Not Showing on Goals Page

**Problem**: Google Calendar shows as "connected" but events don't appear on the goals page.

**Root Cause**: The goals page fetches calendar events from `/api/integrations/google-calendar/events`, but this might be failing silently.

**Debug Steps**:

1. **Check if calendar is actually connected**:
   ```bash
   # Visit this URL in your browser (while logged in)
   https://align-alpha.vercel.app/api/user/integrations
   ```
   - Should show `google_calendar` in the list with `connected: true`

2. **Check if events endpoint works**:
   ```bash
   # Visit this URL (while logged in)
   https://align-alpha.vercel.app/api/integrations/google-calendar/events
   ```
   - Should return a list of events or an error message

3. **Check browser console**:
   - Open goals page
   - Press F12 to open developer tools
   - Go to "Console" tab
   - Look for any error messages related to calendar

**Possible Fixes**:

- **If no events today**: The goals page only shows TODAY's events. If you have no events today, it will show "No events today"
- **If calendar not actually connected**: Go to /integrations page and reconnect Google Calendar
- **If token expired**: Disconnect and reconnect Google Calendar

---

## Quick Fix Commands

### 1. Restart Local Dev Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 2. Check Environment Variables Locally
```bash
npx tsx scripts/check-production-env.ts
```

### 3. Test AI Status Locally
```bash
curl http://localhost:3000/api/ai/status
```

### 4. Test AI Status in Production
```bash
curl https://align-alpha.vercel.app/api/ai/status
```

### 5. Push Changes to Production
```bash
git add .
git commit -m "fix: Environment configuration"
git push main main
```

---

## Summary of Actions Needed

1. ✅ **Set GEMINI_API_KEY in Vercel** (Production environment)
2. ✅ **Set OPIK_API_KEY in Vercel** (Production environment)
3. ✅ **Redeploy in Vercel** after setting environment variables
4. ✅ **Publish Google OAuth app** OR add test users
5. ✅ **Restart local dev server** to reload environment variables
6. ✅ **Test calendar connection** on goals page

---

## Verification Checklist

After making changes, verify:

- [ ] Visit `/api/ai/status` - should show `gemini.configured: true`
- [ ] Visit `/api/debug/ai-env` - should show API keys exist
- [ ] Try generating a plan - should work without "AI not available" error
- [ ] Try signing in with new email - should work
- [ ] Check goals page - should show calendar events if you have any today
- [ ] Check integrations page - should show Gemini and Opik as "Connected"
