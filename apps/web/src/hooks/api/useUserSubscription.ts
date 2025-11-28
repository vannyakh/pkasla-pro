import { useQuery } from '@tanstack/react-query';
import type { UserSubscription } from '@/types/user-subscription';
import { api } from '@/lib/axios-client';

/**
 * Query keys for user subscriptions
 */
export const userSubscriptionKeys = {
  all: ['user-subscriptions'] as const,
  lists: () => [...userSubscriptionKeys.all, 'list'] as const,
  list: (filters?: { status?: string }) => [...userSubscriptionKeys.lists(), filters] as const,
  detail: (id: string) => [...userSubscriptionKeys.all, 'detail', id] as const,
  byUser: (userId: string) => [...userSubscriptionKeys.all, 'user', userId] as const,
};

/**
 * Get all user subscriptions (Admin only)
 */
export function useAllUserSubscriptions(status?: string) {
  return useQuery<UserSubscription[], Error>({
    queryKey: userSubscriptionKeys.list({ status }),
    queryFn: async (): Promise<UserSubscription[]> => {
      const params = status ? `?status=${status}` : '';
      const response = await api.get<UserSubscription[]>(`/subscriptions/admin/all${params}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch user subscriptions');
      }
      if (!response.data) {
        throw new Error('User subscriptions data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

