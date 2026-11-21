import { rich } from '../../builders';
import { entry, img, link, video } from '../build';
import { campaignDescriptionEn } from '../rich/campaignDescription';
import { newsBodyAfterQuoteEn, newsBodyBeforeQuoteEn } from '../rich/detailBodies';

// Small collections of the public pages A, copied verbatim from the design-reference pages.

// C:campaign_categories — home "Browse by Category" (template sample content, backend Q16).
const CAT: Array<[image: string, name: string]> = [
  ['categori_img_1.webp', 'Education'],
  ['categori_img_2.webp', 'Medical Help'],
  ['categori_img_3.webp', 'Environment'],
  ['categori_img_4.webp', 'Healthy Foods'],
  ['categori_img_5.webp', 'Financial Support'],
  ['categori_img_6.webp', 'Cancer Treatment'],
  ['categori_img_7.webp', 'Home benefits'],
];
export const campaignCategoriesEn = CAT.map(([image, name]) =>
  entry(name.toLowerCase().replace(/\s+/g, '-'), { slug: name.toLowerCase().replace(/\s+/g, '-'), fields: { name }, media: { image: img(image, 'category') } }),
);

// C:portfolios — USAFI's four funding portfolios (about_us counter band, donate, grants cards).
// `flagship` is the bare name; "Flagship: …" is UiStrings `site.portfolio.flagship`.
const focus = (text: string) => [rich.p(`${text} Hub focus: `, rich.b('{hub}'), '.')];
const volunteerFor = (label: string) => link(label, '/volunteer?area=usafi');
export const portfoliosEn = [
  entry('diaspora-engagement', {
    fields: { name: 'Diaspora Engagement', flagship: 'Impact 100', focus: focus('Flagship of diaspora engagement.'), volunteer_link: volunteerFor('Volunteer for Impact 100 →') },
    data: { icon: 'projects' },
  }),
  entry('academic-partnerships', {
    fields: { name: 'Academic Partnerships', flagship: 'Victoria Falls Summit', focus: focus('Flagship of academic partnerships.'), volunteer_link: volunteerFor('Volunteer for Victoria Falls Summit →') },
    data: { icon: 'team' },
  }),
  entry('youth-women-entrepreneurship', {
    fields: { name: 'Youth & Women Entrepreneurship', flagship: 'To be announced', focus: focus('Flagship of youth & women entrepreneurship.'), volunteer_link: volunteerFor('Volunteer for this portfolio →') },
    data: { icon: 'reviews' },
  }),
  entry('sustainable-development', {
    fields: { name: 'Sustainable Development', flagship: 'THRIVE Africa Network projects', focus: focus('Flagship of sustainable development.'), volunteer_link: volunteerFor('Volunteer for THRIVE Africa Network projects →') },
    data: { icon: 'awards' },
  }),
];

// C:news — the 4 stories of /news (blogs.dc.html). Home "Latest News" shows the latest 3 (decision of Step 5).
const N: Array<[slug: string, image: string, date: string, published: string, category: string, title: string, excerpt: string]> = [
  ['2026-27-campaign-cycle-is-open', 'blog_img_7.webp', 'Oct 1, 2026', '2026-10-01', 'Campaign', 'The 2026–27 campaign cycle is open', 'Memberships from $250 to $1,000 can now be pledged through WAZIImpact.org, in full or in installments until March 31.'],
  ['chapter-charter-released-for-discussion', 'blog_img_8.webp', 'Sep 2026', '2026-09-15', 'Governance', 'Chapter charter released for discussion', 'The discussion draft sets out our purpose, contribution-based membership, and how decisions are made.'],
  ['why-usafi-impact-hosts-our-chapter', 'blog_img_9.webp', 'Sep 2026', '2026-09-01', 'Partners', 'Why USAFI Impact hosts our Chapter', 'Our host organization keeps every grant compliant, verified and accountable.'],
  ['report-update-building-the-chapter', 'blog_img_1.webp', 'Aug 21, 2026', '2026-08-21', 'Report', 'Report & update: building the Chapter', 'The WAZI app is live, advisory meetings now run monthly, and leadership is taking shape around two Co-Chairs and a set of committees.'],
];
// The detail page's body, quote, tags and author box are template sample copy (blog_details.dc.html,
// FQ8): the same for every story until the CMS has the real articles.
const SAMPLE_ARTICLE = {
  body_before: newsBodyBeforeQuoteEn,
  quote:
    'Donec sollicitudin eros porta lacinia feugiat. Donec et venenatis quam. Sed eu velit non purus imperdiet sagittis a nunc. Phasellus eu euismod Intege erra pellentesque luctusurna tempus id feugiat nec porta ac quam.',
  quote_author: 'Dominic L. Ement',
  body_after: newsBodyAfterQuoteEn,
  tags: ['Course', 'Education', 'Learn', 'Online'].map((tag) => link(tag, '#')),
  author_name: 'Ravi O\'Leigh',
  author_role: 'Digital Marketing',
  author_bio: 'Sed mi leo, accumsan vel ante at, viverra placerat nulla. Donec pharetra rutrum sed allium lectus fermentum enim Nam maximus.',
  author_links: ['Facebook', 'LinkedIn', 'Twitter', 'Pinterest'].map((network) => link(network, '#')),
};
export const newsEn = N.map(([slug, image, date_label, published_on, category, title, excerpt]) =>
  entry(slug, {
    slug,
    fields: { title, excerpt, date_label, category, ...SAMPLE_ARTICLE },
    media: {
      image: img(image, 'blog'),
      detail_image: img('blog_details_img.webp', 'Blog'),
      author_photo: img('blog_details_author_img.webp', 'Author'),
    },
    data: { published_on },
  }),
);

// C:blog_comments — the sample comments of blog_details.dc.html (there is no comments API yet).
const COMMENT =
  'Nulla a ipsum nibh. Fusce purus elit, tristique vitae enim sed, auctor placerat est. Maecenas consequat nibh consequat malesuada fringilla, mauris lorem dapibus metus, non imperdiet nunc erat ultricies est. Praesent ames nec lorem sit amet leo consequat.';
export const blogCommentsEn = (
  [
    ['comment_img_1.webp', "Ravi O'Leigh"],
    ['comment_img_2.webp', 'Doug Lyphe'],
    ['comment_img_2.webp', 'Doug Lyphe'],
  ] as const
).map(([image, name], i) =>
  entry(`comment-${i + 1}`, { fields: { name, date_label: 'June 25, 2025 at 08:45 pm', text: COMMENT }, media: { avatar: img(image, 'Comments') } }),
);

// C:us_hubs — the five US regional hubs (hubs.dc.html `H`).
export const usHubsEn = (
  [
    ['northern-california', 'Northern California', 'LIVE', 'ok'],
    ['southern-california', 'Southern California', 'LAUNCHING', 'warn'],
    ['atlanta', 'Atlanta', 'LAUNCHING · Dec 2026', 'warn'],
    ['dmv', 'DMV', 'LAUNCHING · Mar 2027', 'warn'],
    ['fifth-us-hub', 'Fifth US hub', 'PLANNED', 'info'],
  ] as const
).map(([key, name, status, badge_kind]) => entry(key, { fields: { name, status }, data: { badge_kind } }));

// C:donors — /about/donors (template sample, backend Q10). 30 per page, "01 02 03" → 90 seeded.
const D: Array<[name: string, cents: number]> = [
  ['Aretha Barrett', 95000],
  ['Tasnim Tabassum', 29000],
  ['Dieter Maldonadon', 50000],
];
export const donorsEn = Array.from({ length: 90 }, (_, i) => {
  const [name, amount_cents] = D[i % 3];
  return entry(`donor-${i + 1}`, { fields: { name, location: 'california, USA' }, data: { amount_cents } });
});

// C:photos and C:videos — the galleries (9 per page, "01 02 03" → 27 seeded; template sample).
const GALLERY = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `gallery_img_${n}.webp`);
export const photosEn = Array.from({ length: 27 }, (_, i) => entry(`photo-${i + 1}`, { media: { image: img(GALLERY[i % 9], 'gallery1') } }));

const VIDEO_URL = 'https://youtu.be/5q1YBhJA-rU?si=W6ATPvd4KvLUK1yg';
const VIDEO_THUMBS = [...GALLERY].reverse();
export const videosEn = Array.from({ length: 27 }, (_, i) =>
  entry(`video-${i + 1}`, { media: { thumbnail: video(VIDEO_URL, 'gallery1', VIDEO_THUMBS[i % 9]) }, data: { url: VIDEO_URL } }),
);

// C:campaign_display — the display data of each membership campaign, keyed by campaign slug: the
// card image, the detail gallery (campaign_details.dc.html `IMG`), description and video (sample).
const GALLERY_IMAGES = [1, 2, 3, 4, 5, 6, 7].map((n) => img(`donate_card_img_${n}.webp`, 'Product'));
const CAMPAIGN_VIDEO = 'https://www.youtube.com/watch?v=bjxTIcuzB6k';
const display = (slug: string, image: string, alt: string) =>
  entry(slug, {
    media: { image: img(image, alt), gallery: GALLERY_IMAGES },
    fields: { description: campaignDescriptionEn },
    data: { video_url: CAMPAIGN_VIDEO },
  });
export const campaignDisplayEn = [
  display('2026-27', 'donate_card_img_1.webp', '2026–27 Campaign · Oct 1, 2026 – Mar 31, 2027'),
  display('2025-26', 'donate_card_img_2.webp', '2025–26 Campaign · Oct 1, 2025 – Mar 31, 2026'),
  display('2024-25', 'donate_card_img_3.webp', '2024–25 Campaign · Oct 1, 2024 – Mar 31, 2025'),
];
