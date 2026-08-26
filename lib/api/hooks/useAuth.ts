import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '../auth.service';
import { useOfflineMutation } from '@/lib/offline/useOfflineMutation';
import { assertPatientUnique, assertDoctorUnique } from '@/lib/offline/preflightUniqueness';
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
    onError: () => {
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
  // Offline-aware: queues to /auth/doctor/create when offline.
  return useOfflineMutation<
    Awaited<ReturnType<typeof authApi.createDoctor>>,
    CreateDoctorDto
  >({
    mutationFn: (data) => authApi.createDoctor(data),
    offlineConfig: {
      type: 'createDoctor',
      endpoint: '/auth/doctor/create',
      method: 'POST',
      getPayload: (data) => ({ ...data }),
    },
    beforeQueue: async (payload) => {
      await assertDoctorUnique({
        socialSecurityNumber: payload.socialSecurityNumber as string | undefined,
        email: payload.email as string | undefined,
      });
    },
    invalidateKeys: [['doctors'], ['doctors-all']],
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
  // Offline-aware: queues to /auth/patient/create when offline.
  return useOfflineMutation<
    Awaited<ReturnType<typeof authApi.createPatient>>,
    CreatePatientDto
  >({
    mutationFn: (data) => authApi.createPatient(data),
    offlineConfig: {
      type: 'createPatient',
      endpoint: '/auth/patient/create',
      method: 'POST',
      getPayload: (data) => ({ ...data }),
    },
    beforeQueue: async (payload) => {
      await assertPatientUnique({
        socialSecurityNumber: payload.socialSecurityNumber as string | undefined,
      });
    },
    invalidateKeys: [['patients'], ['patients-all']],
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
