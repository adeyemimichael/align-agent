# Deploying to Vercel

This guide walks you through deploying the Adaptive Productivity Agent to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)
3. A PostgreSQL database (Supabase, Neon, or Railway recommended)
4. All required API keys (see Environment Variables section)

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   In the Vercel dashboard, add these environment variables:

   **Required:**
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `ENCRYPTION_KEY` - Generate with: `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` - From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
   - `GEMINI_API_KEY` - From Google AI Studio

   **Optional:**
   - `TODOIST_CLIENT_ID` - For Todoist integration
   - `TODOIST_CLIENT_SECRET` - For Todoist integration
   - `OPIK_API_KEY` - For AI observability
   - `OPIK_WORKSPACE` - Your Opik workspace name
   - `OPIK_PROJECT_NAME` - Project name in Opik
   - `RESEND_API_KEY` - For email notifications
   - `EMAIL_FROM` - Email sender address

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Add Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add ENCRYPTION_KEY
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add GEMINI_API_KEY
   # Add other optional variables as needed
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Database Setup

### Using Supabase (Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Get your connection string from Settings → Database
3. Use the "Connection Pooling" URL for better performance
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Using Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy your connection string
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Using Railway

1. Create a project at [railway.app](https://railway.app)
2. Add a PostgreSQL service
3. Copy the connection string
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Post-Deployment Steps

### 1. Update Google OAuth Redirect URIs

In [Google Cloud Console](https://console.cloud.google.com):
- Go to APIs & Services → Credentials
- Edit your OAuth 2.0 Client
- Add authorized redirect URIs:
  - `https://your-app.vercel.app/api/auth/callback/google`
  - `https://your-app.vercel.app/api/integrations/google-calendar/callback`

### 2. Update Todoist OAuth Redirect URI (if using)

In [Todoist App Console](https://developer.todoist.com/appconsole.html):
- Add redirect URI: `https://your-app.vercel.app/api/integrations/todoist/callback`

### 3. Verify Deployment

Visit your deployed app and test:
- [ ] Login with Google works
- [ ] Database connection works
- [ ] AI plan generation works
- [ ] Integrations connect properly

## Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
- Solution: The `vercel.json` includes `prisma generate` in the build command

**Error: Environment variables not found**
- Solution: Ensure all required env vars are set in Vercel dashboard

### Runtime Errors

**Database connection fails**
- Check your `DATABASE_URL` is correct
- Ensure your database allows connections from Vercel IPs
- For Supabase, use the connection pooling URL

**OAuth redirect mismatch**
- Update redirect URIs in Google Cloud Console
- Ensure `NEXTAUTH_URL` matches your deployment URL

**AI requests fail**
- Verify `GEMINI_API_KEY` is valid
- Check API quotas in Google AI Studio

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | Yes | Your app's URL |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `ENCRYPTION_KEY` | Yes | Random secret for token encryption |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GEMINI_API_KEY` | Yes | Google Gemini AI API key |
| `TODOIST_CLIENT_ID` | No | Todoist OAuth client ID |
| `TODOIST_CLIENT_SECRET` | No | Todoist OAuth client secret |
| `OPIK_API_KEY` | No | Opik observability API key |
| `OPIK_WORKSPACE` | No | Opik workspace name |
| `OPIK_PROJECT_NAME` | No | Opik project name |
| `RESEND_API_KEY` | No | Resend email API key |
| `EMAIL_FROM` | No | Email sender address |

## Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Run build checks before deploying

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` to your custom domain
6. Update OAuth redirect URIs to use custom domain

## Monitoring

- **Vercel Analytics**: Automatically enabled for performance monitoring
- **Opik Dashboard**: View AI traces at [comet.com/opik](https://www.comet.com/opik)
- **Logs**: View in Vercel dashboard under "Logs" tab

## Cost Considerations

- **Vercel**: Free tier includes 100GB bandwidth, unlimited deployments
- **Database**: Supabase free tier includes 500MB, Neon free tier includes 3GB
- **Gemini AI**: Free tier includes 60 requests/minute
- **Resend**: Free tier includes 100 emails/day

## Support

For issues:
1. Check Vercel deployment logs
2. Review database connection
3. Verify all environment variables are set
4. Check API quotas and limits
