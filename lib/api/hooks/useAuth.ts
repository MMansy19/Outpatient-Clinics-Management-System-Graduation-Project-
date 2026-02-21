import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '../auth.service';
import type { 
  LoginDto, 
  CreateAdminDto, 
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
      setUser({
        name: data.name,
        language: data.language,
        role: data.role,
        clinicId: data.clinicId,
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
 * Create Admin Hook
 * 
 * Requires SUPER_ADMIN role.
 * 
 * Usage:
 * const { mutate: createAdmin, isPending } = useCreateAdmin();
 * createAdmin(adminData, {
 *   onSuccess: (response) => {
 *     toast.success(`Admin created with ID: ${response.id}`);
 *   }
 * });
 */
export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAdminDto) => {
      return await authApi.createAdmin(data);
    },
    onSuccess: () => {
      // Invalidate admin list query
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    },
  });
}

/**
 * Create Doctor Hook
 * 
 * Requires SUPER_ADMIN or ADMIN role.
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
 * Requires SUPER_ADMIN, ADMIN, or DOCTOR role.
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
      // Invalidate all patient queries to ensure fresh data
      console.log('🔄 Invalidating patient queries after creation...');
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      // Also invalidate the specific nationalId query using the socialSecurityNumber from the response
      if (data.socialSecurityNumber) {
        queryClient.invalidateQueries({
          queryKey: ['patients', 'nationalId', data.socialSecurityNumber],
        });
        console.log(`🔄 Invalidated query for nationalId: ${data.socialSecurityNumber}`);
      }
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
