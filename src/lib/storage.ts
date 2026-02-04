/**
 * Safe localStorage operations with error handling
 *
 * Safari's private browsing mode throws when accessing localStorage.
 * This utility provides safe wrappers that handle these errors gracefully.
 */

const isStorageAvailable = (() => {
  let available = true;
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
  } catch {
    available = false;
  }
  return available;
})();

/**
 * Safely get an item from localStorage
 * Returns null if storage is unavailable
 */
export function safeGetItem(key: string): string | null {
  if (!isStorageAvailable) {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely set an item in localStorage
 * Silently fails if storage is unavailable
 */
export function safeSetItem(key: string, value: string): boolean {
  if (!isStorageAvailable) {
    return false;
  }
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * Silently fails if storage is unavailable
 */
export function safeRemoveItem(key: string): boolean {
  if (!isStorageAvailable) {
    return false;
  }
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  return isStorageAvailable;
}

// Re-export functions as default for convenience
export default {
  getItem: safeGetItem,
  setItem: safeSetItem,
  removeItem: safeRemoveItem,
  isAvailable: isLocalStorageAvailable,
};
