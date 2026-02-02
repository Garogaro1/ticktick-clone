import { type ClassValue, clsx } from "clsx";

/**
 * Merge Tailwind CSS classes without conflicts
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
