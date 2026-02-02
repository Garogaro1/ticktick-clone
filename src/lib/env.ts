/**
 * Environment variable validation and type-safe access.
 *
 * This file provides:
 * - Type-safe access to environment variables
 * - Validation at build/start time
 * - Clear error messages for missing variables
 *
 * @example
 * import { env } from '@/lib/env';
 * console.log(env.NEXT_PUBLIC_APP_URL);
 */

/**
 * Validates that a required environment variable is present.
 * Throws an error with a helpful message if missing.
 *
 * @param name - The environment variable name
 * @param value - The value to validate
 * @returns The validated value
 * @throws Error if the value is missing or empty
 */
function validateEnv(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}\n` + `Please add it to your .env.local file.`
    );
  }
  return value;
}

/**
 * Gets an optional environment variable with a default value.
 *
 * @param name - The environment variable name
 * @param defaultValue - The default value if not set
 * @returns The environment value or default
 */
function optionalEnv(name: string, defaultValue: string): string {
  const value = process.env[name];
  return value?.trim() || defaultValue;
}

/**
 * Type-safe environment variables configuration.
 *
 * Server-only variables are only available on the server side.
 * Public variables (prefixed with NEXT_PUBLIC_) are available on both client and server.
 */
export const env = {
  // Public environment variables (available on client and server)
  public: {
    /** Base URL of the application */
    appUrl: validateEnv('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL),
  },

  // Server-only environment variables
  server: {
    /** Node environment (development, production, test) */
    nodeEnv: optionalEnv('NODE_ENV', 'development'),

    /** Port for the development server */
    port: optionalEnv('PORT', '3000'),

    /** Database connection URL */
    databaseUrl: validateEnv('DATABASE_URL', process.env.DATABASE_URL),
  },

  // Feature flags (can be overridden via environment)
  features: {
    /** Enable analytics tracking */
    analytics: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',

    /** Enable debug mode */
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
  },
} as const;

/**
 * Type assertion to ensure server variables are only accessed on the server.
 * This is a compile-time check; runtime checks happen in Next.js automatically.
 */
export type ServerEnv = typeof env.server;
export type PublicEnv = typeof env.public;
export type Env = typeof env;

/**
 * Validates all environment variables on application start.
 * Call this in server-side initialization code.
 *
 * @returns true if all validations pass
 * @throws Error if any required variable is missing
 */
export function validateEnvVars(): boolean {
  try {
    // Trigger validation by accessing all required variables
    validateEnv('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL);
    // Validate database URL on server side only
    if (typeof window === 'undefined') {
      validateEnv('DATABASE_URL', process.env.DATABASE_URL);
    }
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Environment validation failed:', error.message);
    }
    throw error;
  }
}

/**
 * Checks if the application is running in development mode.
 */
export function isDevelopment(): boolean {
  return env.server.nodeEnv === 'development';
}

/**
 * Checks if the application is running in production mode.
 */
export function isProduction(): boolean {
  return env.server.nodeEnv === 'production';
}

/**
 * Checks if the application is running in test mode.
 */
export function isTest(): boolean {
  return env.server.nodeEnv === 'test';
}
