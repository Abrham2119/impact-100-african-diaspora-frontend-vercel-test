import { apiClient } from '@/infrastructure/api/api';
import { API_ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { ApiEnvelope, PaginatedData } from '@/types/api';
import type { Notification } from '@/domain/entities/notification.types';

export const notificationService = {
  list: async (page = 1, limit = 10): Promise<PaginatedData<Notification>> => {
    const { data } = await apiClient.get<ApiEnvelope<PaginatedData<Notification>>>(
      API_ENDPOINTS.notifications.list,
      { params: { page, limit } },
    );
    return data.data;
  },

  unreadCount: async (): Promise<number> => {
    const { data } = await apiClient.get<ApiEnvelope<{ count: number }>>(
      API_ENDPOINTS.notifications.unreadCount,
    );
    return data.data?.count ?? 0;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.notifications.markRead(id));
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.notifications.markAllRead);
  },
};
