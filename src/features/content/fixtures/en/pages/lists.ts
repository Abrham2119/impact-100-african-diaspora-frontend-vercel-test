import { PATHS } from '@/app/routes/paths';
import { page, section } from '../build';
import { banner } from './banner';

// The paged collection pages of the About menu — each is its banner plus one data-bound section
// (design-reference/pages/{volunteers,testimonial,donot_list,photo_gallery,video_gallery,faq}.dc.html).
const P = PATHS.public;

export const volunteersPageEn = page('volunteers', P.volunteers, { title: 'Impact100 — Volunteers' }, [
  banner('Volunteers', ['Volunteers']),
  section('people', 'volunteers', {
    settings: { layout: 'grid', source: { collection: 'volunteers', limit: 12, paginate: true } },
  }),
]);

export const testimonialsPageEn = page('testimonials', P.testimonials, { title: 'Impact100 — Testimonial' }, [
  banner('testimonial', ['testimonial']),
  section('testimonials', 'testimonials', {
    settings: { layout: 'grid', source: { collection: 'testimonials', limit: 6, paginate: true } },
  }),
]);

export const donorsPageEn = page('donors', P.donors, { title: 'Impact100 — Donor list' }, [
  banner('donor list', ['donor list']),
  section('donor_list', 'donors', { settings: { source: { collection: 'donors', limit: 30, paginate: true } } }),
]);

export const photosPageEn = page('gallery_photos', P.photoGallery, { title: 'Impact100 — Photo gallery' }, [
  banner('photo gallery', ['photo gallery']),
  section('photo_gallery', 'photos', { settings: { source: { collection: 'photos', limit: 9, paginate: true } } }),
]);

export const videosPageEn = page('gallery_videos', P.videoGallery, { title: 'Impact100 — Video gallery' }, [
  banner('video gallery', ['video gallery']),
  section('video_gallery', 'videos', { settings: { source: { collection: 'videos', limit: 9, paginate: true } } }),
]);

export const faqPageEn = page('faq', P.faq, { title: 'Impact100 — FAQ' }, [
  banner('frequently asked questions', ["FAQ's"]),
  section('faq', 'faq', { settings: { layout: 'page', source: { collection: 'faqs' } } }),
]);
