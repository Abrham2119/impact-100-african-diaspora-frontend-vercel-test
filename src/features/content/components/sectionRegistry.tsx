import type { ComponentType, ReactElement } from 'react';
import type { CmsSectionNode } from '@/domain/entities/content.types';
import type { NodeDef, SectionOf, SectionType } from '../schemas/defineSection';
import * as T from '../schemas/sectionTypes';
import { AboutBlockSection } from './sections/AboutBlockSection';
import { BandSection, CounterBandSection, CtaBandSection, StatusCardSection, TextMarqueeSection } from './sections/BandSections';
import { CampaignCardsSection } from './sections/CampaignCardsSection';
import { CardGridSection } from './sections/CardGridSection';
import { VideoDonateSection } from './sections/VideoDonateSection';
import { CategoryCarouselSection, EventSliderSection, LogoStripSection, ServicesSliderSection } from './sections/CarouselSections';
import { CharterDocumentSection } from './sections/CharterSection';
import { CommitteeGridSection } from './sections/CommitteeGridSection';
import { DecisionTableSection, LegalTextSection } from './sections/DocumentSections';
import { FaqSection } from './sections/FaqSection';
import { HeroSliderSection } from './sections/HeroSliderSection';
import { DonorListSection, PhotoGallerySection, VideoGallerySection } from './sections/ListSections';
import { NewsListSection } from './sections/NewsListSection';
import { PeopleSection, TestimonialsSection } from './sections/PeopleSections';

// Section registry (ARCHITECTURE.md §7): section type → validator + component. A page is rendered
// ONLY from this map — admins compose pages from these types in the CMS studio. Each section is
// validated with its declared schema (schemas/sectionTypes.ts); an unknown type or an invalid
// section is skipped (one dev warning) so one bad section never breaks a page.

interface SectionRenderer {
  render: (node: CmsSectionNode) => ReactElement | null;
}

const warned = new Set<string>();
function warnOnce(id: string, ...details: unknown[]) {
  if (!import.meta.env.DEV || warned.has(id)) return;
  warned.add(id);
  console.warn(`[cms] ${id}`, ...details);
}

function entry<Type extends string, D extends NodeDef>(
  def: SectionType<Type, D>,
  Component: ComponentType<{ section: SectionOf<Type, D> }>,
): [string, SectionRenderer] {
  return [
    def.type,
    {
      render: (node) => {
        const parsed = def.schema.safeParse(node);
        if (!parsed.success) {
          warnOnce(`invalid section "${node.key ?? node.id}" (${node.type})`, parsed.error.issues);
          return null;
        }
        return <Component key={node.id} section={parsed.data} />;
      },
    },
  ];
}

const REGISTRY = new Map<string, SectionRenderer>([
  entry(T.heroSlider, HeroSliderSection),
  entry(T.categoryCarousel, CategoryCarouselSection),
  entry(T.aboutBlock, AboutBlockSection),
  entry(T.cardGrid, CardGridSection),
  entry(T.band, BandSection),
  entry(T.videoDonate, VideoDonateSection),
  entry(T.servicesSlider, ServicesSliderSection),
  entry(T.logoStrip, LogoStripSection),
  entry(T.campaignCards, CampaignCardsSection),
  entry(T.counterBand, CounterBandSection),
  entry(T.eventSlider, EventSliderSection),
  entry(T.textMarquee, TextMarqueeSection),
  entry(T.ctaBand, CtaBandSection),
  entry(T.testimonials, TestimonialsSection),
  entry(T.people, PeopleSection),
  entry(T.faq, FaqSection),
  entry(T.newsList, NewsListSection),
  entry(T.committeeGrid, CommitteeGridSection),
  entry(T.charter, CharterDocumentSection),
  entry(T.legalText, LegalTextSection),
  entry(T.decisionTable, DecisionTableSection),
  entry(T.donorList, DonorListSection),
  entry(T.photoGallery, PhotoGallerySection),
  entry(T.videoGallery, VideoGallerySection),
  entry(T.statusCard, StatusCardSection),
]);

/** Section types rendered outside the page body (the layout draws the banner). */
const LAYOUT_SECTIONS = new Set<string>([T.breadcrumbBanner.type]);

/** The page body: every renderable section, in CMS order. */
export function renderSections(sections: CmsSectionNode[]): ReactElement[] {
  const out: ReactElement[] = [];
  for (const node of sections) {
    if (LAYOUT_SECTIONS.has(node.type)) continue;
    const renderer = REGISTRY.get(node.type);
    if (!renderer) {
      warnOnce(`unknown section type "${node.type}"`);
      continue;
    }
    const element = renderer.render(node);
    if (element) out.push(element);
  }
  return out;
}
