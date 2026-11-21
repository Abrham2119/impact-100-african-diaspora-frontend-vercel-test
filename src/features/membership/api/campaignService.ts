import type { Campaign, CampaignFilter } from '@/domain/entities/campaign.types';
import type { CampaignPublicDto } from '@/types/membership.dto';
import { campaignsFixture } from '../fixtures/campaigns';

// Public campaigns reader (`GET /campaigns?status=`). Until the membership API exists it resolves
// from the API-shaped fixture; Step 13 swaps the source to apiClient + API_ENDPOINTS here only.

const toCampaign = (dto: CampaignPublicDto): Campaign => ({
  slug: dto.slug,
  name: dto.name,
  startsOn: dto.starts_on,
  endsOn: dto.ends_on,
  goalCents: dto.goal_cents,
  raisedCents: dto.raised_cents,
  pct: dto.pct,
  status: dto.status === 'ACTIVE' ? 'active' : dto.status === 'HISTORY' ? 'history' : 'scheduled',
});

const seed = (filter: CampaignFilter): Campaign[] =>
  campaignsFixture.map(toCampaign).filter((campaign) => filter === 'all' || campaign.status === filter);

export const campaignService = {
  seed,
  list: async (filter: CampaignFilter): Promise<Campaign[]> => seed(filter),
};
