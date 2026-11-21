import type { CharterValues, SettingsChange, SettingsVersion } from '@/domain/entities/admin.types';
import { publicSettingsFixture as S } from './settings';

// Versioned charter settings (admin_settings, admin_approvals, admin_settings_history .dc.html),
// verbatim. v1.0 holds the numbers of the public settings; the earlier and rejected versions are
// the design's history rows (their numbers are not in the design, so they are not stored).
const level = (key: string) => S.levels.find((l) => l.key === key)?.amount_cents ?? 0;

export const V1_VALUES: CharterValues = {
  initiatorCents: level('initiator'),
  incubatorCents: level('incubator'),
  innovatorCents: level('innovator'),
  investorCents: level('investor'),
  minimumCents: S.membership_minimum_cents,
  votingThresholdCents: S.voting_threshold_cents,
  maxInstallments: S.max_installments,
  roundingCents: S.installment_rounding_cents,
  quorumPct: S.quorum_pct,
  circulationDays: 14,
};

export const SETTINGS_VERSIONS: SettingsVersion[] = [
  { id: 'v-1-0', version: 'v1.0', change: 'Charter adopted', proposedByName: 'Ngozi Eze', approvedByName: 'Kofi Boateng', activeFrom: '2026-10-01', status: 'ACTIVE', values: V1_VALUES },
  { id: 'v-0-9', version: 'v0.9', change: 'Draft thresholds', proposedByName: 'Kofi Boateng', approvedByName: 'Ngozi Eze', activeFrom: '2025-10-01', status: 'SUPERSEDED', values: null },
  { id: 'v-rej-1', version: null, change: 'Voting threshold $400', proposedByName: 'A. Member', approvedByName: null, activeFrom: null, status: 'REJECTED', values: null },
];

export const SETTINGS_CHANGES: SettingsChange[] = [
  {
    id: 'sc-quorum-40',
    summary: 'Quorum 50% → 40% for non-grant decisions',
    diff: [{ field: 'nonGrantQuorumPct', from: 50, to: 40 }],
    proposedBy: 'u-ngozi',
    proposedByName: 'Ngozi Eze',
    effectiveFrom: '2027-04-01',
    status: 'PENDING',
    decidedBy: null,
    decidedByName: null,
  },
  {
    id: 'sc-installments-8',
    summary: 'Max installments 6 → 8',
    diff: [{ field: 'maxInstallments', from: 6, to: 8 }],
    proposedBy: 'u-kofi',
    proposedByName: 'Kofi Boateng',
    effectiveFrom: '2027-10-01',
    status: 'PENDING',
    decidedBy: null,
    decidedByName: null,
  },
  {
    id: 'sc-circulation-21',
    summary: 'Amendment circulation 14 → 21 days',
    diff: [{ field: 'circulationDays', from: 14, to: 21 }],
    proposedBy: 'u-ngozi',
    proposedByName: 'Ngozi Eze',
    effectiveFrom: '2027-01-01',
    status: 'PENDING',
    decidedBy: null,
    decidedByName: null,
  },
];
