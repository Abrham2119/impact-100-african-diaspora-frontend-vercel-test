// A proposal as the public site sees it (`GET /proposals/public`, a public-safe subset). Framework-free.
export interface PublicProposal {
  id: string;
  title: string;
  countryKey: string;
  portfolioKey: string;
  budgetCents: number;
}
