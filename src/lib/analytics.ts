/**
 * Analytics tracking utilities.
 *
 * This module provides a feature-flagged analytics system that:
 * - Respects the analytics feature flag from env.features.analytics
 * - Integrates with real analytics providers (Google Analytics, Plausible, Umami, PostHog)
 * - Logs to console in development when debug mode is enabled
 *
 * Configure via NEXT_PUBLIC_ANALYTICS_PROVIDER environment variable:
 * - 'google' - Google Analytics 4 (requires NEXT_PUBLIC_GA_MEASUREMENT_ID)
 * - 'plausible' - Plausible Analytics (requires NEXT_PUBLIC_PLAUSIBLE_DOMAIN)
 * - 'umami' - Umami Analytics (requires NEXT_PUBLIC_UMAMI_WEBSITE_ID)
 * - 'posthog' - PostHog (requires NEXT_PUBLIC_POSTHOG_KEY)
 * - 'none' or unset - No analytics
 *
 * @example
 * import { trackPageView, trackEvent } from '@/lib/analytics';
 *
 * trackPageView('/tasks');
 * trackEvent('task_completed', { taskId: '123', priority: 'high' });
 */

import { env } from './env';
import {
  trackPageView as trackPageViewProvider,
  trackEvent as trackEventProvider,
  initAnalytics,
} from './analytics-providers';

/**
 * Event properties type for analytics events.
 * Can be any record of string keys to unknown values.
 */
export type EventProperties = Record<string, unknown>;

/**
 * Logs analytics call in development mode for debugging.
 *
 * @param type - Type of analytics call (pageview or event)
 * @param data - Data to log
 */
function debugLog(type: string, data: unknown): void {
  if (env.features.debug) {
    console.log(`[Analytics ${type}]`, data);
  }
}

/**
 * Tracks a page view with debug logging.
 *
 * @param path - The page path to track (e.g., '/tasks', '/projects/123')
 *
 * @example
 * trackPageView('/tasks');
 * trackPageView('/projects/' + projectId);
 */
export function trackPageView(path: string): void {
  if (!env.features.analytics) {
    return;
  }

  const pageViewData = {
    path,
    timestamp: new Date().toISOString(),
  };

  debugLog('PageView', pageViewData);
  trackPageViewProvider(path);
}

/**
 * Tracks a custom analytics event with debug logging.
 *
 * @param name - The event name (e.g., 'task_completed', 'project_created')
 * @param properties - Optional event properties (metadata about the event)
 *
 * @example
 * trackEvent('task_completed', { taskId: '123', priority: 'high' });
 * trackEvent('project_created', { projectId: '456', listCount: 5 });
 * trackEvent('filter_applied', { filterType: 'priority', value: 'high' });
 */
export function trackEvent(name: string, properties?: EventProperties): void {
  if (!env.features.analytics) {
    return;
  }

  const eventData = {
    name,
    properties: properties || {},
    timestamp: new Date().toISOString(),
  };

  debugLog('Event', eventData);
  trackEventProvider(name, properties);
}

/**
 * Tracks a user interaction (click, tap, etc.).
 * Convenience wrapper around trackEvent for common UI interactions.
 *
 * @param element - The element identifier (e.g., 'complete_button', 'delete_icon')
 * @param context - Optional context about where the interaction happened
 *
 * @example
 * trackInteraction('complete_button', 'task_item_123');
 * trackInteraction('filter_dropdown', 'sidebar');
 */
export function trackInteraction(element: string, context?: string): void {
  trackEvent('interaction', {
    element,
    context,
  });
}

/**
 * Tracks an error occurrence.
 * Convenience wrapper around trackEvent for error tracking.
 *
 * @param error - The error message or Error object
 * @param context - Optional context about where the error occurred
 *
 * @example
 * trackError(new Error('Failed to load tasks'), 'TaskList');
 * trackError('Network timeout', 'api_client');
 */
export function trackError(error: Error | string, context?: string): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  trackEvent('error', {
    message: errorMessage,
    context,
    stack: errorStack,
  });
}

/**
 * Initialize analytics. Call this once on app mount.
 * Re-exported from analytics-providers for convenience.
 */
export { initAnalytics };

/**
 * Re-export types from analytics-providers.
 */
export type { AnalyticsProvider } from './analytics-providers';
