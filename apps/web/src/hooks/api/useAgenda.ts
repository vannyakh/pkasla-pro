import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AgendaItem, CreateAgendaItemDto, UpdateAgendaItemDto } from '@/types/agenda';
import { api } from '@/lib/axios-client';
import toast from 'react-hot-toast';

/**
 * Query keys for agenda items
 */
export const agendaKeys = {
  all: ['agenda'] as const,
  lists: () => [...agendaKeys.all, 'list'] as const,
  byEvent: (eventId: string) => [...agendaKeys.lists(), 'event', eventId] as const,
  detail: (id: string) => [...agendaKeys.all, 'detail', id] as const,
};

/**
 * Get agenda items by event ID
 */
export function useAgendaItems(eventId: string) {
  return useQuery<AgendaItem[], Error>({
    queryKey: agendaKeys.byEvent(eventId),
    queryFn: async (): Promise<AgendaItem[]> => {
      const response = await api.get<AgendaItem[]>(`/agenda/event/${eventId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch agenda items');
      }
      if (!response.data) {
        throw new Error('Agenda items data not found');
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    enabled: !!eventId,
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get agenda item by ID
 */
export function useAgendaItem(id: string) {
  return useQuery<AgendaItem, Error>({
    queryKey: agendaKeys.detail(id),
    queryFn: async (): Promise<AgendaItem> => {
      const response = await api.get<AgendaItem>(`/agenda/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch agenda item');
      }
      if (!response.data) {
        throw new Error('Agenda item data not found');
      }
      return response.data;
    },
    enabled: !!id,
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Create agenda item mutation
 */
export function useCreateAgendaItem() {
  const queryClient = useQueryClient();

  return useMutation<AgendaItem, Error, CreateAgendaItemDto>({
    mutationFn: async (data): Promise<AgendaItem> => {
      const response = await api.post<AgendaItem>('/agenda', data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create agenda item');
      }
      if (!response.data) {
        throw new Error('Agenda item data not found');
      }
      return response.data;
    },
    onSuccess: (item, variables) => {
      // Get the eventId from the response or variables
      const eventId = typeof item.eventId === 'string' ? item.eventId : variables.eventId;
      
      // Optimistically update the cache
      queryClient.setQueryData<AgendaItem[]>(agendaKeys.byEvent(eventId), (old = []) => {
        // Add the new item to the list
        const newItems = [...old, item];
        // Sort by date then time
        return newItems.sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.time.localeCompare(b.time);
        });
      });
      
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: agendaKeys.byEvent(eventId) });
      queryClient.refetchQueries({ queryKey: agendaKeys.byEvent(eventId) });
      
      toast.success('Agenda item created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create agenda item');
    },
  });
}

/**
 * Update agenda item mutation
 */
export function useUpdateAgendaItem() {
  const queryClient = useQueryClient();

  return useMutation<
    AgendaItem,
    Error,
    { id: string; data: UpdateAgendaItemDto }
  >({
    mutationFn: async ({ id, data }): Promise<AgendaItem> => {
      const response = await api.patch<AgendaItem>(`/agenda/${id}`, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update agenda item');
      }
      if (!response.data) {
        throw new Error('Agenda item data not found');
      }
      return response.data;
    },
    onSuccess: (item) => {
      // Get the eventId from the response
      // Handle both string and object types (when populated from backend)
      let eventId: string;
      if (typeof item.eventId === 'string') {
        eventId = item.eventId;
      } else if (item.eventId && typeof item.eventId === 'object' && 'id' in item.eventId) {
        eventId = String((item.eventId as { id: string }).id);
      } else {
        // Fallback: try to get from variables if available
        eventId = '';
      }
      
      // Optimistically update the cache
      queryClient.setQueryData<AgendaItem[]>(agendaKeys.byEvent(eventId), (old = []) => {
        return old.map((oldItem) => (oldItem.id === item.id ? item : oldItem))
          .sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
          });
      });
      
      // Update the specific item in cache
      queryClient.setQueryData(agendaKeys.detail(item.id), item);
      
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: agendaKeys.byEvent(eventId) });
      queryClient.refetchQueries({ queryKey: agendaKeys.byEvent(eventId) });
      
      toast.success('Agenda item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update agenda item');
    },
  });
}

/**
 * Delete agenda item mutation
 */
export function useDeleteAgendaItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; eventId: string }>({
    mutationFn: async ({ id }): Promise<void> => {
      const response = await api.delete(`/agenda/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete agenda item');
      }
    },
    onSuccess: (_, { eventId, id }) => {
      // Optimistically remove the item from cache
      queryClient.setQueryData<AgendaItem[]>(agendaKeys.byEvent(eventId), (old = []) => {
        return old.filter((item) => item.id !== id);
      });
      
      // Remove the specific item from cache
      queryClient.removeQueries({ queryKey: agendaKeys.detail(id) });
      
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: agendaKeys.byEvent(eventId) });
      queryClient.refetchQueries({ queryKey: agendaKeys.byEvent(eventId) });
      
      toast.success('Agenda item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete agenda item');
    },
  });
}

