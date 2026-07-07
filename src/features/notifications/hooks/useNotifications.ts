import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../api/notificationService';

const KEYS = {
  list: (page: number, limit: number) => ['notifications', 'list', page, limit] as const,
  unread: ['notifications', 'unread-count'] as const,
};

export function useNotifications(page = 1, limit = 10) {
  return useQuery({
    queryKey: KEYS.list(page, limit),
    queryFn: () => notificationService.list(page, limit),
  });
}

export function useUnreadCount() {
  return useQuery({ queryKey: KEYS.unread, queryFn: notificationService.unreadCount });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
