import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '../auth.service';
import type {
  LoginDto,
  CreateDoctorDto,
  CreatePatientDto
} from '../types';

/**
 * React Query Hooks for Authentication
 * 
 * These hooks use TanStack Query for caching and state management.
 * They integrate with the cookie-based backend authentication.
 */

/**
 * Login Hook
 * 
 * Usage:
 * const { mutate: login, isPending, error } = useLogin();
 * 
 * login({ email, password }, {
 *   onSuccess: (data) => {
 *     router.push('/dashboard');
 *   }
 * });
 */
export function useLogin() {
  const { login: setUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginDto) => {
      return await authApi.login(credentials);
    },
    onSuccess: (data) => {
      // Update Zustand store with user data
      // Note: JWT token is in HTTP-only cookie, not returned in data
      const loginData = data as unknown as Record<string, unknown>;
      console.log('🔍 Login response data:', JSON.stringify(loginData));
      const clinicId = data.clinicId
        || (loginData.clinic_id as string)
        || (loginData.clinicid as string)
        || ((loginData.clinic as Record<string, unknown>)?.id as string);
      setUser({
        name: data.name,
        language: Number(data.language) as typeof data.language,
        role: Number(data.role) as typeof data.role,
        clinicId,
      });

      // Invalidate queries that depend on auth state
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
    onError: (error: unknown) => {
      console.error('[Login Error]', error);
      
      // Clear any stale auth state
      useAuthStore.getState().logout();
    },
  });
}

/**
 * Logout Hook
 * 
 * Usage:
 * const { mutate: logout } = useLogout();
 * logout();
 */
export function useLogout() {
  const { logout: clearUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSuccess: () => {
      // Clear user state
      clearUser();
      
      // Clear all cached queries
      queryClient.clear();
    },
  });
}

/**
 * Create Doctor Hook
 *
 * Requires SUPER_ADMIN role.
 *
 * Usage:
 * const { mutate: createDoctor, isPending } = useCreateDoctor();
 * createDoctor(doctorData, {
 *   onSuccess: (response) => {
 *     toast.success(`Doctor created with ID: ${response.id}`);
 *   }
 * });
 */
export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDoctorDto) => {
      return await authApi.createDoctor(data);
    },
    onSuccess: () => {
      // Invalidate doctor list query
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}

/**
 * Create Patient Hook
 *
 * Requires SUPER_ADMIN or DOCTOR role.
 *
 * Usage:
 * const { mutate: createPatient, isPending } = useCreatePatient();
 * createPatient(patientData, {
 *   onSuccess: (response) => {
 *     toast.success(`Patient created with ID: ${response.id}`);
 *   }
 * });
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePatientDto) => {
      return await authApi.createPatient(data);
    },
    onSuccess: (data) => {
      console.log('Patient created:', data);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

/**
 * Auth Status Check Hook (for development/debugging)
 * 
 * Usage:
 * const { data: status, isLoading } = useAuthStatus();
 */
export function useAuthStatus() {
  return useMutation({
    mutationFn: async () => {
      return await authApi.isUp();
    },
  });
}
