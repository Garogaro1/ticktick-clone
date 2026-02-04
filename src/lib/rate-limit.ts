/**
 * Rate limiting utilities for API routes.
 *
 * Provides in-memory rate limiting using a sliding window approach.
 * For production, consider using Redis-based rate limiting for distributed systems.
 */

import { headers } from 'next/headers';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number;
  /** Time window in milliseconds */
  window: number;
}

/**
 * In-memory rate limit store.
 * For production with multiple server instances, use Redis or similar.
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Default rate limit configurations.
 */
export const RateLimit = {
  /** Strict rate limit for authentication endpoints */
  Auth: { limit: 5, window: 60_000 }, // 5 requests per minute
  /** Standard rate limit for API endpoints */
  Default: { limit: 100, window: 60_000 }, // 100 requests per minute
  /** Lenient rate limit for read operations */
  Read: { limit: 200, window: 60_000 }, // 200 requests per minute
} as const;

/**
 * Gets the client identifier from request headers.
 * Prefers the user's ID if authenticated, otherwise falls back to IP.
 */
async function getClientId(userId?: string): Promise<string> {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from headers
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

  return `ip:${ip}`;
}

/**
 * Cleans up expired rate limit entries.
 * Should be called periodically to prevent memory leaks.
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60_000);
}

/**
 * Rate limit result interface.
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Unix timestamp when the limit resets */
  resetTime: number;
}

/**
 * Checks if a client has exceeded their rate limit.
 *
 * @param config - Rate limit configuration
 * @param userId - Optional user ID for authenticated requests
 * @returns Rate limit result
 *
 * @example
 * ```ts
 * const result = await checkRateLimit(RateLimit.Auth, userId);
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     { status: 429, headers: { 'X-RateLimit-Reset': result.resetTime.toString() } }
 *   );
 * }
 * ```
 */
export async function checkRateLimit(
  config: RateLimitConfig,
  userId?: string
): Promise<RateLimitResult> {
  const clientId = await getClientId(userId);
  const now = Date.now();

  // Get or create rate limit entry
  let entry = rateLimitStore.get(clientId);

  // If entry doesn't exist or has expired, create a new one
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.window,
    };
    rateLimitStore.set(clientId, entry);
  }

  // Increment count
  entry.count++;

  const remaining = Math.max(0, config.limit - entry.count);
  const success = entry.count <= config.limit;

  return {
    success,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Resets the rate limit for a specific client.
 * Useful for testing or administrative purposes.
 *
 * @param userId - User ID to reset (uses IP if not provided)
 */
export async function resetRateLimit(userId?: string): Promise<void> {
  const clientId = await getClientId(userId);
  rateLimitStore.delete(clientId);
}

/**
 * Gets rate limit headers for API responses.
 *
 * @param result - Rate limit result from checkRateLimit
 * @returns Headers object with rate limit information
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.remaining > 0 ? 'true' : 'false',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };
}
