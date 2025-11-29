import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import toast from 'react-hot-toast';

export interface TemplatePurchase {
  id: string;
  userId: string;
  templateId: string;
  price: number;
  purchaseDate: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface CreateTemplatePurchaseInput {
  templateId: string;
  paymentMethod?: string;
  transactionId?: string;
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
  myPurchases: () => [...templatePurchaseKeys.all, 'me'] as const,
  check: (templateId: string) => [...templatePurchaseKeys.all, 'check', templateId] as const,
};

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
 * Check if user owns a template
 */
export function useCheckTemplateOwnership(templateId: string) {
  return useQuery<boolean, Error>({
    queryKey: templatePurchaseKeys.check(templateId),
    queryFn: async (): Promise<boolean> => {
      const response = await api.get<{ owns: boolean }>(`/template-purchases/check/${templateId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to check template ownership');
      }
      return response.data?.owns || false;
    },
    enabled: !!templateId,
    retry: false,
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

