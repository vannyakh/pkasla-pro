import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Guest, CreateGuestDto, UpdateGuestDto, GuestListFilters, GuestListResponse } from '@/types/guest';
import { api } from '@/lib/axios-client';
import toast from 'react-hot-toast';

/**
 * Query keys for guests
 */
export const guestKeys = {
  all: ['guests'] as const,
  lists: () => [...guestKeys.all, 'list'] as const,
  list: (filters?: GuestListFilters) => [...guestKeys.lists(), filters] as const,
  detail: (id: string) => [...guestKeys.all, 'detail', id] as const,
  byEvent: (eventId: string) => [...guestKeys.all, 'event', eventId] as const,
  my: () => [...guestKeys.all, 'my'] as const,
  sheetsConfig: (eventId: string) => [...guestKeys.all, 'sheets-config', eventId] as const,
};

/**
 * Get list of guests with pagination and filters
 */
export function useGuests(filters: GuestListFilters = {}) {
  return useQuery<GuestListResponse, Error>({
    queryKey: guestKeys.list(filters),
    queryFn: async (): Promise<GuestListResponse> => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.eventId) params.append('eventId', filters.eventId);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get<GuestListResponse>(
        `/guests${params.toString() ? `?${params.toString()}` : ''}`
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch guests');
      }
      if (!response.data) {
        throw new Error('Guests data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get guests by current user (authenticated)
 * Optionally filter by eventId
 */
export function useMyGuests(eventId?: string) {
  return useQuery<Guest[], Error>({
    queryKey: [...guestKeys.my(), eventId],
    queryFn: async (): Promise<Guest[]> => {
      const url = eventId ? `/guests/my?eventId=${eventId}` : '/guests/my';
      const response = await api.get<Guest[]>(url);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch my guests');
      }
      if (!response.data) {
        throw new Error('Guests data not found');
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get guests by event ID
 */
export function useGuestsByEvent(eventId: string) {
  return useQuery<Guest[], Error>({
    queryKey: guestKeys.byEvent(eventId),
    queryFn: async (): Promise<Guest[]> => {
      const response = await api.get<Guest[]>(`/guests/event/${eventId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch guests');
      }
      if (!response.data) {
        throw new Error('Guests data not found');
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    enabled: !!eventId,
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get guest by ID
 */
export function useGuest(id: string) {
  return useQuery<Guest, Error>({
    queryKey: guestKeys.detail(id),
    queryFn: async (): Promise<Guest> => {
      const response = await api.get<Guest>(`/guests/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch guest');
      }
      if (!response.data) {
        throw new Error('Guest data not found');
      }
      return response.data;
    },
    enabled: !!id,
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Create guest mutation
 */
export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation<Guest, Error, CreateGuestDto>({
    mutationFn: async (data): Promise<Guest> => {
      const response = await api.post<Guest>('/guests', data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create guest');
      }
      if (!response.data) {
        throw new Error('Guest data not found');
      }
      return response.data;
    },
    onSuccess: (guest) => {
      // Invalidate and refetch guests lists
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      if (guest.eventId) {
        const eventId = typeof guest.eventId === 'string' ? guest.eventId : guest.eventId.id;
        queryClient.invalidateQueries({ queryKey: guestKeys.byEvent(eventId) });
      }
      // Set the new guest in cache
      queryClient.setQueryData(guestKeys.detail(guest.id), guest);
      toast.success('Guest created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create guest');
    },
  });
}

/**
 * Update guest mutation
 */
export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation<Guest, Error, { id: string; data: UpdateGuestDto }>({
    mutationFn: async ({ id, data }): Promise<Guest> => {
      const response = await api.patch<Guest>(`/guests/${id}`, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update guest');
      }
      if (!response.data) {
        throw new Error('Guest data not found');
      }
      return response.data;
    },
    onSuccess: (guest) => {
      // Invalidate and refetch guests lists
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      if (guest.eventId) {
        const eventId = typeof guest.eventId === 'string' ? guest.eventId : guest.eventId.id;
        queryClient.invalidateQueries({ queryKey: guestKeys.byEvent(eventId) });
      }
      // Update the guest in cache
      queryClient.setQueryData(guestKeys.detail(guest.id), guest);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update guest');
    },
  });
}

/**
 * Delete guest mutation
 */
export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; eventId?: string }>({
    mutationFn: async ({ id }): Promise<void> => {
      const response = await api.delete(`/guests/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete guest');
      }
    },
    onSuccess: (_, { id, eventId }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: guestKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: guestKeys.byEvent(eventId) });
      }
      toast.success('Guest deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete guest');
    },
  });
}

/**
 * Google Sheets sync configuration response
 */
export interface GoogleSheetsSyncConfig {
  enabled: boolean;
  message: string;
}

/**
 * Google Sheets sync request
 */
export interface SyncToSheetsDto {
  spreadsheetId?: string;
  sheetName?: string;
  autoCreate?: boolean;
}

/**
 * Google Sheets sync response
 */
export interface SyncToSheetsResponse {
  synced: number;
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetName: string;
}

/**
 * Get Google Sheets sync configuration for an event
 */
export function useGoogleSheetsSyncConfig(eventId: string) {
  return useQuery<GoogleSheetsSyncConfig, Error>({
    queryKey: guestKeys.sheetsConfig(eventId),
    queryFn: async (): Promise<GoogleSheetsSyncConfig> => {
      const response = await api.get<GoogleSheetsSyncConfig>(
        `/guests/event/${eventId}/sheets-config`
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch Google Sheets config');
      }
      if (!response.data) {
        throw new Error('Config data not found');
      }
      return response.data;
    },
    enabled: !!eventId,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Sync guests to Google Sheets mutation
 */
export function useSyncGuestsToSheets(eventId: string) {
  return useMutation<SyncToSheetsResponse, Error, SyncToSheetsDto>({
    mutationFn: async (data): Promise<SyncToSheetsResponse> => {
      const response = await api.post<SyncToSheetsResponse>(
        `/guests/event/${eventId}/sync-to-sheets`,
        data
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to sync guests to Google Sheets');
      }
      if (!response.data) {
        throw new Error('Sync response data not found');
      }
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Successfully synced ${data.synced} guests to Google Sheets!`, {
        duration: 5000,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sync guests to Google Sheets');
    },
  });
}

