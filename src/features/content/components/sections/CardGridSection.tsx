import { ButtonRow, Card, IxCardItem, type IxCardVariant } from '@/components/design';
import { cx } from '@/lib/classes';
import type { SectionData } from '../../schemas/defineSection';
import type { cardGrid } from '../../schemas/sectionTypes';
import { CmsButtons } from '../CmsButton';
import { RichText } from '../RichText';
import { SectionHeadingRow } from './shared';

// card_grid — the generic `ix_card` grids of home / our_model (purpose, campaign cycle, the four
// levels, model steps, facts, pledge & decision rules). Item `type` picks the card layout;
// `note` items form the soft card under the grid. `spacing: continued` is the design's second
// row inside the previous section (`row ix_gap mt_30`, no section margin).
type Grid = SectionData<typeof cardGrid>;

const COLUMN = { lg6: 'col-lg-6', lg4: 'col-lg-4', xl3: 'col-xl-3 col-md-6' } as const;
const VARIANTS: readonly string[] = ['icon', 'num', 'level', 'rich'] satisfies IxCardVariant[];
const isVariant = (type: string | null): type is IxCardVariant => type !== null && VARIANTS.includes(type);

export function CardGridSection({ section }: { section: Grid }) {
  const { fields, settings, items } = section;
  const cards = items.filter((item) => isVariant(item.type));
  const notes = items.filter((item) => item.type === 'note');
  const continued = settings.spacing === 'continued';
  const hasHeading = fields.title !== undefined;

  return (
    <section className={cx(!continued && 'mt_100')}>
      <div className="container">
        <SectionHeadingRow kicker={fields.kicker} title={fields.title} lead={fields.lead} width={settings.heading_width} />
        <div className={cx('row ix_gap', continued ? 'mt_30' : hasHeading && 'mt_50', settings.stretch && 'align-items-stretch')}>
          {cards.map((item) => {
            const { fields: f, settings: s } = item;
            return (
              <div key={item.id} className={COLUMN[settings.columns]}>
                <IxCardItem
                  variant={isVariant(item.type) ? item.type : 'rich'}
                  dark={s.tone === 'dark'}
                  icon={s.icon}
                  num={f.num}
                  pill={s.pill}
                  kicker={f.kicker}
                  title={f.title}
                  price={f.price}
                  body={f.body ? <RichText value={f.body} /> : undefined}
                  badge={f.badge !== undefined ? { label: f.badge, kind: s.badge_kind } : undefined}
                  actions={f.actions ? <CmsButtons links={f.actions} size={item.type === 'level' ? 'sm' : undefined} /> : undefined}
                />
              </div>
            );
          })}
        </div>
        {notes.length > 0 && (
          <div className="row mt_30">
            <div className="col-12">
              <Card tone="soft">
                <div className="row ix_gap">
                  {notes.map((note) => (
                    <div key={note.id} className="col-lg-4">
                      {note.fields.title !== undefined && <h4>{note.fields.title}</h4>}
                      {note.fields.body && <RichText value={note.fields.body} />}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
        {fields.actions && (
          <ButtonRow className="ixd_row_center">
            <CmsButtons links={fields.actions} />
          </ButtonRow>
        )}
      </div>
    </section>
  );
}
