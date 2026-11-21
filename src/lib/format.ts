// Locale-aware formatting of business values (money from cents, ISO dates). Pure functions.

/** 7184000 → "$71,840" (whole dollars when there are no cents, as the design shows). */
export function formatMoney(cents: number, locale: string, currency = 'USD'): string {
  const fractionDigits = cents % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(cents / 100);
}

/** "2026-10-01" → "Oct 1, 2026" (en). Read as a calendar date, never shifted by time zone. */
export function formatDate(isoDate: string, locale: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/** "2026-10-14" → "October 14, 2026" (en): the long form the receipts and cancel page use. */
export function formatLongDate(isoDate: string, locale: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  );
}

/** "03-31" (a cycle boundary, MM-DD) → "March 31" (en). */
export function formatMonthDay(monthDay: string, locale: string): string {
  const [month, day] = monthDay.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, month - 1, day)));
}
