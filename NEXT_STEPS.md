# Next Steps for Deployment

Your code is now ready and pushed to GitHub! Here's what to do next:

## ✅ Completed

- [x] Created Vercel deployment configuration
- [x] Updated README with proper branding (Align AI Agent)
- [x] Added deployment documentation
- [x] Added environment variable examples
- [x] Pushed code to GitHub

## 🚀 Deploy to Vercel

### Step 1: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Click "Import Git Repository"
4. Select `adeyemimichael/align-agent`
5. Click "Deploy"

### Step 2: Add Environment Variables
After first deployment, add these in Vercel Settings → Environment Variables:

**Required:**
- `DATABASE_URL` - Your Supabase connection string
- `NEXTAUTH_URL` - Your Vercel app URL (e.g., https://your-app.vercel.app)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `ENCRYPTION_KEY` - Generate with: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
- `GEMINI_API_KEY` - From Google AI Studio

**Optional:**
- `TODOIST_CLIENT_ID` & `TODOIST_CLIENT_SECRET`
- `OPIK_API_KEY`, `OPIK_WORKSPACE`, `OPIK_PROJECT_NAME`
- `RESEND_API_KEY` & `EMAIL_FROM`

### Step 3: Update OAuth Redirect URIs

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Add these redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
   - `https://your-app.vercel.app/api/integrations/google-calendar/callback`

**Todoist (if using):**
1. Go to [Todoist App Console](https://developer.todoist.com/appconsole.html)
2. Add: `https://your-app.vercel.app/api/integrations/todoist/callback`

### Step 4: Redeploy
After adding environment variables:
1. Go to Deployments tab in Vercel
2. Click "..." on latest deployment
3. Click "Redeploy"

## 📝 Update README Links

Once deployed, update these placeholders in README.md:

1. Replace `https://your-app-url.vercel.app` with your actual Vercel URL
2. Replace `https://your-demo-video-url` with your YouTube/Loom video link
3. Update Twitter handle: `@your-twitter-handle`
4. Update LinkedIn: `your-linkedin`

## 🎥 Create Demo Video

Record a demo showing:
- Login flow
- Daily check-in
- AI plan generation
- Task management
- Calendar integration
- Progress tracking

Upload to YouTube or Loom and update the README link.

## 📧 Update Social Media

Update these in README.md:
- Twitter handle
- LinkedIn profile
- Any other social media accounts

## ✅ Final Checklist

- [ ] Deploy to Vercel
- [ ] Add all environment variables
- [ ] Update OAuth redirect URIs
- [ ] Test login functionality
- [ ] Test AI plan generation
- [ ] Record demo video
- [ ] Update README with live links
- [ ] Update social media links
- [ ] Share on Twitter/LinkedIn

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Setup](https://supabase.com/docs)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
