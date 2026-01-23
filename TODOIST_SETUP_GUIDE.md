# How to Get Todoist Client ID and Client Secret

## Step-by-Step Guide

### 1. Go to Todoist App Management Console
Visit: **https://developer.todoist.com/appconsole.html**

### 2. Sign In
- Log in with your Todoist account
- If you don't have a Todoist account, create one at https://todoist.com

### 3. Create a New App
- Click the **"Create a new app"** button
- You'll see a form to fill out

### 4. Fill Out the App Information

**App Name:**
```
Align AI Productivity Agent
```
(Or any name you prefer)

**App Description:**
```
AI-powered productivity agent that adapts to your capacity and creates realistic daily plans
```

**App Service URL:**
```
http://localhost:3000
```
(For development. Change to your production URL later)

**OAuth redirect URL:**
```
http://localhost:3000/api/integrations/todoist/callback
```
⚠️ **IMPORTANT**: This MUST match exactly what's in your code!

### 5. Submit the Form
- Click **"Create app"** or **"Submit"**
- Your app will be created

### 6. Get Your Credentials
After creating the app, you'll see:

- **Client ID**: A long string like `abc123def456...`
- **Client Secret**: Another long string like `xyz789uvw012...`

### 7. Copy to Your .env File

Open your `.env` file and add:

```env
# Todoist Integration
TODOIST_CLIENT_ID=your_client_id_here
TODOIST_CLIENT_SECRET=your_client_secret_here
```

Replace `your_client_id_here` and `your_client_secret_here` with the actual values.

### 8. Restart Your Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart it
npm run dev
```

## Testing the Integration

1. Start your app: `npm run dev`
2. Go to: `http://localhost:3000/integrations`
3. Click **"Connect Todoist"**
4. You should be redirected to Todoist to authorize
5. After authorizing, you'll be redirected back to your app
6. Your tasks should now sync!

## Troubleshooting

### Error: "Invalid client_id"
- Double-check you copied the Client ID correctly
- Make sure there are no extra spaces
- Verify the Client ID in the Todoist App Console

### Error: "Redirect URI mismatch"
- Go back to Todoist App Console
- Edit your app
- Make sure OAuth redirect URL is exactly:
  ```
  http://localhost:3000/api/integrations/todoist/callback
  ```
- No trailing slash!

### Error: "Invalid client_secret"
- Double-check you copied the Client Secret correctly
- Make sure there are no extra spaces
- You may need to regenerate the secret in the App Console

## For Production Deployment

When you deploy to production (e.g., Vercel, Netlify):

1. Go back to Todoist App Console
2. Edit your app
3. Update the URLs:
   - **App Service URL**: `https://yourdomain.com`
   - **OAuth redirect URL**: `https://yourdomain.com/api/integrations/todoist/callback`
4. Update your production environment variables with the same Client ID and Secret

## Important Notes

- ⚠️ **Never commit your .env file to Git!** (It's already in .gitignore)
- ⚠️ **Keep your Client Secret private!** Don't share it publicly
- ✅ The Client ID can be public (it's used in OAuth flow)
- ✅ The Client Secret must remain secret (it's used server-side only)

## What Permissions Does Align Request?

When users connect Todoist, Align requests:
- **data:read** - Read your tasks and projects
- **data:read_write** - Create and update tasks (for syncing)

Users will see these permissions when they authorize the connection.

## Quick Reference

| Setting | Value |
|---------|-------|
| App Console | https://developer.todoist.com/appconsole.html |
| Redirect URI (Dev) | http://localhost:3000/api/integrations/todoist/callback |
| Redirect URI (Prod) | https://yourdomain.com/api/integrations/todoist/callback |
| Scopes | data:read,data:read_write |

## Need Help?

- Todoist API Docs: https://developer.todoist.com/rest/v2/
- Todoist OAuth Guide: https://developer.todoist.com/guides/#oauth

---

## Visual Guide

Here's what you'll see in the Todoist App Console:

```
┌─────────────────────────────────────────┐
│  Create a new app                       │
├─────────────────────────────────────────┤
│                                         │
│  App name:                              │
│  [Align AI Productivity Agent        ]  │
│                                         │
│  App description:                       │
│  [AI-powered productivity agent...   ]  │
│                                         │
│  App service URL:                       │
│  [http://localhost:3000              ]  │
│                                         │
│  OAuth redirect URL:                    │
│  [http://localhost:3000/api/...      ]  │
│                                         │
│  [Create app]                           │
└─────────────────────────────────────────┘
```

After creation:

```
┌─────────────────────────────────────────┐
│  Align AI Productivity Agent            │
├─────────────────────────────────────────┤
│                                         │
│  Client ID:                             │
│  abc123def456ghi789...                  │
│  [Copy]                                 │
│                                         │
│  Client Secret:                         │
│  xyz789uvw012rst345...                  │
│  [Copy] [Regenerate]                    │
│                                         │
└─────────────────────────────────────────┘
```

Just copy these values to your `.env` file!
