// Wire shapes of the public membership API (backend docs/ARCHITECTURE.md §4, `GET /campaigns`).

export type CampaignStatusDto = 'SCHEDULED' | 'ACTIVE' | 'HISTORY';

export interface CampaignPublicDto {
  slug: string;
  name: string;
  /** ISO date (YYYY-MM-DD) */
  starts_on: string;
  ends_on: string;
  goal_cents: number;
  raised_cents: number;
  pct: number;
  status: CampaignStatusDto;
}
