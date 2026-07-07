import { apiClient } from '@/infrastructure/api/api';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { ApiEnvelope, PaginatedData } from '@/types/api';
import type { UserProfile } from '@/domain/entities/user.types';

export const userService = {
  // Current user's rich profile (created asynchronously by user-service).
  me: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<ApiEnvelope<UserProfile>>(API_ENDPOINTS.users.me);
    return data.data;
  },

  updateMe: async (payload: Partial<Pick<UserProfile, 'full_name' | 'bio'>>): Promise<UserProfile> => {
    const { data } = await apiClient.patch<ApiEnvelope<UserProfile>>(API_ENDPOINTS.users.me, payload);
    return data.data;
  },

  // Admin: paginated user list (requires users:list on the server).
  list: async (page = 1, limit = 10): Promise<PaginatedData<UserProfile>> => {
    const { data } = await apiClient.get<ApiEnvelope<PaginatedData<UserProfile>>>(
      API_ENDPOINTS.users.list,
      { params: { page, limit } },
    );
    return data.data;
  },
};
