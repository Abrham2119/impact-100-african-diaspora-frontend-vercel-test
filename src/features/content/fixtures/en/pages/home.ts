import { PATHS } from '@/app/routes/paths';
import { para } from '../../builders';
import { img, link, page, section, video } from '../build';
import { HOME_VOLUNTEER_KEYS } from '../collections/people';

// GET content/pages/home — design-reference/pages/index.dc.html, copy verbatim. Template sample
// blocks (category carousel, counters, volunteer CTA, testimonials, volunteers, video block) are
// seeded as the design shows them (README "sample", FQ8). Home "Latest News" and the FAQ answers
// come from the news / faqs collections (one source per dataset).
const P = PATHS.public;
const HERO_KICKER = 'Collective giving · Hosted by USAFI Impact';
const HERO_TITLE = 'The Diaspora, giving together — back home.';
const HERO_BODY =
  'Impact 100 African Diaspora brings members of the African diaspora in the United States and their allies together to pool contributions, invest in high-impact organizations in Sub-Saharan Africa, and decide — as one community — where the money goes.';

const heroSlide = (n: number) => ({
  fields: {
    kicker: HERO_KICKER,
    title: HERO_TITLE,
    body: HERO_BODY,
    actions: [link('Join from $250', P.join), link('Read the charter', P.charter, 'ghost_light')],
  },
  media: { background: img(`banner_bg_${n}.webp`, '') },
});

const level = (kicker: string, title: string, price: string, body: string, key: string, dark = false) => ({
  type: 'level',
  settings: { tone: dark ? 'dark' : 'default' },
  fields: { kicker, title, price, body: para(body), actions: [link(`choose ${title}`, `${P.join}?level=${key}`)] },
});

export const homeEn = page('home', PATHS.home, { title: 'Impact100 — Home' }, [
  section('hero_slider', 'hero', {
    settings: { autoplay_ms: 4000 },
    fields: { circle_text: 'Giving together back home' },
    items: [heroSlide(1), heroSlide(2), heroSlide(3)],
  }),
  // "Browse by Category" — hidden for now (client request, Nov 21 2026); uncomment to show it again.
  // section('category_carousel', 'categories', {
  //   settings: { source: { collection: 'campaign_categories' }, href: P.campaigns },
  //   fields: { kicker: 'Campaigns Category', title: 'Browse by Category' },
  // }),
  section('about_block', 'about', {
    fields: {
      kicker: 'About the Chapter',
      title: 'A giving circle for the diaspora, rooted in Africa.',
      body: 'Impact 100 African Diaspora is a chapter affiliated with Impact 100 Global, built for Africans living in the United States and the allies who stand with them. We pool contributions each campaign cycle and direct them, together, to high-impact organizations in Sub-Saharan Africa doing work their own communities have asked for.',
      founder_name: 'Dr. Carmen Ward-Sullivan',
      founder_role: 'Impact 100 ADC Chair',
      founder_cta: link('about us', P.about),
    },
    media: {
      image: img('about-us-images.webp', 'Members of the African diaspora giving together'),
      founder_image: img('volunteer_img_1.webp', 'Dr. Carmen Ward-Sullivan'),
    },
    items: [
      { fields: { label: 'Host & fiscal sponsor', name: 'USAFI Impact' }, media: { icon: img('about_icon_1.webp', 'icon') } },
      { fields: { label: 'Global network', name: 'Impact 100 Global' }, media: { icon: img('about_icon_2.webp', 'icon') } },
      { fields: { label: 'Giving platform', name: 'WAZIImpact.org' }, media: { icon: img('about_icon_3.webp', 'icon') } },
    ],
  }),
  section('card_grid', 'purpose', {
    settings: { columns: 'lg6' },
    fields: {
      kicker: 'Our purpose',
      title: 'We fund priorities that communities identify for themselves.',
      lead: 'Members bring forward organizations they know and trust, learn alongside one another, and make informed grant decisions together.',
    },
    items: [
      {
        type: 'icon',
        settings: { icon: 'far fa-users' },
        fields: {
          title: 'Giving is only half of it.',
          body: para('The Chapter is also a place for diaspora communities across the US to meet, share knowledge, and build lasting relationships with partners on the continent.'),
        },
      },
      {
        type: 'icon',
        settings: { icon: 'far fa-shield-check', tone: 'dark' },
        fields: {
          title: 'USAFI Impact hosts the Chapter',
          body: para('USAFI Impact hosts the Chapter and holds fiduciary responsibility — handling due diligence, legal compliance, and payment of every approved grant.'),
        },
      },
    ],
  }),
  section('card_grid', 'cycle', {
    settings: { columns: 'xl3' },
    fields: {
      kicker: 'How a campaign cycle works',
      title: 'Every member is heard.',
      lead: 'Members contributing more than $500 in a cycle cast one equal vote each — no matter how much they gave.',
    },
    items: [
      ['01 · Oct', 'Pledge', 'Choose a level from $250 to $1,000 and pay in full or in installments through WAZIImpact.org by March 31.'],
      ['02', 'Propose', 'Members suggest priorities, nominees and local African organizations. Leaders summarize each proposal, its finances and any conflicts.'],
      ['03', 'Discuss', 'Every member gets notice and a fair chance to advise before a vote opens — regardless of contribution level.'],
      ['04', 'Vote & grant', 'Members with more than $500 credited vote once each. USAFI Impact completes due diligence and pays approved grants.'],
    ].map(([num, title, body]) => ({ type: 'num', settings: { pill: true }, fields: { num, title, body: para(body) } })),
  }),
  section('card_grid', 'levels', {
    settings: { columns: 'xl3' },
    fields: {
      kicker: 'Membership',
      title: 'Four ways to belong',
      actions: [link('compare membership levels', P.ourModel, 'dark'), link('donate without joining', P.donate)],
    },
    items: [
      level('Advise & inform', 'Initiator', '$250', 'Helps launch and sustain the giving circle, bringing community priorities and potential partners into the conversation.', 'initiator'),
      level('Advise & inform', 'Incubator', '$500', 'Helps develop promising ideas through feedback, connections, and learning alongside other members.', 'incubator'),
      level('Vote & approve', 'Innovator', '$750', 'Helps shape new approaches and assess proposals, and takes part in formal approvals.', 'innovator'),
      level('Vote & approve', 'Investor', '$1,000', 'The highest listed level of annual support. Helps guide collective grant priorities and approvals.', 'investor', true),
    ],
  }),
  section('band', 'wazi', {
    settings: { split: '8_4' },
    fields: {
      kicker: 'Powered by WAZi',
      title: 'Give, track and vote in one place.',
      body: "Every contribution and installment runs through WAZIImpact.org, our giving platform. Members see what's been credited to the cycle, follow their membership level, and cast votes on preferred projects — all from one account.",
      actions: [link('open the member portal', PATHS.portal.dashboard)],
    },
  }),
  section('video_donate', 'donate', {
    settings: { amounts: [100, 200, 300], default_amount: 200 },
    fields: {
      title: "Your Donation Can Change Someone's Life",
      body: 'we’ve granted more than 120,000 wishes all over the world donations are processed.',
      amount_title: 'Your Donation:',
      custom_label: 'custom',
      cta: link('Donate Now', P.donate),
      video_kicker: 'Video Here to Support',
      video_title: 'We Help Poor This Lifes Service',
      video_body:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro ipsam recusandae aliquam, earum labore itaque molestiae laudantium natus necessitatibus quia fuga. Dolorem quaerat.',
    },
    media: {
      image: img('video_image.webp', 'donate'),
      video: video('https://youtu.be/5q1YBhJA-rU?si=W6ATPvd4KvLUK1yg', ''),
      background: img('donation_video_bg.webp', ''),
    },
  }),
  section('services_slider', 'where_we_sit', {
    fields: { kicker: 'Where we sit', title: 'Affiliated with Impact 100 Global' },
    items: [
      ['01 · Parent', 'USAFI', 'Includes USAFI Impact, its nonprofit arm, and USAFI LLC, its consulting arm.', P.ourModel],
      ['02 · Nonprofit home', 'USAFI Impact', 'The organization within which the Chapter resides, and its fiscal sponsor.', P.donate],
      ['03 · Portfolio', 'Diaspora Engagement Initiative', 'One of USAFI’s four portfolios, shown below.', P.grants],
      ['04 · Flagship', 'Impact 100 African Diaspora Chapter', 'The flagship of the Diaspora Engagement Initiative.', P.join],
    ].map(([kicker, title, body, href], i) => ({
      settings: { href },
      fields: { kicker, title, body },
      media: { icon: img(`category_icon_${i + 1}.webp`, 'category') },
    })),
  }),
  section('logo_strip', 'partners', {
    items: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ media: { logo: img(`brand_img_${n}.webp`, 'Brand') } })),
  }),
  section('campaign_cards', 'campaigns', {
    settings: { status: 'all', limit: 3, display: { collection: 'campaign_display' } },
    fields: { kicker: 'Campaigns', title: 'Join the active campaign' },
    media: { background: img('donation_bg_shapes.webp', 'Donation') },
  }),
  section('counter_band', 'counters', {
    settings: { variant: 'count' },
    media: { background: img('counter_bg.webp', '') },
    items: [
      { settings: { icon: 'projects', value: 2487 }, fields: { label: 'Completer projects' } },
      { settings: { icon: 'team', value: 1247 }, fields: { label: 'Team member' } },
      { settings: { icon: 'reviews', value: 1247 }, fields: { label: 'Clients Review' } },
      { settings: { icon: 'awards', value: 1247 }, fields: { label: 'Wining Awards' } },
    ],
  }),
  section('event_slider', 'events', {
    settings: { source: { collection: 'events' } },
    fields: {
      kicker: 'Upcoming',
      title: 'Gather with us',
      lead: 'Open to members and anyone curious about joining. Most events run in person with a live online option for members across the US.',
    },
  }),
  section('text_marquee', 'values', {
    items: ['authenticity', 'equity', 'legacy', 'diaspora representation'].map((text) => ({ fields: { text } })),
  }),
  section('cta_band', 'volunteer_cta', {
    fields: {
      title: 'Join Us as a Volunteer',
      body: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which.',
      cta: link('Join Volunteer', P.volunteers),
    },
    media: { background: img('become_volanteer_bg.webp', '') },
  }),
  section('testimonials', 'testimonials', {
    settings: { layout: 'slider', source: { collection: 'testimonials', limit: 3 } },
    fields: { kicker: 'Testimonial', title: 'Our Customer Reviews' },
  }),
  section('people', 'volunteers', {
    settings: { layout: 'slider', source: { collection: 'volunteers', keys: HOME_VOLUNTEER_KEYS } },
    fields: { kicker: 'Our Volunteers', title: 'Dedicated volunteers who always support us' },
    media: { background: img('volunteer_bg.webp', '') },
  }),
  section('faq', 'faq', {
    settings: { layout: 'with_image', source: { collection: 'faqs' } },
    fields: { kicker: "FAQ's", title: 'Common Queries: Your Questions Answered' },
    media: { image: img('faq_img.webp', 'faq_img') },
  }),
  section('news_list', 'news', {
    settings: { layout: 'home', source: { collection: 'news', limit: 3 } },
    fields: { kicker: 'Latest News', title: 'Hub Insights: Explore Our Latest News' },
  }),
]);

