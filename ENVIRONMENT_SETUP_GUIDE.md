# Environment Variables Setup Guide

This guide will walk you through obtaining all required environment variables for the Adaptive Productivity Agent.

## 🔧 Required Variables

### 1. Database (PostgreSQL)

**DATABASE_URL**
- **What it is**: PostgreSQL connection string
- **How to get it**:
  1. Go to [Supabase](https://supabase.com) and sign up/login
  2. Create a new project
  3. Go to Project Settings → Database
  4. Copy the "Connection string" (URI format)
  5. Replace `[YOUR-PASSWORD]` with your database password
- **Format**: `postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres`

---

### 2. NextAuth Configuration

**NEXTAUTH_URL**
- **What it is**: Your application URL
- **How to get it**:
  - For local development: `http://localhost:3000`
  - For production: Your deployed URL (e.g., `https://yourapp.vercel.app`)

**NEXTAUTH_SECRET**
- **What it is**: Secret key for encrypting session tokens
- **How to get it**:
  ```bash
  # Run this command in your terminal:
  openssl rand -base64 32
  ```
- **Example**: `your-secret-key-here-replace-with-random-string`

**ENCRYPTION_KEY**
- **What it is**: 32-character key for encrypting integration tokens
- **How to get it**:
  ```bash
  # Run this command in your terminal:
  openssl rand -base64 32
  ```
- **Example**: `your-encryption-key-here-32-chars`

---

### 3. Google OAuth (Required for Login)

**GOOGLE_CLIENT_ID** and **GOOGLE_CLIENT_SECRET**
- **What it is**: Credentials for Google OAuth login
- **How to get it**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com)
  2. Create a new project or select existing one
  3. Enable "Google+ API" or "Google Identity Services"
  4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
  5. Application type: "Web application"
  6. Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for local)
     - `https://yourapp.vercel.app/api/auth/callback/google` (for production)
  7. Copy the Client ID and Client Secret

---

### 4. Gemini AI (Required for AI Planning)

**GEMINI_API_KEY**
- **What it is**: API key for Google's Gemini AI
- **How to get it**:
  1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
  2. Sign in with your Google account
  3. Click "Create API Key"
  4. Copy the generated API key
- **Free tier**: Yes, generous free quota available

---

### 5. Todoist Integration (Optional)

**TODOIST_CLIENT_ID** and **TODOIST_CLIENT_SECRET**
- **What it is**: Credentials for Todoist task integration
- **How to get it**:
  1. Go to [Todoist App Management](https://developer.todoist.com/appconsole.html)
  2. Sign in with your Todoist account
  3. Click "Create a new app"
  4. Fill in app details:
     - App name: "Adaptive Productivity Agent"
     - OAuth redirect URL: `http://localhost:3000/api/integrations/todoist/callback`
  5. Copy the Client ID and Client Secret

---

### 6. Notion Integration (Optional - Not Yet Implemented)

**NOTION_CLIENT_ID** and **NOTION_CLIENT_SECRET**
- **What it is**: Credentials for Notion integration
- **Status**: Not required yet (Task 17 - not implemented)

---

### 7. Linear Integration (Optional - Not Yet Implemented)

**LINEAR_CLIENT_ID** and **LINEAR_CLIENT_SECRET**
- **What it is**: Credentials for Linear integration
- **Status**: Not required yet (Task 17 - not implemented)

---

### 8. Opik Tracking (Optional - For Demo Metrics)

**OPIK_API_KEY**
- **What it is**: API key for Opik AI observability platform
- **How to get it**:
  1. Go to [Comet.com](https://www.comet.com) and sign up/login
  2. Navigate to Opik section
  3. Create a new project or select existing one
  4. Go to Settings → API Keys
  5. Generate a new API key
  6. Copy the API key
- **Free tier**: Yes, free tier available
- **Purpose**: Tracks AI decision-making, reasoning quality, and capacity accuracy for demo purposes

**OPIK_PROJECT_NAME**
- **What it is**: Name of your Opik project
- **Default**: `adaptive-productivity-agent`
- **How to set**: Use the project name you created in Comet/Opik

---

## 🚀 Quick Setup Checklist

### Minimum to Get Started (Core Features)
- [ ] DATABASE_URL (Supabase)
- [ ] NEXTAUTH_URL (`http://localhost:3000`)
- [ ] NEXTAUTH_SECRET (generate with openssl)
- [ ] ENCRYPTION_KEY (generate with openssl)
- [ ] GOOGLE_CLIENT_ID (Google Cloud Console)
- [ ] GOOGLE_CLIENT_SECRET (Google Cloud Console)
- [ ] GEMINI_API_KEY (Google AI Studio)

### Optional (Enhanced Features)
- [ ] TODOIST_CLIENT_ID (for task sync)
- [ ] TODOIST_CLIENT_SECRET (for task sync)
- [ ] OPIK_API_KEY (for AI performance tracking - demo feature)
- [ ] OPIK_PROJECT_NAME (optional, defaults to 'adaptive-productivity-agent')

---

## 📝 Setting Up Your .env File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace all placeholder values with your actual credentials

3. **Never commit `.env` to git** - it's already in `.gitignore`

---

## 🔍 Verification

After setting up all variables, run:
```bash
npm run dev
```

Then test:
1. Visit `http://localhost:3000`
2. Click "Sign in with Google"
3. Complete a check-in
4. Try generating a daily plan

---

## ⚠️ Common Issues

### "Invalid client" error with Google OAuth
- Check that your redirect URI in Google Cloud Console matches exactly
- Make sure you've enabled the Google+ API

### "Unauthorized" error with Gemini
- Verify your API key is correct
- Check that you haven't exceeded the free quota

### Database connection errors
- Verify your DATABASE_URL is correct
- Check that your Supabase project is active
- Ensure your IP is allowed (Supabase allows all by default)

---

## 🎯 Priority Order

If you're short on time, set up in this order:
1. **Database** (DATABASE_URL) - Required for everything
2. **NextAuth** (NEXTAUTH_URL, NEXTAUTH_SECRET, ENCRYPTION_KEY) - Required for login
3. **Google OAuth** (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) - Required for login
4. **Gemini AI** (GEMINI_API_KEY) - Required for AI planning
5. **Todoist** (optional) - For task integration

---

## 📞 Need Help?

If you encounter issues:
1. Check the error messages in the browser console
2. Check the terminal logs where `npm run dev` is running
3. Verify all environment variables are set correctly
4. Make sure there are no extra spaces or quotes in your `.env` file
