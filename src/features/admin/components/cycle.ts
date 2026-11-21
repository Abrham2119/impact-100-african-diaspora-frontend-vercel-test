/** "2026-27" → "2026–27" (campaign slug → cycle label, with the design's en dash). */
export const cycleOf = (slug: string) => slug.replace('-', '–');
