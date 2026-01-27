'use client';

import { useState } from 'react';
import { XCircle, AlertTriangle, Info, RefreshCw, X } from 'lucide-react';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

/**
 * User-friendly error display component
 * 
 * Features:
 * - Different severity levels (error, warning, info)
 * - Optional retry button
 * - Collapsible error details
 * - Dismissible
 * - Accessible
 */
export function ErrorDisplay({
  title,
  message,
  severity = 'error',
  details,
  onRetry,
  onDismiss,
  showDetails = false,
  className = '',
}: ErrorDisplayProps) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(showDetails);

  const severityConfig = {
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
      buttonColor: 'bg-red-100 hover:bg-red-200 text-red-800',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
      buttonColor: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
      buttonColor: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
    },
  };

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div
      className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-4 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 ${config.iconColor}`} aria-hidden="true" />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-semibold ${config.textColor} mb-1`}>
              {title}
            </h3>
          )}
          
          <p className={`text-sm ${config.textColor}`}>
            {message}
          </p>

          {details && (
            <div className="mt-2">
              <button
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                className={`text-xs font-medium ${config.textColor} hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${severity}-500`}
                aria-expanded={isDetailsExpanded}
              >
                {isDetailsExpanded ? 'Hide details' : 'Show details'}
              </button>
              
              {isDetailsExpanded && (
                <div className={`mt-2 text-xs ${config.textColor} bg-white bg-opacity-50 rounded p-2 font-mono overflow-x-auto`}>
                  {details}
                </div>
              )}
            </div>
          )}

          {(onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded ${config.buttonColor} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${severity}-500`}
                >
                  <RefreshCw className="h-3 w-3" />
                  Try Again
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded ${config.buttonColor} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${severity}-500`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${config.textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${severity}-500 rounded`}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline error message (smaller, simpler)
 */
export function InlineError({
  message,
  className = '',
}: {
  message: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 text-sm text-red-600 ${className}`} role="alert">
      <XCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Toast-style error notification
 */
export function ErrorToast({
  message,
  onDismiss,
  duration = 5000,
}: {
  message: string;
  onDismiss: () => void;
  duration?: number;
}) {
  useState(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  });

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
      <ErrorDisplay
        message={message}
        severity="error"
        onDismiss={onDismiss}
        className="shadow-lg"
      />
    </div>
  );
}
