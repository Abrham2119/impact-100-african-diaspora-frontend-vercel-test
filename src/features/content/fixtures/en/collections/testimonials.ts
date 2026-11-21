import { entry, img } from '../build';

// C:testimonials — home slider (first 3) and /about/testimonials (6 per page). Template sample
// content copied verbatim (testimonial.dc.html); seeded three times for the "01 02 03" pages (FQ8).
const QUOTE =
  'Metus vulputate eu scelerisque felis imperdiet. At in tellus integer feugiat scelerisque varius morbi enim nunc. Eu nisl nunc mi ipsum faucibus. Vel facilisis volutpat est velit egestas dui. Orci porta non pulvinar neque laoreet.';
const NAMES = ['Norman Gordon', 'Parsley Monta', 'Norman Gordon', 'Norman Gordon', 'Parsley Monta', 'Norman Gordon'];

export const testimonialsEn = [0, 1, 2].flatMap((round) =>
  NAMES.map((name, i) =>
    entry(`testimonial-${round * NAMES.length + i + 1}`, {
      fields: { name, role: 'Traveler', quote: QUOTE },
      media: { avatar: img('author_img.webp', 'author') },
      data: { rating: 5 },
    }),
  ),
);
