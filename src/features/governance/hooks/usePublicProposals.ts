import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PublicProposalQueryDto } from '@/types/governance.dto';
import { proposalService } from '../api/proposalService';

/** Proposals under review (`GET /proposals/public`), optionally for one country / portfolio. */
export function usePublicProposals(params: PublicProposalQueryDto) {
  return useQuery({
    queryKey: ['governance', 'proposals', 'public', params],
    queryFn: () => proposalService.list(params),
    initialData: () => proposalService.seed(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
