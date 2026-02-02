/**
 * NextAuth API Route Handler
 *
 * This file creates the NextAuth API routes at /api/auth/*.
 * The [...nextauth] catch-all route handles all NextAuth endpoints:
 * - /api/auth/signin - Sign in page (redirects to /login)
 * - /api/auth/signout - Sign out
 * - /api/auth/session - Get current session
 * - /api/auth/csrf - CSRF token
 * - /api/auth/providers - List of providers
 * - /api/auth/callback - OAuth callbacks (not used for credential auth)
 */

import { handlers } from '@/lib/auth';

/**
 * Export all NextAuth HTTP handlers.
 * Next.js App Router requires named exports for each HTTP method.
 */
export const { GET, POST } = handlers;
