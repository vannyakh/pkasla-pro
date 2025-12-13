import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios-client';
import type { User } from '@/types';
import { authKeys } from './useAuth';
import toast from 'react-hot-toast';

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface UploadAvatarResponse {
  id: string;
  url: string;
  key: string;
  provider: string;
  filename: string;
  mimetype: string;
  size: number;
  originalSize?: number;
  compressionRatio?: string;
  folder: string;
  createdAt: string;
}

/**
 * Upload avatar image with compression
 */
export function useUploadAvatar() {
  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.upload<UploadAvatarResponse>(
        '/upload/avatar',
        formData,
        onProgress
      );

      if (!response.success) {
        throw new Error(response.error || 'Failed to upload avatar');
      }

      return response.data!;
    },
  });
}

/**
 * Update user profile (name, phone, avatar)
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileDto) => {
      const response = await api.patch<User>('/users/me', data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update profile');
      }
      return response.data!;
    },
    onSuccess: (updatedUser) => {
      // Update the cached user data
      queryClient.setQueryData(authKeys.me(), updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

/**
 * Combined hook to upload avatar and update profile in one go
 */
export function useUpdateAvatar() {
  const uploadAvatar = useUploadAvatar();
  const updateProfile = useUpdateProfile();

  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      // First, upload the avatar
      const uploadResult = await uploadAvatar.mutateAsync({ file, onProgress });

      // Then, update the profile with the new avatar URL
      const updatedUser = await updateProfile.mutateAsync({
        avatar: uploadResult.url,
      });

      return { uploadResult, updatedUser };
    },
  });
}

