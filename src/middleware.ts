/**
 * NextAuth Middleware
 *
 * Protects routes that require authentication.
 * Redirects unauthenticated users to the login page.
 *
 * Middleware runs before the request completes.
 * It receives the request and returns a response.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Routes that don't require authentication.
 * Public routes are accessible without being logged in.
 */
const publicRoutes = new Set(['/login', '/register', '/api/auth']);

/**
 * Routes that should redirect authenticated users to home.
 * For example, logged-in users don't need to see the login page.
 */
const authRoutes = new Set(['/login', '/register']);

/**
 * Middleware function to protect routes.
 *
 * Checks if the user is authenticated and redirects accordingly:
 * - Unauthenticated users trying to access protected routes → /login
 * - Authenticated users trying to access auth routes → /
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes (except auth API)
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth();

  // Check if route is public
  const isPublicRoute =
    publicRoutes.has(pathname) ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/api/auth');

  // Check if route is an auth route (login, register)
  const isAuthRoute = authRoutes.has(pathname);

  // Redirect authenticated users away from auth routes
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!session && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on.
 *
 * - Match all routes except static files and images
 * - Exclude Next.js internal routes (_next, _vercel)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
