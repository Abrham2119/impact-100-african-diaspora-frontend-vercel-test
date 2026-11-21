import { z } from 'zod';
import { jsonShape, zodShape, type DescMap, type Shape } from './fields.ts';

// Declares a section type (or collection item schema) once; see fields.ts.
// Relative imports carry the .ts extension so `npm run export:content-schemas` can run this
// module directly with Node's built-in TypeScript support (no build step, no dependency).

export interface NodeDef {
  fields?: DescMap;
  media?: DescMap;
  settings?: DescMap;
  /** repeating children (slides, cards, rows …) */
  item?: NodeDef;
}

type ShapeOf<M> = M extends DescMap ? Shape<M> : Record<string, never>;

/** A validated node (section or item) of a given definition. */
export interface NodeOf<D extends NodeDef> {
  id: string;
  type: string | null;
  settings: ShapeOf<D['settings']>;
  fields: ShapeOf<D['fields']>;
  media: ShapeOf<D['media']>;
  items: D['item'] extends NodeDef ? Array<NodeOf<D['item']>> : never[];
  fallbackFields: string[];
}

export type SectionOf<T extends string, D extends NodeDef> = NodeOf<D> & { type: T; key: string | null };

function nodeSchema(def: NodeDef): z.ZodObject<z.ZodRawShape> {
  return z.object({
    id: z.string(),
    type: z.string().nullable(),
    settings: zodShape(def.settings ?? {}),
    fields: zodShape(def.fields ?? {}),
    media: zodShape(def.media ?? {}),
    items: def.item ? z.array(nodeSchema(def.item)) : z.array(z.unknown()).max(0),
    fallbackFields: z.array(z.string()),
  });
}

function nodeJson(def: NodeDef): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      settings: jsonShape(def.settings ?? {}),
      fields: jsonShape(def.fields ?? {}),
      media: jsonShape(def.media ?? {}),
      ...(def.item ? { items: { type: 'array', items: nodeJson(def.item) } } : {}),
    },
  };
}

export interface SectionType<T extends string, D extends NodeDef> {
  type: T;
  schema: z.ZodType<SectionOf<T, D>, z.ZodTypeDef, unknown>;
  json: Record<string, unknown>;
}

/** The validated data of a declared section type, e.g. `SectionData<typeof heroSlider>`. */
export type SectionData<S> = S extends SectionType<infer T, infer D> ? SectionOf<T, D> : never;

export function defineSection<const T extends string, const D extends NodeDef>(type: T, def: D): SectionType<T, D> {
  const schema = nodeSchema(def).extend({ type: z.literal(type), key: z.string().nullable() });
  return {
    type,
    schema: schema as unknown as z.ZodType<SectionOf<T, D>, z.ZodTypeDef, unknown>,
    json: { title: type, ...nodeJson(def) },
  };
}

/** Collection entry schema (fields/media/data of an entry, plus optional item children). */
export interface EntryDef {
  fields?: DescMap;
  media?: DescMap;
  data?: DescMap;
  item?: NodeDef;
}

export interface EntryOf<D extends EntryDef> {
  key: string;
  slug: string | null;
  fields: ShapeOf<D['fields']>;
  media: ShapeOf<D['media']>;
  data: ShapeOf<D['data']>;
  items: D['item'] extends NodeDef ? Array<NodeOf<D['item']>> : unknown[];
}

export interface CollectionType<K extends string, D extends EntryDef> {
  key: K;
  schema: z.ZodType<EntryOf<D>, z.ZodTypeDef, unknown>;
  json: Record<string, unknown>;
}

/** The validated entry of a declared collection, e.g. `EntryData<typeof events>`. */
export type EntryData<C> = C extends CollectionType<string, infer D> ? EntryOf<D> : never;

export function defineCollection<const K extends string, const D extends EntryDef>(key: K, def: D): CollectionType<K, D> {
  const schema = z.object({
    key: z.string(),
    slug: z.string().nullable(),
    fields: zodShape(def.fields ?? {}),
    media: zodShape(def.media ?? {}),
    data: zodShape(def.data ?? {}),
    items: def.item ? z.array(nodeSchema(def.item)) : z.array(z.unknown()),
  });
  return {
    key,
    schema: schema as unknown as z.ZodType<EntryOf<D>, z.ZodTypeDef, unknown>,
    json: {
      title: key,
      type: 'object',
      properties: {
        fields: jsonShape(def.fields ?? {}),
        media: jsonShape(def.media ?? {}),
        data: jsonShape(def.data ?? {}),
        ...(def.item ? { items: { type: 'array', items: nodeJson(def.item) } } : {}),
      },
    },
  };
}
