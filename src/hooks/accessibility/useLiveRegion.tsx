/**
 * useLiveRegion Hook
 *
 * Hook for announcing messages to screen readers via ARIA live regions.
 * Supports polite and assertive announcements.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { LiveRegionConfig } from '@/lib/accessibility/types';

export interface LiveMessage {
  id: string;
  message: string;
  politeness?: 'polite' | 'assertive';
  timestamp: number;
}

export interface UseLiveRegionReturn {
  /**
   * Announce a message to screen readers
   */
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;

  /**
   * Clear all pending announcements
   */
  clear: () => void;

  /**
   * Current polite message
   */
  politeMessage: string | null;

  /**
   * Current assertive message
   */
  assertiveMessage: string | null;
}

export interface UseLiveRegionOptions extends LiveRegionConfig {
  /**
   * Maximum number of messages to keep in queue
   * @default 10
   */
  maxQueueSize?: number;
}

/**
 * useLiveRegion hook
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { announce, politeMessage } = useLiveRegion();
 *
 *   const handleClick = () => {
 *     announce('Button clicked', 'polite');
 *   };
 *
 *   return (
 *     <>
 *       <div role="status" aria-live="polite" className="sr-only">
 *         {politeMessage}
 *       </div>
 *       <button onClick={handleClick}>Click me</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useLiveRegion(options: UseLiveRegionOptions = {}): UseLiveRegionReturn {
  const { politeness = 'polite', clearAfter = 0, maxQueueSize = 10 } = options;

  const [politeMessage, setPoliteMessage] = useState<string | null>(null);
  const [assertiveMessage, setAssertiveMessage] = useState<string | null>(null);
  const queueRef = useRef<LiveMessage[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Process queue
  useEffect(() => {
    if (queueRef.current.length === 0) {
      return;
    }

    const next = queueRef.current[0];
    const targetSet = next.politeness === 'assertive' ? setAssertiveMessage : setPoliteMessage;

    targetSet(next.message);

    // Remove from queue after message is set
    const timeoutId = setTimeout(() => {
      queueRef.current.shift();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [politeMessage, assertiveMessage]);

  const announce = useCallback(
    (
      message: string,
      announcePoliteness: 'polite' | 'assertive' = politeness as 'polite' | 'assertive'
    ) => {
      const newMessage: LiveMessage = {
        id: `${Date.now()}-${Math.random()}`,
        message,
        politeness: announcePoliteness,
        timestamp: Date.now(),
      };

      // Add to queue
      queueRef.current.push(newMessage);

      // Limit queue size
      if (maxQueueSize && queueRef.current.length > maxQueueSize) {
        queueRef.current.shift();
      }

      // Set message immediately if queue was empty
      if (queueRef.current.length === 1) {
        const targetSet =
          announcePoliteness === 'assertive' ? setAssertiveMessage : setPoliteMessage;
        targetSet(message);

        // Clear after delay if specified
        if (clearAfter > 0) {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            targetSet(null);
          }, clearAfter);
        }
      }
    },
    [politeness, clearAfter, maxQueueSize]
  );

  const clear = useCallback(() => {
    queueRef.current = [];
    setPoliteMessage(null);
    setAssertiveMessage(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    announce,
    clear,
    politeMessage,
    assertiveMessage,
  };
}

/**
 * useAnnouncer hook
 *
 * Simpler hook for quick announcements without managing live region DOM.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const announce = useAnnouncer();
 *
 *   const handleClick = () => {
 *     announce('Task completed!');
 *   };
 *
 *   return <button onClick={handleClick}>Complete task</button>;
 * }
 * ```
 */
export function useAnnouncer(defaultPoliteness: 'polite' | 'assertive' = 'polite') {
  const [messages, setMessages] = useState<LiveMessage[]>([]);

  const announce = useCallback(
    (message: string, politeness: 'polite' | 'assertive' = defaultPoliteness) => {
      const newMessage: LiveMessage = {
        id: `announcement-${Date.now()}-${Math.random()}`,
        message,
        politeness,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newMessage]);

      // Remove after announcement (short delay for screen readers to pick it up)
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== newMessage.id));
      }, 1000);
    },
    [defaultPoliteness]
  );

  // Render live regions
  const LiveRegionComponent = useCallback(() => {
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
  }, [messages]);

  return [announce, LiveRegionComponent] as [
    (message: string, politeness?: 'polite' | 'assertive') => void,
    () => React.ReactElement,
  ];
}

/**
 * useStatusAnnouncer hook
 *
 * Hook for announcing status changes (polite announcements).
 */
export function useStatusAnnouncer() {
  const [status, setStatus] = useState<string>('');

  const announce = useCallback((message: string) => {
    setStatus(message);

    // Clear after announcement
    setTimeout(() => {
      setStatus('');
    }, 1000);
  }, []);

  const StatusRegion = useCallback(() => {
    return (
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {status}
      </div>
    );
  }, [status]);

  return [announce, StatusRegion] as [(message: string) => void, () => React.ReactElement];
}

/**
 * useAlertAnnouncer hook
 *
 * Hook for announcing alerts (assertive announcements that interrupt).
 */
export function useAlertAnnouncer() {
  const [alert, setAlert] = useState<string>('');

  const announce = useCallback((message: string) => {
    setAlert(message);

    // Clear after announcement
    setTimeout(() => {
      setAlert('');
    }, 1000);
  }, []);

  const AlertRegion = useCallback(() => {
    return (
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {alert}
      </div>
    );
  }, [alert]);

  return [announce, AlertRegion] as [(message: string) => void, () => React.ReactElement];
}
