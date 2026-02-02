/**
 * Password Utilities
 *
 * Secure password hashing and verification using bcryptjs.
 * All passwords are hashed with salt before storing in database.
 */

import bcrypt from 'bcryptjs';

/**
 * Salt rounds for bcrypt hashing.
 * Higher values are more secure but slower.
 * 10 is a good balance for security and performance.
 */
const SALT_ROUNDS = 10;

/**
 * Hash a plain text password for secure storage.
 *
 * @param password - Plain text password to hash
 * @returns Promise resolving to the hashed password
 * @throws Error if hashing fails
 *
 * @example
 * const hashedPassword = await hashPassword('user123');
 * // Store hashedPassword in database
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hashed password.
 *
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password from database
 * @returns Promise resolving to true if passwords match
 *
 * @example
 * const isValid = await verifyPassword('user123', hashedPassword);
 * if (isValid) { /* Login successful *\/ }
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  if (!password || !hashedPassword) {
    return false;
  }

  return bcrypt.compare(password, hashedPassword);
}

/**
 * Validate password strength requirements.
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one number
 *
 * @param password - Plain text password to validate
 * @returns Object with isValid flag and error message
 *
 * @example
 * const validation = validatePasswordStrength('MyPass123');
 * if (!validation.isValid) {
 *   console.error(validation.error);
 * }
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  return { isValid: true };
}
