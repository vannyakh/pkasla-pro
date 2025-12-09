import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Event, CreateEventDto, UpdateEventDto, EventListFilters, EventListResponse } from '@/types/event';
import { api, axiosInstance } from '@/lib/axios-client';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

/**
 * Query keys for events
 */
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: EventListFilters) => [...eventKeys.lists(), filters] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
  my: () => [...eventKeys.all, 'my'] as const,
  categories: () => [...eventKeys.all, 'categories'] as const,
};

/**
 * Get list of events with pagination and filters
 */
export function useEvents(filters: EventListFilters = {}) {
  return useQuery<EventListResponse, Error>({
    queryKey: eventKeys.list(filters),
    queryFn: async (): Promise<EventListResponse> => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.hostId) params.append('hostId', filters.hostId);
      if (filters.status) params.append('status', filters.status);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      const response = await api.get<EventListResponse>(
        `/events${params.toString() ? `?${params.toString()}` : ''}`
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch events');
      }
      if (!response.data) {
        throw new Error('Events data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get events by current user (authenticated)
 */
export function useMyEvents() {
  return useQuery<Event[], Error>({
    queryKey: eventKeys.my(),
    queryFn: async (): Promise<Event[]> => {
      const response = await api.get<Event[]>('/events/my');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch my events');
      }
      if (!response.data) {
        throw new Error('Events data not found');
      }
      return Array.isArray(response.data) ? response.data : [response.data];
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get event by ID
 */
export function useEvent(id: string) {
  return useQuery<Event, Error>({
    queryKey: eventKeys.detail(id),
    queryFn: async (): Promise<Event> => {
      const response = await api.get<Event>(`/events/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch event');
      }
      if (!response.data) {
        throw new Error('Event data not found');
      }
      return response.data;
    },
    enabled: !!id,
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Get all event categories (types)
 */
export function useEventCategories() {
  return useQuery<string[], Error>({
    queryKey: eventKeys.categories(),
    queryFn: async (): Promise<string[]> => {
      const response = await api.get<string[]>(`/events/categories`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch event categories');
      }
      if (!response.data) {
        throw new Error('Event categories data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Confetti celebration function
 */
function triggerConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: NodeJS.Timeout = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // Launch confetti from both sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}

/**
 * Create event mutation
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, { data: CreateEventDto; files?: { coverImage?: File; khqrUsd?: File; khqrKhr?: File } }>({
    mutationFn: async ({ data, files }): Promise<Event> => {
      // If files are provided, use FormData (for direct file upload)
      // Otherwise, use JSON with URLs (for pre-uploaded files)
      if (files && (files.coverImage || files.khqrUsd || files.khqrKhr)) {
        const formData = new FormData();
        
        // Process and add text fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'date') {
              // Convert date to ISO datetime string
              let dateValue: string;
              if (typeof value === 'string') {
                dateValue = value;
              } else if (value instanceof Date) {
                dateValue = value.toISOString();
              } else {
                dateValue = String(value);
              }
              // If it's from datetime-local input, convert to ISO
              if (dateValue.includes('T') && !dateValue.includes('Z') && !dateValue.includes('+')) {
                // It's already in ISO-like format from datetime-local, just ensure it's proper ISO
                formData.append(key, new Date(dateValue).toISOString());
              } else {
                formData.append(key, dateValue);
              }
            } else if (typeof value === 'boolean' || key === 'restrictDuplicateNames') {
              // Convert boolean to string for FormData
              formData.append(key, value ? 'true' : 'false');
            } else {
              formData.append(key, String(value));
            }
          }
        });

        // Add files
        if (files.coverImage) {
          formData.append('coverImage', files.coverImage);
        }
        if (files.khqrUsd) {
          formData.append('khqrUsd', files.khqrUsd);
        }
        if (files.khqrKhr) {
          formData.append('khqrKhr', files.khqrKhr);
        }

        const response = await api.upload<Event>('/events', formData);
        if (!response.success) {
          throw new Error(response.error || 'Failed to create event');
        }
        if (!response.data) {
          throw new Error('Event data not found');
        }
        return response.data;
      } else {
        // No files, use regular JSON request
        // Ensure date is in ISO format
        const jsonData: CreateEventDto = { ...data };
        if (jsonData.date) {
          const dateValue = jsonData.date;
          if (typeof dateValue === 'string') {
            // Convert datetime-local format to ISO
            if (dateValue.includes('T') && !dateValue.includes('Z')) {
              jsonData.date = new Date(dateValue).toISOString();
            }
          } else if (dateValue && typeof dateValue === 'object' && 'toISOString' in dateValue) {
            jsonData.date = (dateValue as Date).toISOString();
          }
        }
        
        const response = await api.post<Event>('/events', jsonData);
        if (!response.success) {
          throw new Error(response.error || 'Failed to create event');
        }
        if (!response.data) {
          throw new Error('Event data not found');
        }
        return response.data;
      }
    },
    onSuccess: (event) => {
      // Invalidate and refetch events lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.my() });
      // Set the new event in cache
      queryClient.setQueryData(eventKeys.detail(event.id), event);
      toast.success('Event created successfully');
      // Trigger confetti celebration
      triggerConfetti();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create event');
    },
  });
}

/**
 * Update event mutation
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation<
    Event,
    Error,
    { id: string; data: UpdateEventDto; files?: { coverImage?: File; khqrUsd?: File; khqrKhr?: File } }
  >({
    mutationFn: async ({ id, data, files }): Promise<Event> => {
      // If files are provided, use FormData with PATCH
      if (files && (files.coverImage || files.khqrUsd || files.khqrKhr)) {
        const formData = new FormData();
        
        // Process and add text fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'date') {
              // Convert date to ISO datetime string
              let dateValue: string;
              if (typeof value === 'string') {
                dateValue = value;
              } else if (value instanceof Date) {
                dateValue = value.toISOString();
              } else {
                dateValue = String(value);
              }
              // If it's from datetime-local input, convert to ISO
              if (dateValue.includes('T') && !dateValue.includes('Z') && !dateValue.includes('+')) {
                formData.append(key, new Date(dateValue).toISOString());
              } else {
                formData.append(key, dateValue);
              }
            } else if (typeof value === 'boolean' || key === 'restrictDuplicateNames') {
              // Convert boolean to string for FormData
              formData.append(key, value ? 'true' : 'false');
            } else {
              formData.append(key, String(value));
            }
          }
        });

        // Add files
        if (files.coverImage) {
          formData.append('coverImage', files.coverImage);
        }
        if (files.khqrUsd) {
          formData.append('khqrUsd', files.khqrUsd);
        }
        if (files.khqrKhr) {
          formData.append('khqrKhr', files.khqrKhr);
        }

        // Use axiosInstance directly for PATCH with FormData
        const response = await axiosInstance.patch<Event>(
          `/events/${id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        // Transform response to match ApiResponse format
        const apiResponse = response.data as { success?: boolean; error?: string; data?: Event } | Event;
        if (typeof apiResponse === 'object' && 'success' in apiResponse && apiResponse.success === false) {
          throw new Error(apiResponse.error || 'Failed to update event');
        }
        const eventData = (typeof apiResponse === 'object' && 'data' in apiResponse) ? apiResponse.data : apiResponse;
        if (!eventData) {
          throw new Error('Event data not found');
        }
        return eventData as Event;
      } else {
        // No files, use regular PATCH request
        // Ensure date is in ISO format
        const jsonData: UpdateEventDto = { ...data };
        if (jsonData.date) {
          const dateValue = jsonData.date;
          if (typeof dateValue === 'string') {
            // Convert datetime-local format to ISO
            if (dateValue.includes('T') && !dateValue.includes('Z')) {
              jsonData.date = new Date(dateValue).toISOString();
            }
          } else if (dateValue && typeof dateValue === 'object' && 'toISOString' in dateValue) {
            jsonData.date = (dateValue as Date).toISOString();
          }
        }
        
        const response = await api.patch<Event>(`/events/${id}`, jsonData);
        if (!response.success) {
          throw new Error(response.error || 'Failed to update event');
        }
        if (!response.data) {
          throw new Error('Event data not found');
        }
        return response.data;
      }
    },
    onSuccess: (event) => {
      // Invalidate and refetch events lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.my() });
      // Update the event in cache
      queryClient.setQueryData(eventKeys.detail(event.id), event);
      // toast.success('Event updated successfully');
      // Trigger confetti celebration
      triggerConfetti();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update event');
    },
  });
}

/**
 * Delete event mutation
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string): Promise<void> => {
      const response = await api.delete(`/events/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete event');
      }
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: eventKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.my() });
      toast.success('Event deleted successfully');
      // Trigger confetti celebration
      triggerConfetti();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete event');
    },
  });
}

/**
 * Generate or regenerate QR code token for event
 */
export function useGenerateEventQRToken() {
  const queryClient = useQueryClient();

  return useMutation<{ token: string }, Error, string>({
    mutationFn: async (eventId: string): Promise<{ token: string }> => {
      const response = await api.post<{ token: string }>(`/events/${eventId}/qr-code/generate`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate QR code token');
      }
      if (!response.data) {
        throw new Error('Token data not found');
      }
      return response.data;
    },
    onSuccess: (_, eventId) => {
      // Invalidate event detail to refresh with new token
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      toast.success('QR code token generated successfully');
      // Trigger confetti celebration
      triggerConfetti();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate QR code token');
    },
  });
}

