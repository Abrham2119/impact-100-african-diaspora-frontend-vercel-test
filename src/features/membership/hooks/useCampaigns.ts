import { useQuery } from '@tanstack/react-query';
import type { CampaignFilter } from '@/domain/entities/campaign.types';
import { campaignService } from '../api/campaignService';
import { CAMPAIGNS_STALE_TIME, membershipKeys } from '../lib/queryKeys';

/** Public campaigns (`GET /campaigns?status=`). Not localized: names come from the API as-is. */
export function useCampaigns(filter: CampaignFilter) {
  return useQuery({
    queryKey: membershipKeys.campaigns(filter),
    queryFn: () => campaignService.list(filter),
    initialData: () => campaignService.seed(filter),
    staleTime: CAMPAIGNS_STALE_TIME,
  });
}
