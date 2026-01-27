/**
 * Centralized Error Handling System
 * 
 * This module provides:
 * - Custom error classes for different error types
 * - Error formatting utilities
 * - User-friendly error messages
 * - Graceful degradation strategies
 */

// ============================================================================
// Custom Error Classes
// ============================================================================

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * Authentication/Authorization errors
 */
export class AuthError extends AppError {
  constructor(message: string = 'Authentication required', details?: any) {
    super(message, 401, 'AUTH_ERROR', details);
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Invalid input', details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', details?: any) {
    super(`${resource} not found`, 404, 'NOT_FOUND', details);
  }
}

/**
 * External API errors (Todoist, Google Calendar, etc.)
 */
export class ExternalAPIError extends AppError {
  constructor(
    service: string,
    message: string = 'External service error',
    details?: any
  ) {
    super(`${service}: ${message}`, 502, 'EXTERNAL_API_ERROR', {
      service,
      ...details,
    });
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details);
  }
}

/**
 * AI service errors (Gemini)
 */
export class AIServiceError extends AppError {
  constructor(message: string = 'AI service error', details?: any) {
    super(message, 503, 'AI_SERVICE_ERROR', details);
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', details?: any) {
    super(message, 429, 'RATE_LIMIT_ERROR', details);
  }
}

// ============================================================================
// Error Formatting Utilities
// ============================================================================

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): {
  error: string;
  code?: string;
  details?: any;
  statusCode: number;
} {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'issues' in error) {
    return {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: error,
      statusCode: 400,
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      error: error.message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    };
  }

  // Handle unknown errors
  return {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof AuthError) {
    return 'Please sign in to continue.';
  }

  if (error instanceof ValidationError) {
    return 'Please check your input and try again.';
  }

  if (error instanceof NotFoundError) {
    return 'The requested item could not be found.';
  }

  if (error instanceof ExternalAPIError) {
    const service = error.details?.service || 'external service';
    return `We're having trouble connecting to ${service}. Please try again later.`;
  }

  if (error instanceof DatabaseError) {
    return 'We encountered a problem saving your data. Please try again.';
  }

  if (error instanceof AIServiceError) {
    return 'Our AI assistant is temporarily unavailable. We'll use a simplified planning approach.';
  }

  if (error instanceof RateLimitError) {
    return 'You're making requests too quickly. Please wait a moment and try again.';
  }

  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

// ============================================================================
// Graceful Degradation Strategies
// ============================================================================

/**
 * Fallback strategies for different services
 */
export const FallbackStrategies = {
  /**
   * AI service fallback - use simple rule-based planning
   */
  aiService: {
    shouldFallback: (error: unknown): boolean => {
      return error instanceof AIServiceError || 
             (error instanceof Error && error.message.includes('Gemini'));
    },
    
    getFallbackMessage: (): string => {
      return 'Using simplified planning mode. AI features will be restored shortly.';
    },
  },

  /**
   * Calendar sync fallback - continue without calendar
   */
  calendarSync: {
    shouldFallback: (error: unknown): boolean => {
      return error instanceof ExternalAPIError && 
             error.details?.service === 'Google Calendar';
    },
    
    getFallbackMessage: (): string => {
      return 'Plan created successfully, but calendar sync failed. You can sync manually later.';
    },
  },

  /**
   * Task integration fallback - use manual tasks
   */
  taskIntegration: {
    shouldFallback: (error: unknown): boolean => {
      return error instanceof ExternalAPIError && 
             (error.details?.service === 'Todoist' || 
              error.details?.service === 'Notion' ||
              error.details?.service === 'Linear');
    },
    
    getFallbackMessage: (): string => {
      return 'Unable to fetch tasks from your task manager. You can add tasks manually.';
    },
  },
};

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log error with context
 */
export function logError(
  error: unknown,
  context: {
    operation: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
): void {
  const timestamp = new Date().toISOString();
  const errorInfo = formatErrorResponse(error);

  console.error('Error occurred:', {
    timestamp,
    operation: context.operation,
    userId: context.userId,
    error: errorInfo,
    metadata: context.metadata,
    stack: error instanceof Error ? error.stack : undefined,
  });

  // In production, you would send this to a logging service
  // e.g., Sentry, LogRocket, CloudWatch, etc.
}

// ============================================================================
// Error Recovery Utilities
// ============================================================================

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts or shouldn't retry this error
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff with max delay
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Execute operation with timeout
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  timeoutError: Error = new Error('Operation timed out')
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(timeoutError), timeoutMs)
    ),
  ]);
}
