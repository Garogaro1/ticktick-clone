/**
 * Authentication Module
 *
 * Exports all authentication utilities for the application.
 */

export { hashPassword, verifyPassword, validatePasswordStrength } from './password';
export { auth, signIn, signOut, handlers, getServerSession } from './auth';
export type { Session, AuthUser } from './auth';

/**
 * Re-export NextAuth types for convenience.
 */
export type { DefaultSession } from 'next-auth';
