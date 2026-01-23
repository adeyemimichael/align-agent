# Check-in 500 Error - Fixed!

## Problem
The check-in form was getting a 500 error because of field name mismatches between the frontend, API, and database.

## Root Cause
The database schema was updated to use shorter field names (`energy`, `sleep`, `stress`), but the API and frontend were still using the old names (`energyLevel`, `sleepQuality`, `stressLevel`).

## ✅ What I Fixed

### 1. Database Schema (prisma/schema.prisma)
Already fixed - using:
- `energy` (was energyLevel)
- `sleep` (was sleepQuality)  
- `stress` (was stressLevel)

### 2. Check-in API (app/api/checkin/route.ts)
Updated to use:
- `energy` instead of `energyLevel`
- `sleep` instead of `sleepQuality`
- `stress` instead of `stressLevel`

### 3. Check-in Form (components/CheckInForm.tsx)
Updated to send:
- `energy` instead of `energyLevel`
- `sleep` instead of `sleepQuality`
- `stress` instead of `stressLevel`

### 4. Dashboard (app/dashboard/page.tsx)
Updated to display:
- `latestCheckIn.energy` instead of `latestCheckIn.energyLevel`
- `latestCheckIn.sleep` instead of `latestCheckIn.sleepQuality`
- `latestCheckIn.stress` instead of `latestCheckIn.stressLevel`

---

## ✅ Now You Can:

1. **Complete a check-in** - The form will submit successfully
2. **See your capacity score** - Calculated from your inputs
3. **View your mode** - Recovery, Balanced, or Deep Work
4. **See the dashboard** - With all your metrics displayed

---

## 🎯 Test It Now

1. Go to http://localhost:3000/checkin
2. Adjust the sliders:
   - Energy Level (1-10)
   - Sleep Quality (1-10)
   - Stress Level (1-10)
3. Select your mood (😊 😐 😔)
4. Click "Complete Check-In"
5. You should be redirected to the dashboard with your capacity score!

---

## 📊 How Capacity Score Works

Your capacity score (0-100) is calculated using:
- **Energy**: 30% weight
- **Sleep**: 30% weight
- **Stress**: 25% weight (inverted - higher stress = lower score)
- **Mood**: 15% weight

### Mode Selection:
- **Recovery Mode**: Score < 40 (focus on rest)
- **Balanced Mode**: Score 40-69 (mix of work and rest)
- **Deep Work Mode**: Score ≥ 70 (tackle challenging tasks)

---

## 🎉 Everything Should Work Now!

All field names are now consistent across:
- ✅ Database schema
- ✅ API endpoints
- ✅ Frontend forms
- ✅ Dashboard display

Try completing a check-in and you should see your capacity score and mode on the dashboard!
