import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Module-level flag to prevent multiple concurrent 401 redirects
let isRedirecting401 = false;

// Extend Axios request config to include metadata
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime?: number;
  };
}

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
      timeout: 180000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request Interceptor
    this.instance.interceptors.request.use(
      (config: ExtendedAxiosRequestConfig) => {
        // Add timestamp for caching
        config.metadata = { startTime: Date.now() };

        // When sending FormData, delete the default JSON Content-Type so the
        // browser/axios can auto-set multipart/form-data with the correct boundary.
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }

        // Note: No Authorization header - backend reads JWT from HTTP-only cookie
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        // Handle 401 Unauthorized (token expired or invalid)
        if (error.response?.status === 401) {

          // Only redirect if we're not already on the login page and not
          // within a grace period after login (prevents redirect loops when
          // the Set-Cookie hasn't been fully processed by the browser yet).
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const isLoginPage = currentPath.includes('/login');
            const loginTimestamp = sessionStorage.getItem('login-timestamp');
            const isRecentLogin = loginTimestamp && (Date.now() - Number(loginTimestamp)) < 5000;

            if (isRecentLogin) {
              // skip redirect — cookie may still be processing
            } else if (isRedirecting401) {
              // skip — redirect already in progress
            } else if (!isLoginPage) {
              isRedirecting401 = true;

              // Clear auth state
              useAuthStore.getState().logout();

              // Get current locale for redirect
              const pathParts = currentPath.split('/');
              const locale = pathParts[1] || 'en';

              // Redirect to login with return URL
              const returnUrl = encodeURIComponent(currentPath);
              window.location.href = `/${locale}/login?redirect=${returnUrl}`;
            }
          }
        }

        // Handle 403 Forbidden (insufficient permissions)
        // Log the error but let it propagate to the caller (React Query / component).
        // The AuthGuard already handles page-level role checks; a 403 from a single
        // API call should not forcibly navigate the user away from the page.
        if (error.response?.status === 403) {
          // 403 is logged by React Query; let it propagate to the caller.
        }

        // Handle network errors
        if (!error.response) {
          // Network error — offline or server unreachable; caller handles
        }

        // Log error details in development
        if (process.env.NODE_ENV === 'development') {
          // placeholder for future dev tooling
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
