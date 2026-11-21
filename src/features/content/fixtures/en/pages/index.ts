import type { PageTreeDto } from '@/types/content.dto';
import { aboutEn } from './about';
import { bannerOnlyPagesEn } from './bannerOnly';
import { charterEn } from './charter';
import { committeesPageEn } from './committees';
import { homeEn } from './home';
import { donorsPageEn, faqPageEn, photosPageEn, testimonialsPageEn, videosPageEn, volunteersPageEn } from './lists';
import { newsletterConfirmedEn, newsletterUnsubscribedEn, privacyEn } from './notices';
import { ourModelEn } from './ourModel';

// Every English page tree (`GET content/pages/:key`), keyed by CMS page key (ARCHITECTURE.md §4).
export const pagesEn: Record<string, PageTreeDto> = {
  ...bannerOnlyPagesEn,
  home: homeEn,
  about: aboutEn,
  committees: committeesPageEn,
  charter: charterEn,
  our_model: ourModelEn,
  volunteers: volunteersPageEn,
  testimonials: testimonialsPageEn,
  donors: donorsPageEn,
  gallery_photos: photosPageEn,
  gallery_videos: videosPageEn,
  faq: faqPageEn,
  privacy: privacyEn,
  newsletter_confirmed: newsletterConfirmedEn,
  newsletter_unsubscribed: newsletterUnsubscribedEn,
};
