import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DataRequest, EmailPrefKey, MemberProfile } from '@/domain/entities/profile.types';
import { useAuthStore } from '@/store/authStore';
import { profileRepository } from '../api/profileRepository';

const KEY = ['profile', 'me'] as const;

export function useMyProfile() {
  const userId = useAuthStore((s) => s.session?.id);
  return useQuery({ queryKey: [...KEY, userId], queryFn: profileRepository.me, enabled: userId !== undefined });
}

function useProfileMutation<V>(fn: (value: V) => Promise<MemberProfile>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }) });
}

export const useSaveProfile = () => useProfileMutation(profileRepository.update);
export const useSaveInterests = () => useProfileMutation(profileRepository.updateInterests);
export const useSetEmailPref = () => useProfileMutation(({ key, on }: { key: EmailPrefKey; on: boolean }) => profileRepository.setEmailPref(key, on));
export const useRequestData = () => useProfileMutation((type: DataRequest['type']) => profileRepository.requestData(type));
