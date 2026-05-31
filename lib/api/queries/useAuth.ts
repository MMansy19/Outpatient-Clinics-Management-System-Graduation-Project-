import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { RegisterRequest, AuthResponse } from '@/types/api';
import { mockAuthAPI } from '@/lib/api/mockData';

// Re-export new hooks for backward compatibility
export * from '../hooks/useAuth';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

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
