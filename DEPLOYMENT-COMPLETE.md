# Deployment Complete - Final Steps

## ✅ What Was Fixed

1. **Build Error** - Excluded scripts from TypeScript compilation
2. **Cron Job Error** - Changed from every minute (`* * * * *`) to daily at 9 AM (`0 9 * * *`)
3. **Todoist OAuth** - Added missing `redirect_uri` parameter
4. **Documentation** - Created comprehensive setup guides

## 🚀 Deployment Status

Your code has been pushed to GitHub and will automatically deploy to Vercel.

**Deployment URL**: https://align-alpha.vercel.app

**Check deployment status**: https://vercel.com/your-project/deployments

---

## ⚠️ CRITICAL: Set Environment Variables

The deployment will complete, but the app won't work until you set environment variables in Vercel.

### Step 1: Go to Vercel Dashboard

Visit: https://vercel.com/your-project/settings/environment-variables

### Step 2: Add Each Variable

For EACH variable in your local `.env` file:

1. Click "Add New"
2. Name: Copy from `.env`
3. Value: Copy from `.env`
4. Environment: Select **Production** only
5. Click "Save"

### Step 3: Change NEXTAUTH_URL

**IMPORTANT**: The ONLY variable that should be different:

- Local: `NEXTAUTH_URL=http://localhost:3000`
- Production: `NEXTAUTH_URL=https://align-alpha.vercel.app`

### Step 4: Redeploy

After adding all variables:

1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait 2-3 minutes

---

## 📋 Required Environment Variables

Make sure ALL of these are set in Vercel Production:

- `DATABASE_URL`
- `NEXTAUTH_URL` (must be `https://align-alpha.vercel.app`)
- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GEMINI_API_KEY` ← Fixes "AI not available"
- `TODOIST_CLIENT_ID`
- `TODOIST_CLIENT_SECRET`
- `OPIK_API_KEY` ← Fixes "Opik not connected"
- `OPIK_WORKSPACE`
- `OPIK_PROJECT_NAME`
- `RESEND_API_KEY`
- `EMAIL_FROM`

---

## ✅ Verification Steps

After redeployment, test these URLs:

### 1. Check AI Status
```
https://align-alpha.vercel.app/api/ai/status
```
Should show:
```json
{
  "gemini": { "configured": true, "status": "active" },
  "opik": { "configured": true, "status": "active" }
}
```

### 2. Check Environment Variables
```
https://align-alpha.vercel.app/api/debug/ai-env
```
Should show:
```json
{
  "gemini": { "exists": true, "length": 39, "preview": "AIzaSyCElN..." },
  "opik": { "exists": true, "length": 21, "preview": "zVJaWMtUn5..." }
}
```

### 3. Test Login
```
https://align-alpha.vercel.app/login
```
Should allow Google sign-in without errors

### 4. Test Plan Generation
```
https://align-alpha.vercel.app/plan
```
Should generate plans without "AI not available" error

### 5. Check Integrations Page
```
https://align-alpha.vercel.app/integrations
```
Should show Gemini and Opik as "Connected"

---

## 🔧 OAuth Configuration

Make sure these redirect URIs are configured:

### Google OAuth Console
https://console.cloud.google.com/apis/credentials

Add these Authorized redirect URIs:
- `https://align-alpha.vercel.app/api/auth/callback/google`
- `https://align-alpha.vercel.app/api/integrations/google-calendar/callback`

### Todoist App Console
https://developer.todoist.com/appconsole.html

Add this OAuth redirect URL:
- `https://align-alpha.vercel.app/api/integrations/todoist/callback`

---

## 🐛 Troubleshooting

### Issue: "AI not available"
**Fix**: Set `GEMINI_API_KEY` in Vercel and redeploy

### Issue: "Gemini not connected"
**Fix**: Same as above

### Issue: "Opik not connected"
**Fix**: Set `OPIK_API_KEY` in Vercel and redeploy

### Issue: Can't sign in with new email
**Fix**: 
1. Go to Google Cloud Console → OAuth consent screen
2. Either click "PUBLISH APP" or add email as test user

### Issue: Calendar not showing events
**Fix**: 
- Make sure you have events today
- Check browser console (F12) for errors
- Reconnect Google Calendar from integrations page

---

## 📝 Cron Job Schedule

The notification cron job now runs once daily at 9 AM UTC:
- Schedule: `0 9 * * *`
- Endpoint: `/api/cron/notifications`

This is compatible with Vercel's free Hobby plan.

---

## 🎉 Next Steps

1. ✅ Set environment variables in Vercel
2. ✅ Redeploy after setting variables
3. ✅ Test all verification URLs
4. ✅ Configure OAuth redirect URIs
5. ✅ Test login and plan generation
6. ✅ Enjoy your production app!

---

## 📚 Reference Documents

- `VERCEL-SETUP-INSTRUCTIONS.md` - Detailed environment setup
- `ISSUES-AND-FIXES.md` - Troubleshooting guide
- `PRODUCTION-FIXES.md` - OAuth and integration fixes

---

## 🆘 Need Help?

If something isn't working:

1. Check the verification URLs above
2. Review `ISSUES-AND-FIXES.md`
3. Check Vercel deployment logs
4. Verify all environment variables are set
5. Make sure you redeployed after setting variables
