import { PATHS } from '@/app/routes/paths';
import { img, link, page, section } from '../build';
import { banner } from './banner';

// GET content/pages/about — design-reference/pages/about_us.dc.html, copy verbatim.
const P = PATHS.public;

export const aboutEn = page('about', P.about, { title: 'Impact100 — About us' }, [
  banner('About Us', ['About Us']),
  section('about_block', 'about', {
    fields: {
      kicker: 'About the Chapter',
      title: 'A giving circle for the diaspora, rooted in Africa.',
      body: 'Impact 100 African Diaspora is a chapter affiliated with Impact 100 Global, built for Africans living in the United States and the allies who stand with them. We pool contributions each campaign cycle and direct them, together, to high-impact organizations in Sub-Saharan Africa doing work their own communities have asked for.',
      founder_name: 'Dr. Carmen Ward-Sullivan',
      founder_role: 'Impact 100 ADC Chair',
      founder_cta: link('become a member', P.join),
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
  section('counter_band', 'portfolios', {
    settings: { variant: 'portfolio', source: { collection: 'portfolios' } },
    fields: { kicker: 'USAFI portfolios & flagships', title: 'Delivered through USAFI’s African regional hubs' },
    media: { background: img('counter_bg.webp', '') },
  }),
  section('text_marquee', 'values', {
    items: ['authenticity', 'equity', 'legacy', 'diaspora representation'].map((text) => ({ fields: { text } })),
  }),
  section('cta_band', 'sponsors', {
    fields: {
      kicker: 'Sponsors & matching funds',
      title: 'Multiply what the diaspora gives.',
      body: 'We work with philanthropic allies, corporate partners and community groups on sponsorships and matching funds that grow each cycle’s grant pool.',
      cta: link('Become a sponsor or match gifts', `${P.contact}?topic=sponsorship`),
    },
    media: { background: img('become_volanteer_bg.webp', '') },
  }),
  section('people', 'leadership', {
    settings: { layout: 'slider', source: { collection: 'leadership' } },
    fields: {
      kicker: 'Chapter leadership',
      title: 'Our leadership structure is evolving',
      lead: 'Advisory meetings held monthly. The Co-Chairs provide overall leadership and direction, serve as the primary liaison with Impact 100 Global and USAFI, and keep the Chapter aligned with its values.',
    },
    media: { background: img('volunteer_bg.webp', '') },
  }),
  section('faq', 'committees', {
    settings: { layout: 'with_image', source: { collection: 'committees' } },
    fields: { kicker: 'Committees', title: 'Members are welcome to volunteer' },
    media: { image: img('faq_img.webp', 'faq_img') },
  }),
]);
