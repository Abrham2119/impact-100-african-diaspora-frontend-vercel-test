import type { ComponentType } from 'react';
import type { SectionData } from '../schemas/defineSection';
import type { FORM_KEYS, formBlock } from '../schemas/sectionTypes';

// form_block → interactive feature component (ARCHITECTURE.md §7.2 `formRegistry`). The component
// gets the whole validated section: its CMS copy (fields), side content (items) and settings.
export type FormBlockData = SectionData<typeof formBlock>;
export type FormBlockComponent = ComponentType<{ section: FormBlockData }>;

export const FORM_REGISTRY: Partial<Record<(typeof FORM_KEYS)[number], FormBlockComponent>> = {};
