# Deployment Guide - Adaptive Productivity Agent

## Quick Start

This guide will help you deploy the Adaptive Productivity Agent to production.

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Google OAuth credentials
- Gemini AI API key
- (Optional) Todoist API credentials
- (Optional) Google Calendar API credentials

---

## Step 1: Environment Setup

Create a `.env.production` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI
GEMINI_API_KEY="your-gemini-api-key"

# Encryption (for storing integration tokens)
ENCRYPTION_KEY="generate-with-openssl-rand-hex-32"

# Optional: Todoist Integration
TODOIST_CLIENT_ID="your-todoist-client-id"
TODOIST_CLIENT_SECRET="your-todoist-client-secret"

# Optional: Google Calendar Integration
GOOGLE_CALENDAR_CLIENT_ID="your-calendar-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="your-calendar-client-secret"

# Optional: Monitoring
OPIK_API_KEY="your-opik-api-key"
OPIK_WORKSPACE="your-workspace-name"
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 32
```

---

## Step 2: Database Setup

### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb adaptive_productivity

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://localhost:5432/adaptive_productivity"
```

### Option B: Cloud Database (Recommended)

Use a managed PostgreSQL service:
- **Vercel Postgres**: Integrated with Vercel deployments
- **Supabase**: Free tier available
- **Railway**: Simple setup
- **Neon**: Serverless PostgreSQL

Example with Vercel Postgres:
```bash
# Install Vercel CLI
npm i -g vercel

# Create Postgres database
vercel postgres create

# Copy connection string to .env
```

---

## Step 3: Run Database Migrations

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Verify schema
npx prisma db push
```

---

## Step 4: Configure OAuth Providers

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to `.env`

### Todoist OAuth Setup (Optional)

1. Go to [Todoist App Console](https://developer.todoist.com/appconsole.html)
2. Create new app
3. Add redirect URI: `https://your-domain.com/api/integrations/todoist/callback`
4. Copy Client ID and Client Secret to `.env`

### Google Calendar OAuth Setup (Optional)

1. In Google Cloud Console (same project as OAuth)
2. Enable Google Calendar API
3. Use same OAuth credentials or create separate ones
4. Add redirect URI: `https://your-domain.com/api/integrations/google-calendar/callback`

---

## Step 5: Build Application

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test build locally
npm start
```

Visit `http://localhost:3000` to verify the build works.

---

## Step 6: Deploy to Vercel (Recommended)

### Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to:
# - Link to existing project or create new
# - Set environment variables
# - Deploy to production
```

### Manual Deploy via Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables from `.env.production`
6. Click "Deploy"

### Post-Deployment

1. Update OAuth redirect URIs with production domain
2. Update `NEXTAUTH_URL` in environment variables
3. Test authentication flow
4. Verify database connection

---

## Step 7: Alternative Deployment Options

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Deploy
railway up
```

### Deploy to Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect Git repository
4. Configure:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables
6. Create PostgreSQL database
7. Deploy

### Deploy to Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build image
docker build -t adaptive-productivity .

# Run container
docker run -p 3000:3000 --env-file .env.production adaptive-productivity
```

---

## Step 8: Post-Deployment Verification

### Health Checks

1. **Authentication**
   ```bash
   curl https://your-domain.com/api/auth/signin
   ```

2. **Database Connection**
   - Sign in with Google
   - Complete a check-in
   - Verify data is saved

3. **API Endpoints**
   ```bash
   # Get check-in history (requires auth)
   curl https://your-domain.com/api/checkin/history
   ```

4. **AI Integration**
   - Create a goal
   - Generate a daily plan
   - Verify AI reasoning is displayed

### Performance Monitoring

1. **Response Times**
   - Check-in submission: < 200ms
   - Plan generation: < 3s
   - Dashboard load: < 500ms

2. **Database Queries**
   - Monitor Prisma logs
   - Check for N+1 queries
   - Verify cache hit rates

3. **Error Rates**
   - Monitor application logs
   - Set up error tracking (Sentry, LogRocket)
   - Configure alerts for critical errors

---

## Step 9: Configure Monitoring (Optional)

### Vercel Analytics

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Sentry Error Tracking

```bash
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs

# Configure in sentry.client.config.ts and sentry.server.config.ts
```

### Opik AI Monitoring

Already integrated! Just set environment variables:
```env
OPIK_API_KEY="your-api-key"
OPIK_WORKSPACE="your-workspace"
```

---

## Step 10: Backup & Recovery

### Database Backups

#### Automated Backups (Vercel Postgres)
```bash
# Backups are automatic with Vercel Postgres
# Configure retention period in dashboard
```

#### Manual Backup
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Environment Variables Backup

Store environment variables securely:
- Use a password manager (1Password, LastPass)
- Store in encrypted vault
- Keep offline backup

### Code Repository

Ensure git repository is backed up:
- Push to GitHub/GitLab
- Enable branch protection
- Tag releases

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```
Error: Can't reach database server
```

**Solution**:
- Verify `DATABASE_URL` is correct
- Check database is running
- Verify network connectivity
- Check firewall rules

#### 2. OAuth Redirect Errors

```
Error: redirect_uri_mismatch
```

**Solution**:
- Update OAuth redirect URIs in Google Console
- Ensure `NEXTAUTH_URL` matches production domain
- Include `/api/auth/callback/google` path

#### 3. Build Errors

```
Error: Module not found
```

**Solution**:
- Run `npm install` to install dependencies
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`

#### 4. Prisma Client Errors

```
Error: Prisma Client not generated
```

**Solution**:
```bash
npx prisma generate
npm run build
```

#### 5. Environment Variable Issues

```
Error: NEXTAUTH_SECRET is not set
```

**Solution**:
- Verify all required environment variables are set
- Check for typos in variable names
- Restart application after changes

---

## Security Checklist

- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Environment variables secured
- ✅ OAuth credentials not exposed
- ✅ Database credentials encrypted
- ✅ Integration tokens encrypted with `ENCRYPTION_KEY`
- ✅ CORS configured properly
- ✅ Rate limiting considered
- ✅ SQL injection prevented (Prisma ORM)
- ✅ XSS prevention (React escaping)
- ✅ CSRF protection (NextAuth.js)

---

## Performance Optimization

### Caching Strategy

Current implementation uses in-memory caching:
- User data: 5 min TTL
- Check-ins: 1 hour TTL
- Plans: 10 min TTL
- Patterns: 30 min TTL

### For Production Scale

Consider migrating to Redis:
```bash
# Install Redis client
npm install ioredis

# Update lib/cache.ts to use Redis
# Deploy Redis instance (Upstash, Redis Cloud)
```

### CDN Configuration

Enable CDN caching for static assets:
- Vercel automatically handles this
- Configure cache headers for API routes if needed

---

## Scaling Considerations

### Current Limits

- **In-memory cache**: Single instance only
- **Database connections**: Limited by Prisma pool
- **AI API calls**: Rate limited by Gemini

### Scaling Solutions

1. **Horizontal Scaling**
   - Migrate to Redis for shared cache
   - Use database connection pooling
   - Deploy multiple instances

2. **Vertical Scaling**
   - Increase server resources
   - Optimize database queries
   - Add database indexes

3. **Caching Layer**
   - Add Redis for distributed caching
   - Use CDN for static assets
   - Cache AI responses

---

## Maintenance

### Regular Tasks

- **Weekly**: Review error logs
- **Monthly**: Update dependencies
- **Quarterly**: Review performance metrics
- **Annually**: Security audit

### Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Support

### Documentation

- `README.md` - Project overview
- `PRODUCTION_READY_SUMMARY.md` - Feature documentation
- `TYPESCRIPT_ERROR_FIXES.md` - TypeScript troubleshooting
- `PERFORMANCE_OPTIMIZATIONS.md` - Performance tuning

### Getting Help

- Check documentation first
- Review error logs
- Search GitHub issues
- Contact development team

---

## Rollback Plan

If issues occur in production:

1. **Immediate Rollback**
   ```bash
   # Vercel
   vercel rollback
   
   # Railway
   railway rollback
   ```

2. **Database Rollback**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup.sql
   ```

3. **Code Rollback**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push
   ```

---

## Success Metrics

Track these metrics post-deployment:

- **User Engagement**: Daily active users
- **Feature Usage**: Check-ins per day, plans generated
- **Performance**: Average response time, error rate
- **AI Quality**: Plan acceptance rate, adjustment frequency
- **Integration Health**: Sync success rate, API errors

---

## Conclusion

Your Adaptive Productivity Agent is now deployed and ready to help users manage their time effectively!

**Next Steps**:
1. ✅ Monitor application health
2. ✅ Gather user feedback
3. ✅ Iterate on features
4. ✅ Scale as needed

**Need Help?** Refer to the troubleshooting section or review the documentation.

---

**Document Version**: 1.0  
**Last Updated**: February 4, 2026  
**Status**: Production Deployment Ready ✅
