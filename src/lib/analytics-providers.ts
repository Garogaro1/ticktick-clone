/**
 * Real analytics provider integrations.
 *
 * This module provides integrations with popular analytics providers:
 * - Google Analytics 4
 * - Plausible Analytics
 * - Umami Analytics
 * - PostHog
 *
 * Set the NEXT_PUBLIC_ANALYTICS_PROVIDER environment variable to enable.
 */

import { env } from './env';

export type AnalyticsProvider = 'google' | 'plausible' | 'umami' | 'posthog' | 'none';

const provider = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as AnalyticsProvider) || 'none';
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

/**
 * Google Analytics 4 initialization.
 */
function initGoogleAnalytics() {
  if (typeof window === 'undefined' || !measurementId) return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(..._args: unknown[]) {
    const dl = window.dataLayer ?? [];
    dl.push(_args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}

/**
 * Plausible Analytics initialization.
 */
function initPlausible() {
  if (typeof window === 'undefined' || !plausibleDomain) return;

  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.dataset.domain = plausibleDomain;
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}

/**
 * Umami Analytics initialization.
 */
function initUmami() {
  if (typeof window === 'undefined' || !umamiWebsiteId) return;

  const script = document.createElement('script');
  script.async = true;
  script.dataset.websiteId = umamiWebsiteId;
  script.src = 'https://analytics.umami.is/script.js';
  document.head.appendChild(script);
}

/**
 * PostHog initialization.
 */
function initPostHog() {
  if (typeof window === 'undefined' || !posthogKey) return;

  // Load PostHog script
  const script = document.createElement('script');
  script.innerHTML = `
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:u="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatures isSessionActive".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('${posthogKey}',{api_host:'${posthogHost}'})
  `;
  document.head.appendChild(script);
}

/**
 * Initialize the configured analytics provider.
 * Call this once on app mount.
 */
export function initAnalytics(): void {
  if (!env.features.analytics) return;

  switch (provider) {
    case 'google':
      initGoogleAnalytics();
      break;
    case 'plausible':
      initPlausible();
      break;
    case 'umami':
      initUmami();
      break;
    case 'posthog':
      initPostHog();
      break;
    case 'none':
    default:
      // No analytics enabled
      break;
  }
}

/**
 * Track a page view with the configured provider.
 */
export function trackPageView(path: string, title?: string): void {
  if (!env.features.analytics) return;

  switch (provider) {
    case 'google':
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_path: path,
          page_title: title,
        });
      }
      break;
    case 'plausible':
      if (window.plausible) {
        window.plausible('pageview', { u: path });
      }
      break;
    case 'umami':
      if (window.umami) {
        window.umami.trackPageView({ url: path, title });
      }
      break;
    case 'posthog':
      if (window.posthog) {
        window.posthog.capture('$pageview', { $current_url: path });
      }
      break;
  }
}

/**
 * Track a custom event with the configured provider.
 */
export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (!env.features.analytics) return;

  switch (provider) {
    case 'google':
      if (window.gtag) {
        window.gtag('event', name, properties);
      }
      break;
    case 'plausible':
      if (window.plausible) {
        window.plausible(name, { props: properties });
      }
      break;
    case 'umami':
      if (window.umami) {
        window.umami.track(name, properties);
      }
      break;
    case 'posthog':
      if (window.posthog) {
        window.posthog.capture(name, properties);
      }
      break;
  }
}

/**
 * Extend Window interface with analytics provider globals.
 */
declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (..._args: unknown[]) => void;
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, unknown>; u?: string }
    ) => void;
    umami?: {
      track: (eventName: string, data?: Record<string, unknown>) => void;
      trackPageView: (data?: { url?: string; title?: string }) => void;
    };
    posthog?: {
      capture: (eventName: string, properties?: Record<string, unknown>) => void;
    };
  }
}
