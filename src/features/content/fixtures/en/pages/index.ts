import type { PageTreeDto } from '@/types/content.dto';
import { aboutEn } from './about';
import { authPagesEn } from './auth';
import { campaignCategoryPageEn, campaignDetailPageEn, campaignsPageEn } from './campaigns';
import { charterEn } from './charter';
import { committeesPageEn } from './committees';
import {
  contactThanksPageEn,
  donateCancelPageEn,
  donateThanksPageEn,
  eventDetailPageEn,
  eventsPageEn,
  hubsPageEn,
  newsDetailPageEn,
  newsPageEn,
  volunteerThanksPageEn,
} from './eventsNews';
import { contactPageEn, shareStoryPageEn, volunteerPageEn } from './forms';
import { grantsPageEn } from './grants';
import { homeEn } from './home';
import { donatePageEn, joinPageEn } from './joinDonate';
import { donorsPageEn, faqPageEn, photosPageEn, testimonialsPageEn, videosPageEn, volunteersPageEn } from './lists';
import { newsletterConfirmedEn, newsletterUnsubscribedEn, privacyEn } from './notices';
import { nonprofitsEn } from './nonprofits';
import { ourModelEn } from './ourModel';

// Every English page tree (`GET content/pages/:key`), keyed by CMS page key (ARCHITECTURE.md §4).
export const pagesEn: Record<string, PageTreeDto> = {
  ...authPagesEn,
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
  // Step 6
  nonprofits: nonprofitsEn,
  campaigns: campaignsPageEn,
  campaign_detail: campaignDetailPageEn,
  campaign_category: campaignCategoryPageEn,
  events: eventsPageEn,
  event_detail: eventDetailPageEn,
  hubs: hubsPageEn,
  news: newsPageEn,
  news_detail: newsDetailPageEn,
  donate_cancel: donateCancelPageEn,
  contact_thanks: contactThanksPageEn,
  donate_thanks: donateThanksPageEn,
  volunteer_thanks: volunteerThanksPageEn,
  contact: contactPageEn,
  volunteer: volunteerPageEn,
  share_story: shareStoryPageEn,
  join: joinPageEn,
  donate: donatePageEn,
  grants: grantsPageEn,
};
