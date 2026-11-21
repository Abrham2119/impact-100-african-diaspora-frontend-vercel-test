import { PATHS } from '@/app/routes/paths';
import { mockReference, mockResponse } from '@/infrastructure/api/mock';
import type { DonationCancelInfoDto, DonationRequestDto, DonationResponseDto } from '@/types/membership.dto';
import { donationCancelFixture } from '../fixtures/donations';

// Donations (`POST membership/donations`, `GET|POST membership/donations/cancel`). Mocked until
// Step 13: the checkout URL leads straight to the thanks page instead of WAZIImpact.org.

let cancelled = false;

export const donationService = {
  start: (request: DonationRequestDto): Promise<DonationResponseDto> =>
    mockResponse(() => {
      void request;
      return {
        donation_id: mockReference('DN'),
        intent_id: mockReference('DI'),
        status_token: mockReference('ST'),
        checkout_url: PATHS.public.donateThanks,
      };
    }),
  /** the mock answers for any token (the design shows the sample gift) */
  cancelInfo: (token: string): Promise<DonationCancelInfoDto | null> =>
    mockResponse(() => {
      void token;
      return { ...donationCancelFixture, status: cancelled ? ('CANCELLED' as const) : ('ACTIVE' as const) };
    }, 0),
  cancel: (token: string): Promise<{ status: 'CANCELLED' }> =>
    mockResponse(() => {
      void token;
      cancelled = true;
      return { status: 'CANCELLED' as const };
    }),
};
