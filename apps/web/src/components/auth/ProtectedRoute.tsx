'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { ROUTES } from '@/constants';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole | UserRole[];
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  fallback,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (requiredRoles) {
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const user = session.user as User;
      const userRole = user.role;
      
      if (!roles.includes(userRole)) {
        router.push(ROUTES.HOME);
        return;
      }
    }
  }, [session, status, router, requiredRoles]);

  if (status === 'loading') {
    return fallback || <div>Loading...</div>;
  }

  if (!session?.user) {
    return fallback || null;
  }

  if (requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const user = session.user as User;
    const userRole = user.role;
    
    if (!roles.includes(userRole)) {
      return fallback || null;
    }
  }

  return <>{children}</>;
}

