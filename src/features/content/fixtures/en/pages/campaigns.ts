import { PATHS } from '@/app/routes/paths';
import { link, page, section } from '../build';
import { banner } from './banner';

// The campaign pages (campaign_list / campaign_details / category .dc.html), copy verbatim. Figures
// come from the membership API; `{campaign}` in a heading is the listed campaign's name.
const P = PATHS.public;
const display = { collection: 'campaign_display' };

export const campaignsPageEn = page('campaigns', P.campaigns, { title: 'Impact100 — Campaigns' }, [
  banner('campaigns', ['campaigns']),
  section('campaign_cards', 'active', {
    settings: { status: 'active', limit: 1, display, layout: 'page', spacing: 'top' },
    fields: { kicker: 'Active campaign', title: '{campaign}' },
  }),
  section('campaign_cards', 'history', {
    settings: { status: 'history', limit: 30, display, layout: 'page' },
    fields: { kicker: 'Campaign history', title: 'Past campaigns' },
  }),
]);

export const campaignDetailPageEn = page('campaign_detail', P.campaigns, { title: 'Impact100 — Campaign details' }, [
  banner('campaign details', [['campaign', P.campaigns], 'campaign details']),
  section('campaign_detail', 'detail', {
    settings: { display, faq_source: { collection: 'faqs' }, default_level: 'incubator' },
    fields: {
      label_period: 'Campaign period:',
      label_status: 'Status:',
      label_who: 'Who can join:',
      who_can_join: 'Members of this campaign (new or renewed membership)',
      membership_title: 'Your Membership:',
      cta: link('join this campaign', P.join),
      renew_text: 'Already a member from a past campaign?',
      renew_link: link('Renew your membership', PATHS.portal.dashboard),
      tab_description: 'Description',
      tab_faq: 'FAQ',
      tab_video: 'Video',
    },
  }),
  section('campaign_cards', 'related', {
    settings: { status: 'history', limit: 30, display, layout: 'slider' },
    fields: { kicker: 'Campaign history', title: 'Past campaigns' },
  }),
]);

export const campaignCategoryPageEn = page('campaign_category', P.campaignCategory(), { title: 'Impact100 — Category' }, [
  banner('Category', ['Category']),
  section('category_carousel', 'categories', {
    settings: { layout: 'grid', href: P.campaigns, source: { collection: 'campaign_categories', limit: 18, paginate: true } },
  }),
]);
