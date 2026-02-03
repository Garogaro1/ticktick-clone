/**
 * Accessibility Hooks
 *
 * Export all accessibility-related hooks.
 */

export { useFocusTrap, useFocusStack } from './useFocusTrap';
export type { UseFocusTrapReturn, UseFocusStackReturn } from './useFocusTrap';

export {
  useLiveRegion,
  useAnnouncer,
  useStatusAnnouncer,
  useAlertAnnouncer,
} from './useLiveRegion';
export type { UseLiveRegionReturn, LiveMessage, UseLiveRegionOptions } from './useLiveRegion';

export {
  useKeyboardNavigation,
  useArrowKeysNavigation,
  useListNavigation,
  useGridNavigation,
} from './useKeyboardNavigation';
export type {
  UseKeyboardNavigationOptions,
  UseKeyboardNavigationReturn,
  UseArrowKeysNavigationOptions,
  UseListNavigationOptions,
  UseGridNavigationOptions,
} from './useKeyboardNavigation';
