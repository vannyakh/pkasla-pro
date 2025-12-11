import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Settings, UpdateSettingsDto, SystemInfo } from '@/types/settings';
import { api } from '@/lib/axios-client';
import toast from 'react-hot-toast';

/**
 * Query keys for settings
 */
export const settingsKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsKeys.all, 'detail'] as const,
  systemInfo: () => [...settingsKeys.all, 'system-info'] as const,
};

/**
 * Get current settings (Admin only)
 */
export function useSettings() {
  return useQuery<Settings, Error>({
    queryKey: settingsKeys.detail(),
    queryFn: async (): Promise<Settings> => {
      const response = await api.get<Settings>('/admin/settings?includeSensitive=true');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch settings');
      }
      if (!response.data) {
        throw new Error('Settings data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Update settings (Admin only)
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<Settings, Error, UpdateSettingsDto>({
    mutationFn: async (updateData: UpdateSettingsDto): Promise<Settings> => {
      const response = await api.put<Settings>('/admin/settings', updateData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update settings');
      }
      if (!response.data) {
        throw new Error('Updated settings data not found');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });
}

/**
 * Get system information (Admin only)
 */
export function useSystemInfo() {
  return useQuery<SystemInfo, Error>({
    queryKey: settingsKeys.systemInfo(),
    queryFn: async (): Promise<SystemInfo> => {
      const response = await api.get<SystemInfo>('/admin/settings/system-info');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch system info');
      }
      if (!response.data) {
        throw new Error('System info data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Test Telegram bot connection (Admin only)
 */
export function useTestTelegramBot() {
  return useMutation<{ success: boolean; message: string }, Error, { botToken: string; chatId: string }>({
    mutationFn: async ({ botToken, chatId }): Promise<{ success: boolean; message: string }> => {
      const response = await api.post<{ success: boolean; message: string }>('/admin/settings/test-telegram', {
        botToken,
        chatId,
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to test Telegram bot');
      }
      if (!response.data) {
        throw new Error('Test result not found');
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Telegram bot connection successful');
      } else {
        toast.error(data.message || 'Telegram bot connection failed');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to test Telegram bot');
    },
  });
}
