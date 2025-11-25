'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { ROUTES } from '@/constants';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole | UserRole[];
  fallback?: ReactNode;
}

/**
 * Check if user has required role(s)
 */
function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export function ProtectedRoute({
  children,
  requiredRoles,
  fallback,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Memoize required roles array to avoid recalculation
  const requiredRolesArray = useMemo(() => {
    if (!requiredRoles) return null;
    return Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  }, [requiredRoles]);

  // Memoize user and role check
  const user = session?.user as User | undefined;
  const userRole = user?.role;
  const hasAccess = useMemo(() => {
    if (!requiredRolesArray || !userRole) return true;
    return hasRequiredRole(userRole, requiredRolesArray);
  }, [requiredRolesArray, userRole]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!user) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (requiredRolesArray && !hasAccess) {
      // Redirect based on user role
      const redirectPath = userRole === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD;
      router.push(redirectPath);
    }
  }, [user, status, router, requiredRolesArray, hasAccess, userRole]);

  // Show loading state
  if (status === 'loading') {
    return fallback || <div>Loading...</div>;
  }

  // Show fallback if not authenticated
  if (!user) {
    return fallback || null;
  }

  // Show fallback if user doesn't have required role
  if (requiredRolesArray && !hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}

