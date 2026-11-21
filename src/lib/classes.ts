// Exact design class strings (ARCHITECTURE.md §3, §5.1).
// Design components must emit the snapshot's class names verbatim. `cx` joins the
// truthy parts in order, so `cx('ix_chip', on && 'ix_on')` reproduces the design's
// `'ix_chip' + (on ? ' ix_on' : '')`. Returns undefined for an empty result so React
// omits the attribute instead of rendering class="".
export type ClassValue = string | false | null | undefined | 0;

export function cx(...values: ClassValue[]): string | undefined {
  const joined = values.filter(Boolean).join(' ');
  return joined === '' ? undefined : joined;
}
