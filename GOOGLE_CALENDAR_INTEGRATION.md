# Google Calendar Integration

This document describes the Google Calendar integration implementation for the Adaptive Productivity Agent.

## Overview

The Google Calendar integration allows the system to:
- Create calendar events for scheduled tasks
- Update existing calendar events when tasks are rescheduled
- Check for scheduling conflicts
- Automatically sync daily plans to the user's calendar

## OAuth Flow

### 1. Initiate Connection
**Endpoint:** `GET /api/integrations/google-calendar/connect`

Returns an authorization URL that the user should visit to grant calendar access.

**Response:**
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### 2. OAuth Callback
**Endpoint:** `GET /api/integrations/google-calendar/callback`

Handles the OAuth callback from Google, exchanges the authorization code for access and refresh tokens, and stores them securely in the database.

**Query Parameters:**
- `code`: Authorization code from Google
- `state`: State parameter for CSRF protection

**Redirects to:**
- Success: `/dashboard?success=google_calendar_connected`
- Error: `/dashboard?error=<error_type>`

### 3. Disconnect
**Endpoint:** `DELETE /api/integrations/google-calendar/disconnect`

Removes the Google Calendar integration for the authenticated user.

## Required Scopes

The integration requests the following Google OAuth scopes:
- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.events` - Event management

## Token Management

### Access Tokens
- Stored encrypted in the database using AES-256-CBC
- Expire after 1 hour (3600 seconds)
- Automatically refreshed using the refresh token when needed

### Refresh Tokens
- Obtained by using `access_type=offline` and `prompt=consent`
- Stored encrypted in the database
- Used to obtain new access tokens without user interaction

## Environment Variables

Required environment variables:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="your-32-character-encryption-key"
```

## Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Add authorized redirect URI: `http://localhost:3000/api/integrations/google-calendar/callback`
7. Copy the Client ID and Client Secret to your `.env` file

## GoogleCalendarClient API

The `GoogleCalendarClient` class in `lib/google-calendar.ts` provides methods for interacting with the Google Calendar API:

### Create Event
```typescript
await client.createEvent('primary', {
  summary: 'Task Title',
  description: 'Task description',
  start: {
    dateTime: '2024-01-20T10:00:00-08:00',
    timeZone: 'America/Los_Angeles',
  },
  end: {
    dateTime: '2024-01-20T11:00:00-08:00',
    timeZone: 'America/Los_Angeles',
  },
});
```

### Update Event
```typescript
await client.updateEvent('event-id', {
  summary: 'Updated Task Title',
  start: { dateTime: '2024-01-20T11:00:00-08:00' },
  end: { dateTime: '2024-01-20T12:00:00-08:00' },
});
```

### Delete Event
```typescript
await client.deleteEvent('event-id');
```

### List Events
```typescript
const events = await client.listEvents(
  new Date('2024-01-20T00:00:00'),
  new Date('2024-01-20T23:59:59')
);
```

### Check for Conflicts
```typescript
const hasConflict = await client.hasConflict(
  new Date('2024-01-20T10:00:00'),
  new Date('2024-01-20T11:00:00')
);
```

## Security

- All tokens are encrypted at rest using AES-256-CBC
- OAuth state parameter prevents CSRF attacks
- Tokens are never exposed in API responses
- Refresh tokens allow token renewal without re-authentication

## Error Handling

The integration handles various error scenarios:
- Missing or invalid OAuth credentials
- Token exchange failures
- API rate limits
- Network errors
- Invalid state parameters

All errors are logged and appropriate error messages are returned to the user.

## Next Steps

To complete the calendar integration:
1. Implement calendar event creation in the daily plan generation flow
2. Add UI components for managing the calendar connection
3. Implement automatic event updates when tasks are rescheduled
4. Add conflict detection before scheduling tasks
5. Implement property-based tests for calendar operations
