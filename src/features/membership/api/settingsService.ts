import type { MembershipSettings } from '@/domain/entities/membership.types';
import type { PublicSettingsDto } from '@/types/membership.dto';
import { mockResponse } from '@/infrastructure/api/mock';
import { publicSettingsFixture } from '../fixtures/settings';
import { activeCharterValues } from './charterSettingsStore';

// Charter settings reader (`GET membership/settings/public`). Mocked until Step 13; only this file
// changes when it moves to apiClient + API_ENDPOINTS.membership.publicSettings.

export const toSettings = (dto: PublicSettingsDto): MembershipSettings => ({
  versionLabel: dto.version_label,
  levels: dto.levels.map((level) => ({ key: level.key, amountCents: level.amount_cents })),
  membershipMinimumCents: dto.membership_minimum_cents,
  votingThresholdCents: dto.voting_threshold_cents,
  maxInstallments: dto.max_installments,
  installmentRoundingCents: dto.installment_rounding_cents,
  quorumPct: dto.quorum_pct,
  cycle: dto.cycle,
  goalCents: dto.goal_cents,
});

/** The public settings with the numbers of the active charter version (admin › Charter settings). */
function current(): MembershipSettings {
  const v = activeCharterValues();
  return {
    ...toSettings(publicSettingsFixture),
    levels: [
      { key: 'initiator', amountCents: v.initiatorCents },
      { key: 'incubator', amountCents: v.incubatorCents },
      { key: 'innovator', amountCents: v.innovatorCents },
      { key: 'investor', amountCents: v.investorCents },
    ],
    membershipMinimumCents: v.minimumCents,
    votingThresholdCents: v.votingThresholdCents,
    maxInstallments: v.maxInstallments,
    installmentRoundingCents: v.roundingCents,
    quorumPct: v.quorumPct,
    circulationDays: v.circulationDays,
  };
}

export const settingsService = {
  seed: current,
  get: (): Promise<MembershipSettings> => mockResponse(current, 0),
};
