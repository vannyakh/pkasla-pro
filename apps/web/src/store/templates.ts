'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TemplateListFilters } from '@/hooks/api/useTemplate'

export interface TemplateStoreFilters extends TemplateListFilters {
  pageSize?: number
}

interface TemplateStore {
  filters: TemplateStoreFilters
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setCategory: (category: string | undefined) => void
  setIsPremium: (isPremium: boolean | undefined) => void
  setSearch: (search: string | undefined) => void
  resetFilters: () => void
}

const defaultFilters: TemplateStoreFilters = {
  page: 1,
  pageSize: 12,
  category: undefined,
  isPremium: undefined,
  search: undefined,
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      setPage: (page) =>
        set((state) => ({
          filters: { ...state.filters, page },
        })),
      setPageSize: (pageSize) =>
        set((state) => ({
          filters: { ...state.filters, pageSize, page: 1 }, // Reset to first page on page size change
        })),
      setCategory: (category) =>
        set((state) => ({
          filters: {
            ...state.filters,
            category: category === 'all' ? undefined : category,
            page: 1, // Reset to first page on filter change
          },
        })),
      setIsPremium: (isPremium) =>
        set((state) => ({
          filters: {
            ...state.filters,
            isPremium: isPremium === undefined ? undefined : isPremium,
            page: 1, // Reset to first page on filter change
          },
        })),
      setSearch: (search) =>
        set((state) => ({
          filters: {
            ...state.filters,
            search: search || undefined,
            page: 1, // Reset to first page on search
          },
        })),
      resetFilters: () =>
        set({
          filters: defaultFilters,
        }),
    }),
    {
      name: 'template-store-filters',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
)

