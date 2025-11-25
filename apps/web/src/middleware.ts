import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import type { UserRole } from '@/types';
import { ROUTES } from '@/constants';

/**
 * Role-based route protection
 * Routes are ordered from most specific to least specific
 */
const roleRoutes: Array<{ route: string; roles: UserRole[] }> = [
  { route: '/admin', roles: ['admin'] },
  { route: '/dashboard', roles: ['user', 'admin'] },
];

/**
 * Public routes that don't require authentication
 */
const publicRoutes: readonly string[] = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.HOME,
] as const;

/**
 * Auth pages that authenticated users should be redirected away from
 */
const authPages: readonly string[] = [ROUTES.LOGIN, ROUTES.REGISTER] as const;

/**
 * Check if pathname matches a static file or API route
 */
function isStaticOrApiRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  );
}

/**
 * Check if route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  // Check if pathname starts with any public route (for nested routes)
  return publicRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Get required roles for a specific route
 * Returns null if route doesn't have role restrictions
 */
function getRequiredRoles(pathname: string): UserRole[] | null {
  // Check routes from most specific to least specific
  for (const { route, roles } of roleRoutes) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

/**
 * Check if user has required role
 */
function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Early return for static files and API routes
  if (isStaticOrApiRoute(pathname)) {
    return NextResponse.next();
  }

  // Get session once
  const session = await auth();
  const user = session?.user;

  // Redirect authenticated users away from auth pages
  if (authPages.some((route) => pathname.startsWith(route)) && user) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  // Check if route requires authentication
  if (!isPublicRoute(pathname)) {
    // Route requires authentication
    if (!user) {
      // Redirect to login with callback URL
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access
    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles && !hasRequiredRole(user.role, requiredRoles)) {
      // User doesn't have required role, redirect based on their role
      const redirectPath = user.role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD;
      return NextResponse.redirect(new URL(redirectPath, request.url));
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
