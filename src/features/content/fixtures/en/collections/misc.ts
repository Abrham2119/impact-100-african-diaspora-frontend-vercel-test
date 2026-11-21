import { entry, img, video } from '../build';

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

// C:portfolios — USAFI's four funding portfolios (about_us.dc.html counter band; later grants/donate).
export const portfoliosEn = [
  entry('diaspora-engagement', { fields: { name: 'Diaspora Engagement', flagship: 'Flagship: Impact 100' }, data: { icon: 'projects' } }),
  entry('academic-partnerships', { fields: { name: 'Academic Partnerships', flagship: 'Flagship: Victoria Falls Summit' }, data: { icon: 'team' } }),
  entry('youth-women-entrepreneurship', { fields: { name: 'Youth & Women Entrepreneurship', flagship: 'Flagship: To be announced' }, data: { icon: 'reviews' } }),
  entry('sustainable-development', { fields: { name: 'Sustainable Development', flagship: 'Flagship: THRIVE Africa Network projects' }, data: { icon: 'awards' } }),
];

// C:news — the 4 stories of /news (blogs.dc.html). Home "Latest News" shows the latest 3 (decision of Step 5).
const N: Array<[slug: string, image: string, date: string, published: string, category: string, title: string, excerpt: string]> = [
  ['2026-27-campaign-cycle-is-open', 'blog_img_7.webp', 'Oct 1, 2026', '2026-10-01', 'Campaign', 'The 2026–27 campaign cycle is open', 'Memberships from $250 to $1,000 can now be pledged through WAZIImpact.org, in full or in installments until March 31.'],
  ['chapter-charter-released-for-discussion', 'blog_img_8.webp', 'Sep 2026', '2026-09-15', 'Governance', 'Chapter charter released for discussion', 'The discussion draft sets out our purpose, contribution-based membership, and how decisions are made.'],
  ['why-usafi-impact-hosts-our-chapter', 'blog_img_9.webp', 'Sep 2026', '2026-09-01', 'Partners', 'Why USAFI Impact hosts our Chapter', 'Our host organization keeps every grant compliant, verified and accountable.'],
  ['report-update-building-the-chapter', 'blog_img_1.webp', 'Aug 21, 2026', '2026-08-21', 'Report', 'Report & update: building the Chapter', 'The WAZI app is live, advisory meetings now run monthly, and leadership is taking shape around two Co-Chairs and a set of committees.'],
];
export const newsEn = N.map(([slug, image, date_label, published_on, category, title, excerpt]) =>
  entry(slug, { slug, fields: { title, excerpt, date_label, category }, media: { image: img(image, 'blog') }, data: { published_on } }),
);

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

// C:campaign_display — the card image of each membership campaign, keyed by campaign slug.
export const campaignDisplayEn = [
  entry('2026-27', { media: { image: img('donate_card_img_1.webp', '2026–27 Campaign · Oct 1, 2026 – Mar 31, 2027') } }),
  entry('2025-26', { media: { image: img('donate_card_img_2.webp', '2025–26 Campaign · Oct 1, 2025 – Mar 31, 2026') } }),
  entry('2024-25', { media: { image: img('donate_card_img_3.webp', '2024–25 Campaign · Oct 1, 2024 – Mar 31, 2025') } }),
];
