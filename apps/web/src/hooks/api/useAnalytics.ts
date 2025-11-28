import { useQuery } from '@tanstack/react-query';
import type { RevenueStats, RevenueByDateRange, SiteMetrics, UserMetrics } from '@/types/analytics';
import { api } from '@/lib/axios-client';

/**
 * Query keys for analytics
 */
export const analyticsKeys = {
  all: ['analytics'] as const,
  revenue: () => [...analyticsKeys.all, 'revenue'] as const,
  revenueStats: () => [...analyticsKeys.revenue(), 'stats'] as const,
  revenueRange: (startDate: string, endDate: string) => [...analyticsKeys.revenue(), 'range', startDate, endDate] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  users: () => [...analyticsKeys.all, 'users'] as const,
};

/**
 * Get comprehensive revenue statistics (Admin only)
 */
export function useRevenueStats() {
  return useQuery<RevenueStats, Error>({
    queryKey: analyticsKeys.revenueStats(),
    queryFn: async (): Promise<RevenueStats> => {
      const response = await api.get<RevenueStats>('/analytics/revenue/stats');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch revenue statistics');
      }
      if (!response.data) {
        throw new Error('Revenue statistics data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get revenue by date range (Admin only)
 */
export function useRevenueByDateRange(startDate: string, endDate: string, enabled: boolean = true) {
  return useQuery<RevenueByDateRange, Error>({
    queryKey: analyticsKeys.revenueRange(startDate, endDate),
    queryFn: async (): Promise<RevenueByDateRange> => {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      const response = await api.get<RevenueByDateRange>(`/analytics/revenue/range?${params.toString()}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch revenue by date range');
      }
      if (!response.data) {
        throw new Error('Revenue data not found');
      }
      return response.data;
    },
    enabled: enabled && !!startDate && !!endDate,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get site metrics (Admin only)
 */
export function useSiteMetrics() {
  return useQuery<SiteMetrics, Error>({
    queryKey: analyticsKeys.dashboard(),
    queryFn: async (): Promise<SiteMetrics> => {
      const response = await api.get<SiteMetrics>('/admin/dashboard');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch site metrics');
      }
      if (!response.data) {
        throw new Error('Site metrics data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get user metrics (Admin only)
 */
export function useUserMetrics() {
  return useQuery<UserMetrics, Error>({
    queryKey: analyticsKeys.users(),
    queryFn: async (): Promise<UserMetrics> => {
      const response = await api.get<UserMetrics>('/admin/analytics/users');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch user metrics');
      }
      if (!response.data) {
        throw new Error('User metrics data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

