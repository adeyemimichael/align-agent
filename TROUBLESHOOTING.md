# Troubleshooting Guide

## Issues Identified

### 1. Google Calendar Connection Error (Failed to fetch)
**Problem:** When clicking "Connect Google Calendar" in the integrations page, you get a "TypeError: Failed to fetch" error.

**Root Cause:** The issue is that your `.env` file has `NEXTAUTH_URL="http://localhost:3000"` but you're trying to use this on a live/deployed site.

**Solution:**
Update your `.env` file with your actual deployed URL:
```env
NEXTAUTH_URL="https://your-actual-domain.vercel.app"
```

Also update the Google OAuth redirect URI in Google Cloud Console:
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Add your deployed URL to "Authorized redirect URIs":
   - `https://your-actual-domain.vercel.app/api/auth/callback/google`
   - `https://your-actual-domain.vercel.app/api/integrations/google-calendar/callback`

---

### 2. AI Planning Insights Not Activated
**Problem:** The AI planning feature shows "AI not available temporarily" even though you have a Gemini API key configured.

**Root Cause:** The integrations page checks for `process.env.GEMINI_API_KEY` on the **client side**, but environment variables prefixed with `NEXT_PUBLIC_` are the only ones accessible in client-side code. Your `GEMINI_API_KEY` is server-side only.

**Current Code Issue (app/integrations/page.tsx:112):**
```typescript
connected: !!process.env.GEMINI_API_KEY,  // This is always undefined on client
```

**Solution:**
You need to check AI availability from the server side. Here's how to fix it:

1. Create an API endpoint to check AI status
2. Fetch this status from the client
3. Display the correct status

---

### 3. Sign-in Issues with Live Link
**Problem:** The live link is not signing in using the URI link you configured.

**Root Cause:** Same as issue #1 - your `NEXTAUTH_URL` is set to `localhost:3000` but you're trying to use it on a deployed site.

**Solution:**
1. Update `NEXTAUTH_URL` in your environment variables (both `.env` and Vercel dashboard)
2. Update Google OAuth settings to include your deployed domain
3. Redeploy your application

---

## Where AI is Used in This Project

### 1. **Daily Plan Generation** (`lib/gemini.ts` + `app/api/plan/generate/route.ts`)
- **Function:** `generateDailyPlan()`
- **Purpose:** Creates an intelligent daily schedule based on:
  - Your capacity score (energy, sleep, stress)
  - Historical completion patterns
  - Task priorities and due dates
  - Time blindness compensation
  - Productivity windows
  - Skip risk prediction
  - Momentum state

### 2. **AI-Driven Task Scheduling** (`lib/gemini.ts`)
- **Function:** `scheduleTasksWithAI()`
- **Purpose:** Makes actual scheduling decisions with:
  - Time buffer adjustments based on your history
  - Peak productivity hour scheduling
  - Skip risk mitigation
  - Momentum-aware planning

### 3. **Capacity Insights** (`lib/gemini.ts`)
- **Function:** `getCapacityInsights()`
- **Purpose:** Analyzes your capacity trends and provides recommendations

### 4. **Check-in Notifications** (`lib/gemini.ts`)
- **Function:** `generateCheckInNotification()`
- **Purpose:** Creates context-aware check-in messages based on:
  - Task status
  - Progress vs schedule
  - Momentum state
  - User's preferred tone (gentle/direct/minimal)

### 5. **Re-scheduling Recommendations** (`lib/gemini.ts`)
- **Function:** `generateRescheduleRecommendation()`
- **Purpose:** Analyzes mid-day progress and suggests adjustments

### 6. **Skip Risk Explanations** (`lib/gemini.ts`)
- **Function:** `explainSkipRisk()`
- **Purpose:** Explains why a task has high skip risk

### 7. **Momentum Interventions** (`lib/gemini.ts`)
- **Function:** `explainMomentumIntervention()`
- **Purpose:** Explains momentum-based system recommendations

### 8. **Auto-Scheduler Integration** (`lib/auto-scheduler.ts`)
- Uses Gemini AI to make intelligent scheduling decisions
- Applies learned patterns from your history
- Considers all adaptive features (time blindness, productivity windows, etc.)

### 9. **Reschedule Engine** (`lib/reschedule-engine.ts`)
- Uses AI to analyze current progress
- Generates new schedules when you're ahead/behind
- Adapts to momentum changes

---

## Quick Fix Checklist

### For Deployed Site:
- [ ] Update `NEXTAUTH_URL` in Vercel environment variables to your actual domain
- [ ] Update Google OAuth redirect URIs in Google Cloud Console
- [ ] Redeploy the application
- [ ] Test sign-in flow
- [ ] Test Google Calendar connection

### For AI Status Display:
- [ ] Create `/api/ai/status` endpoint to check if Gemini is configured
- [ ] Update integrations page to fetch AI status from server
- [ ] Display correct status based on server response

---

## Environment Variables Checklist

Make sure these are set in your Vercel dashboard (or wherever you're deploying):

```env
# CRITICAL - Must match your deployed domain
NEXTAUTH_URL="https://your-actual-domain.vercel.app"

# Database
DATABASE_URL="your-database-url"

# Auth
NEXTAUTH_SECRET="your-secret"
ENCRYPTION_KEY="your-encryption-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# AI (Server-side only)
GEMINI_API_KEY="your-gemini-key"

# Optional integrations
TODOIST_CLIENT_ID="your-todoist-id"
TODOIST_CLIENT_SECRET="your-todoist-secret"
OPIK_API_KEY="your-opik-key"
OPIK_WORKSPACE="your-workspace"
RESEND_API_KEY="your-resend-key"
```

---

## Testing After Fixes

1. **Test Sign-in:**
   - Visit your deployed site
   - Click "Sign in with Google"
   - Should redirect to Google OAuth
   - Should redirect back to your dashboard

2. **Test Google Calendar:**
   - Go to Integrations page
   - Click "Connect Google Calendar"
   - Should redirect to Google OAuth
   - Should redirect back with success message

3. **Test AI Planning:**
   - Complete a check-in
   - Go to Plan page
   - Click "Generate Plan"
   - Should see AI-generated schedule with reasoning

---

## Need More Help?

If issues persist after these fixes:
1. Check browser console for specific error messages
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Test OAuth flow step by step
5. Check Google Cloud Console for any API restrictions
