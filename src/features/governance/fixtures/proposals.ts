import type { PublicProposalDto } from '@/types/governance.dto';

// Seed of `GET /proposals/public` (grants.dc.html, sample data, FQ8).
//   • PUBLISHED: "Proposals members are reading now" (`RV`), status in_review.
//   • PER_COUNTRY_TITLES + perCountry(): the hub panel's "Projects under review here" — the design
//     generates them per country from the country name; the mock does the same so every hub shows
//     what the design shows.
export const PUBLISHED: PublicProposalDto[] = [
  { id: 'rv-1', title: 'Youth digital skills programme', country_key: 'kenya', portfolio_key: 'diaspora-engagement', budget_cents: 2_500_000 },
  { id: 'rv-2', title: 'Community health outreach', country_key: 'ghana', portfolio_key: 'sustainable-development', budget_cents: 1_850_000 },
  { id: 'rv-3', title: 'Women-led agribusiness fund', country_key: 'zambia', portfolio_key: 'academic-partnerships', budget_cents: 2_200_000 },
  { id: 'rv-4', title: 'School library and reading clubs', country_key: 'ghana', portfolio_key: 'diaspora-engagement', budget_cents: 1_200_000 },
];

const PER_COUNTRY_TITLES: Record<string, [string, string]> = {
  'diaspora-engagement': ['Diaspora mentorship network', 'Returnee skills exchange'],
  'academic-partnerships': ['University research partnership', 'STEM scholarship programme'],
  'youth-women-entrepreneurship': ['Youth coding hub', 'Women-led agribusiness fund'],
  'sustainable-development': ['Solar power for rural clinics', 'Clean water boreholes'],
};
/** the design's order of the four portfolios in the panel */
const PANEL_ORDER = ['youth-women-entrepreneurship', 'diaspora-engagement', 'academic-partnerships', 'sustainable-development'];
const LETTERS = 'ABCD';

/** The design's per-country sample proposals (grants.dc.html `allProps`), seeded by the country name. */
export function perCountry(countryKey: string, countryName: string): PublicProposalDto[] {
  let seed = 0;
  for (const ch of countryName) seed = (seed * 31 + ch.charCodeAt(0)) % 9973;
  return PANEL_ORDER.map((portfolio, i) => ({
    id: `${countryKey}-${i + 1}`,
    title: `Proposal ${LETTERS[i]} — ${PER_COUNTRY_TITLES[portfolio][(seed + i) % 2]}`,
    country_key: countryKey,
    portfolio_key: portfolio,
    budget_cents: (10_000 + ((seed * (i + 3)) % 41) * 500) * 100,
  }));
}
