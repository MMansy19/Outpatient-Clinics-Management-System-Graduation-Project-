import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/api';
import { mockAuthAPI } from '@/lib/api/mockData';

// Set to true to use mock data (no backend required)
const USE_MOCK_DATA = true;

export const useLogin = (): UseMutationResult<
  AuthResponse,
  Error,
  LoginRequest
> => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      if (USE_MOCK_DATA) {
        return await mockAuthAPI.login(data.email, data.password);
      }
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      login(
        {
          id: data.user.id,
          global_id: data.user.global_id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role as never,
          is_deleted: false,
          created_at: new Date(data.user.created_at),
          updated_at: new Date(data.user.created_at),
        },
        data.token
      );
    },
  });
};

export const useRegister = (): UseMutationResult<
  AuthResponse,
  Error,
  RegisterRequest
> => {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      if (USE_MOCK_DATA) {
        return await mockAuthAPI.register(data);
      }
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      login(
        {
          id: data.user.id,
          global_id: data.user.global_id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role as never,
          is_deleted: false,
          created_at: new Date(data.user.created_at),
          updated_at: new Date(data.user.created_at),
        },
        data.token
      );
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
