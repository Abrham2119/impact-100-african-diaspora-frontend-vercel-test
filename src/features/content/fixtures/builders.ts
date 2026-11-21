import type {
  ButtonVariantDto,
  EntryCardDto,
  FieldsDto,
  JsonValue,
  LinkValueDto,
  LocalizedValue,
  MediaDto,
  MediaFieldsDto,
  PageTreeDto,
  RichBlock,
  RichInline,
  RichText,
  SectionDto,
  SectionItemDto,
  SettingsDto,
  UiBundleDto,
} from '@/types/content.dto';

// Helpers that build content fixtures in the EXACT wire shape of the content API (backend
// ARCHITECTURE §8.4): every translatable value is a LocalizedValue, every image a MEDIA object.
// Fixture files stay readable (plain strings in, DTOs out) and contentService treats them
// exactly like an API response. Images resolve to the bundled files in src/assets/images.

const IMAGE_URLS = import.meta.glob<string>('../../../assets/images/*.{webp,svg,png,jpg}', {
  eager: true,
  import: 'default',
});

export function imageUrl(file: string): string {
  const url = IMAGE_URLS[`../../../assets/images/${file}`];
  if (url === undefined) throw new Error(`[content fixtures] missing image src/assets/images/${file}`);
  return url;
}

export function createBuilders(locale: string) {
  const lv = <T>(value: T): LocalizedValue<T> => ({ value, resolved_locale: locale, is_fallback: false });

  const media = (kind: MediaDto['kind'], id: string, url: string, alt: string, externalUrl: string | null = null): MediaDto => ({
    id,
    kind,
    url,
    external_url: externalUrl,
    width: null,
    height: null,
    focal: null,
    alt: lv(alt),
    poster: null,
    tracks: [],
    resolved_locale: locale,
    is_fallback: false,
  });

  /** An image from src/assets/images (the design's copy) with its alt text. */
  const img = (file: string, alt: string): MediaDto => media('IMAGE', `img:${file}`, imageUrl(file), alt);

  /** An external video (YouTube/Vimeo); `url` is the thumbnail when given. */
  const video = (externalUrl: string, alt: string, thumbnailFile?: string): MediaDto =>
    media('VIDEO', `video:${externalUrl}`, thumbnailFile ? imageUrl(thumbnailFile) : '', alt, externalUrl);

  const link = (label: string, href: string, variant?: ButtonVariantDto): LinkValueDto =>
    variant ? { label, href, variant } : { label, href };

  type FieldInput = string | RichText | LinkValueDto | LinkValueDto[] | undefined;

  const fields = (input: Record<string, FieldInput> = {}): FieldsDto => {
    const out: FieldsDto = {};
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) continue;
      out[key] = lv(value) as FieldsDto[string];
    }
    return out;
  };

  interface NodeInput {
    type?: string;
    settings?: Record<string, JsonValue | undefined>;
    fields?: Record<string, FieldInput>;
    media?: Record<string, MediaDto | MediaDto[] | undefined>;
    items?: NodeInput[];
  }

  const settings = (input: NodeInput['settings'] = {}): SettingsDto => {
    const out: SettingsDto = {};
    for (const [key, value] of Object.entries(input)) if (value !== undefined) out[key] = value;
    return out;
  };

  const mediaFields = (input: NodeInput['media'] = {}): MediaFieldsDto => {
    const out: MediaFieldsDto = {};
    for (const [key, value] of Object.entries(input)) if (value !== undefined) out[key] = value;
    return out;
  };

  const node = (input: NodeInput, id: string): SectionItemDto => ({
    id,
    type: input.type ?? null,
    settings: settings(input.settings),
    fields: fields(input.fields),
    media: mediaFields(input.media),
    items: (input.items ?? []).map((child, i) => node(child, `${id}.${i + 1}`)),
  });

  /** A page section; `key` is its stable anchor within the page. */
  const section = (type: string, key: string, input: Omit<NodeInput, 'type'> = {}): SectionDto => ({
    ...node(input, key),
    key,
    type,
  });

  const page = (
    key: string,
    path: string,
    seo: { title: string; description?: string },
    sections: SectionDto[],
  ): PageTreeDto => ({
    page: {
      key,
      layout: 'PUBLIC',
      version_no: 1,
      requested_locale: locale,
      direction: 'ltr',
      seo: { title: lv(seo.title), description: seo.description ? lv(seo.description) : null, image: null },
      alternates: [{ locale, path }],
      sections,
    },
    meta: { settings_version: 'v1.0', fallback_fields: 0 },
  });

  const entry = (
    key: string,
    input: Omit<NodeInput, 'type' | 'settings'> & { slug?: string; data?: Record<string, JsonValue | undefined> },
  ): EntryCardDto => ({
    key,
    slug: input.slug ?? null,
    fields: fields(input.fields),
    media: mediaFields(input.media),
    data: settings(input.data),
    ...(input.items ? { items: input.items.map((child, i) => node(child, `${key}.${i + 1}`)) } : {}),
  });

  /** UiStrings namespace: `{ key: text }` → `{ key: LocalizedValue }`. */
  const uiBundle = (strings: Record<string, string>): UiBundleDto => {
    const out: UiBundleDto = {};
    for (const [key, value] of Object.entries(strings)) out[key] = lv(value);
    return out;
  };

  return { lv, img, video, link, section, page, entry, uiBundle };
}

// ---- rich text (locale-independent AST builders) --------------------------------------------
type InlineInput = string | RichInline;
const inline = (part: InlineInput): RichInline => (typeof part === 'string' ? { type: 'text', text: part } : part);

export const rich = {
  b: (text: string): RichInline => ({ type: 'text', text, marks: ['strong'] }),
  br: (): RichInline => ({ type: 'break' }),
  p: (...parts: InlineInput[]): RichBlock => ({ type: 'paragraph', children: parts.map(inline) }),
  ul: (...items: InlineInput[][]): RichBlock => ({ type: 'list', ordered: false, items: items.map((parts) => parts.map(inline)) }),
  table: (head: string[], rows: string[][]): RichBlock => ({
    type: 'table',
    head: head.map((cell) => [inline(cell)]),
    rows: rows.map((row) => row.map((cell) => [inline(cell)])),
  }),
  note: (...parts: InlineInput[]): RichBlock => ({ type: 'note', children: parts.map(inline) }),
};

/** One paragraph of plain text. */
export const para = (text: string): RichText => [rich.p(text)];
/** A plain bullet list. */
export const bullets = (...items: string[]): RichText => [rich.ul(...items.map((text) => [text]))];
