import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Gift, CreateGiftDto, UpdateGiftDto, GiftListFilters, GiftListResponse } from '@/types/gift';
import { api, axiosInstance } from '@/lib/axios-client';
import toast from 'react-hot-toast';

/**
 * Query keys for gifts
 */
export const giftKeys = {
  all: ['gifts'] as const,
  lists: () => [...giftKeys.all, 'list'] as const,
  list: (filters?: GiftListFilters) => [...giftKeys.lists(), filters] as const,
  detail: (id: string) => [...giftKeys.all, 'detail', id] as const,
  byGuest: (guestId: string) => [...giftKeys.all, 'guest', guestId] as const,
  byEvent: (eventId: string) => [...giftKeys.all, 'event', eventId] as const,
};

/**
 * Get list of gifts with pagination and filters
 */
export function useGifts(filters: GiftListFilters = {}) {
  return useQuery<GiftListResponse, Error>({
    queryKey: giftKeys.list(filters),
    queryFn: async (): Promise<GiftListResponse> => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.guestId) params.append('guestId', filters.guestId);
      if (filters.eventId) params.append('eventId', filters.eventId);
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.currency) params.append('currency', filters.currency);

      const response = await api.get<GiftListResponse>(
        `/guests/gifts${params.toString() ? `?${params.toString()}` : ''}`
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch gifts');
      }
      if (!response.data) {
        throw new Error('Gifts data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get gifts by guest ID
 */
export function useGiftsByGuest(guestId: string) {
  return useQuery<Gift[], Error>({
    queryKey: giftKeys.byGuest(guestId),
    queryFn: async (): Promise<Gift[]> => {
      const response = await api.get<Gift[]>(`/guests/gifts/guest/${guestId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch gifts');
      }
      if (!response.data) {
        throw new Error('Gifts data not found');
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    enabled: !!guestId,
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get gifts by event ID
 */
export function useGiftsByEvent(eventId: string) {
  return useQuery<Gift[], Error>({
    queryKey: giftKeys.byEvent(eventId),
    queryFn: async (): Promise<Gift[]> => {
      const response = await api.get<Gift[]>(`/guests/gifts/event/${eventId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch gifts');
      }
      if (!response.data) {
        throw new Error('Gifts data not found');
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    enabled: !!eventId,
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get gift by ID
 */
export function useGift(id: string) {
  return useQuery<Gift, Error>({
    queryKey: giftKeys.detail(id),
    queryFn: async (): Promise<Gift> => {
      const response = await api.get<Gift>(`/guests/gifts/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch gift');
      }
      if (!response.data) {
        throw new Error('Gift data not found');
      }
      return response.data;
    },
    enabled: !!id,
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Create gift mutation
 */
export function useCreateGift() {
  const queryClient = useQueryClient();

  return useMutation<Gift, Error, { data: CreateGiftDto; file?: File }>({
    mutationFn: async ({ data, file }): Promise<Gift> => {
      // If file is provided, use FormData
      if (file) {
        const formData = new FormData();
        
        // Add text fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'amount') {
              formData.append(key, value.toString());
            } else {
              formData.append(key, String(value));
            }
          }
        });

        // Add file
        formData.append('receiptImage', file);

        const response = await api.upload<Gift>('/guests/gifts', formData);
        if (!response.success) {
          throw new Error(response.error || 'Failed to create gift');
        }
        if (!response.data) {
          throw new Error('Gift data not found');
        }
        return response.data;
      } else {
        // No file, use regular JSON request
        const response = await api.post<Gift>('/guests/gifts', data);
        if (!response.success) {
          throw new Error(response.error || 'Failed to create gift');
        }
        if (!response.data) {
          throw new Error('Gift data not found');
        }
        return response.data;
      }
    },
    onSuccess: (gift) => {
      // Invalidate and refetch gifts lists
      queryClient.invalidateQueries({ queryKey: giftKeys.lists() });
      const guestId = typeof gift.guestId === 'string' ? gift.guestId : gift.guestId.id;
      queryClient.invalidateQueries({ queryKey: giftKeys.byGuest(guestId) });
      const eventId = typeof gift.eventId === 'string' ? gift.eventId : gift.eventId.id;
      queryClient.invalidateQueries({ queryKey: giftKeys.byEvent(eventId) });
      // Invalidate guests list to update hasGivenGift flag
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      // Set the new gift in cache
      queryClient.setQueryData(giftKeys.detail(gift.id), gift);
      toast.success('Gift payment recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record gift payment');
    },
  });
}

/**
 * Update gift mutation
 */
export function useUpdateGift() {
  const queryClient = useQueryClient();

  return useMutation<Gift, Error, { id: string; data: UpdateGiftDto; file?: File }>({
    mutationFn: async ({ id, data, file }): Promise<Gift> => {
      // If file is provided, use FormData with PATCH
      if (file) {
        const formData = new FormData();
        
        // Add text fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'amount') {
              formData.append(key, value.toString());
            } else {
              formData.append(key, String(value));
            }
          }
        });

        // Add file
        formData.append('receiptImage', file);

        // Use axiosInstance directly for PATCH with FormData
        const response = await axiosInstance.patch<Gift>(
          `/guests/gifts/${id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        // Transform response to match ApiResponse format
        const apiResponse = response.data as { success?: boolean; error?: string; data?: Gift } | Gift;
        if (typeof apiResponse === 'object' && 'success' in apiResponse && apiResponse.success === false) {
          throw new Error(apiResponse.error || 'Failed to update gift');
        }
        const giftData = (typeof apiResponse === 'object' && 'data' in apiResponse) ? apiResponse.data : apiResponse;
        if (!giftData) {
          throw new Error('Gift data not found');
        }
        return giftData as Gift;
      } else {
        // No file, use regular PATCH request
        const response = await api.patch<Gift>(`/guests/gifts/${id}`, data);
        if (!response.success) {
          throw new Error(response.error || 'Failed to update gift');
        }
        if (!response.data) {
          throw new Error('Gift data not found');
        }
        return response.data;
      }
    },
    onSuccess: (gift) => {
      // Invalidate and refetch gifts lists
      queryClient.invalidateQueries({ queryKey: giftKeys.lists() });
      const guestId = typeof gift.guestId === 'string' ? gift.guestId : gift.guestId.id;
      queryClient.invalidateQueries({ queryKey: giftKeys.byGuest(guestId) });
      const eventId = typeof gift.eventId === 'string' ? gift.eventId : gift.eventId.id;
      queryClient.invalidateQueries({ queryKey: giftKeys.byEvent(eventId) });
      // Update the gift in cache
      queryClient.setQueryData(giftKeys.detail(gift.id), gift);
      toast.success('Gift payment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update gift payment');
    },
  });
}

/**
 * Delete gift mutation
 */
export function useDeleteGift() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; guestId?: string; eventId?: string }>({
    mutationFn: async ({ id }): Promise<void> => {
      const response = await api.delete(`/guests/gifts/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete gift');
      }
    },
    onSuccess: (_, { id, guestId, eventId }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: giftKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: giftKeys.lists() });
      if (guestId) {
        queryClient.invalidateQueries({ queryKey: giftKeys.byGuest(guestId) });
      }
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: giftKeys.byEvent(eventId) });
      }
      // Invalidate guests list to update hasGivenGift flag
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast.success('Gift payment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete gift payment');
    },
  });
}

