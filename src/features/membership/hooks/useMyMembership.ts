import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { memberRepository } from '../api/memberRepository';
import { membershipKeys } from '../lib/queryKeys';

// The signed-in member's membership (portal). While a payment is processing the summary re-reads
// every second, so the dashboard, history and charter lock update the moment it is confirmed.
const PROCESSING_POLL_MS = 1000;

export function useMyMembership() {
  const userId = useAuthStore((s) => s.session?.id);
  return useQuery({
    queryKey: [...membershipKeys.mine(), userId],
    queryFn: memberRepository.summary,
    enabled: userId !== undefined,
    refetchInterval: (query) => (query.state.data?.processing ? PROCESSING_POLL_MS : false),
  });
}

export function useMyContributions() {
  const userId = useAuthStore((s) => s.session?.id);
  const membership = useMyMembership();
  return useQuery({
    queryKey: [...membershipKeys.myContributions(), userId, membership.data?.receivedCents],
    queryFn: memberRepository.contributions,
    enabled: userId !== undefined,
  });
}

export function usePayInstallment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memberRepository.payNextInstallment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membershipKeys.mine() }),
  });
}
