'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '@/types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  logout: () => void;
}

/**
 * Store tokens in localStorage
 */
function storeTokens(tokens: AuthTokens): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }
}

/**
 * Remove tokens from localStorage
 */
function clearTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setAuth: (user, tokens) => {
        storeTokens(tokens);
        set({ user, tokens });
      },
      setTokens: (tokens) => {
        if (tokens) {
          storeTokens(tokens);
        } else {
          clearTokens();
        }
        set({ tokens });
      },
      logout: () => {
        clearTokens();
        set({ user: null, tokens: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
    }
  )
);

/**
 * Computed selector for authentication status
 * Use this instead of accessing isAuthenticated directly from the store
 */
export const useIsAuthenticated = () => {
  return useAuthStore((state) => state.user !== null);
};

