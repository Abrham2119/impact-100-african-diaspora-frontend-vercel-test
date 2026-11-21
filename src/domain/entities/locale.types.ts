// Content locale (CONTENT_AND_I18N.md §2/§3). Enabled locales are configured in admin.
export type TextDirection = 'ltr' | 'rtl';

export interface Locale {
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
  direction: TextDirection;
  /** next locale in the fallback chain; the default locale ends the chain */
  fallbackCode: string | null;
}
