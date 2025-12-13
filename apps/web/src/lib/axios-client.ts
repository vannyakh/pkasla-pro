import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/axios';

/**
 * Use Next.js proxy for backend API requests
 * We use /backend-api/* to avoid conflicts with Next.js API routes (e.g., /api/auth/*)
 * In development: /backend-api/* → http://localhost:4000/api/v1/*
 * In production: /backend-api/* → your backend URL
 * This avoids CORS issues and keeps the backend URL hidden from the client
 */
const API_BASE_URL = '/backend-api';

/**
 * Create Axios instance with default configuration
 * withCredentials: true enables sending HTTP-only cookies with requests
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // Enable sending cookies (HTTP-only cookies for auth)
});

/**
 * Request interceptor - Cookies are automatically sent with requests
 * No need to manually add Authorization header - backend reads from HTTP-only cookies
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Cookies are automatically sent via withCredentials: true
    // Backend will read accessToken from cookies
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

    // Handle 401 Unauthorized - try to refresh token using cookies
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token endpoint reads refreshToken from HTTP-only cookie
        // No need to send token in body - cookies are sent automatically
        // Using proxy: /backend-api/auth/refresh → backend API
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {}, // Empty body - backend reads refreshToken from cookie
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true, // Ensure cookies are sent
          }
        );

        // Backend sets new cookies automatically, so we just retry the original request
        if (refreshResponse.data?.success) {
          // Retry original request - new cookies will be sent automatically
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        // Backend will clear cookies on logout endpoint
        // if (typeof window !== 'undefined') {
        //   window.location.href = '/login';
        // }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden - user doesn't have permission
    if (error.response?.status === 403) {
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: error.response.data?.error || error.response.data?.message || 'Access forbidden',
        message: error.response.data?.message || 'You do not have permission to access this resource',
      };
      return Promise.reject(errorResponse);
    }

    // Handle other errors
    if (error.response) {
      // Check for validation errors with formatted field errors
      const responseData = error.response.data;
      let errorMessage = responseData?.error || responseData?.message || 'An error occurred';
      
      // If there are validation errors with fieldErrors, format them
      if (responseData?.errors?.fieldErrors && Object.keys(responseData.errors.fieldErrors).length > 0) {
        const fieldErrors = responseData.errors.fieldErrors;
        const errorMessages: string[] = [];
        
        // Collect all field error messages
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            // Capitalize field name and join messages
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
            errorMessages.push(`${fieldName}: ${messages.join(', ')}`);
          }
        });
        
        // If there are form-level errors, add them too
        if (responseData.errors.formErrors && Array.isArray(responseData.errors.formErrors) && responseData.errors.formErrors.length > 0) {
          errorMessages.push(...responseData.errors.formErrors);
        }
        
        // Combine all error messages
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join('. ');
        }
      } else if (responseData?.errors?.formErrors && Array.isArray(responseData.errors.formErrors) && responseData.errors.formErrors.length > 0) {
        // Only form-level errors
        errorMessage = responseData.errors.formErrors.join('. ');
      }
      
      // Server responded with error status
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: errorMessage,
        message: responseData?.message,
        errors: responseData?.errors, // Include errors object for detailed handling if needed
      };
      return Promise.reject(errorResponse);
    } else if (error.request) {
      // Request made but no response received
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'Network error occurred',
        message: 'Unable to connect to the server. Please check your internet connection.',
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

