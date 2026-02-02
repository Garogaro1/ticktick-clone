/**
 * Analytics tracking utilities.
 *
 * This module provides a feature-flagged analytics system that:
 * - Respects the analytics feature flag from env.features.analytics
 * - Logs to console in development (for debugging)
 * - Provides a placeholder implementation for production analytics
 * - Easy to integrate with real analytics providers (Google Analytics, Plausible, etc.)
 *
 * @example
 * import { trackPageView, trackEvent } from '@/lib/analytics';
 *
 * trackPageView('/tasks');
 * trackEvent('task_completed', { taskId: '123', priority: 'high' });
 */

import { env } from './env';

/**
 * Event properties type for analytics events.
 * Can be any record of string keys to unknown values.
 */
export type EventProperties = Record<string, unknown>;

/**
 * Checks if analytics is enabled via feature flag.
 *
 * @returns true if analytics is enabled
 */
function isAnalyticsEnabled(): boolean {
  return env.features.analytics;
}

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
 * Tracks a page view.
 *
 * In development: logs to console if debug mode is enabled
 * In production: placeholder for real analytics integration
 *
 * @param path - The page path to track (e.g., '/tasks', '/projects/123')
 *
 * @example
 * trackPageView('/tasks');
 * trackPageView('/projects/' + projectId);
 */
export function trackPageView(path: string): void {
  if (!isAnalyticsEnabled()) {
    return;
  }

  const pageViewData = {
    path,
    timestamp: new Date().toISOString(),
    // Add more metadata as needed (referrer, userAgent, etc.)
  };

  // Development: console logging
  debugLog('PageView', pageViewData);

  // Production: TODO - Integrate with real analytics provider
  // Examples:
  // - Google Analytics: gtag('event', 'page_view', { page_path: path })
  // - Plausible: plausible('pageview', { u: path })
  // - Umami: umami.trackPageView(path)
}

/**
 * Tracks a custom analytics event.
 *
 * In development: logs to console if debug mode is enabled
 * In production: placeholder for real analytics integration
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
  if (!isAnalyticsEnabled()) {
    return;
  }

  const eventData = {
    name,
    properties: properties || {},
    timestamp: new Date().toISOString(),
  };

  // Development: console logging
  debugLog('Event', eventData);

  // Production: TODO - Integrate with real analytics provider
  // Examples:
  // - Google Analytics: gtag('event', name, properties)
  // - Plausible: plausible(name, { props: properties })
  // - Umami: umami.track(name, properties)
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
