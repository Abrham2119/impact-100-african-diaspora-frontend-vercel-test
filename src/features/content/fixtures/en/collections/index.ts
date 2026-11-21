import type { EntryCardDto } from '@/types/content.dto';
import { charterVersionsEn } from './charterVersions';
import { committeesEn } from './committees';
import { countriesEn } from './countries';
import { eventsEn } from './events';
import { faqsEn } from './faqs';
import { blogCommentsEn, campaignCategoriesEn, campaignDisplayEn, donorsEn, newsEn, photosEn, portfoliosEn, usHubsEn, videosEn } from './misc';
import { nonprofitFaqsEn } from './nonprofitFaqs';
import { leadershipEn, volunteersEn } from './people';
import { testimonialsEn } from './testimonials';

// Every English collection, in the order the CMS lists entries (`sort` default).
export const collectionsEn: Record<string, EntryCardDto[]> = {
  blog_comments: blogCommentsEn,
  campaign_categories: campaignCategoriesEn,
  campaign_display: campaignDisplayEn,
  charter_versions: charterVersionsEn,
  committees: committeesEn,
  countries: countriesEn,
  donors: donorsEn,
  events: eventsEn,
  faqs: faqsEn,
  leadership: leadershipEn,
  news: newsEn,
  nonprofit_faqs: nonprofitFaqsEn,
  photos: photosEn,
  portfolios: portfoliosEn,
  testimonials: testimonialsEn,
  us_hubs: usHubsEn,
  videos: videosEn,
  volunteers: volunteersEn,
};
