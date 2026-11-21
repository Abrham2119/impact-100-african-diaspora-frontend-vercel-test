import type { InstallmentPlan } from '@/domain/entities/membership.types';
import { findLevel, installmentPlan } from '@/domain/rules/membership';
import { PATHS } from '@/app/routes/paths';
import { mockReference, mockResponse } from '@/infrastructure/api/mock';
import type { JoinIntentDto, JoinQuoteRequestDto, JoinRequestDto, JoinResponseDto } from '@/types/membership.dto';
import { publicSettingsFixture } from '../fixtures/settings';
import { toSettings } from './settingsService';

// Join flow (`POST membership/join/quote`, `POST membership/join`, `GET membership/join/intents/:id`).
// Mocked until Step 13: the quote applies the same rule the server does (domain/rules/membership),
// and the checkout URL leads back to the wizard's "Done" step instead of WAZIImpact.org.

const settings = () => toSettings(publicSettingsFixture);

/** The quote for a level and installment count (null when the level is unknown). */
function quote(request: JoinQuoteRequestDto): InstallmentPlan | null {
  const s = settings();
  const level = findLevel(s, request.level_key);
  if (!level) return null;
  return installmentPlan(level.amountCents, Math.min(request.installments, s.maxInstallments), s.installmentRoundingCents);
}

const intents = new Map<string, JoinIntentDto>();

export const joinService = {
  quote: (request: JoinQuoteRequestDto): Promise<InstallmentPlan | null> => mockResponse(() => quote(request), 0),
  start: (request: JoinRequestDto): Promise<JoinResponseDto> =>
    mockResponse(() => {
      const intentId = mockReference('JI');
      const statusToken = mockReference('ST');
      intents.set(intentId, { status: 'PENDING', pledge_status: 'PENDING_PAYMENT' });
      const params = new URLSearchParams({ level: request.level_key, plan: String(request.installments), intent: intentId, status_token: statusToken });
      return { pledge_id: mockReference('PL'), intent_id: intentId, status_token: statusToken, checkout_url: `${PATHS.public.join}?${params.toString()}` };
    }),
  intent: (intentId: string): Promise<JoinIntentDto> =>
    mockResponse(() => intents.get(intentId) ?? { status: 'PENDING', pledge_status: 'PENDING_PAYMENT' }, 0),
};
