import { defineCollection, defineSection } from './defineSection.ts';
import { f, m, optional as o, s } from './fields.ts';

// Every CMS section type and collection schema of the public site (ARCHITECTURE.md §3.3, §7).
// Declared once: the registry validates each section with `.schema`, section components get
// their prop types by inference, and `npm run export:content-schemas` writes `.json` of all of
// them to content-schemas.json for the backend Joi registry contract test.

const heading = { kicker: o(f.text()), title: o(f.text()), lead: o(f.text()) };
const layout = s.enumOf(['slider', 'grid'], 'slider');

export const COUNTER_ICONS = ['projects', 'team', 'reviews', 'awards'] as const;
export const BADGE_KINDS = ['neutral', 'ok', 'warn', 'info', 'accent', 'bad'] as const;

// ---- sections ------------------------------------------------------------------------------

/** Page banner (title + crumbs); rendered by PublicLayout, skipped by CmsPage. Empty href = current page. */
export const breadcrumbBanner = defineSection('breadcrumb_banner', {
  fields: { title: f.text(), trail: f.links() },
  media: { background: o(m.image()) },
});

export const heroSlider = defineSection('hero_slider', {
  fields: { circle_text: o(f.text()) },
  settings: { autoplay_ms: s.number(4000) },
  item: {
    fields: { kicker: o(f.text()), title: f.text(), body: o(f.text()), actions: o(f.links()) },
    media: { background: o(m.image()) },
  },
});

export const categoryCarousel = defineSection('category_carousel', {
  fields: heading,
  settings: { source: s.source('campaign_categories'), href: s.string() },
});

export const aboutBlock = defineSection('about_block', {
  fields: {
    kicker: o(f.text()),
    title: f.text(),
    body: f.text(),
    founder_name: o(f.text()),
    founder_role: o(f.text()),
    founder_cta: o(f.link()),
  },
  media: { image: m.image(), founder_image: o(m.image()) },
  item: { fields: { label: f.text(), name: f.text() }, media: { icon: m.image() } },
});

/**
 * Generic `ix_card` grid. Item `type`: icon · num · level · rich (cards in the grid) and note (columns of
 * the soft card under the grid). `spacing: continued` continues the previous section's container.
 */
export const cardGrid = defineSection('card_grid', {
  fields: { ...heading, actions: o(f.links()) },
  settings: {
    heading_width: s.enumOf(['wide', 'narrow'], 'wide'),
    columns: s.enumOf(['lg6', 'lg4', 'xl3'], 'lg4'),
    spacing: s.enumOf(['section', 'continued'], 'section'),
    stretch: s.bool(false),
  },
  item: {
    fields: {
      kicker: o(f.text()),
      num: o(f.text()),
      title: o(f.text()),
      price: o(f.text()),
      body: o(f.rich()),
      badge: o(f.text()),
      actions: o(f.links()),
    },
    settings: {
      icon: o(s.string()),
      tone: s.enumOf(['default', 'dark'], 'default'),
      pill: s.bool(false),
      badge_kind: s.enumOf(BADGE_KINDS, 'neutral'),
    },
  },
});

export const band = defineSection('band', {
  fields: { kicker: o(f.text()), title: f.text(), body: f.text(), actions: o(f.links()) },
  settings: { split: s.enumOf(['8_4', '7_5'], '8_4') },
});

export const videoDonate = defineSection('video_donate', {
  fields: {
    title: f.text(),
    body: f.text(),
    amount_title: f.text(),
    custom_label: f.text(),
    cta: f.link(),
    video_kicker: f.text(),
    video_title: f.text(),
    video_body: f.text(),
  },
  media: { image: m.image(), video: m.video(), background: o(m.image()) },
  settings: { amounts: s.numbers(), default_amount: s.number(200) },
});

export const servicesSlider = defineSection('services_slider', {
  fields: heading,
  item: {
    fields: { kicker: o(f.text()), title: f.text(), body: f.text() },
    settings: { href: s.string() },
    media: { icon: m.image() },
  },
});

export const logoStrip = defineSection('logo_strip', {
  item: { media: { logo: m.image() } },
});

/** Membership campaigns (`GET /campaigns`) composed with the `campaign_display` collection (image). */
export const campaignCards = defineSection('campaign_cards', {
  fields: heading,
  media: { background: o(m.image()) },
  settings: {
    status: s.enumOf(['active', 'history', 'all'], 'all'),
    limit: s.number(3),
    display: s.source('campaign_display'),
  },
});

export const counterBand = defineSection('counter_band', {
  fields: heading,
  media: { background: o(m.image()) },
  settings: { variant: s.enumOf(['count', 'portfolio'], 'count'), source: o(s.source('portfolios')) },
  item: {
    fields: { label: f.text() },
    settings: { icon: s.enumOf(COUNTER_ICONS, 'projects'), value: s.number(0) },
  },
});

export const eventSlider = defineSection('event_slider', {
  fields: heading,
  settings: { source: s.source('events') },
});

export const textMarquee = defineSection('text_marquee', {
  item: { fields: { text: f.text() } },
});

export const ctaBand = defineSection('cta_band', {
  fields: { kicker: o(f.text()), title: f.text(), body: f.text(), cta: f.link() },
  media: { background: o(m.image()) },
});

export const testimonials = defineSection('testimonials', {
  fields: heading,
  settings: { layout, source: s.source('testimonials') },
});

export const people = defineSection('people', {
  fields: heading,
  media: { background: o(m.image()) },
  settings: { layout, source: s.source('volunteers') },
});

/** FAQ accordion; with `source.collection = committees` the answers list the committee duties. */
export const faq = defineSection('faq', {
  fields: heading,
  media: { image: o(m.image()) },
  settings: { layout: s.enumOf(['with_image', 'page'], 'with_image'), source: s.source('faqs') },
});

export const newsList = defineSection('news_list', {
  fields: heading,
  settings: { layout: s.enumOf(['home', 'page'], 'home'), source: s.source('news') },
});

export const committeeGrid = defineSection('committee_grid', {
  fields: heading,
  settings: { source: s.source('committees') },
});

export const charter = defineSection('charter', {
  fields: { title: f.text(), intro: f.text(), actions: o(f.links()), note: o(f.text()) },
  settings: { source: s.source('charter_versions') },
});

export const legalText = defineSection('legal_text', {
  fields: { kicker: o(f.text()), title: f.text(), intro: o(f.text()), actions: o(f.links()) },
  item: { fields: { title: f.text(), body: f.rich() } },
});

export const decisionTable = defineSection('decision_table', {
  fields: { ...heading, col_activity: f.text(), col_low: f.text(), col_high: f.text() },
  item: {
    fields: { activity: f.text(), low: f.text(), high: f.text() },
    settings: { low_kind: s.enumOf(BADGE_KINDS, 'ok'), high_kind: s.enumOf(BADGE_KINDS, 'ok') },
  },
});

export const donorList = defineSection('donor_list', { settings: { source: s.source('donors') } });
export const photoGallery = defineSection('photo_gallery', { settings: { source: s.source('photos') } });
export const videoGallery = defineSection('video_gallery', { settings: { source: s.source('videos') } });

/**
 * Thanks / status card. With `summary_key`, the last submission of that form (saved by the form,
 * infrastructure/storage/submission.storage) fills `result_title` / `result_body` (`{name}` tokens).
 */
export const statusCard = defineSection('status_card', {
  fields: { title: f.text(), body: f.text(), actions: o(f.links()), result_title: o(f.text()), result_body: o(f.text()) },
  settings: { icon: s.string(), summary_key: o(s.string()) },
});

/** `ol.ix_flow` numbered steps (nonprofits "How it works", grants roadmap). */
export const flowSteps = defineSection('flow_steps', {
  fields: { ...heading, list_kicker: o(f.text()) },
  item: { fields: { num: f.text(), title: f.text(), text: o(f.text()) } },
});

/** The interactive forms and widgets, by key (formRegistry). */
export const FORM_KEYS = [
  'contact',
  'volunteer',
  'share_story',
  'hub_join',
  'join',
  'donate',
  'cancel_gift',
  'eligibility',
  'hub_map',
] as const;

/**
 * An interactive block: `form_key` picks the component; the fields carry its CMS copy (headings,
 * intro, notes, success message, side content) and `items` its repeated side content.
 */
export const formBlock = defineSection('form_block', {
  fields: {
    kicker: o(f.text()),
    title: o(f.text()),
    lead: o(f.text()),
    body: o(f.rich()),
    note: o(f.rich()),
    side_kicker: o(f.text()),
    side_title: o(f.text()),
    side_body: o(f.rich()),
    success_title: o(f.text()),
    success_body: o(f.text()),
    actions: o(f.links()),
  },
  media: { image: o(m.image()) },
  settings: {
    form_key: s.enumOf(FORM_KEYS, 'contact'),
    source: o(s.source('')),
    default_key: o(s.string()),
  },
  item: {
    fields: { title: o(f.text()), body: o(f.rich()), link: o(f.link()) },
    settings: { key: o(s.string()), done: s.bool(false) },
  },
});

export const SECTION_TYPES = [
  breadcrumbBanner,
  heroSlider,
  categoryCarousel,
  aboutBlock,
  cardGrid,
  band,
  videoDonate,
  servicesSlider,
  logoStrip,
  campaignCards,
  counterBand,
  eventSlider,
  textMarquee,
  ctaBand,
  testimonials,
  people,
  faq,
  newsList,
  committeeGrid,
  charter,
  legalText,
  decisionTable,
  donorList,
  photoGallery,
  videoGallery,
  statusCard,
  flowSteps,
  formBlock,
] as const;

export type SectionTypeName = (typeof SECTION_TYPES)[number]['type'];

// ---- collections ---------------------------------------------------------------------------

export const campaignCategories = defineCollection('campaign_categories', {
  fields: { name: f.text() },
  media: { image: m.image() },
});

export const events = defineCollection('events', {
  fields: { title: f.text(), summary: f.text(), date_label: f.text(), place: f.text() },
  media: { image: m.image() },
});

export const testimonialEntries = defineCollection('testimonials', {
  fields: { name: f.text(), role: f.text(), quote: f.text() },
  media: { avatar: m.image() },
  data: { rating: s.number(5) },
});

const person = { fields: { name: f.text(), role: f.text() }, media: { photo: m.image() } };
export const volunteers = defineCollection('volunteers', person);
export const leadership = defineCollection('leadership', person);

export const faqs = defineCollection('faqs', {
  fields: { question: f.text(), answer: f.rich() },
});

export const committees = defineCollection('committees', {
  fields: { name: f.text(), seats: f.text(), duties: f.rich() },
});

export const portfolios = defineCollection('portfolios', {
  fields: { name: f.text(), flagship: f.text() },
  data: { icon: s.enumOf(COUNTER_ICONS, 'projects') },
});

export const news = defineCollection('news', {
  fields: { title: f.text(), excerpt: f.text(), date_label: f.text(), category: f.text() },
  media: { image: m.image() },
  data: { published_on: s.string() },
});

export const donors = defineCollection('donors', {
  fields: { name: f.text(), location: f.text() },
  data: { amount_cents: s.number() },
});

export const photos = defineCollection('photos', { media: { image: m.image() } });

export const videos = defineCollection('videos', {
  media: { thumbnail: m.image() },
  data: { url: s.string() },
});

export const charterVersions = defineCollection('charter_versions', {
  fields: { label: f.text(), badge: f.text() },
  data: { is_current: s.bool(false) },
  item: { fields: { title: f.text(), body: f.rich() }, settings: { anchor: s.string() } },
});

/** Display data of a membership campaign, keyed by the campaign slug. */
export const campaignDisplay = defineCollection('campaign_display', {
  media: { image: m.image() },
});

export const COLLECTION_TYPES = [
  campaignCategories,
  events,
  testimonialEntries,
  volunteers,
  leadership,
  faqs,
  committees,
  portfolios,
  news,
  donors,
  photos,
  videos,
  charterVersions,
  campaignDisplay,
] as const;
