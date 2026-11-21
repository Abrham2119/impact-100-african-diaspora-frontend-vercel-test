import type { Locale } from '@/domain/entities/locale.types';

// Enabled locales (seed of `GET content/locales`). English is the default and, until the
// client confirms the launch languages (backend Q1), the only enabled locale. The template's
// sample list (Japanese, Korean, Chinese, Urdu) is not a decision (CONTENT_AND_I18N.md §3).
export const localesFixture: Locale[] = [
  { code: 'en', name: 'English', nativeName: 'English', isDefault: true, direction: 'ltr', fallbackCode: null },
];
