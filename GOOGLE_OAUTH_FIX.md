# Google Calendar OAuth Fix

## Error
```
Error 400: redirect_uri_mismatch
```

## Problem
The redirect URI configured in Google Cloud Console doesn't match what your app is sending.

## Solution

### Step 1: Go to Google Cloud Console
1. Visit https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID
Look for the client ID that matches: `851768313132-vb6t6uf8fkqj78gom1p028snnpsbb0g5.apps.googleusercontent.com`

### Step 3: Add Authorized Redirect URIs
Click on your OAuth 2.0 Client ID and add these **exact** URIs:

```
http://localhost:3000/api/integrations/google-calendar/callback
http://localhost:3000/api/auth/callback/google
```

**Important**: 
- No trailing slashes
- Must be exactly `http://localhost:3000` (not `http://127.0.0.1:3000`)
- Case-sensitive

### Step 4: Save Changes
Click **Save** at the bottom of the page.

### Step 5: Wait (Optional)
Sometimes Google takes a few minutes to propagate the changes. If it still doesn't work immediately, wait 2-3 minutes and try again.

### Step 6: Test the Connection
1. Go to http://localhost:3000/integrations
2. Click "Connect" next to Google Calendar
3. You should be redirected to Google's authorization page
4. Grant permissions
5. You'll be redirected back to your app

## Alternative: Use ngrok for Production-like Testing

If you want to test with a public URL:

```bash
# Install ngrok
brew install ngrok

# Start ngrok
ngrok http 3000
```

Then add the ngrok URL to your redirect URIs:
```
https://your-ngrok-url.ngrok.io/api/integrations/google-calendar/callback
```

And update your `.env`:
```
NEXTAUTH_URL="https://your-ngrok-url.ngrok.io"
```

## Verification

After adding the redirect URI, you should see it listed under "Authorized redirect URIs" in your Google Cloud Console OAuth client configuration.
