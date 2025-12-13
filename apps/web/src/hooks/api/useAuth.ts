import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession, signIn, signOut } from 'next-auth/react';
import type { User, RegisterDto, LoginDto } from '@/types';
import { api } from '@/lib/axios-client';
import { useAuthStore } from '@/store';

/**
 * Query keys for auth
 */
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

/**
 * Get current authenticated user from NextAuth session
 * Falls back to API call if session data is incomplete
 */
export function useMe() {
  const { data: session, status } = useSession();
  const user = useAuthStore((state) => state.user);
  
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await api.get<User>('/auth/me');
      console.log("🚀 ~ useMe ~ response:", response)
      if (!response.success) throw new Error(response.error);
      return response.data!;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: status === 'authenticated' && !!user, // Only fetch if authenticated
    initialData: (session?.user as User) || user || undefined,
  });
}

/**
 * Login mutation - logs in via backend API (sets cookies) then signs in with NextAuth
 * This ensures backend cookies are set in the browser before NextAuth session is created
 */
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: LoginDto) => {
      // First, call backend login API client-side to set HTTP-only cookies
      // This must happen client-side so cookies are set in the browser
      const response = await api.post<{ user: User }>('/auth/login', data);
      if (!response.success) throw new Error(response.error);
      
      const userData = response.data;
      if (!userData) {
        throw new Error('Login failed - no user data returned');
      }
      
      // After backend cookies are set, sign in with NextAuth for session management
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      
      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }
      
      return userData;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

/**
 * Register mutation - registers user then signs them in with NextAuth
 */
export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      // Register user via API (this sets backend cookies)
      const response = await api.post<{ data: { user: User } }>('/auth/register', data);
      if (!response.success) throw new Error(response.error);
      
      const userData = (response.data as unknown as { data: { user: User } }).data?.user;
      if (!userData) {
        throw new Error('Registration failed - no user data returned');
      }
      
      // After successful registration, sign in with NextAuth
      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      
      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }
      
      return userData;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

/**
 * Refresh token mutation
 * Uses HTTP-only cookies - refreshToken is read from cookie by backend
 * Backend automatically sets new cookies on successful refresh
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      // Backend reads refreshToken from HTTP-only cookie
      // No need to send token in body - cookies are sent automatically via withCredentials
      const response = await api.post<{ user: User }>('/auth/refresh', {});
      if (!response.success) throw new Error(response.error);
      
      // Backend sets new cookies automatically, so we just return success
      return response.data;
    },
  });
}

/**
 * Logout mutation - uses NextAuth signOut
 */
export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        // Call backend logout endpoint
        await api.post('/auth/logout');
      } catch (error) {
        // Even if logout fails on server, continue with client-side logout
        console.error('Logout error:', error);
      }
      
      // Sign out from NextAuth (this clears the session)
      await signOut({ redirect: false });
    },
    onSuccess: () => {
      // Clear React Query cache
      queryClient.clear();
    },
  });
}

