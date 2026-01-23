# Google OAuth "Invalid Code Verifier" Fix Guide

## What I Fixed

1. ✅ Updated `app/login/page.tsx` to await `searchParams` (Next.js 15+ requirement)
2. ✅ Added error page redirect in auth configuration
3. ✅ Enabled debug mode for development

## The Main Issue: Google OAuth Configuration

The error `"Invalid code verifier"` means your **Google Cloud Console redirect URI doesn't match** what NextAuth is using.

## 🔧 Fix Steps

### Step 1: Check Your Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, you should have:

```
http://localhost:3000/api/auth/callback/google
```

**IMPORTANT**: It must be EXACTLY this URL. No trailing slash, no extra parameters.

### Step 2: Verify Your .env File

Your `.env` should have:

```bash
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="851768313132-vb6t6uf8fkqj78gom1p028snnpsbb0g5.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
```

✅ These look correct!

### Step 3: Clear Browser Data

The "Invalid code verifier" error can also be caused by stale cookies/sessions:

1. Open your browser's Developer Tools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Clear all cookies for `localhost:3000`
4. Clear Local Storage
5. Clear Session Storage

Or simply use **Incognito/Private mode** for testing.

### Step 4: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test Sign-in Again

1. Go to `http://localhost:3000`
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. You should now successfully sign in!

---

## 🔍 If Still Not Working

### Option A: Recreate Google OAuth Credentials

If the issue persists, create new OAuth credentials:

1. In Google Cloud Console → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `Adaptive Productivity Agent`
5. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Click **CREATE**
7. Copy the new Client ID and Client Secret
8. Update your `.env` file with the new credentials
9. Restart your dev server

### Option B: Check for Multiple Redirect URIs

Make sure you don't have conflicting redirect URIs like:
- ❌ `http://localhost:3000/api/auth/callback/google/`  (trailing slash)
- ❌ `http://localhost:3000/api/auth/callback`  (missing /google)
- ✅ `http://localhost:3000/api/auth/callback/google`  (correct)

### Option C: Verify Database Connection

The OAuth flow needs to store the session in the database. Verify:

```bash
npx prisma db push
```

Should show: "The database is already in sync with the Prisma schema."

---

## 🎯 Common Causes of "Invalid Code Verifier"

1. **Redirect URI mismatch** (most common)
   - Solution: Ensure exact match in Google Cloud Console

2. **Stale cookies/sessions**
   - Solution: Clear browser data or use incognito mode

3. **Multiple OAuth apps**
   - Solution: Make sure you're using the correct Client ID/Secret pair

4. **NEXTAUTH_URL mismatch**
   - Solution: Ensure NEXTAUTH_URL matches your actual URL

5. **Database connection issues**
   - Solution: Verify database is accessible and schema is synced

---

## ✅ Verification Checklist

- [ ] Google Cloud Console redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- [ ] NEXTAUTH_URL in .env is: `http://localhost:3000`
- [ ] Browser cookies/storage cleared
- [ ] Dev server restarted
- [ ] Database schema is synced (`npx prisma db push`)
- [ ] Using correct Google Client ID and Secret

---

## 🐛 Debug Mode

I've enabled debug mode in development. Check your terminal logs when signing in - you'll see detailed OAuth flow information that can help identify the issue.

Look for lines starting with `[auth]` in your terminal.

---

## 📞 Still Having Issues?

If you're still getting the error after following all steps:

1. Check the terminal logs for `[auth][error]` messages
2. Verify your Google Cloud project is active
3. Try creating a completely new OAuth client in Google Cloud Console
4. Make sure you're not behind a proxy or VPN that might interfere

---

## 🎉 Success Indicators

When it works, you should see:
1. Redirect to Google sign-in page
2. Select your Google account
3. Redirect back to your app
4. See the dashboard (not an error page)
5. No errors in terminal logs
