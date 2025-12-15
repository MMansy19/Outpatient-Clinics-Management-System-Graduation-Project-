import { apiClient } from './client';
import type { 
  LoginDto, 
  LoginResponse, 
  CreateAdminDto, 
  CreateDoctorDto, 
  CreatePatientDto,
  CreateUserResponse 
} from './types';

/**
 * Authentication API Service
 * 
 * Handles all authentication-related API calls.
 * The backend uses HTTP-only cookies for JWT storage, so:
 * - Login response does NOT include the token in JSON (it's set as a cookie)
 * - Subsequent requests automatically include the cookie
 * - Logout should call a backend endpoint to clear the cookie
 */

export const authApi = {
  /**
   * Check if Auth service is running
   */
  isUp: async (): Promise<string> => {
    const response = await apiClient.get<string>('/auth');
    return response.data;
  },

  /**
   * User Login
   * 
   * IMPORTANT: The JWT token is NOT in the response body.
   * It's automatically set as an HTTP-only signed cookie by the backend.
   * 
   * @param credentials - User email and password
   * @returns User data: { name, language, role }
   */
  login: async (credentials: LoginDto): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Create Admin (SUPER_ADMIN only)
   * 
   * Requires authentication with SUPER_ADMIN role.
   * The JWT cookie must be present in the request.
   * 
   * @param data - Admin creation data
   * @returns Success message and user globalId
   */
  createAdmin: async (data: CreateAdminDto): Promise<CreateUserResponse> => {
    const response = await apiClient.post<CreateUserResponse>('/auth/admin/create', data);
    return response.data;
  },

  /**
   * Create Doctor (SUPER_ADMIN or ADMIN)
   * 
   * Requires authentication with SUPER_ADMIN or ADMIN role.
   * Doctors created by normal admins require approval by SUPER_ADMIN.
   * 
   * @param data - Doctor creation data (includes speciality)
   * @returns Success message and user globalId
   */
  createDoctor: async (data: CreateDoctorDto): Promise<CreateUserResponse> => {
    const response = await apiClient.post<CreateUserResponse>('/auth/doctor/create', data);
    return response.data;
  },

  /**
   * Create Patient (SUPER_ADMIN, ADMIN, or DOCTOR)
   * 
   * Requires authentication with SUPER_ADMIN, ADMIN, or DOCTOR role.
   * Patients do not have login credentials (no email/password).
   * 
   * @param data - Patient creation data (includes address and job)
   * @returns Success message and user globalId
   */
  createPatient: async (data: CreatePatientDto): Promise<CreateUserResponse> => {
    const response = await apiClient.post<CreateUserResponse>('/auth/patient/create', data);
    return response.data;
  },

  /**
   * Logout (TODO: Implement backend endpoint)
   * 
   * NOTE: Currently, the backend doesn't have a logout endpoint.
   * For now, we'll clear local state and the browser will handle cookie expiration.
   * In production, this should call a backend endpoint to invalidate the cookie.
   */
  logout: async (): Promise<void> => {
    // TODO: When backend implements /auth/logout, uncomment:
    // await apiClient.post('/auth/logout');
    
    // For now, just clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
    }
  },
};

/**
 * React Query Hooks (Optional - for use with TanStack Query)
 * 
 * Example usage in components:
 * 
 * import { useMutation } from '@tanstack/react-query';
 * 
 * const loginMutation = useMutation({
 *   mutationFn: authApi.login,
 *   onSuccess: (data) => {
 *     // Update Zustand store with user data
 *     useAuthStore.getState().setUser(data);
 *     router.push('/dashboard');
 *   },
 *   onError: (error) => {
 *     toast.error('Login failed');
 *   },
 * });
 */
