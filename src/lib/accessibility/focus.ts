/**
 * Focus Management Utilities
 *
 * Helper functions for managing focus in accessible applications.
 * Includes focus trap, focus restoration, and tab order management.
 */

import { FOCUSABLE_SELECTORS, TABBABLE_SELECTORS } from './types';

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(
  container: HTMLElement | Document,
  { includePositiveTabIndex = false } = {}
): HTMLElement[] {
  const selector = includePositiveTabIndex ? FOCUSABLE_SELECTORS : TABBABLE_SELECTORS;
  const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));

  // Filter out elements that are not visible or not in the DOM
  return elements.filter(
    (el) =>
      el.isConnected &&
      !isHidden(el) &&
      getComputedStyle(el).visibility !== 'hidden' &&
      getComputedStyle(el).display !== 'none'
  );
}

/**
 * Get all tabbable elements (tabindex >= 0)
 */
export function getTabbableElements(container: HTMLElement | Document): HTMLElement[] {
  return getFocusableElements(container, { includePositiveTabIndex: false })
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
      // Maintain DOM order for equal tabindex
      const position = a.compareDocumentPosition(b);
      return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
}

/**
 * Check if an element is visually hidden
 */
export function isHidden(el: HTMLElement): boolean {
  if (el === document.body || el === document.documentElement) {
    return false;
  }

  // Check if element or its ancestors have display: none or visibility: hidden
  let current: HTMLElement | null = el;
  while (current) {
    const styles = getComputedStyle(current);
    if (styles.display === 'none' || styles.visibility === 'hidden') {
      return true;
    }
    current = current.parentElement;
  }

  // Check for aria-hidden attribute
  if (el.getAttribute('aria-hidden') === 'true') {
    return true;
  }

  // Check if element has width/height of 0
  const rect = el.getBoundingClientRect();
  return rect.width === 0 && rect.height === 0;
}

/**
 * Get the first focusable element in a container
 */
export function getFirstFocusableElement(container: HTMLElement | Document): HTMLElement | null {
  const elements = getTabbableElements(container);
  return elements[0] || null;
}

/**
 * Get the last focusable element in a container
 */
export function getLastFocusableElement(container: HTMLElement | Document): HTMLElement | null {
  const elements = getTabbableElements(container);
  return elements[elements.length - 1] || null;
}

/**
 * Get the next focusable element after a given element
 */
export function getNextFocusableElement(
  current: HTMLElement,
  container: HTMLElement | Document = document
): HTMLElement | null {
  const elements = getTabbableElements(container);
  const index = elements.indexOf(current);
  return index >= 0 && index < elements.length - 1 ? elements[index + 1] : null;
}

/**
 * Get the previous focusable element before a given element
 */
export function getPreviousFocusableElement(
  current: HTMLElement,
  container: HTMLElement | Document = document
): HTMLElement | null {
  const elements = getTabbableElements(container);
  const index = elements.indexOf(current);
  return index > 0 ? elements[index - 1] : null;
}

/**
 * Focus an element with options
 */
export function focusElement(
  element: HTMLElement | null,
  options: { preventScroll?: boolean; focusVisible?: boolean } = {}
): boolean {
  if (!element) {
    return false;
  }

  try {
    element.focus({
      preventScroll: options.preventScroll ?? false,
    });

    // Add focus-visible class if requested
    if (options.focusVisible) {
      element.classList.add('focus-visible');
      // Remove after interaction
      const removeFocusVisible = () => {
        element.classList.remove('focus-visible');
        element.removeEventListener('mousedown', removeFocusVisible);
        element.removeEventListener('keydown', removeFocusVisible);
      };
      element.addEventListener('mousedown', removeFocusVisible);
      element.addEventListener('keydown', removeFocusVisible);
    }

    return true;
  } catch {
    // Element might not be focusable
    return false;
  }
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirstElement(
  container: HTMLElement | Document,
  options?: { preventScroll?: boolean }
): boolean {
  const first = getFirstFocusableElement(container);
  return focusElement(first, options);
}

/**
 * Focus the last focusable element in a container
 */
export function focusLastElement(
  container: HTMLElement | Document,
  options?: { preventScroll?: boolean }
): boolean {
  const last = getLastFocusableElement(container);
  return focusElement(last, options);
}

/**
 * Wrap focus within a container (circular tab navigation)
 */
export function wrapFocus(
  container: HTMLElement,
  current: HTMLElement,
  direction: 'forward' | 'backward'
): boolean {
  const focusable = getTabbableElements(container);

  if (focusable.length === 0) {
    return false;
  }

  if (focusable.length === 1) {
    return focusElement(focusable[0]);
  }

  const currentIndex = focusable.indexOf(current);

  if (direction === 'forward') {
    // At the last element, wrap to first
    if (currentIndex === focusable.length - 1) {
      return focusElement(focusable[0]);
    }
    // Focus next element
    return focusElement(focusable[currentIndex + 1]);
  } else {
    // At the first element, wrap to last
    if (currentIndex === 0) {
      return focusElement(focusable[focusable.length - 1]);
    }
    // Focus previous element
    return focusElement(focusable[currentIndex - 1]);
  }
}

/**
 * Create a focus restorer function
 * Returns a function that will restore focus to the previously focused element
 */
export function createFocusRestorer(): {
  saveFocus(): () => boolean;
  restoreFocus(): boolean;
} {
  let previousFocus: HTMLElement | null = null;
  let previousScrollPosition = 0;

  return {
    saveFocus: () => {
      previousFocus = document.activeElement as HTMLElement;
      previousScrollPosition = window.scrollY || window.pageYOffset;

      return () => {
        if (previousFocus && isConnected(previousFocus)) {
          focusElement(previousFocus);
          window.scrollTo(0, previousScrollPosition);
          return true;
        }
        return false;
      };
    },

    restoreFocus: () => {
      if (previousFocus && isConnected(previousFocus)) {
        focusElement(previousFocus);
        window.scrollTo(0, previousScrollPosition);
        return true;
      }
      return false;
    },
  };
}

/**
 * Check if an element is still connected to the DOM
 */
function isConnected(element: HTMLElement): boolean {
  return document.body.contains(element);
}

/**
 * Trap focus within a container
 * Call this when a tab key is pressed to keep focus within a modal/dialog
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  const focusable = getTabbableElements(container);

  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.key === 'Tab') {
    if (event.shiftKey) {
      // Shift + Tab: if at first element, move to last
      if (document.activeElement === first) {
        event.preventDefault();
        focusElement(last);
      }
    } else {
      // Tab: if at last element, move to first
      if (document.activeElement === last) {
        event.preventDefault();
        focusElement(first);
      }
    }
  }
}

/**
 * Check if an element can receive focus
 */
export function isFocusable(element: HTMLElement): boolean {
  if (!isConnected(element) || isHidden(element)) {
    return false;
  }

  // Check if element is natively focusable
  const focusableTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY'];
  if (focusableTags.includes(element.tagName)) {
    return !(element as HTMLButtonElement | HTMLInputElement).disabled;
  }

  // Check tabindex
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex !== null && tabIndex !== '-1') {
    return true;
  }

  // Check contenteditable
  if (element.getAttribute('contenteditable') === 'true') {
    return true;
  }

  return false;
}

/**
 * Get the element that currently has focus
 */
export function getActiveElement(): HTMLElement | null {
  const activeElement = document.activeElement;
  return activeElement && activeElement !== document.body ? (activeElement as HTMLElement) : null;
}

/**
 * Check if an element currently has focus
 */
export function hasFocus(element: HTMLElement): boolean {
  const active = getActiveElement();
  return active ? element.contains(active) : false;
}

/**
 * Move focus to a specific element within a container
 * Useful for error handling in forms
 */
export function moveToElement(container: HTMLElement, selector: string): boolean {
  const element = container.querySelector<HTMLElement>(selector);
  return focusElement(element);
}

/**
 * Get all elements that should receive focus in a specific order
 * Respects positive tabindex values
 */
export function getFocusInOrder(container: HTMLElement): HTMLElement[] {
  const focusable = getFocusableElements(container, { includePositiveTabIndex: true });

  return focusable.sort((a, b) => {
    const tabIndexA = parseInt(a.getAttribute('tabindex') || '0', 10);
    const tabIndexB = parseInt(b.getAttribute('tabindex') || '0', 10);

    if (tabIndexA !== tabIndexB) {
      return tabIndexA - tabIndexB;
    }

    // Same tabindex, use DOM order
    return Array.from(container.children).indexOf(a) - Array.from(container.children).indexOf(b);
  });
}

/**
 * Disable focus on all elements outside a container
 * Useful for modals and overlays
 */
export function disableFocusOutside(
  container: HTMLElement,
  originalTabIndexes: Map<HTMLElement, string> = new Map()
): () => void {
  const focusable = getFocusableElements(document.body);

  focusable.forEach((el) => {
    if (!container.contains(el)) {
      const tabIndex = el.getAttribute('tabindex');
      if (tabIndex !== null) {
        originalTabIndexes.set(el, tabIndex);
      }
      el.setAttribute('tabindex', '-1');
      el.setAttribute('data-focus-disabled', 'true');
    }
  });

  // Return function to restore
  return () => {
    focusable.forEach((el) => {
      if (el.getAttribute('data-focus-disabled') === 'true') {
        const original = originalTabIndexes.get(el);
        if (original !== undefined) {
          el.setAttribute('tabindex', original);
        } else {
          el.removeAttribute('tabindex');
        }
        el.removeAttribute('data-focus-disabled');
      }
    });
  };
}

/**
 * Check if the user is navigating with keyboard
 */
export function isKeyboardNavigation(): boolean {
  return document.body.classList.contains('is-keyboard-navigation');
}

/**
 * Mark that keyboard navigation is active
 */
export function markKeyboardNavigation(): void {
  document.body.classList.add('is-keyboard-navigation');
}

/**
 * Clear keyboard navigation marker
 */
export function clearKeyboardNavigation(): void {
  document.body.classList.remove('is-keyboard-navigation');
}

/**
 * Set up keyboard navigation detection
 * Adds a mousedown handler to detect mouse usage
 */
export function setupKeyboardNavigationDetection(): () => void {
  const handleMouseDown = () => {
    clearKeyboardNavigation();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      markKeyboardNavigation();
    }
  };

  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('keydown', handleKeyDown);
  };
}
