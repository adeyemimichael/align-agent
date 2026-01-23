# API Troubleshooting Guide

## Current Issues and Solutions

### 1. `/api/plan/current` - 404 Error

**Cause**: This is expected when you haven't generated a plan for today yet.

**Solution**: 
1. First, complete a daily check-in at `/checkin`
2. Then generate a plan at `/plan` page
3. The `/api/plan/current` endpoint will then return your plan

### 2. `/api/plan/generate` - 500 Error

**Root Cause (FIXED)**: The Gemini model name was outdated. Updated from `gemini-pro` to `gemini-2.5-flash`.

**Other Possible Causes**:
- No check-in completed for today
- Missing Gemini API key
- Database connection issues
- No tasks available (need Todoist connected or manual tasks)

**Solutions**:

#### Step 1: Complete a Check-in
```bash
# Navigate to http://localhost:3000/checkin
# Fill out the check-in form with:
# - Energy level (1-10)
# - Focus level (1-10)
# - Stress level (1-10)
# - Available hours
```

#### Step 2: Verify Gemini API Key
Your `.env` file shows:
```
GEMINI_API_KEY="AIzaSyDy3ADoaVtQd7c1SNv_Gz7XH1tH4EQ7E4A"
```

Test it:
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDy3ADoaVtQd7c1SNv_Gz7XH1tH4EQ7E4A" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

#### Step 3: Connect Todoist (for tasks)
1. Go to http://localhost:3000/integrations
2. Click "Connect" next to Todoist
3. You'll be redirected to Todoist to authorize
4. After authorization, you'll be redirected back

#### Step 4: Check Server Logs
```bash
# In your terminal where the dev server is running
# Look for error messages when you try to generate a plan
```

### 3. Google Calendar API Connection

**Setup Steps**:

#### Step 1: Verify Google OAuth Credentials
Your `.env` has:
```
GOOGLE_CLIENT_ID="851768313132-vb6t6uf8fkqj78gom1p028snnpsbb0g5.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
```

#### Step 2: Configure Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" > "Credentials"
4. Find your OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/integrations/google-calendar/callback
   ```

#### Step 3: Enable Google Calendar API
1. In Google Cloud Console
2. Go to "APIs & Services" > "Library"
3. Search for "Google Calendar API"
4. Click "Enable"

#### Step 4: Connect from Your App
1. Go to http://localhost:3000/integrations
2. Click "Connect" next to Google Calendar
3. You'll be redirected to Google to authorize
4. Grant calendar permissions
5. You'll be redirected back to your app

### 4. Todoist Connection

**Setup Steps**:

#### Step 1: Verify Todoist Credentials
Your `.env` has:
```
TODOIST_CLIENT_ID="769db580c84043dc8033e26956dfa348"
TODOIST_CLIENT_SECRET="d888d9df9cc14e4db6f7ae0053b4f8df"
```

#### Step 2: Configure Todoist App Settings
1. Go to https://developer.todoist.com/appconsole.html
2. Find your app
3. Add OAuth redirect URL:
   ```
   http://localhost:3000/api/integrations/todoist/callback
   ```

#### Step 3: Connect from Your App
1. Go to http://localhost:3000/integrations
2. Click "Connect" next to Todoist
3. You'll be redirected to Todoist to authorize
4. Grant permissions
5. You'll be redirected back to your app

## Testing the Full Flow

### Complete Workflow:

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Login**:
   - Go to http://localhost:3000/login
   - Enter your email and password

3. **Complete Check-in**:
   - Go to http://localhost:3000/checkin
   - Fill out the form
   - Submit

4. **Connect Integrations** (optional but recommended):
   - Go to http://localhost:3000/integrations
   - Connect Todoist for tasks
   - Connect Google Calendar for syncing

5. **Generate Plan**:
   - Go to http://localhost:3000/plan
   - Click "Generate Plan"
   - Wait for AI to create your personalized plan

6. **View Current Plan**:
   - The `/api/plan/current` endpoint will now work
   - Your plan will be displayed on the dashboard

## Common Error Messages

### "No check-in found for today"
**Solution**: Complete a check-in first at `/checkin`

### "No tasks available"
**Solution**: Connect Todoist or add tasks manually

### "Unauthorized"
**Solution**: Make sure you're logged in

### "User not found"
**Solution**: Check your database connection and ensure user exists

## Debugging Tips

### Check Server Logs
Look for detailed error messages in your terminal where `npm run dev` is running.

### Check Browser Console
Open DevTools (F12) and look at:
- Console tab for JavaScript errors
- Network tab for failed API requests

### Test API Endpoints Directly
```bash
# Test plan/current (after generating a plan)
curl http://localhost:3000/api/plan/current \
  -H "Cookie: your-session-cookie"

# Test integrations status
curl http://localhost:3000/api/integrations/status \
  -H "Cookie: your-session-cookie"
```

### Check Database
```bash
# Run Prisma Studio to view your data
npx prisma studio
```

## Need More Help?

If you're still experiencing issues:

1. Check the server logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure database is accessible
4. Make sure all OAuth redirect URLs are configured correctly
5. Check that APIs are enabled in their respective consoles
