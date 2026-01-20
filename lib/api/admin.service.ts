import { apiClient } from './client';
import type { 
  PaginatedDoctorsResponse,
  PaginatedPatientsResponse,
  PaginatedVisitsResponse,
  PaginationParams
} from './types';

/**
 * Admin API Service
 * 
 * Handles all admin-related API calls for managing doctors, patients, and visits.
 */

export const adminApi = {
  /**
   * Check if Admin service is running
   */
  isUp: async (): Promise<string> => {
    const response = await apiClient.get<string>('/admin');
    return response.data;
  },

  /**
   * Get all doctors with pagination
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated list of doctors
   */
  getDoctors: async (params: PaginationParams): Promise<PaginatedDoctorsResponse> => {
    const response = await apiClient.get<PaginatedDoctorsResponse>('/admin/doctors', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Get all patients with pagination
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated list of patients
   */
  getPatients: async (params: PaginationParams): Promise<PaginatedPatientsResponse> => {
    const response = await apiClient.get<PaginatedPatientsResponse>('/admin/patients', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },

  /**
   * Get all visits with pagination
   * 
   * @param params - Pagination parameters (page, limit)
   * @returns Paginated list of visits
   */
  getVisits: async (params: PaginationParams): Promise<PaginatedVisitsResponse> => {
    const response = await apiClient.get<PaginatedVisitsResponse>('/admin/visits', {
      params: {
        page: params.page,
        limit: params.limit,
      },
    });
    return response.data;
  },
};

/**
 * React Query Hooks (Optional - for use with TanStack Query)
 * 
 * Example usage in components:
 * 
 * import { useQuery } from '@tanstack/react-query';
 * 
 * const { data, isLoading } = useQuery({
 *   queryKey: ['doctors', page, limit],
 *   queryFn: () => adminApi.getDoctors({ page, limit }),
 * });
 */