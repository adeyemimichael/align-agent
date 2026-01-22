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
