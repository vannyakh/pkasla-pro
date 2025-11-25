'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { useAuthStore } from './auth';

interface UserState {
  profile: User | null;
  isLoading: boolean;
  setProfile: (user: User | null) => void;
  updateProfile: (updates: Partial<User>) => void;
  clearProfile: () => void;
}

/**
 * User store for managing user profile data
 * This store is separate from auth store but syncs with it
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      setProfile: (user) => {
        set({ profile: user });
        // Sync with auth store if user exists and tokens are available
        if (user) {
          const authState = useAuthStore.getState();
          const authUser = authState.user;
          const tokens = authState.tokens;
          if (authUser?.id === user.id && tokens) {
            authState.setAuth(user, tokens);
          } else if (authUser?.id === user.id) {
            // Update user directly in auth store state if no tokens
            useAuthStore.setState({ user });
          }
        }
      },
      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          const updatedProfile = { ...currentProfile, ...updates };
          set({ profile: updatedProfile });
          // Sync with auth store
          const authState = useAuthStore.getState();
          const authUser = authState.user;
          const tokens = authState.tokens;
          if (authUser?.id === updatedProfile.id && tokens) {
            authState.setAuth(updatedProfile, tokens);
          } else if (authUser?.id === updatedProfile.id) {
            // Update user directly in auth store state if no tokens
            useAuthStore.setState({ user: updatedProfile });
          }
        }
      },
      clearProfile: () => {
        set({ profile: null });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);

/**
 * Initialize user profile from auth store on mount
 * Call this in your app initialization
 */
export const initializeUserFromAuth = () => {
  const authUser = useAuthStore.getState().user;
  if (authUser) {
    useUserStore.getState().setProfile(authUser);
  }
};

/**
 * Computed selector for current user profile
 * Returns profile from user store, falls back to auth store
 */
export const useCurrentUser = () => {
  const profile = useUserStore((state) => state.profile);
  const authUser = useAuthStore((state) => state.user);
  return profile || authUser;
};

/**
 * Computed selector for user profile loading state
 */
export const useUserLoading = () => {
  return useUserStore((state) => state.isLoading);
};

