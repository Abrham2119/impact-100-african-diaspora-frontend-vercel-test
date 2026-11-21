import { z } from 'zod';
import type { CmsLink, CmsMedia, RichBlock, RichInline, RichText } from '@/domain/entities/content.types';

// Field DSL for CMS section types (ARCHITECTURE.md §7.1, refined in Step 5).
// A section type is declared ONCE (schemas/sectionTypes.ts) with these descriptors; from that
// single declaration we get
//   • the TypeScript types of the section (inference, no codegen),
//   • the Zod validator applied to every section at render time,
//   • the JSON Schema exported for the backend Joi registry (npm run export:content-schemas).
//
// Where values live in the API payload (backend §8.4):
//   fields   → translatable text / rich text / links (LocalizedValue on the wire)
//   media    → images, videos, galleries (MEDIA on the wire)
//   settings → non-translatable typed values (numbers, toggles, enums, collection sources)

type JsonSchema = Record<string, unknown>;

export interface FieldDesc<T, Optional extends boolean = false> {
  kind: string;
  optional: Optional;
  zod: z.ZodType<T, z.ZodTypeDef, unknown>;
  json: JsonSchema;
}

type AnyDesc = FieldDesc<unknown, boolean>;
export type DescMap = Record<string, AnyDesc>;

/** Marks a descriptor optional (absent in the payload is valid). */
export function optional<T>(desc: FieldDesc<T>): FieldDesc<T | undefined, true> {
  return { ...desc, optional: true, zod: desc.zod.optional() as z.ZodType<T | undefined, z.ZodTypeDef, unknown> };
}

// ---- domain validators shared by the descriptors ------------------------------------------
const richInline: z.ZodType<RichInline> = z.lazy(() =>
  z.union([
    z.object({ type: z.literal('text'), text: z.string(), marks: z.array(z.enum(['strong', 'em'])).optional() }),
    z.object({ type: z.literal('link'), href: z.string(), children: z.array(richInline) }),
    z.object({ type: z.literal('break') }),
  ]),
);
const inlines = z.array(richInline);
const richBlock: z.ZodType<RichBlock> = z.union([
  z.object({ type: z.literal('paragraph'), children: inlines }),
  z.object({ type: z.literal('heading'), level: z.union([z.literal(3), z.literal(4)]), children: inlines }),
  z.object({ type: z.literal('list'), ordered: z.boolean(), items: z.array(inlines) }),
  z.object({ type: z.literal('table'), head: z.array(inlines), rows: z.array(z.array(inlines)) }),
  z.object({ type: z.literal('note'), children: inlines }),
]);
export const richTextSchema: z.ZodType<RichText> = z.array(richBlock);

export const cmsLinkSchema: z.ZodType<CmsLink> = z.object({
  label: z.string(),
  href: z.string(),
  external: z.boolean(),
  variant: z.enum(['default', 'dark', 'ghost', 'ghost_light']),
});

export const cmsMediaSchema: z.ZodType<CmsMedia> = z.object({
  id: z.string(),
  kind: z.enum(['IMAGE', 'VIDEO', 'FILE']),
  url: z.string(),
  externalUrl: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  focal: z.object({ x: z.number(), y: z.number() }).nullable(),
  alt: z.string(),
  posterUrl: z.string().nullable(),
});

const REF = (name: string): JsonSchema => ({ $ref: `#/definitions/${name}` });

/** Translatable fields (`fields` in the payload). */
export const f = {
  text: (): FieldDesc<string> => ({ kind: 'text', optional: false, zod: z.string(), json: REF('LocalizedText') }),
  rich: (): FieldDesc<RichText> => ({ kind: 'rich_text', optional: false, zod: richTextSchema, json: REF('LocalizedRichText') }),
  link: (): FieldDesc<CmsLink> => ({ kind: 'link', optional: false, zod: cmsLinkSchema, json: REF('LocalizedLink') }),
  /** an ordered button row */
  links: (): FieldDesc<CmsLink[]> => ({
    kind: 'link_list',
    optional: false,
    zod: z.array(cmsLinkSchema),
    json: REF('LocalizedLinkList'),
  }),
};

/** Media fields (`media` in the payload). */
export const m = {
  image: (): FieldDesc<CmsMedia> => ({ kind: 'media', optional: false, zod: cmsMediaSchema, json: REF('Media') }),
  video: (): FieldDesc<CmsMedia> => ({ kind: 'video', optional: false, zod: cmsMediaSchema, json: REF('Media') }),
  list: (): FieldDesc<CmsMedia[]> => ({
    kind: 'media_list',
    optional: false,
    zod: z.array(cmsMediaSchema),
    json: { type: 'array', items: REF('Media') },
  }),
};

/** Non-translatable settings (`settings` in the payload). */
export const s = {
  number: (fallback?: number): FieldDesc<number> => ({
    kind: 'number',
    optional: false,
    zod: fallback === undefined ? z.number() : z.number().default(fallback),
    json: fallback === undefined ? { type: 'number' } : { type: 'number', default: fallback },
  }),
  bool: (fallback = false): FieldDesc<boolean> => ({
    kind: 'boolean',
    optional: false,
    zod: z.boolean().default(fallback),
    json: { type: 'boolean', default: fallback },
  }),
  string: (): FieldDesc<string> => ({ kind: 'string', optional: false, zod: z.string(), json: { type: 'string' } }),
  numbers: (): FieldDesc<number[]> => ({
    kind: 'number_list',
    optional: false,
    zod: z.array(z.number()).default([]),
    json: { type: 'array', items: { type: 'number' }, default: [] },
  }),
  strings: (): FieldDesc<string[]> => ({
    kind: 'string_list',
    optional: false,
    zod: z.array(z.string()).default([]),
    json: { type: 'array', items: { type: 'string' }, default: [] },
  }),
  enumOf: <const V extends readonly [string, ...string[]]>(values: V, fallback: V[number]): FieldDesc<V[number]> => ({
    kind: 'enum',
    optional: false,
    zod: z.enum(values).default(fallback) as unknown as z.ZodType<V[number], z.ZodTypeDef, unknown>,
    json: { type: 'string', enum: [...values], default: fallback },
  }),
  /** a collection the section renders: `{ collection, limit?, keys?, filter? }` */
  source: (collection: string): FieldDesc<CollectionSource> => ({
    kind: 'collection_ref',
    optional: false,
    zod: collectionSourceSchema.default({ collection }) as unknown as z.ZodType<CollectionSource, z.ZodTypeDef, unknown>,
    json: { ...REF('CollectionSource'), default: { collection } },
  }),
};

export interface CollectionSource {
  collection: string;
  /** page size; omitted → the collection's default */
  limit?: number;
  /** explicit entries in this order (e.g. the volunteers featured on home) */
  keys?: string[];
  /** filter on `data` fields, e.g. { area: 'chapter' } */
  filter?: Record<string, string>;
  /** show pagination under a grid */
  paginate?: boolean;
}

const collectionSourceSchema = z.object({
  collection: z.string(),
  limit: z.number().optional(),
  keys: z.array(z.string()).optional(),
  filter: z.record(z.string()).optional(),
  paginate: z.boolean().optional(),
});

// ---- inference -----------------------------------------------------------------------------
type ValueOf<D> = D extends FieldDesc<infer T, boolean> ? T : never;
type OptionalKeys<M extends DescMap> = { [K in keyof M]: M[K]['optional'] extends true ? K : never }[keyof M];
type RequiredKeys<M extends DescMap> = Exclude<keyof M, OptionalKeys<M>>;

/** The validated object shape of a descriptor map. */
export type Shape<M extends DescMap> = { [K in RequiredKeys<M>]: ValueOf<M[K]> } & {
  [K in OptionalKeys<M>]?: Exclude<ValueOf<M[K]>, undefined>;
};

export function zodShape(map: DescMap): z.ZodObject<z.ZodRawShape> {
  const shape: z.ZodRawShape = {};
  for (const [key, desc] of Object.entries(map)) shape[key] = desc.zod;
  return z.object(shape);
}

export function jsonShape(map: DescMap): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const [key, desc] of Object.entries(map)) {
    properties[key] = { ...desc.json, 'x-kind': desc.kind };
    if (!desc.optional && !('default' in desc.json)) required.push(key);
  }
  return { type: 'object', properties, required, additionalProperties: false };
}

const LINK_PROPERTIES = {
  label: { type: 'string' },
  href: { type: 'string' },
  external: { type: 'boolean' },
  variant: { type: 'string', enum: ['default', 'dark', 'ghost', 'ghost_light'] },
};

/** Shared definitions referenced by every exported section schema. */
export const JSON_DEFINITIONS: Record<string, JsonSchema> = {
  LocalizedText: {
    type: 'object',
    properties: { value: { type: 'string' }, resolved_locale: { type: 'string' }, is_fallback: { type: 'boolean' } },
    required: ['value', 'resolved_locale', 'is_fallback'],
  },
  LocalizedRichText: {
    type: 'object',
    properties: { value: { type: 'array', description: 'portable rich-text AST (src/types/content.dto.ts RichBlock)' } },
    required: ['value'],
  },
  LocalizedLink: {
    type: 'object',
    properties: {
      value: {
        type: 'object',
        properties: LINK_PROPERTIES,
        required: ['label', 'href'],
      },
    },
    required: ['value'],
  },
  LocalizedLinkList: {
    type: 'object',
    properties: {
      value: { type: 'array', items: { type: 'object', properties: LINK_PROPERTIES, required: ['label', 'href'] } },
    },
    required: ['value'],
  },
  Media: { type: 'object', description: 'MEDIA (backend §8.4)', required: ['id', 'kind', 'url'] },
  CollectionSource: {
    type: 'object',
    properties: {
      collection: { type: 'string' },
      limit: { type: 'number' },
      keys: { type: 'array', items: { type: 'string' } },
      filter: { type: 'object', additionalProperties: { type: 'string' } },
      paginate: { type: 'boolean' },
    },
    required: ['collection'],
  },
};
