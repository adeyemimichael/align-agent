# Quick Fix Guide for 500 Error

## Problem
After Google OAuth sign-in, you're getting a 500 Internal Server Error. This is caused by database connection issues.

## What I Fixed
1. ✅ Fixed DATABASE_URL (removed double `@@`)
2. ✅ Added missing `VerificationToken` model to Prisma schema
3. ✅ Fixed CheckIn field names (energy, sleep, stress instead of energyLevel, sleepQuality, stressLevel)

## What You Need to Do

### Step 1: Fix Supabase Connection

Your current DATABASE_URL is:
```
postgresql://postgres:adeyemi123@db.ivsnmxubdkfzswsmwlqt.supabase.co:5432/postgres
```

**Check these things:**

1. **Is your Supabase project active?**
   - Go to https://supabase.com/dashboard
   - Find your project
   - If it says "Paused", click "Resume"

2. **Is the password correct?**
   - The password in your URL is: `adeyemi123`
   - Verify this is correct in Supabase dashboard

3. **Get the correct connection string:**
   - In Supabase dashboard → Project Settings → Database
   - Look for "Connection string" (URI format)
   - Copy it and replace `[YOUR-PASSWORD]` with your actual password
   - Update `.env` file

### Step 2: Push Database Schema

Once your database is accessible, run:

```bash
npx prisma db push
```

This will create all the required tables including the NextAuth tables.

### Step 3: Restart Your Dev Server

```bash
npm run dev
```

### Step 4: Test Sign-in Again

1. Go to http://localhost:3000
2. Click "Sign in with Google"
3. Complete OAuth flow
4. You should now be redirected to the dashboard

## Alternative: Use Local PostgreSQL

If Supabase isn't working, you can use a local PostgreSQL database:

### Install PostgreSQL locally:

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Create local database:**
```bash
createdb adaptive_productivity
```

**Update .env:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/adaptive_productivity"
```

**Push schema:**
```bash
npx prisma db push
```

## Verification

After fixing, you should see:
1. No errors in terminal when running `npm run dev`
2. Successful sign-in with Google
3. Redirect to dashboard after sign-in
4. No 500 errors

## Common Errors & Solutions

### Error: "Can't reach database server"
- **Solution**: Check if Supabase project is paused or use local PostgreSQL

### Error: "Invalid `prisma.user.create()` invocation"
- **Solution**: Run `npx prisma generate` then `npx prisma db push`

### Error: "Column does not exist"
- **Solution**: The schema wasn't pushed. Run `npx prisma db push`

### Error: "NEXTAUTH_SECRET is not set"
- **Solution**: Already set in your .env, should be fine

## Need Help?

If you're still getting errors:
1. Check the terminal where `npm run dev` is running
2. Look for the specific error message
3. Share the error message for more specific help
