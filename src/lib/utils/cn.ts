import { type ClassValue, clsx } from 'clsx';

/**
 * Combines class names using clsx.
 * Filters out falsy values and merges Tailwind classes.
 *
 * @param inputs - Class names to combine
 * @returns Combined class string
 *
 * @example
 * cn('px-4', isActive && 'bg-primary', 'text-white')
 * // Returns: 'px-4 bg-primary text-white' (if isActive is true)
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}
