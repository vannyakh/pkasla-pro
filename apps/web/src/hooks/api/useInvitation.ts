import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  Invitation, 
  CreateInvitationDto, 
  UpdateInvitationDto, 
  InvitationListFilters, 
  InvitationListResponse 
} from '@/types/invitation';
import { api } from '@/lib/axios-client';
import toast from 'react-hot-toast';

/**
 * Query keys for invitations
 */
export const invitationKeys = {
  all: ['invitations'] as const,
  lists: () => [...invitationKeys.all, 'list'] as const,
  list: (filters?: InvitationListFilters) => [...invitationKeys.lists(), filters] as const,
  detail: (id: string) => [...invitationKeys.all, 'detail', id] as const,
  byEvent: (eventId: string) => [...invitationKeys.all, 'event', eventId] as const,
  my: () => [...invitationKeys.all, 'my'] as const,
  pending: () => [...invitationKeys.all, 'pending'] as const,
  pendingByEvent: (eventId: string) => [...invitationKeys.all, 'pending', 'event', eventId] as const,
};

/**
 * Get list of invitations with pagination and filters
 */
export function useInvitations(filters: InvitationListFilters = {}) {
  return useQuery<InvitationListResponse, Error>({
    queryKey: invitationKeys.list(filters),
    queryFn: async (): Promise<InvitationListResponse> => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.eventId) params.append('eventId', filters.eventId);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get<InvitationListResponse>(
        `/invitations${params.toString() ? `?${params.toString()}` : ''}`
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch invitations');
      }
      if (!response.data) {
        throw new Error('Invitations data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get invitations by current user (authenticated)
 * Optionally filter by eventId
 */
export function useMyInvitations(eventId?: string) {
  return useQuery<Invitation[], Error>({
    queryKey: [...invitationKeys.my(), eventId],
    queryFn: async (): Promise<Invitation[]> => {
      const url = eventId ? `/invitations/my?eventId=${eventId}` : '/invitations/my';
      const response = await api.get<Invitation[]>(url);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch my invitations');
      }
      if (!response.data) {
        throw new Error('Invitations data not found');
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get invitations by event ID
 */
export function useInvitationsByEvent(eventId: string) {
  return useQuery<Invitation[], Error>({
    queryKey: invitationKeys.byEvent(eventId),
    queryFn: async (): Promise<Invitation[]> => {
      const response = await api.get<Invitation[]>(`/invitations/event/${eventId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch invitations');
      }
      if (!response.data) {
        throw new Error('Invitations data not found');
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    enabled: !!eventId,
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get pending invitations count for events the user hosts
 * This gets all pending invitations - the backend should filter by events where user is host
 */
export function usePendingInvitationsCount() {
  return useQuery<number, Error>({
    queryKey: invitationKeys.pending(),
    queryFn: async (): Promise<number> => {
      // Get pending invitations - backend should return only invitations for events where user is host
      const response = await api.get<InvitationListResponse>(
        '/invitations?status=pending&page=1&pageSize=1'
      );
      if (!response.success) {
        return 0;
      }
      if (!response.data) {
        return 0;
      }
      return response.data.total || 0;
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

/**
 * Get pending invitations by event ID
 */
export function usePendingInvitationsByEvent(eventId: string) {
  return useQuery<Invitation[], Error>({
    queryKey: invitationKeys.pendingByEvent(eventId),
    queryFn: async (): Promise<Invitation[]> => {
      const response = await api.get<Invitation[]>(`/invitations/event/${eventId}?status=pending`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch pending invitations');
      }
      if (!response.data) {
        throw new Error('Invitations data not found');
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    enabled: !!eventId,
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get invitation by ID
 */
export function useInvitation(id: string) {
  return useQuery<Invitation, Error>({
    queryKey: invitationKeys.detail(id),
    queryFn: async (): Promise<Invitation> => {
      const response = await api.get<Invitation>(`/invitations/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch invitation');
      }
      if (!response.data) {
        throw new Error('Invitation data not found');
      }
      return response.data;
    },
    enabled: !!id,
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Create invitation mutation
 */
export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation<Invitation, Error, CreateInvitationDto>({
    mutationFn: async (data): Promise<Invitation> => {
      const response = await api.post<Invitation>('/invitations', data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create invitation');
      }
      if (!response.data) {
        throw new Error('Invitation data not found');
      }
      return response.data;
    },
    onSuccess: (invitation) => {
      // Invalidate and refetch invitations lists
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });
      if (invitation.eventId) {
        const eventId = typeof invitation.eventId === 'string' ? invitation.eventId : invitation.eventId.id;
        queryClient.invalidateQueries({ queryKey: invitationKeys.byEvent(eventId) });
      }
      queryClient.invalidateQueries({ queryKey: invitationKeys.my() });
      queryClient.invalidateQueries({ queryKey: invitationKeys.pending() });
      // Set the new invitation in cache
      queryClient.setQueryData(invitationKeys.detail(invitation.id), invitation);
      toast.success('Invitation request sent successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create invitation');
    },
  });
}

/**
 * Update invitation status mutation
 */
export function useUpdateInvitationStatus() {
  const queryClient = useQueryClient();

  return useMutation<Invitation, Error, { id: string; data: UpdateInvitationDto }>({
    mutationFn: async ({ id, data }): Promise<Invitation> => {
      const response = await api.patch<Invitation>(`/invitations/${id}/status`, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update invitation');
      }
      if (!response.data) {
        throw new Error('Invitation data not found');
      }
      return response.data;
    },
    onSuccess: (invitation) => {
      // Invalidate and refetch invitations lists
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });
      if (invitation.eventId) {
        const eventId = typeof invitation.eventId === 'string' ? invitation.eventId : invitation.eventId.id;
        queryClient.invalidateQueries({ queryKey: invitationKeys.byEvent(eventId) });
        queryClient.invalidateQueries({ queryKey: invitationKeys.pendingByEvent(eventId) });
      }
      queryClient.invalidateQueries({ queryKey: invitationKeys.my() });
      queryClient.invalidateQueries({ queryKey: invitationKeys.pending() });
      // Update the invitation in cache
      queryClient.setQueryData(invitationKeys.detail(invitation.id), invitation);
      const statusMessage = invitation.status === 'approved' ? 'approved' : 'declined';
      toast.success(`Invitation ${statusMessage} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update invitation');
    },
  });
}

/**
 * Delete invitation mutation
 */
export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; eventId?: string }>({
    mutationFn: async ({ id }): Promise<void> => {
      const response = await api.delete(`/invitations/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete invitation');
      }
    },
    onSuccess: (_, { id, eventId }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: invitationKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invitationKeys.my() });
      queryClient.invalidateQueries({ queryKey: invitationKeys.pending() });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: invitationKeys.byEvent(eventId) });
        queryClient.invalidateQueries({ queryKey: invitationKeys.pendingByEvent(eventId) });
      }
      toast.success('Invitation deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete invitation');
    },
  });
}

