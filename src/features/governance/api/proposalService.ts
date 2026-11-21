import type { PublicProposal } from '@/domain/entities/proposal.types';
import { collectionsEn } from '@/features/content/fixtures/en/collections';
import { mockResponse } from '@/infrastructure/api/mock';
import type { PublicProposalDto, PublicProposalQueryDto } from '@/types/governance.dto';
import { PUBLISHED, perCountry } from '../fixtures/proposals';

// Public proposals (`GET governance/proposals/public`). Mocked until Step 13: with a country the
// mock answers the design's per-country sample, without one the published list.
const toProposal = (dto: PublicProposalDto): PublicProposal => ({
  id: dto.id,
  title: dto.title,
  countryKey: dto.country_key,
  portfolioKey: dto.portfolio_key,
  budgetCents: dto.budget_cents,
});

function countryName(key: string): string {
  const entry = (collectionsEn.countries ?? []).find((country) => country.key === key);
  const name = entry?.fields.name?.value;
  return typeof name === 'string' ? name : key;
}

function query(params: PublicProposalQueryDto): PublicProposal[] {
  const list = params.country_key ? perCountry(params.country_key, countryName(params.country_key)) : PUBLISHED;
  return list.filter((p) => !params.portfolio_key || p.portfolio_key === params.portfolio_key).map(toProposal);
}

export const proposalService = {
  seed: query,
  list: (params: PublicProposalQueryDto): Promise<PublicProposal[]> => mockResponse(() => query(params), 0),
};
