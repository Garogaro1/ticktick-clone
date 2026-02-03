/**
 * Accessibility Types
 *
 * TypeScript types for accessibility utilities and hooks.
 */

/**
 * ARIA role values for semantic elements
 */
export type AriaRole =
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'button'
  | 'cell'
  | 'checkbox'
  | 'columnheader'
  | 'combobox'
  | 'complementary'
  | 'contentinfo'
  | 'definition'
  | 'dialog'
  | 'directory'
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem';

/**
 * Live region politeness levels
 */
export type LiveRegionPoliteness = 'polite' | 'assertive' | 'off';

/**
 * Keyboard event handlers
 */
export interface KeyboardHandlers {
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onPageUp?: () => void;
  onPageDown?: () => void;
  onTab?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

/**
 * Focus trap configuration
 */
export interface FocusTrapConfig {
  /**
   * Whether to trap focus within the container
   */
  enabled?: boolean;

  /**
   * Whether to auto-focus the first focusable element on mount
   */
  autoFocus?: boolean;

  /**
   * Whether to restore focus to the previously focused element on unmount
   */
  restoreFocus?: boolean;

  /**
   * Element to focus on mount (selector or element)
   */
  initialFocus?: string | HTMLElement | (() => HTMLElement);

  /**
   * Elements that should be considered outside the trap
   */
  containerSelectors?: string[];

  /**
   * Whether to include positive tab index elements
   */
  positiveTabIndex?: boolean;
}

/**
 * Live region configuration
 */
export interface LiveRegionConfig {
  /**
   * Politeness level for the live region
   */
  politeness?: LiveRegionPoliteness;

  /**
   * Whether the live region is atomic (announced as a whole)
   */
  atomic?: boolean;

  /**
   * Whether the live region is relevant (what types of changes are announced)
   */
  relevant?: 'additions' | 'removals' | 'text' | 'all';

  /**
   * Whether to clear the announcement after a delay
   */
  clearAfter?: number;

  /**
   * Whether to queue multiple announcements
   */
  queue?: boolean;
}

/**
 * Skip link target
 */
export interface SkipLinkTarget {
  /**
   * Unique ID for the target element
   */
  id: string;

  /**
   * Label for the skip link
   */
  label: string;

  /**
   * Target element ID to skip to
   */
  targetId: string;
}

/**
 * Focusable element query selector
 */
export const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  '[role="button"]:not([disabled])',
  '[role="checkbox"]:not([disabled])',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
  '[role="textbox"]:not([disabled])',
].join(', ');

/**
 * Tabbable element query selector (positive tabindex only)
 */
export const TABBABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex="0"]',
  '[contenteditable="true"]',
  'audio[controls]',
  'video[controls]',
  '[role="button"]:not([disabled])',
  '[role="checkbox"]:not([disabled])',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
].join(', ');
