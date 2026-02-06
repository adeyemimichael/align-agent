# Google Calendar OAuth Setup Guide

## Problem
You're getting `Error 400: redirect_uri_mismatch` when trying to connect Google Calendar.

## Solution

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)

### Step 2: Enable Google Calendar API
1. Go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace)
3. Fill in:
   - App name: "Adaptive Productivity Agent"
   - User support email: Your email
   - Developer contact: Your email
4. Click **Save and Continue**
5. On Scopes page, click **Add or Remove Scopes**
6. Add these scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
7. Click **Save and Continue**
8. Add test users (your email) if in testing mode
9. Click **Save and Continue**

### Step 4: Create OAuth Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Choose **Web application**
4. Name it: "Adaptive Productivity Agent"
5. Under **Authorized redirect URIs**, add:
   - For local development: `http://localhost:3000/api/integrations/google-calendar/callback`
   - For production: `https://yourdomain.com/api/integrations/google-calendar/callback`
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 5: Update Your .env File
```bash
GOOGLE_CLIENT_ID="your-client-id-here"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
NEXTAUTH_URL="http://localhost:3000"  # or your production URL
```

### Step 6: Restart Your Development Server
```bash
npm run dev
```

## Important Notes

### For Local Development
- Use `http://localhost:3000` (not `http://127.0.0.1:3000`)
- Make sure NEXTAUTH_URL in .env matches exactly

### For Production
- Update the redirect URI in Google Cloud Console to your production domain
- Update NEXTAUTH_URL in your production environment variables
- Example: `https://yourdomain.com`

### Common Issues

**Issue**: Still getting redirect_uri_mismatch
**Solution**: 
- Double-check the redirect URI in Google Cloud Console matches exactly
- Make sure there are no trailing slashes
- Restart your dev server after changing .env

**Issue**: "This app isn't verified"
**Solution**: 
- This is normal for apps in testing mode
- Click "Advanced" > "Go to [App Name] (unsafe)" to proceed
- For production, submit your app for verification

## Testing the Integration

1. Go to http://localhost:3000/integrations
2. Click "Connect Google Calendar"
3. You should be redirected to Google's OAuth page
4. Grant permissions
5. You should be redirected back to your dashboard with a success message

## Current Configuration

Your current redirect URI is:
```
http://localhost:3000/api/integrations/google-calendar/callback
```

Make sure this EXACT URL is added to your Google Cloud Console OAuth credentials.
