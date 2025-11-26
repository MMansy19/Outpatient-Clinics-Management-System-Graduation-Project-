import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.instance.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/en/login';
          }
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
