import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../api/userService';
import type { UserProfile } from '@/domain/entities/user.types';

const KEYS = {
  me: ['users', 'me'] as const,
  list: (page: number, limit: number) => ['users', 'list', page, limit] as const,
};

// Current user's profile (server state).
export function useMe() {
  return useQuery({ queryKey: KEYS.me, queryFn: userService.me });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Pick<UserProfile, 'full_name' | 'bio'>>) =>
      userService.updateMe(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.me }),
  });
}

// Admin user list.
export function useUsersList(page = 1, limit = 10) {
  return useQuery({
    queryKey: KEYS.list(page, limit),
    queryFn: () => userService.list(page, limit),
  });
}
