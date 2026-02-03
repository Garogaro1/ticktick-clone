/**
 * useFocusTrap Hook
 *
 * Enhanced focus trap hook with circular tab navigation.
 * Traps focus within a container, useful for modals and dialogs.
 */

import { useEffect, useRef, useCallback } from 'react';
import type { FocusTrapConfig } from '@/lib/accessibility/types';
import {
  getFocusableElements,
  focusFirstElement,
  getActiveElement,
  createFocusRestorer,
} from '@/lib/accessibility/focus';

export interface UseFocusTrapReturn {
  /**
   * Ref to attach to the container element
   */
  ref: React.RefObject<HTMLDivElement | null>;

  /**
   * Manually update the focus trap
   */
  update: () => void;

  /**
   * Release the focus trap
   */
  release: () => void;
}

export function useFocusTrap(config: FocusTrapConfig = {}): UseFocusTrapReturn {
  const {
    enabled = true,
    autoFocus = true,
    restoreFocus = true,
    initialFocus,
    positiveTabIndex = false,
  } = config;

  const ref = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Save previous focus on mount
  useEffect(() => {
    if (enabled && restoreFocus) {
      previousActiveElement.current = getActiveElement();
    }

    return () => {
      // Restore focus on unmount
      if (enabled && restoreFocus && previousActiveElement.current) {
        const restorer = createFocusRestorer();
        restorer.restoreFocus();
      }
    };
  }, [enabled, restoreFocus]);

  // Set up focus trap
  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }

    const container = ref.current;

    // Focus initial element
    if (autoFocus) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        if (initialFocus) {
          if (typeof initialFocus === 'string') {
            const element = container.querySelector<HTMLElement>(initialFocus);
            element?.focus();
          } else if (typeof initialFocus === 'function') {
            const element = initialFocus();
            element?.focus();
          } else {
            initialFocus.focus();
          }
        } else {
          focusFirstElement(container);
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [enabled, autoFocus, initialFocus]);

  // Handle tab key
  useEffect(() => {
    if (!enabled || !ref.current) {
      return;
    }

    const container = ref.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusable = getFocusableElements(container, {
        includePositiveTabIndex: positiveTabIndex,
      })
        .filter((el) => {
          const tabIndex = parseInt(el.getAttribute('tabindex') || '0', 10);
          return tabIndex >= 0;
        })
        .sort((a, b) => {
          const tabIndexA = parseInt(a.getAttribute('tabindex') || '0', 10);
          const tabIndexB = parseInt(b.getAttribute('tabindex') || '0', 10);
          if (tabIndexA !== tabIndexB) {
            return tabIndexA - tabIndexB;
          }
          const position = a.compareDocumentPosition(b);
          return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        // Shift + Tab: if at first element, move to last
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        // Tab: if at last element, move to first
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    // Add listener to container
    container.addEventListener('keydown', handleKeyDown, true);

    return () => {
      container.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, positiveTabIndex]);

  const update = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const container = ref.current;
    if (autoFocus) {
      if (initialFocus) {
        if (typeof initialFocus === 'string') {
          const element = container.querySelector<HTMLElement>(initialFocus);
          element?.focus();
        } else if (typeof initialFocus === 'function') {
          const element = initialFocus();
          element?.focus();
        } else {
          initialFocus.focus();
        }
      } else {
        focusFirstElement(container);
      }
    }
  }, [autoFocus, initialFocus]);

  const release = useCallback(() => {
    if (restoreFocus && previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [restoreFocus]);

  return {
    ref,
    update,
    release,
  };
}

/**
 * useFocusStack Hook
 *
 * Manages a stack of focus traps for nested modals/overlays.
 * Useful when multiple modals can be open at once.
 */
export interface UseFocusStackReturn {
  /**
   * Push a new focus trap onto the stack
   */
  push: (container: HTMLElement) => void;

  /**
   * Pop the current focus trap from the stack
   */
  pop: () => void;

  /**
   * Get the current active focus trap
   */
  active: HTMLElement | null;
}

const focusStack: HTMLElement[] = [];

export function useFocusStack(): UseFocusStackReturn {
  const push = useCallback((container: HTMLElement) => {
    focusStack.push(container);
  }, []);

  const pop = useCallback(() => {
    const removed = focusStack.pop();
    if (removed && focusStack.length > 0) {
      // Focus the previous container's first element
      const previousContainer = focusStack[focusStack.length - 1];
      focusFirstElement(previousContainer);
    }
    return removed;
  }, []);

  const active = useCallback(() => {
    return focusStack.length > 0 ? focusStack[focusStack.length - 1] : null;
  }, []);

  return {
    push,
    pop,
    get active() {
      return active();
    },
  };
}
