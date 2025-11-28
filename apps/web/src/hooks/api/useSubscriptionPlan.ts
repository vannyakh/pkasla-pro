import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { SubscriptionPlan, CreateSubscriptionPlanDto, UpdateSubscriptionPlanDto } from '@/types/subscription-plan';
import { api } from '@/lib/axios-client';
import toast from 'react-hot-toast';

/**
 * Query keys for subscription plans
 */
export const subscriptionPlanKeys = {
  all: ['subscription-plans'] as const,
  lists: () => [...subscriptionPlanKeys.all, 'list'] as const,
  list: (activeOnly?: boolean) => [...subscriptionPlanKeys.lists(), { activeOnly }] as const,
  detail: (id: string) => [...subscriptionPlanKeys.all, 'detail', id] as const,
};

/**
 * Get list of subscription plans
 */
export function useSubscriptionPlans(activeOnly: boolean = false) {
  return useQuery<SubscriptionPlan[], Error>({
    queryKey: subscriptionPlanKeys.list(activeOnly),
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const params = activeOnly ? '?activeOnly=true' : '';
      const response = await api.get<SubscriptionPlan[]>(`/subscription-plans${params}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch subscription plans');
      }
      if (!response.data) {
        throw new Error('Subscription plans data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Get subscription plan by ID
 */
export function useSubscriptionPlan(id: string) {
  return useQuery<SubscriptionPlan, Error>({
    queryKey: subscriptionPlanKeys.detail(id),
    queryFn: async (): Promise<SubscriptionPlan> => {
      const response = await api.get<SubscriptionPlan>(`/subscription-plans/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch subscription plan');
      }
      if (!response.data) {
        throw new Error('Subscription plan data not found');
      }
      return response.data;
    },
    enabled: !!id,
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Create subscription plan mutation
 */
export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionPlan, Error, CreateSubscriptionPlanDto>({
    mutationFn: async (data): Promise<SubscriptionPlan> => {
      const response = await api.post<SubscriptionPlan>('/subscription-plans', data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create subscription plan');
      }
      if (!response.data) {
        throw new Error('Subscription plan data not found');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all subscription plan list queries
      queryClient.invalidateQueries({ queryKey: subscriptionPlanKeys.lists() });
      toast.success('Subscription plan created successfully');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create subscription plan');
    },
  });
}

/**
 * Update subscription plan mutation
 */
export function useUpdateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation<SubscriptionPlan, Error, { id: string; data: UpdateSubscriptionPlanDto }>({
    mutationFn: async ({ id, data }): Promise<SubscriptionPlan> => {
      const response = await api.patch<SubscriptionPlan>(`/subscription-plans/${id}`, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update subscription plan');
      }
      if (!response.data) {
        throw new Error('Subscription plan data not found');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate subscription plan detail and list queries
      queryClient.invalidateQueries({ queryKey: subscriptionPlanKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: subscriptionPlanKeys.lists() });
      toast.success('Subscription plan updated successfully');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update subscription plan');
    },
  });
}

/**
 * Delete subscription plan mutation
 */
export function useDeleteSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await api.delete(`/subscription-plans/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete subscription plan');
      }
    },
    onSuccess: (_, id) => {
      // Invalidate subscription plan detail and list queries
      queryClient.invalidateQueries({ queryKey: subscriptionPlanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: subscriptionPlanKeys.lists() });
      toast.success('Subscription plan deleted successfully');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete subscription plan');
    },
  });
}

