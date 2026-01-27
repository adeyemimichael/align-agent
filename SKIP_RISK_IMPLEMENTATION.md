# Skip Risk Prediction System - Implementation Summary

## Overview
Successfully implemented the Skip Risk Prediction System (Task 22) that predicts when users are likely to abandon tasks and triggers proactive interventions.

## Components Implemented

### 1. Skip Risk Calculator Module (`lib/skip-risk.ts`)
Core calculation engine that analyzes multiple risk factors:

**Risk Factors Considered:**
- **Schedule Delay**: Minutes behind schedule (0-55% risk contribution)
  - >30 minutes behind = 75% total risk (Requirement 17.4)
  - 15-30 minutes behind = moderate risk
  - 1-15 minutes behind = slight risk increase

- **Skip History**: Tasks already skipped today (0-55% risk contribution)
  - 2+ skips = collapsed momentum, very high risk
  - 1 skip = 60% likelihood of next skip (Requirement 17.3)

- **Momentum State**: Current momentum (strong/normal/weak/collapsed)
  - Collapsed: +40% risk
  - Weak: +20% risk
  - Strong: -10% risk (reduces risk)

- **Time of Day**: Afternoon tasks have higher skip risk
  - Afternoon + morning ran over: +20% risk (Requirement 17.6)
  - Just afternoon: +10% risk

- **Task Priority**: Lower priority tasks more likely to be skipped
  - P3-P4 tasks: +15% risk
  - P2 tasks: +5% risk

**Risk Levels:**
- **Low**: 0-39% (no intervention)
- **Medium**: 40-59% (supportive check-in)
- **High**: 60-100% (rescue schedule)

### 2. Skip Risk Metrics Tracking
Tracks historical patterns:
- **Morning Start Strength**: % of morning tasks that get started (Requirement 17.5)
- **Afternoon Falloff**: % of afternoon tasks completed when morning runs over (Requirement 17.6)
- **Skip After Skip Rate**: Likelihood of skipping after one skip (baseline 60%)

### 3. Intervention System
Automatically triggers interventions based on risk level:
- **Supportive Check-in** (medium risk): Gentle encouragement and plan adjustment offer
- **Rescue Schedule** (high risk): Simplify plan to protect core wins

### 4. Integration with Auto-Scheduler (`lib/auto-scheduler.ts`)
- Added skip risk calculation to `autoScheduleTasks()` function
- Calculates skip risk for each scheduled task
- Returns interventions array with suggested actions
- Passes current progress context (completed tasks, skipped tasks, minutes behind, momentum state)

### 5. Database Schema Updates (`prisma/schema.prisma`)
Added fields to `PlanTask` model:
```prisma
skipRisk         String?   // 'low', 'medium', 'high'
skipRiskPercentage Float?  // 0-100
momentumState    String?   // 'strong', 'normal', 'weak', 'collapsed'
```

### 6. API Integration (`app/api/plan/generate/route.ts`)
- Plan generation now includes skip risk data for each task
- Returns interventions array in API response
- Stores skip risk data in database

### 7. UI Components (`components/SkipRiskWarning.tsx`)
Three display components:
- **SkipRiskWarning**: Full warning card with reasoning and intervention message
- **SkipRiskBadge**: Compact badge for task lists (only shows medium/high risk)
- **SkipRiskProgressBar**: Visual progress bar representation

### 8. Plan Page Updates (`app/plan/page.tsx`)
- Displays skip risk badges on tasks with medium/high risk
- Shows risk percentage and level
- Integrated with existing task display

## Requirements Validated

✅ **17.1**: Calculate skip risk (low, medium, high) for each scheduled task
✅ **17.2**: Increase skip risk when user is behind schedule
✅ **17.3**: Predict 60% likelihood of skipping after one skip
✅ **17.4**: Predict 75% likelihood of abandoning when >30min behind
✅ **17.5**: Track morning start strength
✅ **17.6**: Track afternoon falloff
✅ **17.7**: Trigger interventions for high-risk tasks

## Testing

Created comprehensive test script (`scripts/test-skip-risk.ts`) that validates:
- Low risk scenarios (normal conditions)
- Medium risk scenarios (behind schedule)
- High risk scenarios (>30 min behind)
- Skip after skip behavior (60% base risk)
- Collapsed momentum scenarios
- Intervention triggers
- Skip risk metrics calculation

All tests pass successfully! ✅

## Usage Example

```typescript
import { calculateSkipRisk, shouldTriggerIntervention } from '@/lib/skip-risk';

// Calculate skip risk for a task
const riskResult = calculateSkipRisk({
  minutesBehind: 25,
  tasksSkipped: 1,
  momentumState: 'weak',
  timeOfDay: 14,
  taskPriority: 3,
  morningRunOver: true,
});

console.log(riskResult.riskLevel); // 'high'
console.log(riskResult.riskPercentage); // 85
console.log(riskResult.reasoning); // Detailed explanation

// Check if intervention is needed
const intervention = shouldTriggerIntervention(riskResult, 3, 10);
if (intervention.shouldIntervene) {
  console.log(intervention.interventionType); // 'rescue_schedule'
  console.log(intervention.message); // Intervention message
}
```

## Next Steps

The Skip Risk Prediction System is now fully integrated and ready to use. Future enhancements could include:

1. **Machine Learning**: Train models on user-specific skip patterns
2. **Real-time Updates**: Update skip risk as tasks are completed/skipped throughout the day
3. **Personalized Thresholds**: Adjust risk thresholds based on individual user patterns
4. **Intervention Effectiveness Tracking**: Measure how well interventions prevent task abandonment

## Files Modified/Created

**Created:**
- `lib/skip-risk.ts` - Core skip risk calculation module
- `components/SkipRiskWarning.tsx` - UI components for displaying skip risk
- `scripts/test-skip-risk.ts` - Test script for validation
- `SKIP_RISK_IMPLEMENTATION.md` - This documentation

**Modified:**
- `lib/auto-scheduler.ts` - Integrated skip risk calculation
- `app/api/plan/generate/route.ts` - Added skip risk to API response
- `app/plan/page.tsx` - Display skip risk in UI
- `prisma/schema.prisma` - Added skip risk fields to database
