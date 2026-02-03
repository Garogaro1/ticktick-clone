/**
 * ARIA Utilities
 *
 * Helper functions for generating ARIA attributes and managing
 * accessible rich internet applications (ARIA) states.
 */

import type { LiveRegionPoliteness } from './types';

/**
 * Generate ARIA attributes for a modal/dialog
 */
export function getAriaModalProps({
  labelledBy,
  describedBy,
}: {
  labelledBy?: string;
  describedBy?: string;
} = {}) {
  const props: Record<string, string> = {
    role: 'dialog',
    'aria-modal': 'true',
  };

  if (labelledBy) {
    props['aria-labelledby'] = labelledBy;
  }
  if (describedBy) {
    props['aria-describedby'] = describedBy;
  }

  return props;
}

/**
 * Generate ARIA attributes for a button
 */
export function getAriaButtonProps({
  label,
  expanded,
  pressed,
  disabled,
  controls,
}: {
  label?: string;
  expanded?: boolean;
  pressed?: boolean;
  disabled?: boolean;
  controls?: string;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {
    type: 'button',
  };

  if (label) {
    props['aria-label'] = label;
  }
  if (expanded !== undefined) {
    props['aria-expanded'] = expanded;
  }
  if (pressed !== undefined) {
    props['aria-pressed'] = pressed;
  }
  if (controls) {
    props['aria-controls'] = controls;
  }
  if (disabled) {
    props['aria-disabled'] = true;
  }

  return props;
}

/**
 * Generate ARIA attributes for a checkbox
 */
export function getAriaCheckboxProps({
  checked = false,
  label,
  describedBy,
  required,
  disabled,
}: {
  checked?: boolean | 'mixed';
  label?: string;
  describedBy?: string;
  required?: boolean;
  disabled?: boolean;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {
    role: 'checkbox',
    'aria-checked': checked,
  };

  if (label) {
    props['aria-label'] = label;
  }
  if (describedBy) {
    props['aria-describedby'] = describedBy;
  }
  if (required) {
    props['aria-required'] = true;
  }
  if (disabled) {
    props['aria-disabled'] = true;
  }

  return props;
}

/**
 * Generate ARIA attributes for a listbox/select
 */
export function getAriaListboxProps({
  labelledBy,
  label,
  expanded,
  multiselectable,
}: {
  labelledBy?: string;
  label?: string;
  expanded?: boolean;
  multiselectable?: boolean;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {
    role: 'listbox',
  };

  if (labelledBy) {
    props['aria-labelledby'] = labelledBy;
  }
  if (label) {
    props['aria-label'] = label;
  }
  if (expanded !== undefined) {
    props['aria-expanded'] = expanded;
  }
  if (multiselectable) {
    props['aria-multiselectable'] = true;
  }

  return props;
}

/**
 * Generate ARIA attributes for a listbox option
 */
export function getAriaOptionProps({
  selected,
  disabled,
  checked,
  posInSet,
  setSize,
}: {
  selected?: boolean;
  disabled?: boolean;
  checked?: boolean;
  posInSet?: number;
  setSize?: number;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {
    role: 'option',
  };

  if (selected !== undefined) {
    props['aria-selected'] = selected;
  }
  if (disabled) {
    props['aria-disabled'] = true;
  }
  if (checked !== undefined) {
    props['aria-checked'] = checked;
  }
  if (posInSet !== undefined) {
    props['aria-posinset'] = String(posInSet);
  }
  if (setSize !== undefined) {
    props['aria-setsize'] = String(setSize);
  }

  return props;
}

/**
 * Generate ARIA attributes for a tab
 */
export function getAriaTabProps({
  selected,
  controls,
  labelledBy,
  disabled,
}: {
  selected?: boolean;
  controls?: string;
  labelledBy?: string;
  disabled?: boolean;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {
    role: 'tab',
  };

  if (selected !== undefined) {
    props['aria-selected'] = selected;
  }
  if (controls) {
    props['aria-controls'] = controls;
  }
  if (labelledBy) {
    props['aria-labelledby'] = labelledBy;
  }
  if (disabled) {
    props['aria-disabled'] = true;
  }

  return props;
}

/**
 * Generate ARIA attributes for a tab panel
 */
export function getAriaTabPanelProps({
  labelledBy,
  hidden,
}: {
  labelledBy?: string;
  hidden?: boolean;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {
    role: 'tabpanel',
  };

  if (labelledBy) {
    props['aria-labelledby'] = labelledBy;
  }
  if (hidden) {
    props['hidden'] = true;
  }

  return props;
}

/**
 * Generate ARIA attributes for a tab list
 */
export function getAriaTabListProps({ label }: { label?: string } = {}) {
  const props: Record<string, string | undefined> = {
    role: 'tablist',
  };

  if (label) {
    props['aria-label'] = label;
  }

  return props;
}

/**
 * Generate ARIA attributes for a combobox
 */
export function getAriaComboboxProps({
  labelledBy,
  label,
  expanded,
  controls,
  required,
  disabled,
}: {
  labelledBy?: string;
  label?: string;
  expanded?: boolean;
  controls?: string;
  required?: boolean;
  disabled?: boolean;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {
    role: 'combobox',
  };

  if (labelledBy) {
    props['aria-labelledby'] = labelledBy;
  }
  if (label) {
    props['aria-label'] = label;
  }
  if (expanded !== undefined) {
    props['aria-expanded'] = expanded;
  }
  if (controls) {
    props['aria-controls'] = controls;
  }
  if (required) {
    props['aria-required'] = true;
  }
  if (disabled) {
    props['aria-disabled'] = true;
  }

  return props;
}

/**
 * Generate ARIA attributes for a menu
 */
export function getAriaMenuProps({
  labelledBy,
  label,
  expanded,
}: {
  labelledBy?: string;
  label?: string;
  expanded?: boolean;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {
    role: 'menu',
  };

  if (labelledBy) {
    props['aria-labelledby'] = labelledBy;
  }
  if (label) {
    props['aria-label'] = label;
  }
  if (expanded !== undefined) {
    props['aria-expanded'] = expanded;
  }

  return props;
}

/**
 * Generate ARIA attributes for a menu item
 */
export function getAriaMenuItemProps({
  disabled,
  checked,
}: {
  disabled?: boolean;
  checked?: boolean;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {
    role: 'menuitem',
  };

  if (disabled) {
    props['aria-disabled'] = true;
  }
  if (checked !== undefined) {
    props['aria-checked'] = checked;
  }

  return props;
}

/**
 * Generate ARIA attributes for a live region
 */
export function getAriaLiveRegionProps({
  politeness = 'polite',
  atomic = false,
  relevant = 'additions text',
  busy = false,
}: {
  politeness?: LiveRegionPoliteness;
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all' | string;
  busy?: boolean;
} = {}) {
  const props: Record<string, string | boolean> = {
    'aria-live': politeness,
    'aria-atomic': atomic,
  };

  if (relevant && relevant !== 'all') {
    props['aria-relevant'] = relevant;
  }
  if (busy) {
    props['aria-busy'] = true;
  }

  return props;
}

/**
 * Generate ARIA attributes for form validation
 */
export function getAriaValidationProps({
  invalid,
  describedBy,
  required,
}: {
  invalid?: boolean;
  describedBy?: string;
  required?: boolean;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {};

  if (invalid) {
    props['aria-invalid'] = true;
  }
  if (describedBy) {
    props['aria-describedby'] = describedBy;
  }
  if (required) {
    props['aria-required'] = true;
  }

  return props;
}

/**
 * Generate ARIA current attribute for navigation
 */
export function getAriaCurrentProps({
  current,
}: {
  current?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {};

  if (current === true) {
    props['aria-current'] = 'page';
  } else if (current) {
    props['aria-current'] = current;
  }

  return props;
}

/**
 * Generate ARIA attributes for a progressbar
 */
export function getAriaProgressbarProps({
  value,
  max = 100,
  min = 0,
  label,
  describedBy,
}: {
  value?: number;
  max?: number;
  min?: number;
  label?: string;
  describedBy?: string;
} = {}) {
  const props: Record<string, string | number | boolean | undefined> = {
    role: 'progressbar',
  };

  if (value !== undefined) {
    props['aria-valuenow'] = String(value);
    props['aria-valuemin'] = String(min);
    props['aria-valuemax'] = String(max);
  } else {
    props['aria-valuemin'] = String(min);
    props['aria-valuemax'] = String(max);
  }

  if (label) {
    props['aria-label'] = label;
  }
  if (describedBy) {
    props['aria-describedby'] = describedBy;
  }

  return props;
}

/**
 * Generate ARIA attributes for a slider
 */
export function getAriaSliderProps({
  value,
  max = 100,
  min = 0,
  label,
  describedBy,
  disabled,
}: {
  value?: number;
  max?: number;
  min?: number;
  label?: string;
  describedBy?: string;
  disabled?: boolean;
} = {}) {
  const props: Record<string, string | number | boolean | undefined> = {
    role: 'slider',
  };

  if (value !== undefined) {
    props['aria-valuenow'] = String(value);
    props['aria-valuemin'] = String(min);
    props['aria-valuemax'] = String(max);
  }

  if (label) {
    props['aria-label'] = label;
  }
  if (describedBy) {
    props['aria-describedby'] = describedBy;
  }
  if (disabled) {
    props['aria-disabled'] = true;
  }

  return props;
}

/**
 * Generate ARIA attributes for a tooltip
 */
export function getAriaTooltipProps({ describedBy }: { describedBy: string }) {
  return {
    'aria-describedby': describedBy,
  };
}

/**
 * Generate ARIA attributes for a search input
 */
export function getAriaSearchboxProps({
  label,
  describedBy,
  expanded,
  controls,
}: {
  label?: string;
  describedBy?: string;
  expanded?: boolean;
  controls?: string;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {
    role: 'searchbox',
  };

  if (label) {
    props['aria-label'] = label;
  }
  if (describedBy) {
    props['aria-describedby'] = describedBy;
  }
  if (expanded !== undefined) {
    props['aria-expanded'] = expanded;
  }
  if (controls) {
    props['aria-controls'] = controls;
  }

  return props;
}

/**
 * Generate ARIA attributes for a tree/grid item
 */
export function getAriaTreeitemProps({
  expanded,
  selected,
  level,
  posInSet,
  setSize,
}: {
  expanded?: boolean;
  selected?: boolean;
  level?: number;
  posInSet?: number;
  setSize?: number;
} = {}) {
  const props: Record<string, string | boolean | undefined> = {
    role: 'treeitem',
  };

  if (expanded !== undefined) {
    props['aria-expanded'] = expanded;
  }
  if (selected !== undefined) {
    props['aria-selected'] = selected;
  }
  if (level !== undefined) {
    props['aria-level'] = String(level);
  }
  if (posInSet !== undefined) {
    props['aria-posinset'] = String(posInSet);
  }
  if (setSize !== undefined) {
    props['aria-setsize'] = String(setSize);
  }

  return props;
}

/**
 * Generate ARIA label for a date
 */
export function getAriaDateLabel(date: Date, locale = 'en-US'): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (diffDays === 0) {
    return `Today, ${formattedDate}`;
  }
  if (diffDays === 1) {
    return `Tomorrow, ${formattedDate}`;
  }
  if (diffDays === -1) {
    return `Yesterday, ${formattedDate}`;
  }
  if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays} days from now, ${formattedDate}`;
  }
  if (diffDays < -1 && diffDays >= -7) {
    return `${Math.abs(diffDays)} days ago, ${formattedDate}`;
  }

  return formattedDate;
}

/**
 * Generate unique ID for ARIA attributes
 */
let idCounter = 0;
export function generateAriaId(prefix = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Reset ID counter (for testing)
 */
export function resetAriaIdCounter(): void {
  idCounter = 0;
}
