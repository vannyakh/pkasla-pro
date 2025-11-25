import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';
import { api } from '@/lib/axios-client';

/**
 * Query keys for admin
 */
export const adminKeys = {
  all: ['admin'] as const,
  users: (filters?: UserListFilters) => [...adminKeys.all, 'users', filters] as const,
  user: (id: string) => [...adminKeys.all, 'user', id] as const,
};

export interface UserListFilters {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export interface UserListResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Get list of users (admin only)
 */
export function useAdminUsers(filters: UserListFilters = {}) {
  return useQuery<UserListResponse, Error>({
    queryKey: adminKeys.users(filters),
    queryFn: async (): Promise<UserListResponse> => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get<UserListResponse>(
        `/admin/users${params.toString() ? `?${params.toString()}` : ''}`
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch users');
      }
      if (!response.data) {
        throw new Error('Users data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Update user status mutation
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { userId: string; status: 'active' | 'pending' | 'suspended' }>({
    mutationFn: async ({ userId, status }) => {
      const response = await api.patch<User>(`/admin/users/${userId}/status`, { status });
      if (!response.success) {
        throw new Error(response.error || 'Failed to update user status');
      }
      if (!response.data) {
        throw new Error('User data not found');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.userId) });
    },
  });
}

/**
 * Update user role mutation
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { userId: string; role: 'admin' | 'recruiter' | 'candidate' | 'user' }>({
    mutationFn: async ({ userId, role }) => {
      const response = await api.patch<User>(`/admin/users/${userId}/role`, { role });
      if (!response.success) {
        throw new Error(response.error || 'Failed to update user role');
      }
      if (!response.data) {
        throw new Error('User data not found');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.userId) });
    },
  });
}

