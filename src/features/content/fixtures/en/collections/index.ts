import type { EntryCardDto } from '@/types/content.dto';
import { charterVersionsEn } from './charterVersions';
import { committeesEn } from './committees';
import { eventsEn } from './events';
import { faqsEn } from './faqs';
import { campaignCategoriesEn, campaignDisplayEn, donorsEn, newsEn, photosEn, portfoliosEn, videosEn } from './misc';
import { leadershipEn, volunteersEn } from './people';
import { testimonialsEn } from './testimonials';

// Every English collection, in the order the CMS lists entries (`sort` default).
export const collectionsEn: Record<string, EntryCardDto[]> = {
  campaign_categories: campaignCategoriesEn,
  campaign_display: campaignDisplayEn,
  charter_versions: charterVersionsEn,
  committees: committeesEn,
  donors: donorsEn,
  events: eventsEn,
  faqs: faqsEn,
  leadership: leadershipEn,
  news: newsEn,
  photos: photosEn,
  portfolios: portfoliosEn,
  testimonials: testimonialsEn,
  videos: videosEn,
  volunteers: volunteersEn,
};
