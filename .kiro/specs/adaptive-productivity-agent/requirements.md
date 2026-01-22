# Requirements Document

## Introduction

This document specifies the requirements for an AI-powered adaptive productivity agent that plans daily work based on human capacity signals (energy, sleep, stress, mood) rather than treating users as constant-output machines. The system integrates with Google Calendar and Todoist, uses Gemini AI for intelligent reasoning, and adapts over time by learning user patterns.

## Glossary

- **Agent**: The AI-powered adaptive productivity system
- **Capacity_Score**: A computed metric representing the user's current ability to perform work based on multiple input signals
- **Check_In**: A daily user interaction where energy, sleep, stress, and mood data are collected
- **Recovery_Mode**: An operational mode where the Agent prioritizes rest and lighter tasks to prevent burnout
- **Deep_Work_Mode**: An operational mode where the Agent schedules demanding tasks during high-capacity periods
- **Signal**: An input data point (energy, sleep quality, stress level, mood) used to assess capacity
- **History_Window**: A 7-day rolling window of past check-ins and performance data
- **Gemini_AI**: The Google AI model used for reasoning and decision-making
- **Todoist**: The task management integration source
- **Google_Calendar**: The calendar integration for time blocking

## Requirements

### Requirement 1: Daily Check-In System

**User Story:** As a user, I want to provide my current state each day, so that the Agent can understand my capacity and plan accordingly.

#### Acceptance Criteria

1. WHEN a user accesses the system each day, THE Agent SHALL display a check-in interface with input fields for energy level, sleep quality, stress level, and mood
2. WHEN a user submits a check-in, THE Agent SHALL validate that all required fields contain values within acceptable ranges
3. WHEN a check-in is submitted, THE Agent SHALL store the data with a timestamp in the database
4. WHEN a user has already completed a check-in for the current day, THE Agent SHALL display the existing check-in data and allow updates
5. THE Agent SHALL accept energy levels on a scale from 1 to 10
6. THE Agent SHALL accept sleep quality on a scale from 1 to 10
7. THE Agent SHALL accept stress levels on a scale from 1 to 10
8. THE Agent SHALL accept mood as a selection from predefined options (e.g., positive, neutral, negative)

### Requirement 2: Capacity Score Calculation

**User Story:** As a user, I want the system to calculate my daily capacity, so that it can make realistic plans for my workday.

#### Acceptance Criteria

1. WHEN a check-in is completed, THE Agent SHALL compute a Capacity_Score based on energy, sleep, stress, and mood inputs
2. THE Capacity_Score SHALL be a normalized value between 0 and 100
3. WHEN energy level is high (8-10), THE Agent SHALL weight it positively in the Capacity_Score calculation
4. WHEN sleep quality is poor (1-4), THE Agent SHALL weight it negatively in the Capacity_Score calculation
5. WHEN stress level is high (8-10), THE Agent SHALL weight it negatively in the Capacity_Score calculation
6. WHEN mood is negative, THE Agent SHALL apply a penalty to the Capacity_Score
7. THE Agent SHALL store the computed Capacity_Score alongside the check-in data

### Requirement 3: Mode Selection

**User Story:** As a user, I want the system to automatically choose between Recovery Mode and Deep Work Mode, so that I'm protected from burnout while maximizing productivity when I'm capable.

#### Acceptance Criteria

1. WHEN the Capacity_Score is below 40, THE Agent SHALL activate Recovery_Mode
2. WHEN the Capacity_Score is 70 or above, THE Agent SHALL activate Deep_Work_Mode
3. WHEN the Capacity_Score is between 40 and 69, THE Agent SHALL activate a balanced mode
4. WHEN Recovery_Mode is active, THE Agent SHALL prioritize tasks marked as low-effort or recovery-related
5. WHEN Deep_Work_Mode is active, THE Agent SHALL prioritize high-value, cognitively demanding tasks
6. THE Agent SHALL display the current mode to the user after check-in completion

### Requirement 4: Google Calendar Integration

**User Story:** As a user, I want the Agent to block time on my Google Calendar, so that my schedule reflects the realistic plan for my day.

#### Acceptance Criteria

1. WHEN the user authorizes Google Calendar access, THE Agent SHALL store OAuth credentials securely
2. WHEN a daily plan is generated, THE Agent SHALL create calendar events for scheduled tasks
3. WHEN creating calendar events, THE Agent SHALL include task name, estimated duration, and priority level
4. WHEN a task is rescheduled, THE Agent SHALL update the corresponding calendar event
5. THE Agent SHALL read existing calendar events to avoid scheduling conflicts
6. WHEN existing events conflict with planned tasks, THE Agent SHALL adjust task scheduling to available time slots

### Requirement 5: Task Management Integration

**User Story:** As a user, I want the Agent to pull tasks from my preferred task management tool (Todoist, Notion, Linear, or others), so that it can prioritize and schedule my existing workload without forcing me to switch tools.

#### Acceptance Criteria

1. THE Agent SHALL support integration with multiple task management platforms: Todoist, Notion, and Linear
2. WHEN the user connects a task management tool, THE Agent SHALL store API credentials securely
3. WHEN generating a daily plan, THE Agent SHALL fetch all active tasks from the connected platform
4. THE Agent SHALL extract task name, due date, priority, and project/database information from tasks
5. WHEN a task has a due date, THE Agent SHALL prioritize it higher in the scheduling algorithm
6. WHEN a task has high priority in the source platform, THE Agent SHALL consider it for Deep_Work_Mode scheduling
7. THE Agent SHALL sync task completion status back to the source platform when tasks are marked complete
8. THE Agent SHALL allow users to connect only one task management platform at a time
9. THE Agent SHALL allow users to switch between task management platforms without losing historical data
10. WHERE Todoist is connected, THE Agent SHALL use Todoist's priority levels (P1-P4) for task prioritization
11. WHERE Notion is connected, THE Agent SHALL read tasks from a specified database with status, due date, and priority properties
12. WHERE Linear is connected, THE Agent SHALL fetch issues assigned to the user with priority and due date information

### Requirement 6: Gemini AI Reasoning

**User Story:** As a user, I want the Agent to use intelligent reasoning when planning my day, so that decisions account for context and trade-offs beyond simple rules.

#### Acceptance Criteria

1. WHEN generating a daily plan, THE Agent SHALL send the Capacity_Score, task list, and historical data to Gemini_AI
2. THE Agent SHALL request Gemini_AI to provide reasoning for task prioritization decisions
3. WHEN Gemini_AI returns a plan, THE Agent SHALL extract task ordering, time allocations, and reasoning explanations
4. THE Agent SHALL display Gemini_AI reasoning chains to the user for transparency
5. WHEN Gemini_AI suggests Recovery_Mode adjustments, THE Agent SHALL apply those recommendations to the schedule
6. THE Agent SHALL include context about recent patterns (e.g., "3 consecutive low-energy days") in Gemini_AI prompts

### Requirement 7: Historical Pattern Learning

**User Story:** As a user, I want the Agent to learn from my past patterns, so that it gets better at predicting my capacity and making realistic plans.

#### Acceptance Criteria

1. THE Agent SHALL maintain a History_Window of the most recent 7 days of check-in data
2. WHEN generating a daily plan, THE Agent SHALL analyze the History_Window for trends in energy, sleep, and stress
3. WHEN a pattern of declining capacity is detected (3+ consecutive days below 50), THE Agent SHALL proactively suggest Recovery_Mode
4. WHEN a pattern of high capacity is detected (3+ consecutive days above 70), THE Agent SHALL suggest more ambitious goals
5. THE Agent SHALL track whether daily plans were realistic by comparing planned vs. actual task completion
6. WHEN plans consistently overestimate capacity, THE Agent SHALL adjust future Capacity_Score calculations downward
7. WHEN plans consistently underestimate capacity, THE Agent SHALL adjust future Capacity_Score calculations upward

### Requirement 8: Daily Plan Generation

**User Story:** As a user, I want to receive a realistic daily plan, so that I know what to focus on without feeling overwhelmed or guilty.

#### Acceptance Criteria

1. WHEN a check-in is completed, THE Agent SHALL generate a daily plan within 10 seconds
2. THE daily plan SHALL include a prioritized list of tasks with estimated time allocations
3. WHEN Recovery_Mode is active, THE daily plan SHALL include explicit recovery activities (e.g., breaks, light tasks)
4. WHEN Deep_Work_Mode is active, THE daily plan SHALL allocate focused time blocks for high-priority tasks
5. THE Agent SHALL display the reasoning behind task prioritization to the user
6. THE Agent SHALL allow the user to manually adjust the generated plan
7. WHEN the user adjusts the plan, THE Agent SHALL learn from those adjustments for future planning

### Requirement 9: Landing Page

**User Story:** As a new user, I want to understand what the Agent does and how it helps, so that I can decide whether to use it.

#### Acceptance Criteria

1. THE Agent SHALL provide a landing page accessible without authentication
2. THE landing page SHALL explain the core problem (burnout from treating humans like machines)
3. THE landing page SHALL describe the solution (adaptive planning based on capacity)
4. THE landing page SHALL use a greenish color scheme as the primary visual theme
5. THE landing page SHALL include clear call-to-action buttons for sign-up or login
6. THE landing page SHALL be visually simple and require minimal effort to understand
7. THE landing page SHALL be responsive and work on mobile devices

### Requirement 10: Authentication and User Management

**User Story:** As a user, I want to securely log in and manage my account, so that my data is protected and accessible only to me.

#### Acceptance Criteria

1. THE Agent SHALL support user registration with email and password
2. THE Agent SHALL support OAuth login via Google
3. WHEN a user registers, THE Agent SHALL create a user account in the database
4. WHEN a user logs in, THE Agent SHALL create a secure session
5. THE Agent SHALL require authentication for all check-in, planning, and integration features
6. THE Agent SHALL allow users to disconnect Google Calendar and Todoist integrations
7. THE Agent SHALL allow users to delete their account and all associated data

### Requirement 11: Data Persistence

**User Story:** As a user, I want my check-ins, plans, and settings to be saved, so that I can access my history and the Agent can learn from it.

#### Acceptance Criteria

1. THE Agent SHALL store all check-in data in a relational database
2. THE Agent SHALL store all generated daily plans in the database
3. THE Agent SHALL store user preferences and integration credentials securely
4. WHEN a user logs in, THE Agent SHALL retrieve their most recent check-in and plan
5. THE Agent SHALL retain historical data for at least 30 days
6. THE Agent SHALL allow users to view their historical check-ins and capacity trends
7. THE Agent SHALL encrypt sensitive data (OAuth tokens, API keys) at rest

### Requirement 12: Goal Setting and Tracking

**User Story:** As a user, I want to set goals at the beginning of the year, so that the Agent can help me stay connected to what I'm working toward and make daily progress meaningful.

#### Acceptance Criteria

1. THE Agent SHALL provide a goal-setting interface where users can define their year-start goals
2. WHEN a user sets a goal, THE Agent SHALL store the goal text, target date, and category
3. THE Agent SHALL allow users to set multiple goals across different life areas (work, health, personal growth)
4. WHEN generating daily plans, THE Agent SHALL connect scheduled tasks to relevant goals when possible
5. THE Agent SHALL display goal progress on the dashboard showing days checked in vs. total days
6. WHEN a user completes a check-in, THE Agent SHALL show which goal(s) today's work contributes to
7. THE Agent SHALL allow users to update or modify their goals throughout the year

### Requirement 13: Opik Tracking (Optional)

**User Story:** As a developer, I want to track AI model performance and decisions, so that I can demonstrate the system's intelligence to hackathon judges.

#### Acceptance Criteria

1. WHEN Gemini_AI is invoked, THE Agent SHALL log the request and response to Opik
2. THE Agent SHALL track reasoning chain quality metrics in Opik
3. THE Agent SHALL track Capacity_Score accuracy over time in Opik
4. THE Agent SHALL provide a dashboard showing AI decision-making patterns
5. THE Agent SHALL allow export of Opik data for analysis

### Requirement 14: Notifications (Optional)

**User Story:** As a user, I want to receive reminders for check-ins and task deadlines, so that I stay on track without constantly checking the app and my year-start goals can materialize.

#### Acceptance Criteria

1. WHEN a user has not completed a daily check-in by 9 AM, THE Agent SHALL send a motivational reminder notification referencing their goals
2. THE notification SHALL include a personalized message connecting the daily check-in to their year-start goals (e.g., "Ready to make progress on [Goal]? Check in to plan your day")
3. WHEN a high-priority task is scheduled to start, THE Agent SHALL send a notification 5 minutes before
4. THE Agent SHALL allow users to configure notification preferences including time and frequency
5. THE Agent SHALL support browser push notifications
6. THE Agent SHALL support email notifications as a fallback
7. WHEN a user sets goals at the beginning of the year, THE Agent SHALL store those goals and reference them in check-in reminders
