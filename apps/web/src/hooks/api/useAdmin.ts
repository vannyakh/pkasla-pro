import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';
import { api } from '@/lib/axios-client';
import toast from 'react-hot-toast';

/**
 * Query keys for admin
 */
export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  userMetrics: () => [...adminKeys.all, 'user-metrics'] as const,
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
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SiteMetrics {
  totalUsers: number;
  activeUsers: number;
  activeUsersCount: number;
}

export interface UserMetrics {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  byRole: Record<string, number>;
  companyApprovals: {
    pending: number;
    approved: number;
    rejected: number;
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

  return useMutation<
    User,
    Error,
    { userId: string; status: 'active' | 'pending' | 'suspended' },
    { previousQueries: Array<[unknown, unknown]> }
  >({
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
    onMutate: async ({ userId, status }) => {
      // Cancel any outgoing refetches for all user list queries
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length >= 2 && key[0] === 'admin' && key[1] === 'users';
        }
      });

      // Snapshot the previous value for all user list queries
      const previousQueries = queryClient.getQueriesData({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length >= 2 && key[0] === 'admin' && key[1] === 'users';
        }
      });

      // Optimistically update all user lists
      queryClient.setQueriesData<UserListResponse>(
        { 
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key.length >= 2 && key[0] === 'admin' && key[1] === 'users';
          }
        },
        (old) => {
          if (!old || !('items' in old)) return old;
          return {
            ...old,
            items: old.items.map((user) =>
              user.id === userId ? { ...user, status } : user
            ),
          };
        }
      );

      // Return context with the snapshotted value
      return { previousQueries };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousQueries) {
        context.previousQueries.forEach((entry) => {
          const [queryKey, data] = entry;
          if (queryKey && data !== undefined) {
            queryClient.setQueryData(queryKey as readonly unknown[], data);
          }
        });
      }
      toast.error(err instanceof Error ? err.message : 'Failed to update user status');
    },
    onSuccess: (data, variables) => {
      // Invalidate all user list queries to ensure we have the latest data
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length >= 2 && key[0] === 'admin' && key[1] === 'users';
        }
      });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.userId) });
      toast.success(`User status updated to ${variables.status}`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length >= 2 && key[0] === 'admin' && key[1] === 'users';
        }
      });
    },
  });
}

/**
 * Update user role mutation
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation<
    User,
    Error,
    { userId: string; role: 'admin' | 'user' },
    { previousQueries: Array<[unknown, unknown]> }
  >({
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
    onMutate: async ({ userId, role }) => {
      // Cancel any outgoing refetches for all user list queries
      await queryClient.cancelQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length >= 2 && key[0] === 'admin' && key[1] === 'users';
        }
      });

      // Snapshot the previous value for all user list queries
      const previousQueries = queryClient.getQueriesData({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length >= 2 && key[0] === 'admin' && key[1] === 'users';
        }
      });

      // Optimistically update all user lists
      queryClient.setQueriesData<UserListResponse>(
        { 
          predicate: (query) => {
            const key = query.queryKey;
            return Array.isArray(key) && key.length >= 2 && key[0] === 'admin' && key[1] === 'users';
          }
        },
        (old) => {
          if (!old || !('items' in old)) return old;
          return {
            ...old,
            items: old.items.map((user) =>
              user.id === userId ? { ...user, role } : user
            ),
          };
        }
      );

      // Return context with the snapshotted value
      return { previousQueries };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousQueries) {
        context.previousQueries.forEach((entry) => {
          const [queryKey, data] = entry;
          if (queryKey && data !== undefined) {
            queryClient.setQueryData(queryKey as readonly unknown[], data);
          }
        });
      }
      toast.error(err instanceof Error ? err.message : 'Failed to update user role');
    },
    onSuccess: (data, variables) => {
      // Invalidate all user list queries to ensure we have the latest data
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length >= 2 && key[0] === 'admin' && key[1] === 'users';
        }
      });
      queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.userId) });
      toast.success(`User role updated to ${variables.role}`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length >= 2 && key[0] === 'admin' && key[1] === 'users';
        }
      });
    },
  });
}

/**
 * Get dashboard metrics (site metrics)
 */
export function useDashboardMetrics() {
  return useQuery<SiteMetrics, Error>({
    queryKey: adminKeys.dashboard(),
    queryFn: async (): Promise<SiteMetrics> => {
      const response = await api.get<SiteMetrics>('/admin/dashboard');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch dashboard metrics');
      }
      if (!response.data) {
        throw new Error('Dashboard metrics not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Get user metrics
 */
export function useUserMetrics() {
  return useQuery<UserMetrics, Error>({
    queryKey: adminKeys.userMetrics(),
    queryFn: async (): Promise<UserMetrics> => {
      const response = await api.get<UserMetrics>('/admin/analytics/users');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch user metrics');
      }
      if (!response.data) {
        throw new Error('User metrics not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

export interface ClearCacheResponse {
  redisCleared: number;
  inMemoryCleared: boolean;
}

/**
 * Clear cache mutation
 */
export function useClearCache() {
  const queryClient = useQueryClient();

  return useMutation<ClearCacheResponse, Error>({
    mutationFn: async (): Promise<ClearCacheResponse> => {
      const response = await api.post<ClearCacheResponse>('/admin/cache/clear');
      if (!response.success) {
        throw new Error(response.error || 'Failed to clear cache');
      }
      if (!response.data) {
        throw new Error('Cache clear response not found');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Clear all React Query cache
      queryClient.clear();
      toast.success(
        `Cache cleared successfully. ${data.redisCleared} Redis keys cleared.`
      );
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to clear cache');
    },
  });
}

