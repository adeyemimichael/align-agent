# Todoist Integration

This document describes the Todoist integration implementation for the Adaptive Productivity Agent.

## Overview

The Todoist integration allows users to:
1. Connect their Todoist account via OAuth
2. Fetch tasks from Todoist automatically
3. Sync task completion status back to Todoist
4. Disconnect their Todoist account

## Architecture

### Components

1. **OAuth Flow** (`app/api/integrations/todoist/connect` & `callback`)
   - Initiates OAuth authorization with Todoist
   - Handles callback and token exchange
   - Stores encrypted access tokens in database

2. **Task Fetching** (`app/api/integrations/todoist/tasks`)
   - Fetches active tasks from Todoist API
   - Converts Todoist priority to internal priority system
   - Estimates task duration based on priority and description
   - Stores tasks in daily plan

3. **Task Completion Sync** (`app/api/integrations/todoist/tasks/[id]/complete`)
   - Marks tasks as complete locally
   - Syncs completion status back to Todoist
   - Handles sync errors gracefully

4. **Todoist Client** (`lib/todoist.ts`)
   - Wrapper for Todoist REST API v2
   - Handles authentication and API calls
   - Provides type-safe interfaces

5. **Encryption Utilities** (`lib/encryption.ts`)
   - AES-256-CBC encryption for access tokens
   - Secure storage of credentials

## API Endpoints

### GET /api/integrations/todoist/connect
Initiates the Todoist OAuth flow.

**Response:**
```json
{
  "authUrl": "https://todoist.com/oauth/authorize?..."
}
```

### GET /api/integrations/todoist/callback
Handles OAuth callback from Todoist.

**Query Parameters:**
- `code`: Authorization code from Todoist
- `state`: State parameter for CSRF protection

**Redirects to:**
- `/dashboard?success=todoist_connected` on success
- `/dashboard?error=...` on failure

### GET /api/integrations/todoist/tasks
Fetches tasks from Todoist and stores them in the current daily plan.

**Response:**
```json
{
  "tasks": [...],
  "count": 5,
  "message": "Tasks synced successfully"
}
```

### POST /api/integrations/todoist/tasks/[id]/complete
Marks a task as complete and syncs to Todoist.

**Response:**
```json
{
  "task": {...},
  "message": "Task marked as complete"
}
```

### DELETE /api/integrations/todoist/tasks/[id]/complete
Marks a task as incomplete and syncs to Todoist.

**Response:**
```json
{
  "task": {...},
  "message": "Task marked as incomplete"
}
```

### DELETE /api/integrations/todoist/disconnect
Disconnects the Todoist integration.

**Response:**
```json
{
  "message": "Todoist integration disconnected"
}
```

## Priority Conversion

Todoist uses a 1-4 priority system where 4 is highest:
- 4 = Highest priority
- 3 = High priority
- 2 = Medium priority
- 1 = Low priority

Our system uses 1-4 where 1 is highest:
- 1 = Highest priority
- 2 = High priority
- 3 = Medium priority
- 4 = Low priority

The conversion formula: `ourPriority = 5 - todoistPriority`

## Task Duration Estimation

Tasks are assigned estimated durations based on priority:
- Priority 1 (Low): 30 minutes
- Priority 2 (Medium): 45 minutes
- Priority 3 (High): 60 minutes
- Priority 4 (Highest): 90 minutes

If the task description is longer than 200 characters, an additional 30 minutes is added.

## Security

### Token Encryption

Access tokens are encrypted using AES-256-CBC before storage:
1. A 32-byte key is derived from `ENCRYPTION_KEY` (or `NEXTAUTH_SECRET` as fallback)
2. A random 16-byte IV is generated for each encryption
3. Tokens are stored in format: `iv:encryptedData`

### Environment Variables

Required environment variables:
```bash
TODOIST_CLIENT_ID=your-todoist-client-id
TODOIST_CLIENT_SECRET=your-todoist-client-secret
ENCRYPTION_KEY=your-32-character-encryption-key
```

## Error Handling

### OAuth Errors
- Invalid state: Redirects to dashboard with error
- Missing code: Redirects to dashboard with error
- Token exchange failure: Logs error and redirects

### API Errors
- Unauthorized: Returns 401
- Integration not found: Returns 404
- Todoist API errors: Returns 500 with error message

### Sync Errors
- If sync to Todoist fails, the task is still marked complete locally
- A warning is returned in the response
- Errors are logged for debugging

## Testing

The integration includes:
1. Type-safe TypeScript interfaces
2. Error handling for all API calls
3. Graceful degradation when sync fails
4. Secure token storage

## Future Improvements

1. **Token Refresh**: Implement automatic token refresh (Todoist tokens don't expire, but this would be needed for other integrations)
2. **Webhook Support**: Listen for Todoist webhooks to sync changes in real-time
3. **Batch Operations**: Sync multiple tasks at once for better performance
4. **Smart Duration Estimation**: Use ML to improve task duration estimates based on historical data
5. **Project Filtering**: Allow users to select which Todoist projects to sync
6. **Label Support**: Sync and use Todoist labels for better categorization

## Requirements Validation

This implementation satisfies the following requirements:

- **5.1**: Supports integration with Todoist ✓
- **5.2**: Stores API credentials securely (encrypted) ✓
- **5.3**: Fetches all active tasks from Todoist ✓
- **5.4**: Extracts task name, due date, priority, and project ✓
- **5.7**: Syncs task completion status back to Todoist ✓
- **11.7**: Encrypts sensitive data (OAuth tokens) at rest ✓
