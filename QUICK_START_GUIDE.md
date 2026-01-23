# Quick Start Guide - Align Agent

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Development Server
```bash
npm run dev
```
Visit: http://localhost:3000

### Step 2: Login
- Go to http://localhost:3000/login
- Use your credentials to log in

### Step 3: Complete Your First Check-in
1. Navigate to http://localhost:3000/checkin
2. Fill out the form:
   - **Energy Level**: How energetic do you feel? (1-10)
   - **Focus Level**: How well can you concentrate? (1-10)
   - **Stress Level**: How stressed are you? (1-10)
   - **Available Hours**: How many hours can you work today?
3. Click "Submit Check-in"

### Step 4: Connect Integrations (Optional but Recommended)

#### Connect Todoist (for tasks):
1. Go to http://localhost:3000/integrations
2. Click "Connect" next to Todoist
3. Authorize the app on Todoist
4. You'll be redirected back automatically

#### Connect Google Calendar (for syncing):
1. Go to http://localhost:3000/integrations
2. Click "Connect" next to Google Calendar
3. Authorize the app on Google
4. Grant calendar permissions
5. You'll be redirected back automatically

### Step 5: Generate Your AI-Powered Plan
1. Go to http://localhost:3000/plan
2. Click "Generate Plan"
3. Wait for the AI to analyze your capacity and create a personalized plan
4. Your plan will appear with:
   - Recommended work mode (Recovery/Balanced/Deep Work)
   - Prioritized tasks
   - Scheduled time blocks
   - AI reasoning for the plan

### Step 6: View Your Dashboard
- Go to http://localhost:3000/dashboard
- See your capacity score
- View upcoming tasks
- Track your progress

## 🔧 Troubleshooting

### "No check-in found for today"
**Fix**: Complete a check-in first (Step 3 above)

### "No tasks available"
**Fix**: Connect Todoist or add tasks manually

### API Errors (404, 500)
**Fix**: See [API_TROUBLESHOOTING.md](./API_TROUBLESHOOTING.md) for detailed solutions

### OAuth Redirect Issues
**Fix**: Make sure redirect URLs are configured:
- **Todoist**: http://localhost:3000/api/integrations/todoist/callback
- **Google**: http://localhost:3000/api/integrations/google-calendar/callback

## 📋 Daily Workflow

1. **Morning**: Complete check-in
2. **Generate Plan**: Let AI create your daily plan
3. **Work**: Follow your personalized schedule
4. **Track**: Mark tasks as complete
5. **Adjust**: AI learns from your patterns

## 🎯 Key Features

- **Adaptive Planning**: AI adjusts to your capacity
- **Smart Scheduling**: Optimal task ordering
- **Integration Sync**: Todoist tasks + Google Calendar
- **Pattern Learning**: Gets better over time
- **Capacity Tracking**: Monitor your productivity trends

## 📚 Additional Resources

- [API Troubleshooting](./API_TROUBLESHOOTING.md)
- [Todoist Setup](./TODOIST_SETUP_GUIDE.md)
- [Google Calendar Integration](./GOOGLE_CALENDAR_INTEGRATION.md)
- [Environment Setup](./ENVIRONMENT_SETUP_GUIDE.md)

## 🆘 Need Help?

Check the server logs in your terminal for detailed error messages.

Open browser DevTools (F12) to see:
- Console errors
- Network requests
- API responses
