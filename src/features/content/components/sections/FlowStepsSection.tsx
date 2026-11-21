import { Badge, FlowSteps } from '@/components/design';
import type { SectionData } from '../../schemas/defineSection';
import type { flowSteps } from '../../schemas/sectionTypes';
import { SectionHeadingRow } from './shared';

// flow_steps — `ol.ix_flow` (nonprofits "How it works", grants roadmap), markup verbatim:
//   <div class="row mt_50"><div class="col-12">[<p class="ix_kicker" style="margin-bottom:16px">…</p>]<ol class="ix_flow">…
export function FlowStepsSection({ section }: { section: SectionData<typeof flowSteps> }) {
  const { fields, items } = section;
  return (
    <section className="mt_100">
      <div className="container">
        <SectionHeadingRow kicker={fields.kicker} title={fields.title} lead={fields.lead} width="wide" />
        <div className="row mt_50">
          <div className="col-12">
            {fields.list_kicker !== undefined && <p className="ix_kicker ixd_mb16">{fields.list_kicker}</p>}
            <FlowSteps
              steps={items.map((item) => ({
                id: item.id,
                num: item.fields.num,
                title: item.fields.title,
                text: item.fields.text,
                marker: item.settings.badge_kind ? <Badge kind={item.settings.badge_kind}>{item.fields.num}</Badge> : undefined,
              }))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
