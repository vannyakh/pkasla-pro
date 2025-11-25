import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User, LoginDto, RegisterDto, AuthResponse, AuthTokens } from '@/types';
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
  
  return useQuery<User, Error>({
    queryKey: authKeys.me(),
    queryFn: async (): Promise<User> => {
      const response = await api.get<User>('/users/me');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch user');
      }
      if (!response.data) {
        throw new Error('User data not found');
      }
      return response.data;
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
  
  return useMutation<AuthResponse, Error, LoginDto>({
    mutationFn: async (credentials: LoginDto) => {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      
      // Response structure: { success: true, data: { user, tokens } }
      const authData = response.data as AuthResponse;
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
  
  return useMutation<AuthResponse, Error, RegisterDto>({
    mutationFn: async (data: RegisterDto) => {
      const response = await api.post<AuthResponse>('/auth/register', data);
      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }
      
      // Response structure: { success: true, data: { user, tokens } }
      const authData = response.data as AuthResponse;
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
 * Refresh token response type
 */
interface RefreshTokenResponse {
  tokens: AuthTokens;
}

/**
 * Refresh token mutation
 */
export function useRefreshToken() {
  const setTokens = useAuthStore((state) => state.setTokens);
  
  return useMutation<AuthTokens, Error, string>({
    mutationFn: async (refreshToken: string) => {
      const response = await api.post<RefreshTokenResponse>(
        '/auth/refresh',
        { refreshToken }
      );
      if (!response.success) {
        throw new Error(response.error || 'Token refresh failed');
      }
      
      // Response structure: { success: true, data: { tokens: { accessToken, refreshToken } } }
      const responseData = response.data as RefreshTokenResponse;
      return responseData.tokens;
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
  
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        await api.post<void>('/auth/logout');
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

