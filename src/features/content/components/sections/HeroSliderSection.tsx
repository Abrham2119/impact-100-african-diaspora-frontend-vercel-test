import { useMemo } from 'react';
import { HeroSlider, type HeroSlide } from '@/components/design';
import type { SectionData } from '../../schemas/defineSection';
import type { heroSlider } from '../../schemas/sectionTypes';
import { CmsButtons } from '../CmsButton';
import { useDotLabel } from './shared';

// hero_slider — home banner (index.dc.html `banner`): fading slides, dots, autoplay, circle text.
export function HeroSliderSection({ section }: { section: SectionData<typeof heroSlider> }) {
  const dotLabel = useDotLabel();
  const slides = useMemo<HeroSlide[]>(
    () =>
      section.items.map((item) => ({
        key: item.id,
        kicker: item.fields.kicker,
        title: item.fields.title,
        body: item.fields.body,
        actions: item.fields.actions ? <CmsButtons links={item.fields.actions} /> : undefined,
        backgroundUrl: item.media.background?.url,
      })),
    [section.items],
  );

  return <HeroSlider slides={slides} autoplayMs={section.settings.autoplay_ms} circleText={section.fields.circle_text} dotLabel={dotLabel} />;
}
