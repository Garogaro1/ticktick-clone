/**
 * NextAuth Configuration
 *
 * Authentication configuration using Auth.js (NextAuth v5).
 * Configures credential provider (email/password) for user authentication.
 */

import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { verifyPassword } from './password';
import type { User } from '@prisma/client';

/**
 * Extended user type with all fields from database except password.
 * This type is used for the session user object.
 */
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extended session type with user data.
 */
export type Session = {
  user: AuthUser;
};

/**
 * Helper to get user data without password.
 */
function sanitizeUser(user: User): AuthUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...sanitized } = user;
  return sanitized;
}

/**
 * NextAuth configuration for credential authentication.
 */
const config: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return null;
        }

        // Return user data without password
        return sanitizeUser(user);
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in - add user to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data from token to session
      if (session.user) {
        // Get fresh user data from database
        const user = await db.user.findUnique({
          where: { id: token.id as string },
        });

        if (user) {
          const sanitizedUser = sanitizeUser(user);
          session.user = sanitizedUser;
        }
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Export configured auth instance for API routes.
 */
export const { auth, signIn, signOut, handlers } = NextAuth(config);

/**
 * Get the current server session.
 *
 * @returns Promise resolving to the session or null
 *
 * @example
 * const session = await getServerSession();
 * if (session) {
 *   console.log('Logged in as:', session.user.email);
 * }
 */
export async function getServerSession() {
  return auth();
}
