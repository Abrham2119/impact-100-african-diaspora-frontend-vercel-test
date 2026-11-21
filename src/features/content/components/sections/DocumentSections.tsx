import { Badge, ButtonRow, Card, CharterSection } from '@/components/design';
import type { SectionData } from '../../schemas/defineSection';
import type { decisionTable, legalText } from '../../schemas/sectionTypes';
import { CmsButtons } from '../CmsButton';
import { RichText } from '../RichText';
import { SectionHeadingRow } from './shared';

// legal_text — privacy & cookie notice (privacy.dc.html): numbered sections in one card.
export function LegalTextSection({ section }: { section: SectionData<typeof legalText> }) {
  const { fields, items } = section;
  return (
    <section className="mt_100">
      <div className="container">
        <div className="row">
          <div className="col-xl-9 col-lg-10 m-auto">
            <Card className="ixd_h_auto" kicker={fields.kicker}>
              <h2 className="ixd_title_36 ixd_mt8">{fields.title}</h2>
              {fields.intro !== undefined && <p>{fields.intro}</p>}
              {items.map((item, i) => (
                <CharterSection key={item.id} num={`${i + 1}.`} title={item.fields.title} className="ixd_mt30">
                  <RichText value={item.fields.body} />
                </CharterSection>
              ))}
              {fields.actions && (
                <ButtonRow>
                  <CmsButtons links={fields.actions} />
                </ButtonRow>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// decision_table — our-model "Who decides what": activity × contribution band, Yes/No badges.
export function DecisionTableSection({ section }: { section: SectionData<typeof decisionTable> }) {
  const { fields, items } = section;
  return (
    <section className="mt_100">
      <div className="container">
        <SectionHeadingRow kicker={fields.kicker} title={fields.title} lead={fields.lead} width="wide" />
        <div className="row mt_50">
          <div className="col-12">
            <div className="ix_card ix_who ixd_h_auto">
              <div className="ix_table_wrap">
                <table className="ix_table">
                  <thead>
                    <tr>
                      <th scope="col">{fields.col_activity}</th>
                      <th scope="col">{fields.col_low}</th>
                      <th scope="col">{fields.col_high}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr key={row.id}>
                        <td>{row.fields.activity}</td>
                        <td>
                          <Badge kind={row.settings.low_kind}>{row.fields.low}</Badge>
                        </td>
                        <td>
                          <Badge kind={row.settings.high_kind}>{row.fields.high}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
