# Vercel Environment Variables Setup

## Step-by-Step Instructions

### 1. Access Vercel Dashboard
Go to: https://vercel.com/your-project/settings/environment-variables

### 2. Copy Variables from Local .env

You need to copy ALL environment variables from your local `.env` file to Vercel.

**IMPORTANT**: For each variable:
1. Click "Add New"
2. Set Environment: **Production** (uncheck Preview and Development)
3. Copy the EXACT value from your `.env` file
4. Click "Save"

### 3. Critical Variables to Set

Make sure these are set in Vercel Production:

- `DATABASE_URL` - Your Supabase connection string
- `NEXTAUTH_URL` - **MUST BE**: `https://align-alpha.vercel.app` (NOT localhost!)
- `NEXTAUTH_SECRET` - Same as local
- `ENCRYPTION_KEY` - Same as local
- `GOOGLE_CLIENT_ID` - Same as local
- `GOOGLE_CLIENT_SECRET` - Same as local
- `GEMINI_API_KEY` - Same as local (this fixes "AI not available")
- `TODOIST_CLIENT_ID` - Same as local
- `TODOIST_CLIENT_SECRET` - Same as local
- `OPIK_API_KEY` - Same as local (this fixes "Opik not connected")
- `OPIK_WORKSPACE` - Same as local
- `OPIK_PROJECT_NAME` - Same as local
- `RESEND_API_KEY` - Same as local
- `EMAIL_FROM` - Same as local

### 4. The ONE Variable That's Different

**NEXTAUTH_URL** is the ONLY variable that should be different:
- Local: `http://localhost:3000`
- Production: `https://align-alpha.vercel.app`

All other variables should be EXACTLY the same as your local `.env` file.

### 5. After Adding All Variables

1. **Redeploy**: 
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

2. **Wait**: 
   - Wait for deployment to complete (2-3 minutes)

3. **Verify**: 
   - Visit: `https://align-alpha.vercel.app/api/debug/ai-env`
   - Should show: `gemini.exists: true` and `opik.exists: true`

4. **Test**:
   - Try logging in
   - Try generating a plan
   - Check integrations page

---

## Quick Copy Command

To see all your local environment variables:

```bash
cat .env
```

Then copy each value to Vercel manually.

---

## Verification Checklist

After redeployment, check these URLs:

- [ ] `https://align-alpha.vercel.app/api/ai/status`
  - Should show: `gemini.configured: true` and `opik.configured: true`

- [ ] `https://align-alpha.vercel.app/api/debug/ai-env`
  - Should show: `gemini.exists: true` and `opik.exists: true`

- [ ] `https://align-alpha.vercel.app/login`
  - Should allow Google sign-in without errors

- [ ] `https://align-alpha.vercel.app/plan`
  - Should generate plans without "AI not available" error

- [ ] `https://align-alpha.vercel.app/integrations`
  - Should show Gemini and Opik as "Connected"

---

## OAuth Redirect URIs

Make sure these are configured in their respective consoles:

### Google OAuth Console
- `https://align-alpha.vercel.app/api/auth/callback/google`
- `https://align-alpha.vercel.app/api/integrations/google-calendar/callback`

### Todoist App Console
- `https://align-alpha.vercel.app/api/integrations/todoist/callback`

---

## Common Issues

**Issue**: "AI not available" error
**Fix**: Make sure `GEMINI_API_KEY` is set in Vercel Production and redeploy

**Issue**: "Gemini not connected" on integrations page
**Fix**: Same as above - set `GEMINI_API_KEY` and redeploy

**Issue**: "Opik not connected" on integrations page
**Fix**: Set `OPIK_API_KEY` in Vercel Production and redeploy

**Issue**: Can't sign in with new email
**Fix**: Publish your Google OAuth app or add the email as a test user

**Issue**: Calendar not showing events
**Fix**: Make sure you have events today, or check browser console for errors
