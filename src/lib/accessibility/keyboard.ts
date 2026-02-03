/**
 * Keyboard Navigation Utilities
 *
 * Helper functions for handling keyboard events and implementing
 * accessible keyboard navigation patterns.
 */

import type { KeyboardHandlers } from './types';

/**
 * Check if a key is a modifier key
 */
export function isModifierKey(event: KeyboardEvent): boolean {
  return (
    event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt' || event.key === 'Meta'
  );
}

/**
 * Check if an event should trigger an action (Enter or Space)
 */
export function isActivationKey(event: KeyboardEvent): boolean {
  return event.key === 'Enter' || event.key === ' ';
}

/**
 * Check if an event is an arrow key
 */
export function isArrowKey(event: KeyboardEvent): boolean {
  return (
    event.key === 'ArrowUp' ||
    event.key === 'ArrowDown' ||
    event.key === 'ArrowLeft' ||
    event.key === 'ArrowRight'
  );
}

/**
 * Check if an event is a navigation key
 */
export function isNavigationKey(event: KeyboardEvent): boolean {
  return (
    isArrowKey(event) ||
    event.key === 'Home' ||
    event.key === 'End' ||
    event.key === 'PageUp' ||
    event.key === 'PageDown'
  );
}

/**
 * Create keyboard event handler
 * Provides a convenient way to handle multiple keyboard shortcuts
 */
export function createKeyboardHandler(handlers: KeyboardHandlers) {
  return (event: React.KeyboardEvent) => {
    // Don't prevent default for modifier keys
    if (isModifierKey(event.nativeEvent)) {
      return;
    }

    const target = event.target as HTMLElement;
    const tagName = target.tagName;

    // Don't interfere with input/textarea/select
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
      // Allow escape to still work
      if (event.key === 'Escape' && handlers.onEscape) {
        handlers.onEscape();
        event.preventDefault();
      }
      return;
    }

    let handled = false;

    switch (event.key) {
      case 'Enter':
        if (handlers.onEnter) {
          handlers.onEnter();
          handled = true;
        }
        break;
      case ' ':
        if (handlers.onSpace) {
          handlers.onSpace();
          handled = true;
        }
        break;
      case 'Escape':
        if (handlers.onEscape) {
          handlers.onEscape();
          handled = true;
        }
        break;
      case 'ArrowUp':
        if (handlers.onArrowUp) {
          handlers.onArrowUp();
          handled = true;
        }
        break;
      case 'ArrowDown':
        if (handlers.onArrowDown) {
          handlers.onArrowDown();
          handled = true;
        }
        break;
      case 'ArrowLeft':
        if (handlers.onArrowLeft) {
          handlers.onArrowLeft();
          handled = true;
        }
        break;
      case 'ArrowRight':
        if (handlers.onArrowRight) {
          handlers.onArrowRight();
          handled = true;
        }
        break;
      case 'Home':
        if (handlers.onHome) {
          handlers.onHome();
          handled = true;
        }
        break;
      case 'End':
        if (handlers.onEnd) {
          handlers.onEnd();
          handled = true;
        }
        break;
      case 'PageUp':
        if (handlers.onPageUp) {
          handlers.onPageUp();
          handled = true;
        }
        break;
      case 'PageDown':
        if (handlers.onPageDown) {
          handlers.onPageDown();
          handled = true;
        }
        break;
      case 'Tab':
        if (handlers.onTab) {
          handlers.onTab();
          handled = true;
        }
        break;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Call custom handler last
    if (handlers.onKeyDown) {
      handlers.onKeyDown(event);
    }
  };
}

/**
 * Handle arrow key navigation for a list
 * Returns the new index and optionally wraps around
 */
export function handleArrowNavigation(
  currentIndex: number,
  itemCount: number,
  direction: 'up' | 'down' | 'left' | 'right',
  orientation: 'vertical' | 'horizontal' = 'vertical',
  options: { wrap?: boolean } = {}
): number {
  const { wrap = true } = options;

  let newIndex = currentIndex;

  if (orientation === 'vertical') {
    if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : wrap ? itemCount - 1 : 0;
    } else if (direction === 'down') {
      newIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : wrap ? 0 : itemCount - 1;
    }
  } else {
    if (direction === 'left') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : wrap ? itemCount - 1 : 0;
    } else if (direction === 'right') {
      newIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : wrap ? 0 : itemCount - 1;
    }
  }

  return newIndex;
}

/**
 * Handle home/end key navigation
 */
export function handleHomeEndNavigation(direction: 'home' | 'end', itemCount: number): number {
  return direction === 'home' ? 0 : itemCount - 1;
}

/**
 * Handle page up/page down key navigation
 */
export function handlePageNavigation(
  currentIndex: number,
  itemCount: number,
  direction: 'pageUp' | 'pageDown',
  pageSize = 10
): number {
  if (direction === 'pageUp') {
    return Math.max(0, currentIndex - pageSize);
  }
  return Math.min(itemCount - 1, currentIndex + pageSize);
}

/**
 * Grid navigation (for 2D grids like calendars)
 */
export interface GridNavigationOptions {
  columns: number;
  rows: number;
  wrap?: boolean;
}

export function handleGridNavigation(
  currentIndex: number,
  direction: 'up' | 'down' | 'left' | 'right',
  options: GridNavigationOptions
): number | null {
  const { columns, rows, wrap = false } = options;
  const totalCells = columns * rows;

  if (currentIndex < 0 || currentIndex >= totalCells) {
    return null;
  }

  const currentRow = Math.floor(currentIndex / columns);
  const currentCol = currentIndex % columns;

  let newRow = currentRow;
  let newCol = currentCol;

  switch (direction) {
    case 'up':
      newRow = currentRow > 0 ? currentRow - 1 : wrap ? rows - 1 : 0;
      break;
    case 'down':
      newRow = currentRow < rows - 1 ? currentRow + 1 : wrap ? 0 : rows - 1;
      break;
    case 'left':
      newCol = currentCol > 0 ? currentCol - 1 : wrap ? columns - 1 : 0;
      break;
    case 'right':
      newCol = currentCol < columns - 1 ? currentCol + 1 : wrap ? 0 : columns - 1;
      break;
  }

  return newRow * columns + newCol;
}

/**
 * Get key from keyboard event
 */
export function getKey(event: React.KeyboardEvent | KeyboardEvent): string {
  return event.key;
}

/**
 * Check if a key event matches a shortcut
 * Supports: Ctrl+Key, Cmd+Key, Alt+Key, Shift+Key
 */
export function matchesShortcut(
  event: React.KeyboardEvent | KeyboardEvent,
  shortcut: string
): boolean {
  const normalized = shortcut.toLowerCase().replace(/\s+/g, '');

  // Parse shortcut
  const ctrl = normalized.includes('ctrl') || normalized.includes('cmd');
  const alt = normalized.includes('alt');
  const shift = normalized.includes('shift');
  const meta = normalized.includes('cmd') || normalized.includes('meta');
  const key = normalized.split('+').pop();

  // Check modifiers
  if (ctrl && !event.ctrlKey && !event.metaKey) return false;
  if (alt && !event.altKey) return false;
  if (shift && !event.shiftKey) return false;
  if (meta && !event.metaKey) return false;

  // Check key (case-insensitive)
  const eventKey = event.key.toLowerCase();

  // Handle special keys
  if (key === 'escape') return eventKey === 'escape';
  if (key === 'enter') return eventKey === 'enter';
  if (key === 'space') return eventKey === ' ';
  if (key === 'tab') return eventKey === 'tab';
  if (key === 'up') return eventKey === 'arrowup';
  if (key === 'down') return eventKey === 'arrowdown';
  if (key === 'left') return eventKey === 'arrowleft';
  if (key === 'right') return eventKey === 'arrowright';

  return eventKey === key;
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: string): string {
  const isMac =
    typeof window !== 'undefined' &&
    (/Mac|iPod|iPhone|iPad/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  return shortcut
    .toLowerCase()
    .replace(/\bctrl\b/g, isMac ? '⌘' : 'Ctrl')
    .replace(/\bcmd\b/g, '⌘')
    .replace(/\balt\b/g, isMac ? '⌥' : 'Alt')
    .replace(/\bshift\b/g, isMac ? '⇧' : 'Shift')
    .replace(/\bmeta\b/g, '⌘')
    .replace(/\bspacer\b/g, 'Space')
    .replace(/\bup\b/g, '↑')
    .replace(/\bdown\b/g, '↓')
    .replace(/\bleft\b/g, '←')
    .replace(/\bright\b/g, '→')
    .replace(/\benter\b/g, '↵')
    .replace(/\bescape\b/g, 'Esc')
    .replace(/\btab\b/g, '⇥')
    .split('+')
    .join(isMac ? '' : '+');
}

/**
 * Get keyboard shortcut from event
 */
export function getShortcutFromEvent(event: React.KeyboardEvent | KeyboardEvent): string {
  const parts: string[] = [];

  if (event.ctrlKey || event.metaKey) {
    parts.push('Ctrl');
  }
  if (event.altKey) {
    parts.push('Alt');
  }
  if (event.shiftKey) {
    parts.push('Shift');
  }

  let key = event.key;

  // Normalize special keys
  if (key === ' ') {
    key = 'Space';
  } else if (key.startsWith('Arrow')) {
    key = key.replace('Arrow', '');
  }

  parts.push(key);

  return parts.join('+');
}

/**
 * Combine multiple keyboard handlers
 * Later handlers take precedence
 */
export function combineKeyboardHandlers(...handlers: KeyboardHandlers[]): KeyboardHandlers {
  return {
    onEnter: (...args) => handlers.forEach((h) => h.onEnter?.(...args)),
    onSpace: (...args) => handlers.forEach((h) => h.onSpace?.(...args)),
    onEscape: (...args) => handlers.forEach((h) => h.onEscape?.(...args)),
    onArrowUp: (...args) => handlers.forEach((h) => h.onArrowUp?.(...args)),
    onArrowDown: (...args) => handlers.forEach((h) => h.onArrowDown?.(...args)),
    onArrowLeft: (...args) => handlers.forEach((h) => h.onArrowLeft?.(...args)),
    onArrowRight: (...args) => handlers.forEach((h) => h.onArrowRight?.(...args)),
    onHome: (...args) => handlers.forEach((h) => h.onHome?.(...args)),
    onEnd: (...args) => handlers.forEach((h) => h.onEnd?.(...args)),
    onPageUp: (...args) => handlers.forEach((h) => h.onPageUp?.(...args)),
    onPageDown: (...args) => handlers.forEach((h) => h.onPageDown?.(...args)),
    onTab: (...args) => handlers.forEach((h) => h.onTab?.(...args)),
    onKeyDown: (...args) => handlers.forEach((h) => h.onKeyDown?.(...args)),
  };
}

/**
 * Create a key map for common keyboard shortcuts
 */
export function createKeyMap(map: Record<string, () => void>) {
  return (event: React.KeyboardEvent | KeyboardEvent) => {
    for (const [shortcut, handler] of Object.entries(map)) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        handler();
        return true;
      }
    }
    return false;
  };
}

/**
 * Debounce keyboard events
 * Prevents rapid-fire keyboard actions
 */
export function createKeyboardDebounce(
  handler: (event: KeyboardEvent) => void,
  delay = 150
): (event: KeyboardEvent) => void {
  let lastTime = 0;

  return (event: KeyboardEvent) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      handler(event);
    }
  };
}
