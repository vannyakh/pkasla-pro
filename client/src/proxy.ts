import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api'))

  // Protected routes (dashboard)
  const isProtectedRoute = pathname.startsWith('/dashbord')

  // TODO: Implement actual authentication check
  // - Get token from cookies/headers
  // - Validate token
  // - Check user permissions

  if (isProtectedRoute) {
    // For now, allow access (implement actual auth check)
    // const token = request.cookies.get('auth_token')
    // if (!token) {
    //   return NextResponse.redirect(new URL('/login', request.url))
    // }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

