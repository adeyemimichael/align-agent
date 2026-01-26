# Opik Analytics Setup Guide

## Current Status

✅ **Opik logging is working correctly** - Your app is successfully sending traces to Opik.

⚠️ **"Private Project" Error** - This happens because the project URL needs proper workspace configuration.

## Solution: Use Local Analytics Dashboard (Recommended)

Your app has a **built-in analytics dashboard** at `/analytics` that shows all the metrics you need:

- Total plans generated
- Tasks completed
- Completion rate
- Average capacity score
- Mode distribution (Recovery/Balanced/Deep Work)

**This is perfect for your demo!** No additional Opik cloud setup needed.

### What Changed

I've updated the `OpikDashboard` component to:
- Remove the "View in Opik" button that was causing the error
- Keep all the local analytics working
- Add a helpful note about accessing Opik Cloud if needed later

## Optional: Access Opik Cloud Dashboard

If you want to view detailed traces in Opik Cloud (not required for demo):

### Step 1: Log in to Opik
1. Go to https://www.comet.com/opik
2. Sign in with your account
3. Note your **workspace name** (shown in URL or navigation)

### Step 2: Update Configuration

Add your workspace name to `.env`:

```env
# Opik Tracking
OPIK_API_KEY="zVJaWMtUn5RShx2avZHjHp9Ji"
OPIK_PROJECT_NAME="adaptive-productivity-agent"
OPIK_WORKSPACE_NAME="your-workspace-name-here"  # Add this line
```

### Step 3: Update the Opik Client

Update `lib/opik.ts` to include workspace name:

```typescript
opikClient = new Opik({
  apiKey: process.env.OPIK_API_KEY,
  projectName: process.env.OPIK_PROJECT_NAME || 'adaptive-productivity-agent',
  workspaceName: process.env.OPIK_WORKSPACE_NAME, // Add this line
});
```

### Step 4: Update Dashboard URL

Update the `getOpikDashboardUrl()` function in `lib/opik.ts`:

```typescript
export function getOpikDashboardUrl(): string {
  const workspaceName = process.env.OPIK_WORKSPACE_NAME || 'default';
  const projectName = process.env.OPIK_PROJECT_NAME || 'adaptive-productivity-agent';
  return `https://www.comet.com/${workspaceName}/opik/projects/${projectName}`;
}
```

## What's Being Tracked

Even without the cloud dashboard, Opik is logging:

1. **AI Plan Generation**
   - Capacity score
   - Mode (recovery/balanced/deep work)
   - Task count
   - Gemini AI prompts and responses
   - Reasoning chains
   - Generation duration

2. **Capacity Accuracy**
   - Predicted capacity vs actual completion rate
   - Accuracy scores over time
   - Mode effectiveness

3. **Reasoning Quality**
   - AI reasoning analysis
   - Quality scores
   - User feedback (when provided)

## For Your Demo

**You don't need the Opik cloud dashboard!** Your local analytics page shows:

- ✅ Total plans and tasks
- ✅ Completion rates
- ✅ Average capacity scores
- ✅ Mode distribution charts
- ✅ All the metrics judges want to see

The Opik integration is working behind the scenes for logging, but the **local dashboard is your demo star**.

## Troubleshooting

### "Private Project" Error
- **Cause**: Project URL doesn't include workspace name
- **Fix**: Use local analytics dashboard (already done!)
- **Alternative**: Follow "Optional: Access Opik Cloud Dashboard" steps above

### Opik Not Logging
- Check `OPIK_API_KEY` is set in `.env`
- Check console for "Opik client initialized successfully" message
- Verify traces are being created (check server logs)

### Local Dashboard Not Showing Data
- Make sure you've completed at least one check-in
- Generate a daily plan
- Refresh the analytics page

## Summary

✅ **Current Setup**: Opik logging works, local analytics dashboard shows all metrics  
✅ **For Demo**: Use the local analytics dashboard at `/analytics`  
⏭️ **Optional**: Configure Opik Cloud access if you want detailed trace viewing

**Your app is demo-ready!** The analytics page has everything you need to showcase the AI decision-making and capacity tracking.
