'use client';

/**
 * LiveRegion Component
 *
 * ARIA live region for announcing dynamic content changes to screen readers.
 * Supports polite, assertive, and off politeness levels.
 */

import React, { useEffect, useRef, useState } from 'react';

export interface LiveRegionProps {
  /**
   * Politeness level for the live region
   * - polite: Wait until user is idle
   * - assertive: Interrupt immediately
   * - off: Don't announce
   * @default "polite"
   */
  politeness?: 'polite' | 'assertive' | 'off';

  /**
   * Whether the live region is atomic (announced as a whole)
   * @default false
   */
  atomic?: boolean;

  /**
   * What types of changes are relevant
   * @default "additions text"
   */
  relevant?:
    | 'additions'
    | 'removals'
    | 'text'
    | 'all'
    | 'additions text'
    | 'additions removals'
    | 'removals additions'
    | 'removals text'
    | 'text additions'
    | 'text removals';

  /**
   * Message to announce
   */
  message?: string | null;

  /**
   * Whether to clear the message after a delay
   * @default 0 (don't clear)
   */
  clearAfter?: number;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * LiveRegion component
 *
 * @example
 * ```tsx
 * <LiveRegion message="Task completed" politeness="polite" />
 * ```
 */
export function LiveRegion({
  politeness = 'polite',
  atomic = false,
  relevant = 'additions text',
  message,
  clearAfter = 0,
  className = '',
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    setCurrentMessage(message);

    // Clear message after delay if specified
    if (clearAfter > 0 && message) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setCurrentMessage(null);
      }, clearAfter);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  return (
    <div
      className={`sr-only live-region ${className}`}
      role="status"
      aria-live={politeness}
      aria-atomic={atomic ? 'true' : undefined}
      aria-relevant={relevant}
      data-testid="live-region"
    >
      {currentMessage}
    </div>
  );
}

/**
 * Announcer component
 *
 * A simpler component for one-off announcements
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const announce = useAnnouncer();
 *
 *   const handleClick = () => {
 *     announce('Button clicked');
 *   };
 *
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 */
export interface AnnouncerProps {
  /**
   * Queue of messages to announce
   */
  messages: Array<{
    id: string;
    message: string;
    politeness?: 'polite' | 'assertive';
  }>;
}

export function Announcer({ messages }: AnnouncerProps) {
  // Use a single live region for politeness level
  const politeMessages = messages.filter((m) => !m.politeness || m.politeness === 'polite');
  const assertiveMessages = messages.filter((m) => m.politeness === 'assertive');

  const lastPolite =
    politeMessages.length > 0 ? politeMessages[politeMessages.length - 1].message : '';
  const lastAssertive =
    assertiveMessages.length > 0 ? assertiveMessages[assertiveMessages.length - 1].message : '';

  return (
    <>
      {lastPolite && (
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="live-region-polite"
        >
          {lastPolite}
        </div>
      )}
      {lastAssertive && (
        <div
          className="sr-only"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-testid="live-region-assertive"
        >
          {lastAssertive}
        </div>
      )}
    </>
  );
}
