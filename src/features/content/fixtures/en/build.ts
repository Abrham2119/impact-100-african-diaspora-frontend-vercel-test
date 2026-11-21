import { createBuilders } from '../builders';

// English fixture builders (the default locale). Other locales get their own folder with the
// same keys; until then the server-style fallback in contentService serves English.
export const { lv, img, video, link, section, page, entry, uiBundle } = createBuilders('en');
