/**
 * NextAuth Type Extensions
 *
 * Extends the default NextAuth types with our custom user properties.
 * This file must be included in the TypeScript project to override types.
 */

import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `credentials` callback.
   */
  interface User {
    id: string;
    email: string;
    emailVerified: Date | null;
    name: string | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  }

  /**
   * The session object returned by `getServerSession` and passed to components.
   */
  interface Session {
    user: {
      id: string;
      email: string;
      emailVerified: Date | null;
      name: string | null;
      image: string | null;
      createdAt: Date;
      updatedAt: Date;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * The JWT returned by the `jwt` callback.
   */
  interface JWT {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  }
}
