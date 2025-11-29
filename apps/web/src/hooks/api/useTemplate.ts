import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Template, TemplateListResponse } from '@/types/template';
import { api, axiosInstance } from '@/lib/axios-client';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/axios';
import toast from 'react-hot-toast';

/**
 * Query keys for templates
 */
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters?: TemplateListFilters) => [...templateKeys.lists(), filters] as const,
  detail: (id: string) => [...templateKeys.all, 'detail', id] as const,
  categories: () => [...templateKeys.all, 'categories'] as const,
};

export interface TemplateListFilters {
  page?: number;
  pageSize?: number;
  category?: string;
  isPremium?: boolean;
  search?: string;
}

/**
 * Get list of templates with pagination and filters
 */
export function useTemplates(filters: TemplateListFilters = {}) {
  return useQuery<TemplateListResponse, Error>({
    queryKey: templateKeys.list(filters),
    queryFn: async (): Promise<TemplateListResponse> => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.isPremium !== undefined) params.append('isPremium', filters.isPremium.toString());
      if (filters.search) params.append('search', filters.search);

      const response = await api.get<TemplateListResponse>(
        `/admin/t${params.toString() ? `?${params.toString()}` : ''}`
      );
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch templates');
      }
      if (!response.data) {
        throw new Error('Templates data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get template by ID
 */
export function useTemplate(id: string | { _id?: unknown; id?: unknown } | unknown) {
  // Ensure ID is always a string
  const templateId = typeof id === 'string' 
    ? id 
    : (id && typeof id === 'object' && ('_id' in id || 'id' in id))
      ? String((id as { _id?: unknown; id?: unknown })._id || (id as { _id?: unknown; id?: unknown }).id)
      : String(id)

  return useQuery<Template, Error>({
    queryKey: templateKeys.detail(templateId),
    queryFn: async (): Promise<Template> => {
      const response = await api.get<Template>(`/admin/t/${templateId}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch template');
      }
      if (!response.data) {
        throw new Error('Template data not found');
      }
      return response.data;
    },
    enabled: !!templateId && templateId !== 'undefined' && templateId !== 'null',
    retry: false,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Get all unique categories
 */
export function useTemplateCategories() {
  return useQuery<string[], Error>({
    queryKey: templateKeys.categories(),
    queryFn: async (): Promise<string[]> => {
      const response = await api.get<string[]>(`/admin/t/categories`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch categories');
      }
      if (!response.data) {
        throw new Error('Categories data not found');
      }
      return response.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create template mutation
 */
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation<Template, Error, { data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>; previewImage?: File }>({
    mutationFn: async ({ data, previewImage }) => {
      // If there's a file, use FormData and upload endpoint
      if (previewImage) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('title', data.title);
        if (data.category) {
          formData.append('category', data.category);
        }
        if (data.price !== undefined && data.price !== null) {
          formData.append('price', data.price.toString());
        }
        formData.append('isPremium', data.isPremium.toString());
        formData.append('previewImage', previewImage);

        const response = await api.upload<Template>('/admin/t', formData);
        if (!response.success) {
          throw new Error(response.error || 'Failed to create template');
        }
        if (!response.data) {
          throw new Error('Template data not found');
        }
        return response.data;
      } else {
        // No file, use regular JSON POST
        const response = await api.post<Template>('/admin/t', data);
        if (!response.success) {
          throw new Error(response.error || 'Failed to create template');
        }
        if (!response.data) {
          throw new Error('Template data not found');
        }
        return response.data;
      }
    },
    onSuccess: () => {
      // Invalidate all template list queries
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success('Template created successfully');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create template');
    },
  });
}

/**
 * Update template mutation
 */
export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation<
    Template,
    Error,
    { id: string; data: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>; previewImage?: File | null }
  >({
    mutationFn: async ({ id, data, previewImage }) => {
      // If there's a file, use FormData with PATCH
      if (previewImage) {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.title) formData.append('title', data.title);
        if (data.category) {
          formData.append('category', data.category);
        }
        if (data.price !== undefined && data.price !== null) {
          formData.append('price', data.price.toString());
        }
        if (data.isPremium !== undefined) {
          formData.append('isPremium', data.isPremium.toString());
        }
        formData.append('previewImage', previewImage);

        // Use axiosInstance directly for PATCH with FormData
        // The interceptor will format errors, so catch and rethrow with formatted message
        try {
          const response = await axiosInstance.patch<Template, AxiosResponse<ApiResponse<Template>>>(
            `/admin/t/${id}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          const responseData = response.data;
          if (!responseData.success) {
            throw new Error(responseData.error || 'Failed to update template');
          }
          if (!responseData.data) {
            throw new Error('Template data not found');
          }
          return responseData.data;
          
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          // The axios interceptor formats errors, so check for ApiResponse format
          if (error?.error) {
            throw new Error(error.error);
          }
          if (error?.response?.data?.error) {
            throw new Error(error.response.data.error);
          }
          throw error instanceof Error ? error : new Error('Failed to update template');
        }
      } else {
        // No file, use regular JSON PATCH
        const response = await api.patch<Template>(`/admin/t/${id}`, data);
        if (!response.success) {
          throw new Error(response.error || 'Failed to update template');
        }
        if (!response.data) {
          throw new Error('Template data not found');
        }
        return response.data;
      }
    },
    onSuccess: (data) => {
      // Invalidate template detail and list queries
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success('Template updated successfully');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update template');
    },
  });
}

/**
 * Delete template mutation
 */
export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await api.delete(`/admin/t/${id}`);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete template');
      }
    },
    onSuccess: (_, id) => {
      // Invalidate template detail and list queries
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success('Template deleted successfully');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete template');
    },
  });
}

