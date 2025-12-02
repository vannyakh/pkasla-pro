import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import type { ApiResponse } from '@/types/axios';

/**
 * Query keys for payment logs
 */
export const paymentLogKeys = {
  all: ['payment-logs'] as const,
  lists: () => [...paymentLogKeys.all, 'list'] as const,
  list: (filters?: PaymentLogListFilters) => [...paymentLogKeys.lists(), filters] as const,
  detail: (id: string) => [...paymentLogKeys.all, 'detail', id] as const,
  stats: (filters?: PaymentLogStatsFilters) => [...paymentLogKeys.all, 'stats', filters] as const,
};

export type PaymentLogEventType =
  | 'payment_created'
  | 'payment_intent_created'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'payment_expired'
  | 'payment_cancelled'
  | 'webhook_received'
  | 'webhook_processed'
  | 'webhook_failed'
  | 'transaction_status_checked';

export type PaymentMethod = 'stripe' | 'bakong';
export type PaymentType = 'subscription' | 'template';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'expired' | 'cancelled';

export interface PaymentLog {
  id: string;
  userId?: string;
  transactionId?: string;
  paymentMethod?: PaymentMethod;
  paymentType?: PaymentType;
  eventType: PaymentLogEventType;
  status: PaymentStatus;
  amount?: number;
  currency?: string;
  planId?: string;
  templateId?: string;
  metadata?: Record<string, any>;
  error?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
  // Populated fields
  userId_populated?: {
    id: string;
    name?: string;
    email?: string;
  };
  planId_populated?: {
    id: string;
    displayName?: string;
    price?: number;
  };
  templateId_populated?: {
    id: string;
    title?: string;
    price?: number;
  };
}

export interface PaymentLogListResponse {
  items: PaymentLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentLogListFilters {
  page?: number;
  limit?: number;
  userId?: string;
  transactionId?: string;
  paymentMethod?: PaymentMethod;
  paymentType?: PaymentType;
  eventType?: PaymentLogEventType;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaymentLogStats {
  total: number;
  byStatus: Record<string, number>;
  byPaymentMethod: Record<string, number>;
  byPaymentType: Record<string, number>;
  byEventType: Record<string, number>;
  totalAmount: number;
}

export interface PaymentLogStatsFilters {
  userId?: string;
  transactionId?: string;
  paymentMethod?: PaymentMethod;
  paymentType?: PaymentType;
  eventType?: PaymentLogEventType;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * Get list of payment logs with pagination and filters
 */
export function usePaymentLogs(filters: PaymentLogListFilters = {}) {
  return useQuery<PaymentLogListResponse, Error>({
    queryKey: paymentLogKeys.list(filters),
    queryFn: async (): Promise<PaymentLogListResponse> => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.transactionId) params.append('transactionId', filters.transactionId);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.paymentType) params.append('paymentType', filters.paymentType);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get<PaymentLogListResponse>(
        `/admin/payments/logs${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch payment logs');
      }
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      
      return response.data;
    },
  });
}

/**
 * Get specific payment log by ID
 */
export function usePaymentLog(id: string) {
  return useQuery<PaymentLog, Error>({
    queryKey: paymentLogKeys.detail(id),
    queryFn: async (): Promise<PaymentLog> => {
      const response = await api.get<PaymentLog>(`/admin/payments/logs/${id}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch payment log');
      }
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Get payment log statistics
 */
export function usePaymentLogStats(filters: PaymentLogStatsFilters = {}) {
  return useQuery<PaymentLogStats, Error>({
    queryKey: paymentLogKeys.stats(filters),
    queryFn: async (): Promise<PaymentLogStats> => {
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.transactionId) params.append('transactionId', filters.transactionId);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.paymentType) params.append('paymentType', filters.paymentType);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get<PaymentLogStats>(
        `/admin/payments/logs/stats${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch payment log statistics');
      }
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      
      return response.data;
    },
  });
}

