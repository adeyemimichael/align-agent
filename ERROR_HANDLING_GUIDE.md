# Error Handling Guide

## Overview

This application implements a comprehensive error handling system with:
- Custom error classes for different error types
- Consistent error formatting across API routes
- User-friendly error messages
- Graceful degradation strategies
- Detailed error logging

## Error Classes

### Base Error: `AppError`

All custom errors extend from `AppError`, which provides:
- HTTP status code
- Error code for client-side handling
- Optional details object
- JSON serialization

### Specific Error Types

#### `AuthError` (401)
Used for authentication and authorization failures.

```typescript
throw new AuthError('Please sign in to continue');
```

#### `ValidationError` (400)
Used for input validation failures.

```typescript
throw new ValidationError('Invalid check-in data', validationResult.error.issues);
```

#### `NotFoundError` (404)
Used when a requested resource doesn't exist.

```typescript
throw new NotFoundError('User');
```

#### `ExternalAPIError` (502)
Used for failures in external services (Todoist, Google Calendar, etc.).

```typescript
throw new ExternalAPIError('Todoist', 'Failed to fetch tasks', { statusCode: 500 });
```

#### `DatabaseError` (500)
Used for database operation failures.

```typescript
throw new DatabaseError('Failed to save check-in', dbError);
```

#### `AIServiceError` (503)
Used for AI service (Gemini) failures.

```typescript
throw new AIServiceError('AI service temporarily unavailable');
```

#### `RateLimitError` (429)
Used when rate limits are exceeded.

```typescript
throw new RateLimitError('Too many requests');
```

## API Route Error Handling

### Using `handleAPIError`

All API routes should use the `handleAPIError` utility:

```typescript
import { handleAPIError } from '@/lib/api-error-handler';
import { AuthError, ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      throw new AuthError('Please sign in');
    }
    
    // ... your logic here
    
    return NextResponse.json(result);
  } catch (error) {
    return handleAPIError(error, {
      operation: 'POST /api/your-route',
      userId: session?.user?.email,
    });
  }
}
```

### Error Response Format

All errors return a consistent JSON format:

```json
{
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "details": { /* optional additional details */ },
  "fallbackMessage": "Optional fallback strategy message"
}
```

## Graceful Degradation

The system implements graceful degradation for non-critical failures:

### AI Service Fallback

When Gemini AI fails, the system falls back to rule-based scheduling:

```typescript
const result = await withGracefulDegradation(
  // Primary: AI-powered scheduling
  async () => await autoScheduleTasks(...),
  // Fallback: Simple rule-based scheduling
  async () => simpleFallbackScheduling(...),
  {
    operation: 'AI scheduling',
    shouldFallback: (error) => error instanceof AIServiceError,
  }
);
```

### Calendar Sync Fallback

When calendar sync fails, the plan is still created:

```typescript
try {
  calendarSyncResult = await syncPlanToCalendar(...);
} catch (calendarError) {
  console.warn('Calendar sync failed:', calendarError);
  calendarSyncResult = {
    success: false,
    message: 'Plan created successfully, but calendar sync failed. You can sync manually later.',
  };
}
```

### Task Integration Fallback

When task fetching fails, the system uses existing plan tasks:

```typescript
try {
  tasks = await fetchTodoistTasks();
} catch (todoistError) {
  console.warn('Todoist integration error:', todoistError);
  // Fall back to existing plan tasks
  tasks = await getExistingPlanTasks();
}
```

## Client-Side Error Display

### ErrorDisplay Component

Use the `ErrorDisplay` component for user-friendly error messages:

```typescript
import { ErrorDisplay } from '@/components/ErrorDisplay';

<ErrorDisplay
  title="Failed to Generate Plan"
  message="We couldn't generate your plan right now."
  severity="error"
  details={error.details}
  onRetry={() => retryOperation()}
  onDismiss={() => setError(null)}
/>
```

### Severity Levels

- **error**: Critical failures (red)
- **warning**: Non-critical issues (yellow)
- **info**: Informational messages (blue)

### InlineError Component

For smaller, inline error messages:

```typescript
import { InlineError } from '@/components/ErrorDisplay';

<InlineError message="Please complete your check-in first" />
```

## Error Logging

All errors are logged with context:

```typescript
logError(error, {
  operation: 'POST /api/checkin',
  userId: user.id,
  metadata: { capacityScore: 75 },
});
```

Log output includes:
- Timestamp
- Operation name
- User ID (if available)
- Error details
- Stack trace
- Additional metadata

## Retry Logic

Use `retryWithBackoff` for transient failures:

```typescript
import { retryWithBackoff } from '@/lib/errors';

const result = await retryWithBackoff(
  async () => await externalAPICall(),
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    shouldRetry: (error) => error instanceof ExternalAPIError,
  }
);
```

## Timeout Handling

Use `withTimeout` for operations that might hang:

```typescript
import { withTimeout } from '@/lib/errors';

const result = await withTimeout(
  async () => await longRunningOperation(),
  30000, // 30 seconds
  new Error('Operation timed out')
);
```

## Best Practices

### 1. Always Use Specific Error Types

❌ Bad:
```typescript
throw new Error('User not found');
```

✅ Good:
```typescript
throw new NotFoundError('User');
```

### 2. Include Helpful Details

❌ Bad:
```typescript
throw new ValidationError('Invalid input');
```

✅ Good:
```typescript
throw new ValidationError('Invalid check-in data', {
  fields: ['energy', 'sleep'],
  errors: validationResult.error.issues,
});
```

### 3. Handle Errors at the Right Level

- **API Routes**: Catch all errors and use `handleAPIError`
- **Service Layer**: Throw specific error types
- **Client Components**: Display user-friendly messages

### 4. Log Errors with Context

Always include operation name and user ID:

```typescript
return handleAPIError(error, {
  operation: 'POST /api/plan/generate',
  userId: user.id,
  metadata: { taskCount: tasks.length },
});
```

### 5. Implement Graceful Degradation

For non-critical features, provide fallbacks:

```typescript
// Try primary approach
try {
  return await primaryOperation();
} catch (error) {
  // Log and fall back
  console.warn('Primary operation failed, using fallback');
  return await fallbackOperation();
}
```

## Testing Error Handling

### Unit Tests

Test that errors are thrown correctly:

```typescript
it('should throw AuthError when not authenticated', async () => {
  await expect(apiRoute(request)).rejects.toThrow(AuthError);
});
```

### Integration Tests

Test error responses:

```typescript
it('should return 401 for unauthenticated requests', async () => {
  const response = await fetch('/api/checkin', { method: 'POST' });
  expect(response.status).toBe(401);
  const body = await response.json();
  expect(body.code).toBe('AUTH_ERROR');
});
```

## Monitoring and Alerts

In production, errors should be:
1. Logged to a centralized logging service (e.g., Sentry, LogRocket)
2. Monitored for patterns and spikes
3. Alerted when critical thresholds are exceeded

Example integration with Sentry:

```typescript
import * as Sentry from '@sentry/nextjs';

export function logError(error: unknown, context: any): void {
  // Console logging
  console.error('Error occurred:', { error, context });
  
  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      contexts: { operation: context },
    });
  }
}
```

## Summary

This error handling system provides:
- ✅ Consistent error responses across all API routes
- ✅ User-friendly error messages
- ✅ Graceful degradation for non-critical failures
- ✅ Detailed error logging with context
- ✅ Type-safe error handling with custom error classes
- ✅ Retry logic for transient failures
- ✅ Timeout handling for long-running operations
