import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import toast from 'react-hot-toast';

export interface TemplatePurchase {
  id: string;
  userId: string | { id: string; name: string; email: string };
  templateId: string | { id: string; name: string; title: string; previewImage?: string };
  price: number;
  purchaseDate: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface TemplatePurchaseListResponse {
  items: TemplatePurchase[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateTemplatePurchaseInput {
  templateId: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface TemplatePurchaseListFilters {
  page?: number;
  pageSize?: number;
  userId?: string;
  templateId?: string;
  search?: string;
}

export interface BakongPaymentResponse {
  qrCode: string;
  transactionId: string;
  amount: number;
  currency: string;
  expiresAt?: string;
}

export interface StripePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export const templatePurchaseKeys = {
  all: ['template-purchases'] as const,
  lists: () => [...templatePurchaseKeys.all, 'list'] as const,
  list: (filters?: TemplatePurchaseListFilters) => [...templatePurchaseKeys.lists(), filters] as const,
  myPurchases: () => [...templatePurchaseKeys.all, 'me'] as const,
  check: (templateId: string) => [...templatePurchaseKeys.all, 'check', templateId] as const,
  revenue: () => [...templatePurchaseKeys.all, 'revenue'] as const,
};

/**
 * Get list of all template purchases (Admin only)
 */
export function useTemplatePurchases(filters: TemplatePurchaseListFilters = {}) {
  return useQuery<TemplatePurchaseListResponse, Error>({
    queryKey: templatePurchaseKeys.list(filters),
    queryFn: async (): Promise<TemplatePurchaseListResponse> => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.templateId) params.append('templateId', filters.templateId);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get<TemplatePurchaseListResponse>(
        `/template-purchases${params.toString() ? `?${params.toString()}` : ''}`
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch template purchases');
      }
      if (!response.data) {
        throw new Error('Template purchases data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get current user's template purchases
 */
export function useMyTemplatePurchases() {
  return useQuery<TemplatePurchase[], Error>({
    queryKey: templatePurchaseKeys.myPurchases(),
    queryFn: async (): Promise<TemplatePurchase[]> => {
      const response = await api.get<TemplatePurchase[]>('/template-purchases/me');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch template purchases');
      }
      return response.data || [];
    },
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Get total revenue from template purchases (Admin only)
 */
export function useTemplatePurchaseRevenue() {
  return useQuery<{ totalRevenue: number }, Error>({
    queryKey: templatePurchaseKeys.revenue(),
    queryFn: async (): Promise<{ totalRevenue: number }> => {
      const response = await api.get<{ totalRevenue: number }>('/template-purchases/revenue');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch revenue');
      }
      return response.data || { totalRevenue: 0 };
    },
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Check if user owns a template
 */
export function useCheckTemplateOwnership(templateId: string) {
  return useQuery<boolean, Error>({
    queryKey: templatePurchaseKeys.check(templateId),
    queryFn: async (): Promise<boolean> => {
      try {
        const response = await api.get<{ ownsTemplate: boolean }>(`/template-purchases/check/${templateId}`);
        if (!response.success) {
          throw new Error(response.error || 'Failed to check template ownership');
        }
        return response.data?.ownsTemplate || false;
      } catch (error) {
        // Handle connection errors gracefully
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Network error') || errorMessage.includes('Unable to connect')) {
          // Return false if backend is not available (assume user doesn't own it yet)
          return false;
        }
        throw error;
      }
    },
    enabled: !!templateId,
    retry: (failureCount, error) => {
      // Retry on network errors, but not on 404/400 errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Network error') || errorMessage.includes('Unable to connect')) {
        return failureCount < 2; // Retry up to 2 times
      }
      return false;
    },
    retryDelay: 2000, // Wait 2 seconds between retries
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Purchase a template (for free templates)
 */
export function usePurchaseTemplate() {
  const queryClient = useQueryClient();

  return useMutation<TemplatePurchase, Error, CreateTemplatePurchaseInput>({
    mutationFn: async (input) => {
      const response = await api.post<TemplatePurchase>('/template-purchases', input);
      if (!response.success) {
        throw new Error(response.error || 'Failed to purchase template');
      }
      if (!response.data) {
        throw new Error('Purchase data not found');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templatePurchaseKeys.myPurchases() });
      queryClient.invalidateQueries({ queryKey: templatePurchaseKeys.all });
      toast.success('Template purchased successfully');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to purchase template');
    },
  });
}

/**
 * Create Bakong payment for template purchase
 */
export function useCreateBakongTemplatePayment() {
  return useMutation<BakongPaymentResponse, Error, { templateId: string }>({
    mutationFn: async ({ templateId }) => {
      const response = await api.post<BakongPaymentResponse>('/payments/bakong/template', { templateId });
      if (!response.success) {
        throw new Error(response.error || 'Failed to create Bakong payment');
      }
      if (!response.data) {
        throw new Error('Payment data not found');
      }
      return response.data;
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create Bakong payment');
    },
  });
}

/**
 * Create Stripe payment intent for template purchase
 */
export function useCreateStripeTemplatePayment() {
  return useMutation<StripePaymentIntentResponse, Error, { templateId: string }>({
    mutationFn: async ({ templateId }) => {
      const response = await api.post<StripePaymentIntentResponse>('/payments/template/intent', { templateId });
      if (!response.success) {
        throw new Error(response.error || 'Failed to create Stripe payment');
      }
      if (!response.data) {
        throw new Error('Payment data not found');
      }
      return response.data;
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create Stripe payment');
    },
  });
}
