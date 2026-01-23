import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

/**
 * Base API Client Configuration
 * 
 * CRITICAL: This client is configured for COOKIE-BASED authentication.
 * The backend sets JWT tokens in HTTP-only signed cookies after login.
 * These cookies are automatically included in requests when withCredentials is true.
 * 
 * For development, we use a Next.js proxy (/api/proxy) to avoid CORS issues.
 * For production, we connect directly to the backend API.
 * 
 * DO NOT manually set Authorization headers - the backend uses cookies!
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/proxy';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true, // ⚠️ CRITICAL: Enables cookie-based authentication
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }
        // Note: No Authorization header - backend reads JWT from HTTP-only cookie
        return config;
      },
      (error: AxiosError) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API Response] ${response.status} ${response.config.url}`);
          console.log(response);
        }
        return response;
      },
      async (error: AxiosError) => {
        // Handle 401 Unauthorized (token expired or invalid)
        if (error.response?.status === 401) {
          console.error('[API Error] 401 Unauthorized - Token expired or invalid');
          
          // Clear auth state
          useAuthStore.getState().logout();
          
          // Redirect to login
          if (typeof window !== 'undefined') {
            const locale = localStorage.getItem('locale') || 'en';
            window.location.href = `/${locale}/login`;
          }
        }

        // Handle 403 Forbidden (insufficient permissions)
        if (error.response?.status === 403) {
          console.error('[API Error] 403 Forbidden - Insufficient permissions');
        }

        // Handle network errors
        if (!error.response) {
          console.error('[API Error] Network error or server unreachable');
        }

        // Log error details in development
        if (process.env.NODE_ENV === 'development') {
          console.error('[API Error Details]', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, config = {}) {
    return this.instance.get<T>(url, config);
  }

  public post<T>(url: string, data = {}, config = {}) {
    return this.instance.post<T>(url, data, config);
  }

  public put<T>(url: string, data = {}, config = {}) {
    return this.instance.put<T>(url, data, config);
  }

  public patch<T>(url: string, data = {}, config = {}) {
    return this.instance.patch<T>(url, data, config);
  }

  public delete<T>(url: string, config = {}) {
    return this.instance.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
