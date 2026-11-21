import type {
  CmsCollectionPage,
  CmsEntry,
  CmsFieldValue,
  CmsLink,
  CmsMedia,
  CmsNode,
  CmsPageTree,
  CmsSectionNode,
  CmsSettingValue,
} from '@/domain/entities/content.types';
import type {
  EntryCardDto,
  FieldsDto,
  JsonValue,
  LinkValueDto,
  MediaDto,
  MediaFieldsDto,
  PageTreeDto,
  PaginatedDto,
  SectionDto,
  SectionItemDto,
  SettingsDto,
  UiBundleDto,
} from '@/types/content.dto';

// Content API DTOs (snake_case, LocalizedValue-wrapped) → framework-free domain values.
// Used by contentService for both sources (fixtures today, the API from Step 13), so the
// components never see wire shapes. Fallback flags are kept per node (`fallbackFields`).

const EXTERNAL = /^(https?:|mailto:|tel:)/;

export function mapLink(dto: LinkValueDto): CmsLink {
  return {
    label: dto.label,
    href: dto.href,
    external: dto.external ?? EXTERNAL.test(dto.href),
    variant: dto.variant ?? 'default',
  };
}

export function mapMedia(dto: MediaDto): CmsMedia {
  return {
    id: dto.id,
    kind: dto.kind,
    url: dto.url,
    externalUrl: dto.external_url,
    width: dto.width,
    height: dto.height,
    focal: dto.focal,
    alt: dto.alt?.value ?? '',
    posterUrl: dto.poster?.url ?? null,
  };
}

const isLinkValue = (value: unknown): value is LinkValueDto =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && 'href' in value;

/** A field value is text, a rich-text AST (array of blocks), a link or a link list. */
function mapFieldValue(value: FieldsDto[string]['value']): CmsFieldValue {
  if (typeof value === 'string') return value;
  if (isLinkValue(value)) return mapLink(value);
  if (value.length > 0 && isLinkValue(value[0])) return (value as LinkValueDto[]).map(mapLink);
  return value as CmsFieldValue;
}

function mapFields(fields: FieldsDto): { fields: Record<string, CmsFieldValue>; fallbackFields: string[] } {
  const out: Record<string, CmsFieldValue> = {};
  const fallbackFields: string[] = [];
  for (const [key, lv] of Object.entries(fields)) {
    out[key] = mapFieldValue(lv.value);
    if (lv.is_fallback) fallbackFields.push(key);
  }
  return { fields: out, fallbackFields };
}

function mapMediaFields(media: MediaFieldsDto): Record<string, CmsMedia | CmsMedia[]> {
  const out: Record<string, CmsMedia | CmsMedia[]> = {};
  for (const [key, value] of Object.entries(media)) out[key] = Array.isArray(value) ? value.map(mapMedia) : mapMedia(value);
  return out;
}

const mapSetting = (value: JsonValue): CmsSettingValue => value;

function mapSettings(settings: SettingsDto): Record<string, CmsSettingValue> {
  const out: Record<string, CmsSettingValue> = {};
  for (const [key, value] of Object.entries(settings)) out[key] = mapSetting(value);
  return out;
}

export function mapNode(dto: SectionItemDto): CmsNode {
  return {
    id: dto.id,
    type: dto.type,
    settings: mapSettings(dto.settings),
    ...mapFields(dto.fields),
    media: mapMediaFields(dto.media),
    items: dto.items.map(mapNode),
  };
}

function mapSection(dto: SectionDto): CmsSectionNode {
  return { ...mapNode({ ...dto, type: dto.type }), type: dto.type, key: dto.key };
}

export function mapPageTree(dto: PageTreeDto): CmsPageTree {
  const { page } = dto;
  return {
    key: page.key,
    direction: page.direction,
    seo: {
      title: page.seo.title?.value ?? null,
      description: page.seo.description?.value ?? null,
      image: page.seo.image ? mapMedia(page.seo.image) : null,
    },
    alternates: page.alternates,
    sections: page.sections.map(mapSection),
  };
}

export function mapEntry(dto: EntryCardDto): CmsEntry {
  return {
    key: dto.key,
    slug: dto.slug,
    fields: mapFields(dto.fields).fields,
    media: mapMediaFields(dto.media),
    data: mapSettings(dto.data),
    items: (dto.items ?? []).map(mapNode),
  };
}

export function mapCollectionPage(dto: PaginatedDto<EntryCardDto>): CmsCollectionPage {
  return { entries: dto.data.map(mapEntry), page: dto.page, totalPages: dto.total_pages, total: dto.total };
}

export function mapUiBundle(dto: UiBundleDto): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, lv] of Object.entries(dto)) out[key] = lv.value;
  return out;
}
