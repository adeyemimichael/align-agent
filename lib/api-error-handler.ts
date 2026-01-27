/**
 * API Error Handler Utility
 * 
 * Provides consistent error handling for Next.js API routes
 */

import { NextResponse } from 'next/server';
import {
  AppError,
  formatErrorResponse,
  logError,
  FallbackStrategies,
} from './errors';

/**
 * Handle API errors with consistent formatting and logging
 */
export function handleAPIError(
  error: unknown,
  context: {
    operation: string;
    userId?: string;
    metadata?: Record<string, any>;
  }
): NextResponse {
  // Log the error
  logError(error, context);

  // Format error response
  const errorResponse = formatErrorResponse(error);

  // Check for fallback strategies
  let fallbackMessage: string | undefined;
  
  if (FallbackStrategies.aiService.shouldFallback(error)) {
    fallbackMessage = FallbackStrategies.aiService.getFallbackMessage();
  } else if (FallbackStrategies.calendarSync.shouldFallback(error)) {
    fallbackMessage = FallbackStrategies.calendarSync.getFallbackMessage();
  } else if (FallbackStrategies.taskIntegration.shouldFallback(error)) {
    fallbackMessage = FallbackStrategies.taskIntegration.getFallbackMessage();
  }

  return NextResponse.json(
    {
      ...errorResponse,
      fallbackMessage,
    },
    { status: errorResponse.statusCode }
  );
}

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  operation: string
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleAPIError(error, { operation });
    }
  };
}

/**
 * Validate required environment variables
 */
export function validateEnvVars(vars: Record<string, string | undefined>): void {
  const missing: string[] = [];

  for (const [key, value] of Object.entries(vars)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new AppError(
      `Missing required environment variables: ${missing.join(', ')}`,
      500,
      'ENV_VAR_MISSING',
      { missing }
    );
  }
}

/**
 * Safe JSON parse with error handling
 */
export function safeJSONParse<T = any>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json);
  } catch (error) {
    logError(error, { operation: 'JSON parse' });
    return fallback;
  }
}

/**
 * Execute with graceful degradation
 */
export async function withGracefulDegradation<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T> | T,
  options: {
    operation: string;
    shouldFallback?: (error: unknown) => boolean;
  }
): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    const shouldFallback = options.shouldFallback?.(error) ?? true;

    if (shouldFallback) {
      logError(error, {
        operation: options.operation,
        metadata: { fallbackUsed: true },
      });
      return await fallback();
    }

    throw error;
  }
}
