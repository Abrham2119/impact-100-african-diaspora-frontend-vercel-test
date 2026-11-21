// Shared validation rules of the design's forms (join / volunteer / donate .dc.html), used by the
// zod schemas so every form checks the same way the design does.

/** design: /^[^@\s]+@[^@\s]+\.[^@\s]+$/ */
export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/** names need at least 2 characters (trimmed) */
export const NAME_MIN_LENGTH = 2;
/** contact message and story body: 10–5,000 characters (backend §4.6) */
export const LONG_TEXT_MIN = 10;
export const LONG_TEXT_MAX = 5000;

export const isEmail = (value: string): boolean => EMAIL_PATTERN.test(value.trim());
export const isName = (value: string): boolean => value.trim().length >= NAME_MIN_LENGTH;
