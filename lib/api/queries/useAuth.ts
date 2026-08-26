import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/api';
import { mockAuthAPI } from '@/lib/api/mockData';

// Re-export new hooks for backward compatibility
export * from '../hooks/useAuth';

// Set to true to use mock data (no backend required)
const USE_MOCK_DATA = false;  // Changed to false - using real backend now

// Legacy useLogin for components that haven't been migrated
export const useLoginOld = (): UseMutationResult<
  AuthResponse,
  Error,
  LoginRequest
> => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      if (USE_MOCK_DATA) {
        return await mockAuthAPI.login(data.email, data.password);
      }
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      return response.data;
    },
    // TODO: This is legacy mock-based hook. Use useLogin from hooks/useAuth.ts instead
  });
};

export const useRegister = (): UseMutationResult<
  AuthResponse,
  Error,
  RegisterRequest
> => {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      if (USE_MOCK_DATA) {
        return await mockAuthAPI.register(data);
      }
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    },
    // TODO: This is legacy mock-based hook. Registration should go through admin panel
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
    },
  });
};
