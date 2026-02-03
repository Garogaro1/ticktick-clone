/**
 * useKeyboardNavigation Hook
 *
 * Hook for implementing keyboard navigation patterns.
 * Supports list navigation, grid navigation, and custom handlers.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  handleArrowNavigation,
  handleHomeEndNavigation,
  handleGridNavigation,
} from '@/lib/accessibility/keyboard';

export interface UseKeyboardNavigationOptions {
  /**
   * Orientation of the navigation
   */
  orientation?: 'vertical' | 'horizontal' | 'both';

  /**
   * Whether to wrap navigation
   * @default true
   */
  wrap?: boolean;

  /**
   * Number of columns (for grid navigation)
   */
  columns?: number;

  /**
   * Number of rows (for grid navigation)
   */
  rows?: number;

  /**
   * Initial selected index
   * @default -1 (none selected)
   */
  initialIndex?: number;

  /**
   * Whether to loop navigation
   * @default true
   */
  loop?: boolean;

  /**
   * Custom keyboard handler
   */
  onKey?: (key: string, index: number) => boolean;
}

export interface UseKeyboardNavigationReturn {
  /**
   * Currently selected index
   */
  selectedIndex: number;

  /**
   * Set the selected index
   */
  setSelectedIndex: (index: number) => void;

  /**
   * Keyboard event handler to attach to container
   */
  onKeyDown: (event: React.KeyboardEvent) => void;

  /**
   * Get props for a navigation item
   */
  getItemProps: (index: number) => {
    tabIndex: number;
    'aria-selected'?: boolean;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    ref?: (element: HTMLElement | null) => void;
  };

  /**
   * Ref for the selected item element
   */
  selectedRef: React.RefObject<HTMLElement | null>;
}

/**
 * useKeyboardNavigation hook
 *
 * @example
 * ```tsx
 * function MyList() {
 *   const items = ['Item 1', 'Item 2', 'Item 3'];
 *   const { selectedIndex, getItemProps, onKeyDown } = useKeyboardNavigation({
 *     itemCount: items.length,
 *     orientation: 'vertical',
 *   });
 *
 *   return (
 *     <div role="listbox" onKeyDown={onKeyDown}>
 *       {items.map((item, index) => (
 *         <div key={index} role="option" {...getItemProps(index)}>
 *           {item}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useKeyboardNavigation(
  itemCount: number,
  options: UseKeyboardNavigationOptions = {}
): UseKeyboardNavigationReturn {
  const {
    orientation = 'vertical',
    wrap = true,
    columns = 1,
    rows,
    initialIndex = -1,
    loop = true,
    onKey,
  } = options;

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const selectedRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  // Focus the selected element
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.focus();
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Call custom handler first
      if (onKey && onKey(event.key, selectedIndex)) {
        event.preventDefault();
        return;
      }

      // Only handle navigation keys
      const isNavKey =
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'Home' ||
        event.key === 'End';

      if (!isNavKey) {
        return;
      }

      event.preventDefault();

      let newIndex = selectedIndex;

      switch (event.key) {
        case 'ArrowUp':
          if (orientation === 'both' && columns > 1 && rows) {
            newIndex =
              handleGridNavigation(selectedIndex, 'up', { columns, rows, wrap }) ?? selectedIndex;
          } else if (orientation === 'vertical') {
            newIndex = handleArrowNavigation(selectedIndex, itemCount, 'up', 'vertical', { wrap });
          }
          break;

        case 'ArrowDown':
          if (orientation === 'both' && columns > 1 && rows) {
            newIndex =
              handleGridNavigation(selectedIndex, 'down', { columns, rows, wrap }) ?? selectedIndex;
          } else if (orientation === 'vertical') {
            newIndex = handleArrowNavigation(selectedIndex, itemCount, 'down', 'vertical', {
              wrap,
            });
          }
          break;

        case 'ArrowLeft':
          if (orientation === 'both' && columns > 1) {
            newIndex =
              handleGridNavigation(selectedIndex, 'left', {
                columns,
                rows: rows ?? itemCount / columns,
                wrap,
              }) ?? selectedIndex;
          } else if (orientation === 'horizontal') {
            newIndex = handleArrowNavigation(selectedIndex, itemCount, 'left', 'horizontal', {
              wrap,
            });
          }
          break;

        case 'ArrowRight':
          if (orientation === 'both' && columns > 1) {
            newIndex =
              handleGridNavigation(selectedIndex, 'right', {
                columns,
                rows: rows ?? itemCount / columns,
                wrap,
              }) ?? selectedIndex;
          } else if (orientation === 'horizontal') {
            newIndex = handleArrowNavigation(selectedIndex, itemCount, 'right', 'horizontal', {
              wrap,
            });
          }
          break;

        case 'Home':
          newIndex = handleHomeEndNavigation('home', itemCount);
          break;

        case 'End':
          newIndex = handleHomeEndNavigation('end', itemCount);
          break;
      }

      if (newIndex !== selectedIndex) {
        setSelectedIndex(newIndex);
      }
    },
    [selectedIndex, itemCount, orientation, wrap, columns, rows, loop, onKey]
  );

  const getItemProps = useCallback(
    (index: number) => {
      return {
        tabIndex: selectedIndex === -1 ? (index === 0 ? 0 : -1) : index === selectedIndex ? 0 : -1,
        'aria-selected': selectedIndex === index ? true : undefined,
        ref: (element: HTMLElement | null) => {
          itemRefs.current[index] = element;
          if (index === selectedIndex) {
            selectedRef.current = element;
          }
        },
      };
    },
    [selectedIndex]
  );

  return {
    selectedIndex,
    setSelectedIndex,
    onKeyDown: handleKeyDown,
    getItemProps,
    selectedRef,
  };
}

/**
 * useArrowKeysNavigation hook
 *
 * Simpler hook for arrow key navigation in 1D lists.
 */
export interface UseArrowKeysNavigationOptions {
  /**
   * Whether to allow wrapping
   */
  wrap?: boolean;

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (index: number) => void;

  /**
   * Disable navigation
   */
  disabled?: boolean;
}

export function useArrowKeysNavigation(
  itemCount: number,
  options: UseArrowKeysNavigationOptions = {}
) {
  const { wrap = true, onSelectionChange, disabled = false } = options;
  const [index, setIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      let newIndex = index;

      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          newIndex = index > 0 ? index - 1 : wrap ? itemCount - 1 : 0;
          break;

        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          newIndex = index < itemCount - 1 ? index + 1 : wrap ? 0 : itemCount - 1;
          break;

        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          event.preventDefault();
          newIndex = itemCount - 1;
          break;

        default:
          return;
      }

      if (newIndex !== index) {
        setIndex(newIndex);
        onSelectionChange?.(newIndex);
      }
    },
    [index, itemCount, wrap, disabled, onSelectionChange]
  );

  return {
    index,
    setIndex,
    onKeyDown: handleKeyDown,
  };
}

/**
 * useListNavigation hook
 *
 * Hook for navigating a list with keyboard (Arrow keys, Home, End).
 * Supports both single-select and multi-select patterns.
 */
export interface UseListNavigationOptions {
  /**
   * Whether multiple items can be selected
   */
  multiple?: boolean;

  /**
   * Initially selected indices
   */
  defaultSelected?: number[];

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selected: number[]) => void;

  /**
   * Whether to wrap navigation
   */
  wrap?: boolean;
}

export function useListNavigation(itemCount: number, options: UseListNavigationOptions = {}) {
  const { multiple = false, defaultSelected = [], onSelectionChange, wrap = true } = options;
  const [selected, setSelected] = useState<number[]>(defaultSelected);
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      let newActiveIndex = activeIndex;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          newActiveIndex = activeIndex < itemCount - 1 ? activeIndex + 1 : wrap ? 0 : itemCount - 1;
          break;

        case 'ArrowUp':
          event.preventDefault();
          newActiveIndex = activeIndex > 0 ? activeIndex - 1 : wrap ? itemCount - 1 : 0;
          break;

        case 'Home':
          event.preventDefault();
          newActiveIndex = 0;
          break;

        case 'End':
          event.preventDefault();
          newActiveIndex = itemCount - 1;
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          if (multiple) {
            if (selected.includes(activeIndex)) {
              setSelected(selected.filter((i) => i !== activeIndex));
            } else {
              setSelected([...selected, activeIndex]);
            }
          } else {
            setSelected([activeIndex]);
          }
          onSelectionChange?.(selected);
          break;

        default:
          return;
      }

      if (newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex);
      }
    },
    [activeIndex, itemCount, multiple, selected, wrap, onSelectionChange]
  );

  return {
    selected,
    activeIndex,
    setSelected,
    setActiveIndex,
    onKeyDown: handleKeyDown,
  };
}

/**
 * useGridNavigation hook
 *
 * Hook for 2D grid navigation with arrow keys.
 */
export interface UseGridNavigationOptions {
  /**
   * Number of columns in the grid
   */
  columns: number;

  /**
   * Whether to wrap navigation
   */
  wrap?: boolean;

  /**
   * Callback when active cell changes
   */
  onActiveChange?: (index: number) => void;
}

export function useGridNavigation(itemCount: number, options: UseGridNavigationOptions) {
  const { columns, wrap = true, onActiveChange } = options;
  const rows = Math.ceil(itemCount / columns);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      let newIndex = activeIndex;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          newIndex =
            handleGridNavigation(activeIndex, 'up', { columns, rows, wrap }) ?? activeIndex;
          break;

        case 'ArrowDown':
          event.preventDefault();
          newIndex =
            handleGridNavigation(activeIndex, 'down', { columns, rows, wrap }) ?? activeIndex;
          break;

        case 'ArrowLeft':
          event.preventDefault();
          newIndex =
            handleGridNavigation(activeIndex, 'left', { columns, rows, wrap }) ?? activeIndex;
          break;

        case 'ArrowRight':
          event.preventDefault();
          newIndex =
            handleGridNavigation(activeIndex, 'right', { columns, rows, wrap }) ?? activeIndex;
          break;

        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          event.preventDefault();
          newIndex = itemCount - 1;
          break;

        case 'PageUp':
          event.preventDefault();
          newIndex = Math.max(0, activeIndex - columns);
          break;

        case 'PageDown':
          event.preventDefault();
          newIndex = Math.min(itemCount - 1, activeIndex + columns);
          break;

        default:
          return;
      }

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
        onActiveChange?.(newIndex);
      }
    },
    [activeIndex, columns, rows, wrap, itemCount, onActiveChange]
  );

  const getCellProps = useCallback(
    (index: number) => ({
      role: 'gridcell',
      tabIndex: index === activeIndex ? 0 : -1,
      'aria-selected': index === activeIndex,
      onKeyDown: handleKeyDown,
    }),
    [activeIndex, handleKeyDown]
  );

  return {
    activeIndex,
    setActiveIndex,
    onKeyDown: handleKeyDown,
    getCellProps,
  };
}
