import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import  auth  from '@/lib/auth';
import type { UserRole } from '@/types';

/**
 * Role-based route protection
 */
const roleRoutes: Record<string, UserRole[]> = {
  '/admin': ['admin'],
  '/dashbord': ['user']
};

/**
 * Public routes that don't require authentication
 */
const publicRoutes = ['/login', '/register'];

/**
 * Check if route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  return !publicRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if route requires specific role
 */
function getRequiredRole(pathname: string): UserRole[] | null {
  for (const [route, roles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth();

  // Check if route requires authentication
  if (requiresAuth(pathname)) {
    if (!session?.user) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if route requires specific role
    const requiredRoles = getRequiredRole(pathname);
    if (requiredRoles && session.user) {
      const userRole = session.user.role;
      if (!requiredRoles.includes(userRole)) {
        // Redirect to home if user doesn't have required role
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth/login') || pathname.startsWith('/register')) {
    if (session?.user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
