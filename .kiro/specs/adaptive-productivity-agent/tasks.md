# Implementation Plan: Adaptive Productivity Agent

## Overview

This implementation plan breaks down the adaptive productivity agent into discrete, incremental tasks. Each task builds on previous work, with testing integrated throughout. The plan prioritizes core functionality first (check-in, capacity calculation, basic planning) before adding integrations and advanced features.

## Tasks

- [x] 1. Project Setup and Database Configuration
  - Initialize Prisma with PostgreSQL
  - Create database schema with all models (User, CheckIn, DailyPlan, PlanTask, Goal, Integration)
  - Run initial migration
  - Set up environment variables for database connection
  - _Requirements: 11.1, 11.2_

- [x] 1.1 Write property test for database schema
  - **Property 2: Check-in round-trip persistence**
  - **Validates: Requirements 1.3, 11.2**

- [x] 2. Authentication System
  - [x] 2.1 Configure NextAuth.js with Google OAuth provider
    - Set up NextAuth configuration file
    - Configure Google OAuth credentials
    - Create auth API routes
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 2.2 Create protected route middleware
    - Implement session validation
    - Add authentication checks to API routes
    - _Requirements: 10.5_

  - [ ]* 2.3 Write property test for session authentication
    - **Property 16: Session authentication**
    - **Validates: Requirements 10.5**

  - [x] 2.4 Build sign-up and login UI components
    - Create login page with Google OAuth button
    - Create registration form
    - Add loading and error states
    - _Requirements: 10.1, 10.2_

- [x] 3. Check-in System
  - [x] 3.1 Create check-in data model and API routes
    - Implement POST /api/checkin endpoint
    - Implement GET /api/checkin/latest endpoint
    - Implement GET /api/checkin/history endpoint
    - Add input validation
    - _Requirements: 1.2, 1.3_

  - [ ]* 3.2 Write property tests for check-in validation
    - **Property 1: Check-in validation**
    - **Validates: Requirements 1.2**

  - [x] 3.3 Build check-in UI component
    - Create slider inputs for energy, sleep, stress (1-10 scale)
    - Create mood selector (positive/neutral/negative)
    - Add visual feedback and validation
    - Implement submit functionality
    - _Requirements: 1.1, 1.4_

  - [ ]* 3.4 Write unit tests for check-in UI
    - Test slider interactions
    - Test form submission
    - Test validation error display
    - _Requirements: 1.1, 1.2_

- [ ] 4. Capacity Score Calculation
  - [x] 4.1 Implement capacity score algorithm
    - Create calculation function with weighted inputs
    - Energy: positive weight (0.3)
    - Sleep: positive weight (0.3)
    - Stress: negative weight (0.25)
    - Mood: modifier (0.15)
    - Normalize to 0-100 scale
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 4.2 Write property tests for capacity score
    - **Property 3: Capacity score bounds**
    - **Property 4: Capacity score monotonicity**
    - **Property 5: Stress penalty**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.5**

  - [x] 4.3 Integrate capacity calculation with check-in submission
    - Calculate score on check-in submission
    - Store score in database
    - Return score in API response
    - _Requirements: 2.1, 2.7_

- [ ] 5. Mode Selection Logic
  - [x] 5.1 Implement mode selection algorithm
    - Create function to determine mode from capacity score
    - Recovery mode: score < 40
    - Balanced mode: 40 ≤ score < 70
    - Deep work mode: score ≥ 70
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.2 Write property tests for mode selection
    - **Property 6: Mode selection determinism**
    - **Property 7: Mode threshold correctness**
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [x] 5.3 Display mode on dashboard
    - Create mode badge component
    - Show current mode after check-in
    - Add mode-specific styling
    - _Requirements: 3.6_

- [x] 6. Checkpoint - Core Check-in Flow Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Dashboard and Visualization
  - [x] 7.1 Create dashboard layout
    - Build main dashboard page
    - Add capacity score visualization (circular progress)
    - Display current mode badge
    - Show quick check-in button
    - _Requirements: 8.2_

  - [x] 7.2 Implement 7-day capacity trend chart
    - Fetch 7-day check-in history
    - Create line chart component
    - Display energy, sleep, stress trends
    - _Requirements: 7.1, 11.6_

  - [ ]* 7.3 Write property test for historical window
    - **Property 11: Historical window consistency**
    - **Validates: Requirements 7.1**

- [x] 8. Goal Management System
  - [x] 8.1 Create goal data model and API routes
    - Implement POST /api/goals endpoint
    - Implement GET /api/goals endpoint
    - Implement PATCH /api/goals/:id endpoint
    - Implement DELETE /api/goals/:id endpoint
    - _Requirements: 12.1, 12.2, 12.3, 12.7_

  - [x] 8.2 Build goal management UI
    - Create goal creation form
    - Display goal list with progress
    - Add edit and delete functionality
    - _Requirements: 12.1, 12.5_

  - [x]* 8.3 Write property test for goal-task association
    - **Property 14: Goal-task association**
    - **Validates: Requirements 12.4**

- [x] 9. Task Management Integration - Todoist
  - [x] 9.1 Implement Todoist OAuth flow
    - Create OAuth connection endpoint
    - Store access token securely (encrypted)
    - Handle token refresh
    - _Requirements: 5.1, 5.2, 11.7_

  - [ ]* 9.2 Write property test for credential security
    - **Property 15: Integration credential security**
    - **Validates: Requirements 11.7**

  - [x] 9.3 Implement Todoist task fetching
    - Create service to fetch tasks from Todoist API
    - Parse task data (name, due date, priority, project)
    - Store in local database
    - _Requirements: 5.3, 5.4_

  - [x] 9.4 Implement task completion sync
    - Sync completed tasks back to Todoist
    - Handle sync errors gracefully
    - _Requirements: 5.7_

  - [ ]* 9.5 Write property test for task completion sync
    - **Property 10: Task completion sync**
    - **Validates: Requirements 5.7**

- [x] 10. Google Calendar Integration
  - [x] 10.1 Implement Google Calendar OAuth flow
    - Create OAuth connection endpoint
    - Store credentials securely
    - Handle token refresh
    - _Requirements: 4.1_

  - [x] 10.2 Implement calendar event creation
    - Create service to create calendar events
    - Map tasks to calendar events
    - Handle scheduling conflicts
    - _Requirements: 4.2, 4.3, 4.5, 4.6_

  - [ ]* 10.3 Write property test for calendar event creation
    - **Property 9: Calendar event creation**
    - **Validates: Requirements 4.2, 4.3**

- [ ] 11. Checkpoint - Integrations Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Gemini AI Integration
  - [x] 12.1 Set up Gemini AI API client
    - Configure API credentials
    - Create service wrapper for Gemini API
    - Implement error handling and retries
    - _Requirements: 6.1_

  - [x] 12.2 Implement AI-powered planning
    - Create prompt template with capacity score, tasks, and history
    - Send request to Gemini AI
    - Parse AI response for task ordering and reasoning
    - _Requirements: 6.2, 6.3_

  - [x] 12.3 Display AI reasoning chains
    - Create UI component to show reasoning
    - Format and display AI explanations
    - _Requirements: 6.4_

  - [ ]* 12.4 Write unit tests for AI integration
    - Test prompt formatting
    - Test response parsing
    - Test error handling
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 13. Daily Plan Generation
  - [x] 13.1 Implement plan generation algorithm
    - Combine capacity score, mode, tasks, and AI reasoning
    - Create prioritized task list
    - Allocate time blocks based on mode
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 13.2 Write property test for plan generation time
    - **Property 13: Plan generation time limit**
    - **Validates: Requirements 8.1**

  - [ ]* 13.3 Write property test for task priority ordering
    - **Property 8: Task priority ordering**
    - **Validates: Requirements 5.4, 5.5**

  - [x] 13.4 Build daily plan UI
    - Display prioritized task list
    - Show time allocations
    - Display AI reasoning
    - Add manual adjustment controls
    - _Requirements: 8.2, 8.5, 8.6_

  - [x] 13.5 Implement plan adjustment learning
    - Track user adjustments to plans
    - Store adjustment patterns
    - Use patterns to improve future plans
    - _Requirements: 8.7_

- [ ] 14. Historical Pattern Learning
  - [x] 14.1 Implement pattern detection algorithm
    - Analyze 7-day history for trends
    - Detect declining capacity patterns (3+ days below 50)
    - Detect high capacity patterns (3+ days above 70)
    - _Requirements: 7.2, 7.3, 7.4_

  - [ ]* 14.2 Write property test for pattern detection
    - **Property 12: Pattern detection threshold**
    - **Validates: Requirements 7.3**

  - [x] 14.3 Implement capacity adjustment logic
    - Track plan accuracy (planned vs actual completion)
    - Adjust future capacity calculations based on accuracy
    - _Requirements: 7.5, 7.6, 7.7_

- [ ] 15. Landing Page
  - [x] 15.1 Design and implement landing page
    - Create hero section explaining the problem
    - Add feature showcase section
    - Implement greenish color scheme (#10B981)
    - Add call-to-action buttons
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 15.2 Make landing page responsive
    - Implement mobile-first design
    - Test on various screen sizes
    - _Requirements: 9.6, 9.7_

  - [ ]* 15.3 Write accessibility tests for landing page
    - Use jest-axe to test accessibility
    - Ensure WCAG compliance
    - _Requirements: 9.1_

- [ ] 16. Checkpoint - Core Features Complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Additional Task Platform Integrations (Optional)
  - [ ] 17.1 Implement Notion integration
    - Create OAuth flow
    - Fetch tasks from Notion database
    - Sync completion status
    - _Requirements: 5.1, 5.2, 5.3, 5.11_

  - [ ] 17.2 Implement Linear integration
    - Create OAuth flow
    - Fetch assigned issues
    - Sync completion status
    - _Requirements: 5.1, 5.2, 5.3, 5.12_

- [ ] 18. Opik Tracking Integration (Optional)
  - [x] 18.1 Set up Opik client
    - Configure Opik API credentials
    - Create logging service
    - _Requirements: 13.1_

  - [x] 18.2 Implement AI decision tracking
    - Log Gemini AI requests and responses
    - Track reasoning chain quality
    - Track capacity score accuracy
    - _Requirements: 13.2, 13.3_

  - [x] 18.3 Create Opik dashboard
    - Display AI decision patterns
    - Show performance metrics
    - Add data export functionality
    - _Requirements: 13.4, 13.5_

- [-] 19. Notification System (Optional)
  - [x] 19.1 Implement notification scheduling
    - Create notification service
    - Schedule check-in reminders (9 AM)
    - Schedule task start reminders (5 min before)
    - _Requirements: 14.1, 14.3_

  - [ ]* 19.2 Write property test for notification scheduling
    - **Property 17: Notification scheduling**
    - **Validates: Requirements 14.1, 14.2**

  - [x] 19.3 Implement browser push notifications
    - Set up service worker
    - Request notification permissions
    - Send push notifications
    - _Requirements: 14.5_

  - [ ] 19.4 Implement email notifications
    - Set up email service (e.g., SendGrid)
    - Create email templates
    - Send fallback email notifications
    - _Requirements: 14.6_

  - [x] 19.5 Build notification preferences UI
    - Create settings page for notifications
    - Allow time and frequency configuration
    - _Requirements: 14.4_

- [-] 20. Final Integration and Polish
  - [x] 20.1 End-to-end testing
    - Test complete user flows
    - Test all integrations together
    - Fix any integration issues

  - [x] 20.2 Performance optimization
    - Optimize database queries
    - Add caching where appropriate
    - Minimize API calls

  - [x] 20.3 Error handling improvements
    - Add comprehensive error messages
    - Implement graceful degradation
    - Add user-friendly error displays

  - [ ] 20.4 UI/UX polish
    - Add loading states
    - Add animations with Framer Motion
    - Ensure consistent styling
    - Test accessibility

- [ ] 21. Final Checkpoint - Production Ready
  - Ensure all tests pass, ask the user if questions arise.

## Real-Time Adaptive Features

- [x] 22. Skip Risk Prediction System
  - [x] 22.1 Create skip risk calculator module
    - Implement risk calculation algorithm
    - Consider minutes behind, tasks skipped, momentum state
    - Calculate risk levels: low, medium, high
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [x] 22.2 Integrate skip risk into scheduling
    - Add skip risk to each scheduled task
    - Display skip risk in UI
    - Trigger interventions for high-risk tasks
    - _Requirements: 17.5, 17.6, 17.7_

  - [ ]* 22.3 Write property test for skip risk calculation
    - **Property 20: Skip risk calculation**
    - **Validates: Requirements 17.4**

- [-] 23. Momentum Tracking System
  - [x] 23.1 Implement momentum state machine
    - Create momentum state tracker
    - Implement state transitions (strong, normal, weak, collapsed)
    - Track momentum metrics (morning start strength, completion-after-early-win rate)
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

  - [ ] 23.2 Integrate momentum into scheduling decisions
    - Boost predictions when momentum is strong
    - Trigger interventions when momentum collapses
    - Display momentum state to user
    - _Requirements: 20.6, 20.7, 20.8_

  - [ ]* 23.3 Write property test for momentum state transitions
    - **Property 21: Momentum state transitions**
    - **Validates: Requirements 20.5**

- [x] 24. Real-Time Progress Tracking
  - [x] 24.1 Create progress monitoring service
    - Track task start/end times in real-time
    - Calculate minutes ahead/behind schedule
    - Detect early completions and delays
    - _Requirements: 14.1, 14.2_

  - [x] 24.2 Implement task app sync for progress detection
    - Sync with Todoist to detect completions
    - Detect unplanned completions
    - Update momentum state based on progress
    - _Requirements: 14.7, 14.8_

  - [x] 24.3 Build progress tracking UI
    - Display current progress vs schedule
    - Show momentum state indicator
    - Show skip risk warnings
    - _Requirements: 14.3, 14.4, 14.5, 14.6_

- [x] 25. Intelligent Check-In System
  - [x] 25.1 Create check-in scheduler
    - Schedule check-ins at configured times (10am, 1pm, 3:30pm)
    - Trigger check-ins based on progress (behind schedule, momentum collapse)
    - _Requirements: 18.1_

  - [x] 25.2 Implement check-in message generator
    - Generate context-aware check-in messages
    - Reference specific tasks and their status from task app
    - Provide response options (Done, Still working, Stuck)
    - Adapt tone based on user preference (gentle, direct, minimal)
    - _Requirements: 18.3, 18.4, 18.8_

  - [x] 25.3 Build check-in response handler
    - Handle "Still working" response (extend time, defer tasks)
    - Handle "Stuck" response (defer task, suggest easier wins)
    - Handle "Done" response (celebrate, continue plan)
    - _Requirements: 18.5, 18.6, 18.7_

  - [x] 25.4 Integrate task app sync with check-ins
    - Sync with Todoist before each check-in
    - Detect completion status
    - Reference task app status in notifications
    - _Requirements: 18.2_

- [x] 26. Mid-Day Re-Scheduling Engine
  - [x] 26.1 Create progress analyzer
    - Analyze current progress vs original plan
    - Calculate minutes ahead/behind
    - Identify protected tasks (high-priority, due soon)
    - _Requirements: 19.1, 19.2, 19.5_

  - [x] 26.2 Implement re-scheduling algorithm
    - Rebuild afternoon schedule based on progress
    - Protect high-priority and due-soon tasks
    - Defer low-priority tasks when capacity exceeded
    - _Requirements: 19.4, 19.5, 19.6_

  - [x] 26.3 Integrate AI agent for re-scheduling decisions
    - Send current progress to Gemini AI
    - Request re-schedule with updated context
    - Apply AI recommendations
    - _Requirements: 19.3, 19.7_

  - [x] 26.4 Build re-scheduling UI
    - Show "ahead of schedule" suggestions
    - Show "behind schedule" rescue plan
    - Display re-scheduling reasoning
    - Allow user to accept/reject re-schedule
    - _Requirements: 19.3, 19.4, 19.8_

- [ ] 27. Adaptive Notification System
  - [x] 27.1 Create notification generator with tone adaptation
    - Implement gentle tone templates
    - Implement direct tone templates
    - Implement minimal tone templates
    - _Requirements: 21.6, 21.7, 21.8, 21.9_

  - [x] 27.2 Implement smart notification timing
    - Don't interrupt during first 15 minutes of task
    - Batch notifications within 10-minute windows
    - Respect Do Not Disturb hours
    - _Requirements: 21.3_

  - [x] 27.3 Build notification types
    - Morning check-in reminder with goal reference
    - Task start reminder (5 minutes before)
    - Celebration notification (early completion)
    - Supportive check-in (behind schedule)
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

  - [x] 27.4 Integrate with notification preferences
    - Allow users to configure notification style
    - Allow users to configure check-in times
    - Support browser push and email notifications
    - _Requirements: 21.10_

- [x] 28. Enhanced Gemini AI Agent Integration
  - [x] 28.1 Update AI prompt with full context
    - Include time blindness buffers in prompt
    - Include productivity windows in prompt
    - Include skip risk and momentum state in prompt
    - Include current progress and real-time data in prompt
    - _Requirements: 14-21 (all adaptive features)_

  - [x] 28.2 Implement AI response parsing for adaptive features
    - Parse skip risk predictions from AI
    - Parse momentum state recommendations from AI
    - Parse check-in notification suggestions from AI
    - Parse re-scheduling decisions from AI
    - _Requirements: 14-21 (all adaptive features)_

  - [x] 28.3 Build AI reasoning display for adaptive decisions
    - Show why AI suggested re-schedule
    - Show why AI predicted high skip risk
    - Show why AI recommended momentum intervention
    - _Requirements: 14-21 (all adaptive features)_

- [-] 29. Database Schema Updates for Adaptive Features
  - [x] 29.1 Add fields to PlanTask model
    - Add actualStartTime field
    - Add actualEndTime field
    - Add actualMinutes field
    - Add skipRisk field
    - Add momentumState field
    - _Requirements: 14, 15, 17, 20_

  - [x] 29.2 Create ScheduleAdaptation model
    - Store schedule adaptations (re-schedules)
    - Track trigger (check-in, behind schedule, momentum collapse)
    - Store reasoning for adaptation
    - _Requirements: 19.8_

  - [ ] 29.3 Create CheckInNotification model
    - Store check-in notifications sent
    - Track user responses
    - Store adaptive actions taken
    - _Requirements: 18_

  - [ ] 29.4 Run database migration
    - Create migration for new fields and models
    - Test migration on development database
    - _Requirements: 14-21_

- [ ] 30. API Routes for Adaptive Features
  - [ ] 30.1 Create progress tracking routes
    - POST /api/progress/update - Update task progress
    - GET /api/progress/current - Get current progress
    - POST /api/progress/sync - Sync with task app
    - _Requirements: 14_

  - [ ] 30.2 Create check-in routes
    - POST /api/checkin/schedule - Schedule check-in notification
    - POST /api/checkin/respond - Handle check-in response
    - GET /api/checkin/pending - Get pending check-ins
    - _Requirements: 18_

  - [ ] 30.3 Create re-scheduling routes
    - POST /api/plan/reschedule - Trigger mid-day re-schedule
    - GET /api/plan/adaptations - Get schedule adaptation history
    - _Requirements: 19_

  - [ ] 30.4 Create momentum tracking routes
    - GET /api/momentum/current - Get current momentum state
    - GET /api/momentum/history - Get momentum history
    - _Requirements: 20_

- [ ] 31. Testing for Adaptive Features
  - [ ]* 31.1 Write property test for time blindness buffers
    - **Property 18: Time blindness buffer application**
    - **Validates: Requirements 15.2, 15.3**

  - [ ]* 31.2 Write property test for productivity window scheduling
    - **Property 19: Productivity window scheduling**
    - **Validates: Requirements 16.3**

  - [ ]* 31.3 Write unit tests for skip risk calculator
    - Test risk calculation with various scenarios
    - Test intervention triggers
    - _Requirements: 17_

  - [ ]* 31.4 Write unit tests for momentum state machine
    - Test state transitions
    - Test momentum metrics calculation
    - _Requirements: 20_

  - [ ]* 31.5 Write integration tests for check-in system
    - Test check-in scheduling
    - Test response handling
    - Test task app sync
    - _Requirements: 18_

- [ ] 32. UI Components for Adaptive Features
  - [ ] 32.1 Create MomentumIndicator component
    - Display current momentum state
    - Show momentum trend
    - Display momentum metrics
    - _Requirements: 20.8_

  - [ ] 32.2 Create SkipRiskWarning component
    - Display skip risk for tasks
    - Show intervention suggestions
    - _Requirements: 17.7_

  - [ ] 32.3 Create ProgressTracker component
    - Show minutes ahead/behind schedule
    - Display completed vs planned tasks
    - Show real-time progress updates
    - _Requirements: 14_

  - [ ] 32.4 Create CheckInModal component
    - Display check-in message
    - Show response options
    - Handle user responses
    - _Requirements: 18_

  - [ ] 32.5 Create RescheduleProposal component
    - Display re-schedule reasoning
    - Show before/after comparison
    - Allow accept/reject actions
    - _Requirements: 19_

- [ ] 33. Final Integration and Testing
  - [ ] 33.1 End-to-end testing of adaptive features
    - Test complete adaptive flow (check-in → progress → re-schedule)
    - Test momentum tracking across day
    - Test skip risk interventions
    - Test AI agent integration with all context

  - [ ] 33.2 Performance optimization for real-time features
    - Optimize progress tracking queries
    - Add caching for productivity windows
    - Minimize AI API calls

  - [ ] 33.3 User acceptance testing
    - Test with real users
    - Gather feedback on adaptive features
    - Refine notification tone and timing

- [ ] 34. Final Checkpoint - Real-Time Adaptive Agent Complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Focus on Todoist integration first, then add Notion and Linear if time permits
- Opik tracking and notifications are optional but valuable for hackathon demo
 