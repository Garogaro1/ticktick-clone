/**
 * Input validation utilities.
 * Provides common validation functions with TypeScript types.
 */

/**
 * Email validation regex.
 * Follows RFC 5322 standard for email addresses.
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Password validation regex.
 * Requires at least 8 characters, 1 letter, 1 number.
 */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;

/**
 * URL validation regex.
 * Matches http, https, and protocol-relative URLs.
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * Validation result type.
 */
export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

/**
 * Validate an email address.
 *
 * @param email - Email address to validate
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email address' };
  }

  return { isValid: true };
}

/**
 * Validate a password.
 * Requires at least 8 characters, 1 letter, 1 number.
 *
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least 1 letter and 1 number',
    };
  }

  return { isValid: true };
}

/**
 * Validate a URL.
 *
 * @param url - URL to validate
 * @returns Validation result
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }

  if (!URL_REGEX.test(url)) {
    return { isValid: false, error: 'Invalid URL' };
  }

  return { isValid: true };
}

/**
 * Validate a required string field.
 *
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 */
export function validateRequired(value: string, fieldName = 'Field'): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

/**
 * Validate a string length.
 *
 * @param value - Value to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns Validation result
 */
export function validateLength(value: string, min: number, max: number): ValidationResult {
  if (value.length < min) {
    return { isValid: false, error: `Must be at least ${min} characters` };
  }

  if (value.length > max) {
    return { isValid: false, error: `Must be at most ${max} characters` };
  }

  return { isValid: true };
}

/**
 * Validate a number range.
 *
 * @param value - Value to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Validation result
 */
export function validateRange(value: number, min: number, max: number): ValidationResult {
  if (isNaN(value)) {
    return { isValid: false, error: 'Must be a valid number' };
  }

  if (value < min) {
    return { isValid: false, error: `Must be at least ${min}` };
  }

  if (value > max) {
    return { isValid: false, error: `Must be at most ${max}` };
  }

  return { isValid: true };
}

/**
 * Validate a task title.
 *
 * @param title - Title to validate
 * @returns Validation result
 */
export function validateTaskTitle(title: string): ValidationResult {
  const requiredResult = validateRequired(title, 'Title');
  if (!requiredResult.isValid) return requiredResult;

  return validateLength(title, 1, 500);
}

/**
 * Validate a task description.
 *
 * @param description - Description to validate
 * @returns Validation result
 */
export function validateTaskDescription(description: string): ValidationResult {
  if (description && description.length > 10000) {
    return { isValid: false, error: 'Description must be at most 10,000 characters' };
  }

  return { isValid: true };
}
