'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook for tracking media query matches.
 *
 * Uses window.matchMedia to track screen size changes.
 * Handles SSR by defaulting to false.
 *
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns Whether the media query currently matches
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 640px)');
 * const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // Default to false for SSR
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Skip if window is not available (SSR)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    const hasMatchMedia = typeof mediaQuery.matches === 'boolean';

    // Set initial state based on current match
    if (hasMatchMedia) {
      setMatches(mediaQuery.matches);
    }

    // Define handler for media query changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback for older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }

    return undefined;
  }, [query]);

  return matches;
}

/**
 * Pre-defined media query hooks for common breakpoints.
 *
 * These align with Tailwind's default breakpoints:
 * - xs: 375px (small phones)
 * - sm: 640px (large phones)
 * - md: 768px (tablets)
 * - lg: 1024px (small laptops)
 * - xl: 1280px (laptops)
 * - 2xl: 1536px (large screens)
 */

/** Returns true on screens smaller than 640px (mobile) */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

/** Returns true on screens from 640px to 1023px (tablet) */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
}

/** Returns true on screens larger than 1023px (desktop) */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/** Returns true on screens smaller than 768px (mobile and small tablet) */
export function useIsSmallerThanTablet(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/** Returns true on screens larger than 767px (tablet and desktop) */
export function useIsTabletAndUp(): boolean {
  return useMediaQuery('(min-width: 768px)');
}

/** Returns true if user prefers dark mode */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/** Returns true if user prefers reduced motion */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/** Returns true on portrait orientation */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

/** Returns true on landscape orientation */
export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}
