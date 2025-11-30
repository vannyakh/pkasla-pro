import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import type { ApiResponse } from '@/types/axios';

/**
 * Query keys for audit logs
 */
export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters?: AuditLogListFilters) => [...auditLogKeys.lists(), filters] as const,
  detail: (id: string) => [...auditLogKeys.all, 'detail', id] as const,
  user: (userId: string, limit?: number) => [...auditLogKeys.all, 'user', userId, limit] as const,
  resource: (resource: string, resourceId: string, limit?: number) =>
    [...auditLogKeys.all, 'resource', resource, resourceId, limit] as const,
};

export type AuditLogAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'view'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'unpublish'
  | 'payment'
  | 'subscription'
  | 'other';

export type AuditLogStatus = 'success' | 'failure' | 'pending';

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  action: AuditLogAction;
  resource: string;
  resourceId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  status: AuditLogStatus;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogListResponse {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditLogListFilters {
  page?: number;
  pageSize?: number;
  userId?: string;
  userEmail?: string;
  action?: AuditLogAction;
  resource?: string;
  resourceId?: string;
  status?: AuditLogStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Get list of audit logs with pagination and filters
 */
export function useAuditLogs(filters: AuditLogListFilters = {}) {
  return useQuery<AuditLogListResponse, Error>({
    queryKey: auditLogKeys.list(filters),
    queryFn: async (): Promise<AuditLogListResponse> => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.action) params.append('action', filters.action);
      if (filters.resource) params.append('resource', filters.resource);
      if (filters.resourceId) params.append('resourceId', filters.resourceId);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get<AuditLogListResponse>(
        `/audit-logs${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch audit logs');
      }
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      
      return response.data;
    },
  });
}

/**
 * Get specific audit log by ID
 */
export function useAuditLog(id: string) {
  return useQuery<AuditLog, Error>({
    queryKey: auditLogKeys.detail(id),
    queryFn: async (): Promise<AuditLog> => {
      const response = await api.get<AuditLog>(`/audit-logs/${id}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch audit log');
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
 * Get audit logs for a specific user
 */
export function useUserAuditLogs(userId: string, limit: number = 50) {
  return useQuery<AuditLog[], Error>({
    queryKey: auditLogKeys.user(userId, limit),
    queryFn: async (): Promise<AuditLog[]> => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());

      const response = await api.get<AuditLog[]>(
        `/audit-logs/user/${userId}${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch user audit logs');
      }
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      
      return response.data;
    },
    enabled: !!userId,
  });
}

/**
 * Get audit logs for a specific resource
 */
export function useResourceAuditLogs(resource: string, resourceId: string, limit: number = 50) {
  return useQuery<AuditLog[], Error>({
    queryKey: auditLogKeys.resource(resource, resourceId, limit),
    queryFn: async (): Promise<AuditLog[]> => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());

      const response = await api.get<AuditLog[]>(
        `/audit-logs/resource/${resource}/${resourceId}${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch resource audit logs');
      }
      if (!response.data) {
        throw new Error('No data returned from server');
      }
      
      return response.data;
    },
    enabled: !!resource && !!resourceId,
  });
}

