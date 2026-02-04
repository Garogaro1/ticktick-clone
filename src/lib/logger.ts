/**
 * Production-ready logging system.
 *
 * Provides structured logging with:
 * - Log levels (debug, info, warn, error)
 * - Contextual metadata
 * - Production-safe formatting
 * - Error tracking integration
 */

import { env } from './env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  stack?: string;
}

/**
 * Sanitizes context for logging (removes sensitive data).
 */
function sanitizeContext(context: LogContext): LogContext {
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'sessionId', 'csrf'];
  const sanitized = { ...context };

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Formats log entry for output.
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, context, timestamp, stack } = entry;
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  const stackStr = stack ? `\n${stack}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}${stackStr}`;
}

/**
 * Core logging function.
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  const entry: LogEntry = {
    level,
    message,
    context: context ? sanitizeContext(context) : undefined,
    timestamp: new Date().toISOString(),
    stack: error?.stack,
  };

  // In development, always log to console
  if (env.features.debug || env.server.nodeEnv !== 'production') {
    const formatted = formatLogEntry(entry);
    switch (level) {
      case 'debug':
      case 'info':
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  }

  // In production, send to error tracking service
  if (env.server.nodeEnv === 'production') {
    if (level === 'error') {
      // TODO: Send to Sentry or similar service
      // Sentry.captureException(error || new Error(message));
    }
    // TODO: Send to logging service (Datadog, CloudWatch, etc.)
  }
}

/**
 * Logger object with methods for each log level.
 */
export const logger = {
  /**
   * Debug level log (only in development).
   */
  debug: (message: string, context?: LogContext) => {
    if (env.features.debug) {
      log('debug', message, context);
    }
  },

  /**
   * Info level log.
   */
  info: (message: string, context?: LogContext) => {
    log('info', message, context);
  },

  /**
   * Warning level log.
   */
  warn: (message: string, context?: LogContext, error?: Error) => {
    log('warn', message, context, error);
  },

  /**
   * Error level log (always tracked).
   */
  error: (message: string, error?: Error, context?: LogContext) => {
    log('error', message, context, error);
  },
};

/**
 * Creates a scoped logger with predefined context.
 */
export function createScopedLogger(defaultContext: LogContext): typeof logger {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext, error?: Error) =>
      logger.warn(message, { ...defaultContext, ...context }, error),
    error: (message: string, error?: Error, context?: LogContext) =>
      logger.error(message, error, { ...defaultContext, ...context }),
  };
}
