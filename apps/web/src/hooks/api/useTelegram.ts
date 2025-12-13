import { useQuery, useMutation } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { User } from '@/types';
import { api } from '@/lib/axios-client';
import toast from 'react-hot-toast';

export interface ConnectTelegramDto {
  telegramChatId: string;
  isTelegramBot: boolean;
}

export interface TelegramBotStatus {
  isConnected: boolean;
  isTelegramBot: boolean;
  telegramChatId: string | null;
  status: 'connected' | 'disconnected';
}

/**
 * Query keys for telegram
 */
export const telegramKeys = {
  all: ['telegram'] as const,
  status: () => [...telegramKeys.all, 'status'] as const,
};

/**
 * Get Telegram bot status
 */
export function useTelegramBotStatus(enabled: boolean = true) {
  return useQuery<TelegramBotStatus, Error>({
    queryKey: telegramKeys.status(),
    queryFn: async (): Promise<TelegramBotStatus> => {
      const response = await api.get<TelegramBotStatus>('/users/telegram/status');
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch Telegram status');
      }
      if (!response.data) {
        throw new Error('Status data not found');
      }
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

/**
 * Connect Telegram account
 */
export function useConnectTelegram() {
  const { update } = useSession();

  return useMutation<User, Error, ConnectTelegramDto>({
    mutationFn: async (data: ConnectTelegramDto): Promise<User> => {
      const response = await api.post<User>('/users/telegram', data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to connect Telegram');
      }
      if (!response.data) {
        throw new Error('User data not found');
      }
      return response.data;
    },
    onSuccess: async () => {
      // Update NextAuth session with new user data
      await update();
      toast.success('Telegram connected successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to connect Telegram. Please try again.');
    },
  });
}

/**
 * Disconnect Telegram account
 */
export function useDisconnectTelegram() {
  const { update } = useSession();

  return useMutation<User, Error, void>({
    mutationFn: async (): Promise<User> => {
      const response = await api.delete<User>('/users/telegram');
      if (!response.success) {
        throw new Error(response.error || 'Failed to disconnect Telegram');
      }
      if (!response.data) {
        throw new Error('User data not found');
      }
      return response.data;
    },
    onSuccess: async () => {
      // Update NextAuth session with new user data
      await update();
      toast.success('Telegram disconnected successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disconnect Telegram. Please try again.');
    },
  });
}

