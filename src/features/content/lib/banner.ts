import type { CmsBanner, CmsPageTree } from '@/domain/entities/content.types';
import { breadcrumbBanner } from '../schemas/sectionTypes';

/** The page's `breadcrumb_banner` section as banner data (validated), or null. */
export function readBanner(page: CmsPageTree | null): CmsBanner | null {
  const node = page?.sections.find((section) => section.type === breadcrumbBanner.type);
  if (!node) return null;
  const parsed = breadcrumbBanner.schema.safeParse(node);
  if (!parsed.success) return null;
  const { fields, media } = parsed.data;
  return { title: fields.title, trail: fields.trail, background: media.background ?? null };
}
