import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User, LoginDto, RegisterDto, AuthResponse } from '@/types';
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
 * Get current authenticated user
 */
export function useMe() {
  const user = useAuthStore((state) => state.user);
  
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await api.get<User>('/auth/me');
      if (!response.success) throw new Error(response.error);
      return response.data!;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!user, // Only fetch if user exists in store
    initialData: user || undefined,
  });
}

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  return useMutation({
    mutationFn: async (credentials: LoginDto) => {
      const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
      if (!response.success) throw new Error(response.error);
      
      // Response structure: { success: true, data: { user, tokens } }
      const authData = (response.data as unknown as { data: AuthResponse }).data || response.data as unknown as AuthResponse;
      return authData;
    },
    onSuccess: (data) => {
      // Store user and tokens
      setAuth(data.user, data.tokens);
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

/**
 * Register mutation
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  return useMutation({
    mutationFn: async (data: RegisterDto) => {
      const response = await api.post<{ data: AuthResponse }>('/auth/register', data);
      if (!response.success) throw new Error(response.error);
      
      // Response structure: { success: true, data: { user, tokens } }
      const authData = (response.data as unknown as { data: AuthResponse }).data || response.data as unknown as AuthResponse;
      return authData;
    },
    onSuccess: (data) => {
      // Store user and tokens
      setAuth(data.user, data.tokens);
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

/**
 * Refresh token mutation
 */
export function useRefreshToken() {
  const setTokens = useAuthStore((state) => state.setTokens);
  
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await api.post<{ data: { tokens: { accessToken: string; refreshToken: string } } }>(
        '/auth/refresh',
        { refreshToken }
      );
      if (!response.success) throw new Error(response.error);
      
      // Response structure may vary, adjust based on your API
      const tokens = (response.data as unknown as { tokens: { accessToken: string; refreshToken: string } }).tokens || (response.data as unknown as { data: { tokens: { accessToken: string; refreshToken: string } } }).data?.tokens;
      return tokens;
    },
    onSuccess: (tokens) => {
      setTokens(tokens);
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await api.post('/auth/logout');
        return response;
      } catch (error) {
        // Even if logout fails on server, clear local state
        console.error('Logout error:', error);
      }
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}

