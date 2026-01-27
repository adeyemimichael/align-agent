# Design Document: Adaptive Productivity Agent

## Overview

The Adaptive Productivity Agent is a Next.js web application that uses AI to create realistic daily plans based on human capacity signals. Unlike traditional productivity tools that assume constant output, this system adapts to the user's actual state (energy, sleep, stress, mood) and learns patterns over time to prevent burnout while maximizing meaningful work.

The system integrates with Google Calendar for time blocking, multiple task management platforms (Todoist, Notion, Linear) for task sourcing, and uses Google's Gemini AI for intelligent reasoning about task prioritization and capacity management.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Landing     │  │  Dashboard   │  │  Check-in    │     │
│  │  Page        │  │  & Planning  │  │  Interface   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Auth    │  │ Check-in │  │ Planning │  │Integration│   │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Database   │   │  Gemini AI   │   │ External APIs│
│  (Prisma +   │   │   Service    │   │ - Google Cal │
│   PostgreSQL)│   │              │   │ - Todoist    │
│              │   │              │   │ - Notion     │
│              │   │              │   │ - Linear     │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: NextAuth.js v5 with Google OAuth
- **AI**: Google Gemini AI API
- **State Management**: Zustand
- **Testing**: Vitest, React Testing Library, fast-check (property-based testing)
- **Integrations**: Google Calendar API, Todoist API, Notion API, Linear API

## Components and Interfaces

### Frontend Components

#### 1. Landing Page (`/`)
- Hero section explaining the problem (burnout from constant-output expectations)
- Feature showcase (capacity-based planning, AI reasoning, integrations)
- Call-to-action buttons (Sign Up, Login)
- Greenish color scheme (#10B981 primary, #059669 accent)
- Responsive design with mobile-first approach

#### 2. Dashboard (`/dashboard`)
- Current capacity score visualization (circular progress indicator)
- Today's mode badge (Recovery/Balanced/Deep Work)
- Daily plan with task list and time blocks
- Goal progress tracker
- Quick check-in button
- 7-day capacity trend chart

#### 3. Check-in Interface (`/check-in`)
- Four slider inputs (Energy, Sleep, Stress, Mood)
- Visual feedback as user adjusts sliders
- Submit button that triggers capacity calculation
- Historical check-in data display
- Goal reminder section

#### 4. Settings Page (`/settings`)
- Integration management (connect/disconnect platforms)
- Notification preferences
- Goal management
- Account settings

### API Routes

#### Authentication Routes
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (NextAuth)
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - User logout

#### Check-in Routes
- `POST /api/checkin` - Submit daily check-in
- `GET /api/checkin/latest` - Get most recent check-in
- `GET /api/checkin/history` - Get 7-day history

#### Planning Routes
- `POST /api/plan/generate` - Generate daily plan
- `GET /api/plan/current` - Get today's plan
- `PATCH /api/plan/:id` - Update plan (user adjustments)

#### Integration Routes
- `POST /api/integrations/google/connect` - OAuth flow for Google Calendar
- `POST /api/integrations/todoist/connect` - Connect Todoist
- `POST /api/integrations/notion/connect` - Connect Notion
- `POST /api/integrations/linear/connect` - Connect Linear
- `GET /api/integrations/tasks` - Fetch tasks from connected platform
- `POST /api/integrations/tasks/:id/complete` - Mark task complete

#### Goal Routes
- `POST /api/goals` - Create new goal
- `GET /api/goals` - Get user's goals
- `PATCH /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

## Data Models

### Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  checkIns      CheckIn[]
  plans         DailyPlan[]
  goals         Goal[]
  integrations  Integration[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model CheckIn {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date          DateTime @default(now())
  energyLevel   Int      // 1-10
  sleepQuality  Int      // 1-10
  stressLevel   Int      // 1-10
  mood          String   // "positive", "neutral", "negative"
  capacityScore Float    // 0-100
  mode          String   // "recovery", "balanced", "deep_work"
  createdAt     DateTime @default(now())
  @@unique([userId, date])
  @@index([userId, date])
}

model DailyPlan {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime
  capacityScore   Float
  mode            String
  tasks           PlanTask[]
  geminiReasoning String   @db.Text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@unique([userId, date])
  @@index([userId, date])
}

model PlanTask {
  id              String    @id @default(cuid())
  planId          String
  plan            DailyPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  externalId      String?   // ID from Todoist/Notion/Linear
  title           String
  description     String?
  priority        Int       // 1-4 (1 highest)
  estimatedMinutes Int
  scheduledStart  DateTime?
  scheduledEnd    DateTime?
  completed       Boolean   @default(false)
  goalId          String?
  goal            Goal?     @relation(fields: [goalId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  @@index([planId])
}

model Goal {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  description String?
  category    String     // "work", "health", "personal"
  targetDate  DateTime?
  tasks       PlanTask[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  @@index([userId])
}

model Integration {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  platform     String   // "google_calendar", "todoist", "notion", "linear"
  accessToken  String   @db.Text
  refreshToken String?  @db.Text
  expiresAt    DateTime?
  metadata     Json?    // Platform-specific config (e.g., Notion database ID)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@unique([userId, platform])
  @@index([userId])
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before defining the correctness properties, let me analyze each acceptance criterion for testability:

### Acceptance Criteria Testing Prework

**1.1** WHEN a user accesses the system each day, THE Agent SHALL display a check-in interface
- Thoughts: This is a UI rendering requirement. We can test that the check-in component renders with all required input fields.
- Testable: yes - example

**1.2** WHEN a user submits a check-in, THE Agent SHALL validate that all required fields contain values within acceptable ranges
- Thoughts: This is about input validation across all possible inputs. We can generate random check-in data and verify validation rules hold.
- Testable: yes - property

**1.3** WHEN a check-in is submitted, THE Agent SHALL store the data with a timestamp
- Thoughts: This is about data persistence. For any valid check-in, storing then retrieving should return equivalent data.
- Testable: yes - property (round-trip)

**2.1** WHEN a check-in is completed, THE Agent SHALL compute a Capacity_Score
- Thoughts: For any valid check-in inputs, a capacity score should be computed and be within 0-100.
- Testable: yes - property

**2.2-2.6** Capacity score weighting rules
- Thoughts: These specify how different inputs affect the score. We can test that the relationships hold (high energy increases score, high stress decreases it, etc.)
- Testable: yes - property

**3.1-3.3** Mode selection based on capacity score
- Thoughts: For any capacity score, exactly one mode should be selected according to the thresholds.
- Testable: yes - property

**4.1-4.6** Google Calendar integration
- Thoughts: These involve external API calls. We can test the integration logic with mocked responses.
- Testable: yes - property (with mocks)

**5.1-5.12** Task management integration
- Thoughts: Similar to calendar integration, testable with mocked API responses. Round-trip properties for sync.
- Testable: yes - property

**6.1-6.6** Gemini AI reasoning
- Thoughts: AI responses are non-deterministic, but we can test that the integration correctly formats requests and parses responses.
- Testable: yes - property (structure validation)

**7.1-7.7** Historical pattern learning
- Thoughts: For any sequence of check-ins, pattern detection should work consistently. Adjustment logic should be deterministic.
- Testable: yes - property

**8.1-8.7** Daily plan generation
- Thoughts: For any valid inputs, a plan should be generated within time limits and contain required fields.
- Testable: yes - property

**9.1-9.7** Landing page
- Thoughts: UI rendering and responsiveness. Mostly example-based testing.
- Testable: yes - example

**10.1-10.7** Authentication
- Thoughts: Auth flows are well-defined. Round-trip properties for session management.
- Testable: yes - property

**11.1-11.7** Data persistence
- Thoughts: Database operations should preserve data integrity. Round-trip properties.
- Testable: yes - property

**12.1-12.7** Goal setting
- Thoughts: CRUD operations on goals. Standard database property tests.
- Testable: yes - property

**13.1-13.5** Opik tracking
- Thoughts: Logging operations. Can verify logs are created with correct structure.
- Testable: yes - property

**14.1-14.7** Notifications
- Thoughts: Notification scheduling and delivery. Can test scheduling logic.
- Testable: yes - property

### Property Reflection

After reviewing all testable properties, I'll consolidate redundant ones:

- Properties 1.3, 11.1-11.7 all test data persistence → Combine into comprehensive persistence properties
- Properties 4.1-4.6, 5.1-5.12 test external integrations → Combine into integration properties
- Properties 2.1-2.6 all test capacity calculation → Combine into capacity score properties

### Correctness Properties

**Property 1: Check-in validation**
*For any* check-in submission, if energy, sleep, and stress are outside the range 1-10, or mood is not in the valid set, the system should reject the submission with a validation error.
**Validates: Requirements 1.2**

**Property 2: Check-in round-trip persistence**
*For any* valid check-in data, storing it to the database and then retrieving it should return data equivalent to the original input (with system-generated fields like ID and timestamp added).
**Validates: Requirements 1.3, 11.2**

**Property 3: Capacity score bounds**
*For any* valid check-in inputs (energy, sleep, stress, mood), the computed capacity score should be a number between 0 and 100 inclusive.
**Validates: Requirements 2.1, 2.2**

**Property 4: Capacity score monotonicity**
*For any* two check-ins that differ only in energy level, the check-in with higher energy should produce a capacity score greater than or equal to the one with lower energy (all else being equal).
**Validates: Requirements 2.3**

**Property 5: Stress penalty**
*For any* two check-ins that differ only in stress level, the check-in with higher stress should produce a capacity score less than or equal to the one with lower stress.
**Validates: Requirements 2.5**

**Property 6: Mode selection determinism**
*For any* capacity score, exactly one mode (recovery, balanced, or deep_work) should be selected, and the same score should always produce the same mode.
**Validates: Requirements 3.1, 3.2, 3.3**

**Property 7: Mode threshold correctness**
*For any* capacity score below 40, recovery mode should be selected; for scores 70 and above, deep work mode should be selected; for scores between 40 and 69, balanced mode should be selected.
**Validates: Requirements 3.1, 3.2, 3.3**

**Property 8: Task priority ordering**
*For any* list of tasks with different priorities, when sorted by the planning algorithm, tasks with higher priority (lower priority number) should appear before tasks with lower priority.
**Validates: Requirements 5.4, 5.5**

**Property 9: Calendar event creation**
*For any* generated daily plan with scheduled tasks, each task should result in a corresponding calendar event with matching title, start time, and duration.
**Validates: Requirements 4.2, 4.3**

**Property 10: Task completion sync**
*For any* task marked as complete in the system, the completion status should be synced back to the source platform (Todoist/Notion/Linear) within a reasonable time.
**Validates: Requirements 5.7**

**Property 11: Historical window consistency**
*For any* user, the 7-day history window should contain at most 7 check-ins, ordered by date descending, with the most recent check-in first.
**Validates: Requirements 7.1**

**Property 12: Pattern detection threshold**
*For any* sequence of 3 or more consecutive check-ins with capacity scores below 50, the system should detect a declining pattern and suggest recovery mode.
**Validates: Requirements 7.3**

**Property 13: Plan generation time limit**
*For any* valid check-in and task list, a daily plan should be generated and returned within 10 seconds.
**Validates: Requirements 8.1**

**Property 14: Goal-task association**
*For any* task in a daily plan that is associated with a goal, the goal should exist in the user's goal list and belong to the same user.
**Validates: Requirements 12.4**

**Property 15: Integration credential security**
*For any* stored integration credentials (OAuth tokens, API keys), the data should be encrypted at rest in the database.
**Validates: Requirements 11.7**

**Property 16: Session authentication**
*For any* request to protected routes (check-in, planning, integrations), if no valid session exists, the request should be rejected with a 401 Unauthorized response.
**Validates: Requirements 10.5**

**Property 17: Notification scheduling**
*For any* user who has not completed a check-in by 9 AM, a notification should be scheduled with a message referencing their goals.
**Validates: Requirements 14.1, 14.2**

**Property 18: Time blindness buffer application**
*For any* task with historical completion data, the adjusted time estimate should be the original estimate multiplied by the learned buffer, and the buffer should be between 0.5x and 3.0x.
**Validates: Requirements 15.2, 15.3**

**Property 19: Productivity window scheduling**
*For any* high-priority task, it should be scheduled during hours with completion rates above 60%, unless no such hours are available.
**Validates: Requirements 16.3**

**Property 20: Skip risk calculation**
*For any* task in a schedule where the user is more than 30 minutes behind, the skip risk should be marked as "high".
**Validates: Requirements 17.4**

**Property 21: Momentum state transitions**
*For any* sequence of task completions, if 2 or more consecutive tasks are skipped, the momentum state should transition to "collapsed".
**Validates: Requirements 20.5**

## Real-Time Adaptive Scheduling System

### Overview

The real-time adaptive scheduling system is the core intelligence that makes this agent truly autonomous. Unlike traditional schedulers that create static plans, this system continuously monitors progress, predicts outcomes, and adapts the schedule throughout the day.

### Architecture Components

```
┌─────────────────────────────────────────────────────────────┐
│                   Real-Time Monitoring Layer                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Task App    │  │  Progress    │  │  Time        │     │
│  │  Sync        │  │  Tracker     │  │  Tracker     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Analysis & Prediction Layer                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Momentum    │  │  Skip Risk   │  │  Time        │     │
│  │  Detector    │  │  Predictor   │  │  Blindness   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Adaptive Decision Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Gemini AI   │  │  Re-Schedule │  │  Notification│     │
│  │  Agent       │  │  Engine      │  │  Generator   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Time Blindness Compensation System

**Purpose**: Learn how long tasks actually take the user and apply intelligent buffers to future estimates.

**Components**:

1. **Time Tracking Service** (`lib/time-tracking.ts`)
   - Records actual start/end times for all tasks
   - Calculates actual duration vs estimated duration
   - Computes time blindness buffer (actual/estimated ratio)
   - Stores historical accuracy data

2. **Buffer Calculation Algorithm**:
   ```typescript
   interface BufferCalculation {
     averageBuffer: number;        // Overall multiplier (e.g., 1.8 = 180% of estimate)
     taskTypeBuffers: {            // Different buffers per task type
       writing: number;            // e.g., 2.1x for writing tasks
       coding: number;             // e.g., 1.4x for coding tasks
       admin: number;              // e.g., 0.9x for admin tasks
     };
     timeOfDayAdjustment: {        // Afternoon tasks need more buffer
       morning: 1.0;               // 9am-12pm: baseline
       afternoon: 1.2;             // 1pm-5pm: +20% buffer
     };
     confidence: 'low' | 'medium' | 'high';  // Based on sample size
   }
   ```

3. **Application Strategy**:
   - New users: Use conservative 1.5x default buffer
   - 5-15 completed tasks: Medium confidence, apply learned buffer
   - 15+ completed tasks: High confidence, apply task-type-specific buffers
   - Add transition time (15min) between different task types

**AI Integration**:
The Gemini AI agent receives buffer data and makes final scheduling decisions:
```typescript
// AI receives this context
{
  historicalData: {
    averageBuffer: 1.8,
    taskTypeBuffers: { writing: 2.1, coding: 1.4 },
    completionRatesByHour: { 9: 0.85, 14: 0.45 }
  }
}
// AI decides: "Schedule writing task at 9am with 2.1x buffer (90min instead of 45min)"
```

### Productivity Window Optimization

**Purpose**: Schedule tasks during hours when the user is most likely to complete them successfully.

**Components**:

1. **Productivity Window Tracker** (`lib/productivity-windows.ts`)
   - Tracks completion rate by hour of day
   - Identifies peak windows (>70% completion rate)
   - Identifies slump periods (<50% completion rate)
   - Tracks patterns by task type

2. **Window Data Structure**:
   ```typescript
   interface ProductivityWindow {
     hour: number;                 // 0-23
     completionRate: number;       // 0-100
     taskCount: number;            // Sample size
     taskTypes: {
       creative: number;           // Completion rate for creative tasks
       admin: number;              // Completion rate for admin tasks
       meetings: number;           // Completion rate for meetings
     };
   }
   ```

3. **Scheduling Rules**:
   - High-priority tasks → Peak windows (>70% completion rate)
   - Medium-priority tasks → Good windows (50-70% completion rate)
   - Low-priority tasks → Any available window
   - Avoid scheduling demanding tasks during slump periods (e.g., 2-3pm)

**AI Integration**:
```typescript
// AI receives productivity windows
{
  productivityWindows: {
    "9": { completionRate: 0.85, taskCount: 20 },
    "14": { completionRate: 0.45, taskCount: 12 }  // Post-lunch slump
  }
}
// AI decides: "Schedule proposal at 9am (85% success rate), not at 2pm (45% success rate)"
```

### Skip Risk Prediction System

**Purpose**: Predict when the user is likely to abandon tasks and intervene proactively.

**Components**:

1. **Skip Risk Calculator** (`lib/skip-risk.ts`)
   - Calculates risk level: low, medium, high
   - Considers current progress vs schedule
   - Analyzes momentum state
   - Tracks skip patterns

2. **Risk Factors**:
   ```typescript
   interface SkipRiskFactors {
     minutesBehind: number;        // How far behind schedule
     tasksSkipped: number;         // Tasks skipped today
     momentumState: string;        // strong, normal, weak, collapsed
     timeOfDay: number;            // Later in day = higher risk
     taskPriority: number;         // Lower priority = higher risk
   }
   ```

3. **Risk Calculation**:
   - Base risk: 20%
   - +30% if >15 minutes behind schedule
   - +45% if >30 minutes behind schedule
   - +40% if 1 task already skipped (60% total)
   - +55% if 2+ tasks skipped (75% total)
   - +20% if afternoon and morning ran over

4. **Intervention Triggers**:
   - Medium risk (40-60%): Send supportive check-in
   - High risk (>60%): Trigger "rescue schedule"
   - Rescue schedule: Defer all non-urgent tasks, protect 1-2 core wins

### Momentum Tracking System

**Purpose**: Detect flow states and momentum collapse to capitalize on high-energy periods and intervene during crashes.

**Components**:

1. **Momentum State Machine**:
   ```typescript
   type MomentumState = 'strong' | 'normal' | 'weak' | 'collapsed';
   
   interface MomentumTransitions {
     strong: {
       trigger: 'early_completion',
       effect: 'boost_predictions_by_15%',
       suggestion: 'pull_forward_tasks'
     };
     weak: {
       trigger: 'task_skipped',
       effect: 'reduce_predictions_by_20%',
       suggestion: 'simplify_remaining_tasks'
     };
     collapsed: {
       trigger: '2_consecutive_skips',
       effect: 'trigger_rescue_schedule',
       suggestion: 'defer_all_but_one_task'
     };
   }
   ```

2. **Momentum Metrics**:
   - **Morning Start Strength**: % of morning tasks that get started (baseline: 82%)
   - **Completion-After-Early-Win Rate**: Likelihood of completing next task after early completion (baseline: 78%)
   - **Afternoon Falloff**: % of afternoon tasks completed when morning runs over (baseline: 35%)

3. **AI-Driven Momentum Responses**:
   - **Strong momentum detected**: AI suggests pulling forward tomorrow's tasks
   - **Weak momentum detected**: AI simplifies remaining tasks, adds breaks
   - **Collapsed momentum**: AI triggers rescue schedule, sends encouragement

### Intelligent Check-In System

**Purpose**: Check in with the user throughout the day, sync with task apps, and adapt the schedule based on responses.

**Components**:

1. **Check-In Scheduler**:
   - Default times: 10am, 1pm, 3:30pm (user-configurable)
   - Triggers: Time-based, progress-based, risk-based
   - Notification channels: Push, email, SMS

2. **Check-In Message Generator**:
   ```typescript
   interface CheckInMessage {
     time: string;
     trigger: 'scheduled' | 'behind_schedule' | 'momentum_collapse';
     message: string;
     responseOptions: string[];
     adaptiveActions: Record<string, ScheduleAdjustment>;
   }
   ```

3. **Task App Sync Integration**:
   - Before each check-in, sync with Todoist/task app
   - Detect completions not in original plan
   - Detect tasks marked complete but not started
   - Reference specific task status in notification

4. **Response Handling**:
   ```typescript
   // User responds "Still working"
   → Extend current task time, defer next task
   
   // User responds "Stuck"
   → Defer current task, suggest easier win, offer to break into smaller chunks
   
   // User responds "Done"
   → Celebrate, check momentum state, continue with plan or suggest additions
   ```

5. **Notification Tone Adaptation**:
   - **Gentle**: "Just checking in—how's it going with the proposal? No pressure, just want to help you finish strong 💙"
   - **Direct**: "Proposal status check: Todoist shows incomplete. Done, still working, or stuck? Reply and I'll adjust."
   - **Minimal**: "Proposal done?"

### Mid-Day Re-Scheduling Engine

**Purpose**: Rebuild the schedule mid-day based on actual progress, protecting core tasks while adapting to reality.

**Components**:

1. **Progress Analyzer**:
   ```typescript
   interface ProgressAnalysis {
     minutesAhead: number;         // Positive if ahead, negative if behind
     tasksCompleted: number;
     tasksSkipped: number;
     currentTask: string;
     momentumState: MomentumState;
     skipRisk: 'low' | 'medium' | 'high';
   }
   ```

2. **Re-Scheduling Algorithm**:
   ```typescript
   function reScheduleAfternoon(analysis: ProgressAnalysis): NewSchedule {
     // Step 1: Calculate remaining available time
     const remainingMinutes = calculateRemainingTime(analysis);
     
     // Step 2: Protect high-priority and due-soon tasks
     const protectedTasks = filterProtectedTasks(remainingTasks);
     
     // Step 3: Let AI re-schedule with updated context
     const aiSchedule = await gemini.scheduleTasksWithAI({
       currentTime: '13:00',
       remainingMinutes,
       protectedTasks,
       momentumState: analysis.momentumState,
       skipRisk: analysis.skipRisk
     });
     
     return aiSchedule;
   }
   ```

3. **Re-Scheduling Triggers**:
   - Scheduled check-in (1pm, 3:30pm)
   - User request ("I'm stuck, help me re-plan")
   - High skip risk detected (>60%)
   - Momentum collapse (2+ skipped tasks)
   - Unplanned completions detected in task app

4. **Protection Rules**:
   - Always protect tasks due today or tomorrow
   - Always protect P1 (highest priority) tasks
   - Defer P3-P4 tasks first when capacity exceeded
   - Maintain at least 1 achievable win for the day

### Adaptive Notification System

**Purpose**: Send notifications that adapt to the user's current state, progress, and preferences.

**Components**:

1. **Notification Types**:
   - **Morning Check-In Reminder**: "Ready to make progress on [Goal]? Check in to plan your day"
   - **Task Start Reminder**: "Proposal starts in 5 minutes. You've got this! 🎯"
   - **Progress Check-In**: "How's the proposal going? I see it's not marked complete in Todoist yet"
   - **Celebration**: "You crushed that admin task 10min early! 🎉 Want to jump into the proposal now?"
   - **Supportive Intervention**: "No worries about running over—proposals are tricky! I'm giving you until 2:30pm"

2. **Tone Adaptation Engine**:
   ```typescript
   function generateNotification(
     type: NotificationType,
     context: UserContext,
     style: 'gentle' | 'direct' | 'minimal'
   ): Notification {
     const templates = {
       gentle: {
         behind_schedule: "Just checking in—how's it going? No pressure, just want to help you finish strong 💙",
         task_start: "About to start [task]—how's your focus level? 💪"
       },
       direct: {
         behind_schedule: "You're 15min behind. Should I defer [task] or extend your current work time?",
         task_start: "[Task] starts in 5min. Ready?"
       },
       minimal: {
         behind_schedule: "Behind schedule. Defer [task]? Y/N",
         task_start: "[Task] in 5min"
       }
     };
     
     return templates[style][type];
   }
   ```

3. **Smart Notification Timing**:
   - Don't interrupt during first 15 minutes of a task (focus time)
   - Batch notifications if multiple triggers occur within 10 minutes
   - Respect "Do Not Disturb" hours (user-configurable)
   - Increase frequency when skip risk is high

### Gemini AI Agent Integration

**Purpose**: Use Gemini AI as the central decision-making agent that receives all context and makes intelligent scheduling decisions.

**AI Agent Prompt Structure**:

```typescript
const aiAgentPrompt = `
You are an AI scheduling agent for an ADHD-focused productivity app.

**USER CONTEXT:**
- Capacity Score: ${capacityScore}/100
- Mode: ${mode}
- Current Time: ${currentTime}
- Available Time: ${availableMinutes} minutes

**HISTORICAL PATTERNS:**
- Time Blindness Buffer: ${averageBuffer}x
- Productivity Windows: ${productivityWindows}
- Skip Patterns: ${skipPatterns}
- Momentum State: ${momentumState}

**CURRENT PROGRESS:**
- Tasks Completed: ${completedTasks}
- Tasks Skipped: ${skippedTasks}
- Minutes Behind: ${minutesBehind}
- Skip Risk: ${skipRisk}

**TASKS TO SCHEDULE:**
${tasks}

**YOUR JOB:**
1. Calculate intelligent available time (consider trends, day of week, capacity context)
2. Prioritize tasks (deadline urgency, goal alignment, energy requirements, current momentum)
3. Apply smart time blindness buffers (task type, time of day, real-time performance)
4. Optimize time windows (schedule high-priority during peak hours)
5. Build intelligent schedule (task flow, energy management, strategic breaks)
6. Generate check-in notifications (supportive, references task app status)
7. Predict schedule changes (if ahead/behind, what should adapt)
8. Generate cohesive reasoning (explain strategy, insights, advice)

**CRITICAL RULES:**
- Always explain your reasoning
- Use actual historical data
- Be capacity-aware (ADHD users crash when overloaded)
- Account for task switching costs
- No toxic positivity
- Teach patterns
- Sync with task app religiously
- Adapt, don't scold
- Predict momentum collapse and intervene early

Generate the schedule now:
`;
```

**AI Response Format**:
```json
{
  "availableTime": {
    "availableMinutes": 340,
    "remainingMinutes": 280,
    "reasoning": "..."
  },
  "prioritizedTasks": [...],
  "adjustedTasks": [...],
  "timeWindowRecommendations": [...],
  "schedule": [...],
  "notifications": [...],
  "scheduleAdaptation": {...},
  "reasoning": {
    "overallReasoning": "...",
    "keyInsights": [...],
    "goalAlignment": "...",
    "advice": "...",
    "adaptiveStrategy": "..."
  }
}
```

## Error Handling

### Client-Side Error Handling

1. **Network Errors**: Display user-friendly messages with retry options
2. **Validation Errors**: Show inline validation feedback on form fields
3. **Authentication Errors**: Redirect to login with appropriate message
4. **Integration Errors**: Show specific error messages for each platform (e.g., "Todoist connection failed")

### Server-Side Error Handling

1. **Database Errors**: Log errors, return generic 500 response to client
2. **External API Errors**: Implement retry logic with exponential backoff
3. **AI Service Errors**: Fallback to rule-based planning if Gemini fails
4. **Validation Errors**: Return 400 with detailed error messages

### Error Recovery Strategies

1. **Graceful Degradation**: If Gemini AI fails, use simple rule-based capacity calculation
2. **Retry Logic**: Retry failed external API calls up to 3 times
3. **Fallback Data**: If task fetch fails, use cached tasks from previous sync
4. **User Notification**: Inform users of integration issues via dashboard alerts

## Testing Strategy

### Dual Testing Approach

The system will use both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs using fast-check library

### Unit Testing

Unit tests will focus on:
- Specific examples that demonstrate correct behavior (e.g., capacity score = 75 for specific inputs)
- Integration points between components (e.g., API route handlers)
- Edge cases (e.g., empty task lists, missing optional fields)
- Error conditions (e.g., invalid tokens, network failures)

### Property-Based Testing

Property tests will use fast-check with minimum 100 iterations per test:

1. **Capacity Score Properties** (Properties 3, 4, 5)
   - Generate random check-in data
   - Verify score bounds, monotonicity, and stress penalties

2. **Mode Selection Properties** (Properties 6, 7)
   - Generate random capacity scores
   - Verify deterministic mode selection and threshold correctness

3. **Data Persistence Properties** (Property 2)
   - Generate random check-in objects
   - Verify round-trip persistence (store → retrieve → compare)

4. **Task Ordering Properties** (Property 8)
   - Generate random task lists with priorities
   - Verify correct priority-based sorting

5. **Historical Window Properties** (Property 11)
   - Generate sequences of check-ins
   - Verify 7-day window constraints

6. **Pattern Detection Properties** (Property 12)
   - Generate sequences with declining capacity
   - Verify pattern detection triggers correctly

Each property test will include a comment tag:
```typescript
// Feature: adaptive-productivity-agent, Property 3: Capacity score bounds
```

### Integration Testing

Integration tests will verify:
- End-to-end flows (sign up → check-in → plan generation)
- External API integrations (with mocked responses)
- Database transactions and rollbacks

### Test Configuration

- Test framework: Vitest
- Property testing: fast-check
- React testing: React Testing Library
- Accessibility testing: jest-axe
- Minimum property test iterations: 100
