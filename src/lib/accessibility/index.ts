/**
 * Accessibility Utilities Module
 *
 * Comprehensive accessibility utilities for building WCAG-compliant applications.
 * Includes ARIA helpers, focus management, and keyboard navigation.
 *
 * @module accessibility
 */

// Export types
export * from './types';

// Export ARIA utilities
export {
  getAriaModalProps,
  getAriaButtonProps,
  getAriaCheckboxProps,
  getAriaListboxProps,
  getAriaOptionProps,
  getAriaTabProps,
  getAriaTabPanelProps,
  getAriaTabListProps,
  getAriaComboboxProps,
  getAriaMenuProps,
  getAriaMenuItemProps,
  getAriaLiveRegionProps,
  getAriaValidationProps,
  getAriaCurrentProps,
  getAriaProgressbarProps,
  getAriaSliderProps,
  getAriaTooltipProps,
  getAriaSearchboxProps,
  getAriaTreeitemProps,
  getAriaDateLabel,
  generateAriaId,
  resetAriaIdCounter,
} from './aria';

// Export focus utilities
export {
  getFocusableElements,
  getTabbableElements,
  isHidden,
  getFirstFocusableElement,
  getLastFocusableElement,
  getNextFocusableElement,
  getPreviousFocusableElement,
  focusElement,
  focusFirstElement,
  focusLastElement,
  wrapFocus,
  createFocusRestorer,
  trapFocus,
  isFocusable,
  getActiveElement,
  hasFocus,
  moveToElement,
  getFocusInOrder,
  disableFocusOutside,
  isKeyboardNavigation,
  markKeyboardNavigation,
  clearKeyboardNavigation,
  setupKeyboardNavigationDetection,
} from './focus';

// Export keyboard utilities
export {
  isModifierKey,
  isActivationKey,
  isArrowKey,
  isNavigationKey,
  createKeyboardHandler,
  handleArrowNavigation,
  handleHomeEndNavigation,
  handlePageNavigation,
  handleGridNavigation,
  getKey,
  matchesShortcut,
  formatShortcut,
  getShortcutFromEvent,
  combineKeyboardHandlers,
  createKeyMap,
  createKeyboardDebounce,
} from './keyboard';
