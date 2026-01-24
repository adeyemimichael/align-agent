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

- [ ] 19. Notification System (Optional)
  - [ ] 19.1 Implement notification scheduling
    - Create notification service
    - Schedule check-in reminders (9 AM)
    - Schedule task start reminders (5 min before)
    - _Requirements: 14.1, 14.3_

  - [ ]* 19.2 Write property test for notification scheduling
    - **Property 17: Notification scheduling**
    - **Validates: Requirements 14.1, 14.2**

  - [ ] 19.3 Implement browser push notifications
    - Set up service worker
    - Request notification permissions
    - Send push notifications
    - _Requirements: 14.5_

  - [ ] 19.4 Implement email notifications
    - Set up email service (e.g., SendGrid)
    - Create email templates
    - Send fallback email notifications
    - _Requirements: 14.6_

  - [ ] 19.5 Build notification preferences UI
    - Create settings page for notifications
    - Allow time and frequency configuration
    - _Requirements: 14.4_

- [-] 20. Final Integration and Polish
  - [-] 20.1 End-to-end testing
    - Test complete user flows
    - Test all integrations together
    - Fix any integration issues

  - [ ] 20.2 Performance optimization
    - Optimize database queries
    - Add caching where appropriate
    - Minimize API calls

  - [ ] 20.3 Error handling improvements
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

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Focus on Todoist integration first, then add Notion and Linear if time permits
- Opik tracking and notifications are optional but valuable for hackathon demo
 