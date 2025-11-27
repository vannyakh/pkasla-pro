'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AdminUsersFilters {
  page: number
  limit: number
  search?: string
  role?: string
  status?: string
}

interface AdminStore {
  filters: AdminUsersFilters
  setPage: (page: number) => void
  setSearch: (search: string) => void
  setRoleFilter: (role: string) => void
  setStatusFilter: (status: string) => void
  resetFilters: () => void
}

const defaultFilters: AdminUsersFilters = {
  page: 1,
  limit: 20,
  search: undefined,
  role: undefined,
  status: undefined,
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      setPage: (page) =>
        set((state) => ({
          filters: { ...state.filters, page },
        })),
      setSearch: (search) =>
        set((state) => ({
          filters: {
            ...state.filters,
            search: search || undefined,
            page: 1, // Reset to first page on search
          },
        })),
      setRoleFilter: (role) =>
        set((state) => ({
          filters: {
            ...state.filters,
            role: role === 'all' ? undefined : role,
            page: 1, // Reset to first page on filter change
          },
        })),
      setStatusFilter: (status) =>
        set((state) => ({
          filters: {
            ...state.filters,
            status: status === 'all' ? undefined : status,
            page: 1, // Reset to first page on filter change
          },
        })),
      resetFilters: () =>
        set({
          filters: defaultFilters,
        }),
    }),
    {
      name: 'admin-users-filters',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
)

