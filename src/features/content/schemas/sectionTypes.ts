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

/** Campaign categories: the home carousel, or the paged grid of /campaigns/category. */
export const categoryCarousel = defineSection('category_carousel', {
  fields: heading,
  settings: { source: s.source('campaign_categories'), href: s.string(), layout: s.enumOf(['slider', 'grid'], 'slider') },
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
  settings: { split: s.enumOf(['8_4', '7_5'], '8_4'), title_size: s.enumOf(['40', '38'], '40') },
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
/**
 * Campaign cards: the home block (`layout: home`, with the background shape) or the /campaigns
 * lists (`layout: page`). In the heading, `{campaign}` is replaced by the first listed campaign's
 * name (the list's "2026–27 Campaign" heading).
 */
export const campaignCards = defineSection('campaign_cards', {
  fields: heading,
  media: { background: o(m.image()) },
  settings: {
    status: s.enumOf(['active', 'history', 'all'], 'all'),
    limit: s.number(3),
    display: s.source('campaign_display'),
    layout: s.enumOf(['home', 'page', 'slider'], 'home'),
    spacing: s.enumOf(['top', 'section'], 'section'),
  },
});

/** /campaigns/:slug — figures from `GET /campaigns/:slug`, gallery/description/video from C:campaign_display. */
export const campaignDetail = defineSection('campaign_detail', {
  fields: {
    label_period: f.text(),
    label_status: f.text(),
    label_who: f.text(),
    who_can_join: f.text(),
    membership_title: f.text(),
    cta: f.link(),
    renew_text: o(f.text()),
    renew_link: o(f.link()),
    tab_description: f.text(),
    tab_faq: f.text(),
    tab_video: f.text(),
  },
  settings: { display: s.source('campaign_display'), faq_source: s.source('faqs'), default_level: s.string() },
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

/** Events: the home slider, or the paged grid of /events (`layout: grid`). */
export const eventSlider = defineSection('event_slider', {
  fields: heading,
  settings: { source: s.source('events'), layout: s.enumOf(['slider', 'grid'], 'slider') },
});

/** The US hubs launch plan cards (event.dc.html). */
export const hubPlan = defineSection('hub_plan', {
  fields: heading,
  item: {
    fields: { badge: f.text(), name: f.text(), area: f.text(), note: o(f.text()), launch_label: f.text(), launch: f.text(), cta: o(f.link()) },
    settings: { badge_kind: s.enumOf(BADGE_KINDS, 'info') },
  },
});

/** /events/:slug — the event (C:events by slug), its RSVP form and the hub call. */
export const eventDetail = defineSection('event_detail', {
  fields: {
    rsvp_kicker: f.text(),
    rsvp_title: f.text(),
    rsvp_submit: f.text(),
    rsvp_login: o(f.link()),
    rsvp_note: o(f.text()),
    rsvp_done_title: f.text(),
    rsvp_done_body: f.text(),
    hub_kicker: o(f.text()),
    hub_title: o(f.text()),
    hub_cta: o(f.link()),
    schedule_title: f.text(),
    label_date: f.text(),
    label_time: f.text(),
    label_location: f.text(),
    label_link: f.text(),
    organizer_title: f.text(),
    label_name: f.text(),
    label_email: f.text(),
    label_phone: f.text(),
    map_title: f.text(),
  },
  settings: { source: s.source('events') },
});

/** /news/:slug — the story (C:news by slug), tags, share, author box, sample comments + the (inert) comment form. */
export const newsDetail = defineSection('news_detail', {
  fields: {
    comments_label: f.text(),
    tags_label: f.text(),
    share_label: f.text(),
    comments_title: f.text(),
    form_title: f.text(),
    form_note: f.text(),
    form_remember: f.text(),
    form_submit: f.text(),
    search_title: f.text(),
    recent_title: f.text(),
    categories_title: f.text(),
    sidebar_tags_title: f.text(),
  },
  settings: { source: s.source('news'), comments: s.source('blog_comments'), recent_limit: s.number(3) },
  /** share networks: label = accessible name, icon = icon-font class, href = share URL with `{url}` */
  item: { fields: { label: f.text() }, settings: { icon: s.string(), href: s.string() } },
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

/** `ol.ix_flow` numbered steps (nonprofits "How it works", grants roadmaps); with `badge_kind` the
 * step's `num` shows as a badge (the dated roadmap). */
export const flowSteps = defineSection('flow_steps', {
  fields: { ...heading, list_kicker: o(f.text()) },
  item: { fields: { num: f.text(), title: f.text(), text: o(f.text()) }, settings: { badge_kind: o(s.enumOf(BADGE_KINDS, 'neutral')) } },
});

/** grants: the Africa map + hub panel. The selected hub is `?hub=` (shared with the sections below). */
export const hubMap = defineSection('hub_map', {
  fields: {
    ...heading,
    map_label: f.text(),
    region_north: f.text(),
    region_sub_saharan: f.text(),
    legend_north: f.text(),
    legend_hub: f.text(),
    legend_mine: f.text(),
    boundaries_note: o(f.text()),
    list_kicker: f.text(),
    country_title: f.text(),
    country_body: f.text(),
    country_actions: o(f.links()),
    interest_label: f.text(),
    projects_kicker: f.text(),
    roles_kicker: f.text(),
    role_title: f.text(),
    role_where: f.text(),
    role_link: f.link(),
    saved_title: f.text(),
    saved_body: f.text(),
    unsaved_title: f.text(),
    unsaved_body: f.text(),
    cta: o(f.link()),
  },
  settings: { default_hub: s.string() },
});

/** grants "How grants are selected": heading + text + button beside a card of rubric rows. */
export const splitFeature = defineSection('split_feature', {
  fields: { title: f.text(), lead: o(f.text()), actions: o(f.links()), card_kicker: o(f.text()), card_note: o(f.text()) },
  item: { fields: { title: f.text(), text: o(f.text()) } },
});

/** grants "Each portfolio and its flagship": C:portfolios cards with the selected hub (`{hub}`). */
export const portfolioCards = defineSection('portfolio_cards', {
  fields: { ...heading, no_hub: f.text() },
  settings: { source: s.source('portfolios'), default_hub: o(s.string()) },
});

/** grants work plan + selection process: two cards. Item `type`: milestone | step | badge. */
export const planPair = defineSection('plan_pair', {
  fields: { left_kicker: f.text(), left_title: f.text(), right_kicker: f.text(), right_title: f.text(), badges_title: o(f.text()), note: o(f.text()) },
  item: { fields: { title: f.text(), text: o(f.text()) }, settings: { done: s.bool(false) } },
});

/** grants "Proposals members are reading now" (`GET /proposals/public`), the selected hub first. */
export const proposalsList = defineSection('proposals_list', {
  fields: { ...heading, your_hub: f.text(), requested: f.rich(), read_link: f.text() },
  settings: { default_hub: o(s.string()) },
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
  // auth screens (FE-7)
  'sign_in',
  'sign_up',
  'forgot',
  'check_email',
  'two_step',
  'two_step_setup',
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
    fail_title: o(f.text()),
    fail_body: o(f.text()),
    /** progress / hint line, may hold `{count}`-style tokens filled by the component */
    progress_note: o(f.text()),
    /** copy repeated on each card of a card list (hubs) */
    card_kicker: o(f.text()),
    card_body: o(f.text()),
    card_cta: o(f.text()),
    /** the form card's own heading (`{name}` tokens allowed) and submit button */
    form_kicker: o(f.text()),
    form_title: o(f.text()),
    submit_label: o(f.text()),
    /** consent checkbox label; `{link}` marks where `consent_link` goes */
    consent_label: o(f.text()),
    consent_link: o(f.link()),
    /** a plain text link (`.ix_link`) under the side card */
    side_link: o(f.link()),
    /** the "pay securely on WAZIImpact.org" line (shown with a lock icon) */
    secure_note: o(f.text()),
    /** a summary line with `{tokens}` filled by the component (donate: the gift summary) */
    summary: o(f.text()),
    /** auth screens: the "Or" separator, the WAZIImpact.org button, the line under the form */
    alt_label: o(f.text()),
    sso_label: o(f.text()),
    after_form: o(f.rich()),
    actions: o(f.links()),
  },
  media: { image: o(m.image()) },
  settings: {
    form_key: s.enumOf(FORM_KEYS, 'contact'),
    source: o(s.source('')),
    default_key: o(s.string()),
    /** preset amounts in whole currency units (donate) and the preselected one */
    amounts: o(s.numbers()),
    default_amount: o(s.number()),
    /** icon-font class of a status card (check_email) */
    icon: o(s.string()),
  },
  item: {
    fields: { title: o(f.text()), body: o(f.rich()), link: o(f.link()), value: o(f.text()) },
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
  campaignDetail,
  hubPlan,
  eventDetail,
  newsDetail,
  hubMap,
  splitFeature,
  portfolioCards,
  planPair,
  proposalsList,
] as const;

export type SectionTypeName = (typeof SECTION_TYPES)[number]['type'];

// ---- collections ---------------------------------------------------------------------------

export const campaignCategories = defineCollection('campaign_categories', {
  fields: { name: f.text() },
  media: { image: m.image() },
});

export const events = defineCollection('events', {
  fields: { title: f.text(), summary: f.text(), date_label: f.text(), place: f.text(), body: o(f.rich()), map_label: o(f.text()) },
  media: { image: m.image() },
  data: {
    time_label: o(s.string()),
    link_url: o(s.string()),
    organizer_name: o(s.string()),
    organizer_email: o(s.string()),
    organizer_phone: o(s.string()),
    map_url: o(s.string()),
  },
});

/** C:countries — the Sub-Saharan countries (all USAFI hubs); `featured` = the three highlighted hubs. */
export const countries = defineCollection('countries', {
  fields: { name: f.text(), capital: f.text(), hub_text: o(f.text()) },
  data: { map_key: s.string(), featured: s.bool(false) },
});

export const volunteerRoles = defineCollection('volunteer_roles', {
  fields: { title: f.text(), team: f.text(), description: f.text() },
  data: { area: s.string(), team_key: s.string(), interest_key: o(s.string()) },
});

export const contactTopics = defineCollection('contact_topics', { fields: { name: f.text() } });

/** C:us_hubs — the five US regional hubs (hubs.dc.html, join form). */
export const usHubs = defineCollection('us_hubs', {
  fields: { name: f.text(), status: f.text() },
  data: { badge_kind: s.enumOf(BADGE_KINDS, 'info') },
});

export const blogComments = defineCollection('blog_comments', {
  fields: { name: f.text(), date_label: f.text(), text: f.text() },
  media: { avatar: m.image() },
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
  /** `focus`: the grants card text, `{hub}` = the selected hub; `volunteer_link`: its call to action */
  fields: { name: f.text(), flagship: f.text(), focus: o(f.rich()), volunteer_link: o(f.link()) },
  data: { icon: s.enumOf(COUNTER_ICONS, 'projects') },
});

export const news = defineCollection('news', {
  fields: {
    title: f.text(),
    excerpt: f.text(),
    date_label: f.text(),
    category: f.text(),
    body_before: o(f.rich()),
    quote: o(f.text()),
    quote_author: o(f.text()),
    body_after: o(f.rich()),
    tags: o(f.links()),
    author_name: o(f.text()),
    author_role: o(f.text()),
    author_bio: o(f.text()),
    author_links: o(f.links()),
  },
  media: { image: m.image(), detail_image: o(m.image()), author_photo: o(m.image()) },
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
  media: { image: m.image(), gallery: o(m.list()) },
  fields: { description: o(f.rich()) },
  data: { video_url: o(s.string()) },
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
  usHubs,
  blogComments,
  countries,
  volunteerRoles,
  contactTopics,
] as const;
