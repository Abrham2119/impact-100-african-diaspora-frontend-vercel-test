// A membership campaign as shown on the public site (`GET /campaigns`). Framework-free.
export type CampaignStatus = 'scheduled' | 'active' | 'history';

export interface Campaign {
  slug: string;
  name: string;
  startsOn: string;
  endsOn: string;
  goalCents: number;
  raisedCents: number;
  /** 0–100, computed by the server */
  pct: number;
  status: CampaignStatus;
}

/** `status` filter of `GET /campaigns`; `all` = no filter. */
export type CampaignFilter = 'active' | 'history' | 'all';
