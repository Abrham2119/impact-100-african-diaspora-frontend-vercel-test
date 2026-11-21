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

/** `GET /campaigns/:slug` */
export interface CampaignDetailDto extends CampaignPublicDto {
  members_count: number;
}

/** `GET /settings/public` — the charter settings every page reads (one source). */
export interface PublicSettingsDto {
  version_label: string;
  levels: Array<{ key: string; amount_cents: number }>;
  membership_minimum_cents: number;
  voting_threshold_cents: number;
  max_installments: number;
  installment_rounding_cents: number;
  quorum_pct: number;
  cycle: { starts: string; ends: string };
  goal_cents: number;
}

/** `POST /join/quote` */
export interface JoinQuoteRequestDto {
  level_key: string;
  installments: number;
}
export interface JoinQuoteDto {
  pledge_cents: number;
  each_cents: number;
  last_cents: number;
  schedule: Array<{ seq: number; due_on: string; amount_cents: number }>;
  max_installments_now: number;
}

/** `POST /join` — either `city` or `us_hub_key` is required */
export interface JoinRequestDto {
  level_key: string;
  installments: number;
  full_name: string;
  email: string;
  city?: string;
  us_hub_key?: string;
  newsletter_opt_in: boolean;
  locale: string;
  renew?: boolean;
}
export interface CheckoutStartDto {
  intent_id: string;
  status_token: string;
  /** WAZIImpact.org checkout; the mock returns an in-app path */
  checkout_url: string;
}
export interface JoinResponseDto extends CheckoutStartDto {
  pledge_id: string;
}
export interface JoinIntentDto {
  status: 'CREATED' | 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  pledge_status: string;
}

/** `POST /donations` */
export type DonationFrequencyDto = 'ONE_TIME' | 'MONTHLY';
export interface DonationRequestDto {
  frequency: DonationFrequencyDto;
  amount_cents: number;
  portfolio_key: string;
  country_key: string;
  donor_name: string;
  donor_email: string;
  newsletter_opt_in: boolean;
  locale: string;
}
export interface DonationResponseDto extends CheckoutStartDto {
  donation_id: string;
}

/** `GET /donations/cancel?token=` */
export interface DonationCancelInfoDto {
  amount_cents: number;
  frequency: DonationFrequencyDto;
  portfolio: string;
  country: string;
  started_at: string;
  next_charge_on: string;
  status: 'ACTIVE' | 'CANCELLED';
}
