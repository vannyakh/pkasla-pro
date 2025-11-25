import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Get auth token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Get refresh token from storage
 */
function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

/**
 * Create Axios instance with default configuration
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * Request interceptor - Add auth token to requests
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors and transform responses
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // If response already has success field, wrap data properly
    if (response.data?.success !== undefined) {
      return {
        ...response,
        data: {
          success: response.data.success,
          data: response.data.data || response.data,
          message: response.data.message,
        },
      };
    }
    
    // Transform response to match ApiResponse format
    return {
      ...response,
      data: {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message,
      },
    };
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          // Try to refresh the token
          const response = await axiosInstance.post('/auth/refresh', {
            refreshToken,
          });

          // Handle response structure: { success: true, data: { tokens: { accessToken, refreshToken } } }
          interface RefreshResponse {
            data?: {
              tokens?: {
                accessToken: string;
                refreshToken?: string;
              };
            };
            tokens?: {
              accessToken: string;
              refreshToken?: string;
            };
          }
          const refreshData = response.data as unknown as RefreshResponse;
          const tokens = refreshData?.data?.tokens || refreshData?.tokens;
          const accessToken = tokens?.accessToken;
          
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            if (tokens.refreshToken) {
              localStorage.setItem('refreshToken', tokens.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: error.response.data?.error || error.response.data?.message || 'An error occurred',
        message: error.response.data?.message,
      };
      return Promise.reject(errorResponse);
    } else if (error.request) {
      // Request made but no response received
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'Network error occurred',
      };
      return Promise.reject(errorResponse);
    } else {
      // Something else happened
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: error.message || 'An error occurred',
      };
      return Promise.reject(errorResponse);
    }
  }
);

/**
 * API methods using Axios
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T, AxiosResponse<ApiResponse<T>>>(url, config).then((res) => res.data),
  
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.post<T, AxiosResponse<ApiResponse<T>>>(url, data, config).then((res) => res.data),
  
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.put<T, AxiosResponse<ApiResponse<T>>>(url, data, config).then((res) => res.data),
  
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.patch<T, AxiosResponse<ApiResponse<T>>>(url, data, config).then((res) => res.data),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T, AxiosResponse<ApiResponse<T>>>(url, config).then((res) => res.data),
  
  /**
   * Upload file(s) using FormData
   * @param url - API endpoint
   * @param formData - FormData object containing file(s) and other fields
   * @param onUploadProgress - Optional progress callback
   */
  upload: <T>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progress: number) => void
  ) => {
    return axiosInstance
      .post<T, AxiosResponse<ApiResponse<T>>>(
        url,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onUploadProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onUploadProgress(percentCompleted);
            }
          },
        }
      )
      .then((res) => res.data);
  },
};

