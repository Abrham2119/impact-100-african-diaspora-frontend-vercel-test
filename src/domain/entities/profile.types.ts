// The signed-in person's profile and preferences (portal Account: profile, privacy). Framework-free.
export type EmailPrefKey = 'receipts' | 'votes' | 'newsletter' | 'hub' | 'volunteer';

export interface Consent {
  purpose: string;
  /** the exact wording shown when consent was given */
  wording: string;
  grantedOn: string;
  withdrawnOn: string | null;
}

export interface DataRequest {
  type: 'EXPORT' | 'DELETE';
  requestedOn: string;
  status: 'OPEN' | 'DONE';
}

export interface MemberProfile {
  userId: string;
  fullName: string;
  email: string;
  city: string;
  usHubKey: string | null;
  africanHubKey: string | null;
  portfolioKey: string | null;
  /** image file in src/assets/images (sample avatars), null = initials */
  avatarFile: string | null;
  emailPrefs: Record<EmailPrefKey, boolean>;
  consents: Consent[];
  dataRequests: DataRequest[];
}
