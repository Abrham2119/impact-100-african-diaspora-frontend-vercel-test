import type { RouteObject } from 'react-router-dom';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { LocaleGate } from '@/app/guards/LocaleGate';
import { NotFound } from '@/components/NotFound';
import { TwScope } from '@/components/TwScope';
import { ScreenPlaceholder } from '@/pages/ScreenPlaceholder';
import { CmsRoutePage } from '@/pages/public/CmsRoutePage';
import type { CmsPageKey } from '@/domain/entities/content.types';
import type { RouteHandle } from './routeHandle';

// Public website, screens 1–33 of design-reference/ROUTES.md (ARCHITECTURE.md §4).
// `nav` reproduces each snapshot's active menu item exactly (e.g. join/donate/volunteer mark
// only "Opportunities"; share-a-story marks News › Share a Story).
// One children array, mounted twice (decision F2): at "/" (default locale) and at "/:lang"
// (enabled non-default locales, validated by LocaleGate). React Router ranks static segments
// first, so "/faq" never matches "/:lang".

// Pages composed entirely from CMS sections (Step 5); the interactive pages follow in Step 6.
const CMS_COMPOSED = new Set<CmsPageKey>([
  'home',
  'about',
  'committees',
  'charter',
  'our_model',
  'volunteers',
  'testimonials',
  'donors',
  'gallery_photos',
  'gallery_videos',
  'faq',
  'privacy',
  'newsletter_confirmed',
  'newsletter_unsubscribed',
  // Step 6
  'nonprofits',
  'campaigns',
  'campaign_detail',
  'campaign_category',
  'events',
  'event_detail',
  'hubs',
  'news',
  'news_detail',
  'donate_cancel',
  'contact_thanks',
  'donate_thanks',
  'volunteer_thanks',
]);

const page = (path: string | undefined, handle: RouteHandle): RouteObject => {
  const element = handle.pageKey && CMS_COMPOSED.has(handle.pageKey) ? <CmsRoutePage /> : <ScreenPlaceholder />;
  return path === undefined ? { index: true, handle, element } : { path, handle, element };
};

// A function, so each mount gets its own route objects.
const publicChildren = (): RouteObject[] => [
  page(undefined, { screen: 'index', pageKey: 'home' }),
  page('about', { screen: 'about_us', pageKey: 'about', nav: 'about.about' }),
  page('about/committees', { screen: 'committees', pageKey: 'committees', nav: 'about.committees' }),
  page('charter', { screen: 'charter', pageKey: 'charter', nav: 'about.charter' }),
  page('about/volunteers', { screen: 'volunteers', pageKey: 'volunteers', nav: 'about.volunteers' }),
  page('about/testimonials', { screen: 'testimonial', pageKey: 'testimonials', nav: 'about.testimonials' }),
  page('about/donors', { screen: 'donot_list', pageKey: 'donors', nav: 'about.donors' }),
  page('gallery/photos', { screen: 'photo_gallery', pageKey: 'gallery_photos', nav: 'about.photos' }),
  page('gallery/videos', { screen: 'video_gallery', pageKey: 'gallery_videos', nav: 'about.videos' }),
  page('faq', { screen: 'faq', pageKey: 'faq', nav: 'about.faq' }),
  page('contact', { screen: 'contact', pageKey: 'contact', nav: 'about.contact' }),
  page('contact/thanks', { screen: 'contact_thanks', pageKey: 'contact_thanks', nav: 'about' }),
  page('privacy', { screen: 'privacy', pageKey: 'privacy', nav: 'about' }),
  page('newsletter/confirmed', { screen: 'newsletter_confirmed', pageKey: 'newsletter_confirmed' }),
  page('newsletter/unsubscribed', { screen: 'unsubscribed', pageKey: 'newsletter_unsubscribed' }),
  page('our-model', { screen: 'our_model', pageKey: 'our_model', nav: 'model' }),
  page('join', { screen: 'join', pageKey: 'join', nav: 'opportunities' }),
  page('donate', { screen: 'donate', pageKey: 'donate', nav: 'opportunities' }),
  page('donate/thanks', { screen: 'donate_thanks', pageKey: 'donate_thanks', nav: 'opportunities' }),
  page('donate/cancel', { screen: 'cancel_gift', pageKey: 'donate_cancel', nav: 'opportunities' }),
  page('volunteer', { screen: 'volunteer', pageKey: 'volunteer', nav: 'opportunities' }),
  page('volunteer/thanks', { screen: 'volunteer_thanks', pageKey: 'volunteer_thanks', nav: 'opportunities' }),
  page('grants', { screen: 'grants', pageKey: 'grants', nav: 'grants.map' }),
  page('campaigns', { screen: 'campaign_list', pageKey: 'campaigns', nav: 'grants.campaigns' }),
  page('campaigns/category/:slug?', { screen: 'category', pageKey: 'campaign_category', nav: 'grants.categories' }),
  page('campaigns/:slug', { screen: 'campaign_details', pageKey: 'campaign_detail', nav: 'grants' }),
  page('nonprofits', { screen: 'nonprofits', pageKey: 'nonprofits', nav: 'nonprofits' }),
  page('events', { screen: 'event', pageKey: 'events', nav: 'events.events' }),
  // design: /events/:id — slugs are per locale (FQ4); the legacy #e=n maps to a slug in Step 6
  page('events/:slug', { screen: 'event_details', pageKey: 'event_detail', nav: 'events' }),
  page('hubs', { screen: 'hubs', pageKey: 'hubs', nav: 'events.hubs' }),
  page('news', { screen: 'blogs', pageKey: 'news', nav: 'news.news' }),
  page('news/share-a-story', { screen: 'share_story', pageKey: 'share_story', nav: 'news.share' }),
  page('news/:slug', { screen: 'blog_details', pageKey: 'news_detail', nav: 'news' }),
];

const notFound = (
  <TwScope>
    <NotFound />
  </TwScope>
);

export const publicRoutes: RouteObject[] = [
  { element: <PublicLayout />, children: publicChildren() },
  {
    path: ':lang',
    element: (
      <LocaleGate notFound={notFound}>
        <PublicLayout />
      </LocaleGate>
    ),
    children: publicChildren(),
  },
];
