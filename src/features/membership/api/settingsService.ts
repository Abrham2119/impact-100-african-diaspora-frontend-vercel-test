import type { MembershipSettings } from '@/domain/entities/membership.types';
import type { PublicSettingsDto } from '@/types/membership.dto';
import { mockResponse } from '@/infrastructure/api/mock';
import { publicSettingsFixture } from '../fixtures/settings';

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

export const settingsService = {
  seed: (): MembershipSettings => toSettings(publicSettingsFixture),
  get: (): Promise<MembershipSettings> => mockResponse(() => toSettings(publicSettingsFixture), 0),
};
