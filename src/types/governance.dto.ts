// Wire shapes of the public governance API (backend docs/ARCHITECTURE.md §4.8).

/** `GET /proposals/public` — the public-safe subset of a proposal under review */
export interface PublicProposalDto {
  id: string;
  title: string;
  country_key: string;
  portfolio_key: string;
  budget_cents: number;
}

export interface PublicProposalQueryDto {
  country_key?: string;
  portfolio_key?: string;
  status?: string;
}
