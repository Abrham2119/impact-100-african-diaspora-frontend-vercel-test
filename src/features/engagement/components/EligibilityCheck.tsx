import { useEffect, useMemo, useRef, useState } from 'react';
import { Accordion, Card, Chip, ChipGroup, ResultBox } from '@/components/design';
import { CmsButtons } from '@/features/content/components/CmsButton';
import { RichText } from '@/features/content/components/RichText';
import type { FormBlockData } from '@/features/content/components/formRegistry';
import { useSectionEntries } from '@/features/content/hooks/useSectionEntries';
import { faqs } from '@/features/content/schemas/sectionTypes';
import { useT } from '@/i18n/useT';
import { useCheckEligibility } from '../hooks/useEngagement';

// form_block `eligibility` — nonprofits "Quick eligibility check" + "Questions from organizations"
// (nonprofits.dc.html): Yes/No per question; once all are answered the result shows (all Yes →
// eligible) and the answers are recorded with `POST engagement/eligibility-checks` (mocked).
type Answer = 'y' | 'n';

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, name: string) => (name in values ? String(values[name]) : match));

export function EligibilityCheck({ section }: { section: FormBlockData }) {
  const t = useT('site');
  const { fields, items, settings } = section;
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const check = useCheckEligibility();
  const faqSource = settings.source ?? { collection: 'nonprofit_faqs' };
  const faqEntries = useSectionEntries(faqs, faqSource);

  const keys = items.map((item) => item.settings.key ?? item.id);
  const answered = keys.filter((key) => answers[key] !== undefined).length;
  const complete = answered === keys.length && keys.length > 0;
  const pass = complete && keys.every((key) => answers[key] === 'y');
  const answer = (key: string, value: Answer) => setAnswers((current) => ({ ...current, [key]: value }));

  // Each distinct complete set of answers is recorded once (`POST eligibility-checks`).
  const { mutate } = check;
  const recorded = useRef('');
  const signature = complete ? keys.map((key) => answers[key]).join('') : '';
  useEffect(() => {
    if (!signature || signature === recorded.current) return;
    recorded.current = signature;
    mutate({ answers: Object.fromEntries(keys.map((key, i) => [key, signature[i] === 'y'])) });
  }, [signature, keys, mutate]);

  const faqItems = useMemo(
    () => faqEntries.entries.map((entry) => ({ id: entry.key, question: entry.fields.question, answer: <RichText value={entry.fields.answer} /> })),
    [faqEntries.entries],
  );

  return (
    <section className="mt_100">
      <div className="container">
        <div className="row ix_gap">
          <div className="col-lg-7">
            <Card>
              {fields.title !== undefined && <h3>{fields.title}</h3>}
              {fields.lead !== undefined && <p className="ix_note ixd_mt6">{fields.lead}</p>}
              <div className="ixd_mt14">
                {items.map((item, i) => {
                  const key = keys[i];
                  return (
                    <div key={item.id} className="ix_toggle_row">
                      <div>
                        <b>{`${i + 1}. ${item.fields.title ?? ''}`}</b>
                      </div>
                      <ChipGroup className="ixd_flex_none">
                        <Chip on={answers[key] === 'y'} onClick={() => answer(key, 'y')}>
                          {t('answer.yes')}
                        </Chip>
                        <Chip on={answers[key] === 'n'} onClick={() => answer(key, 'n')}>
                          {t('answer.no')}
                        </Chip>
                      </ChipGroup>
                    </div>
                  );
                })}
              </div>
              {complete && (
                <ResultBox kind={pass ? 'ok' : 'bad'} title={pass ? fields.success_title : fields.fail_title}>
                  {pass ? fields.success_body : fields.fail_body}
                </ResultBox>
              )}
              {!complete && fields.progress_note !== undefined && (
                <p className="ix_note">{fill(fields.progress_note, { answered, total: keys.length })}</p>
              )}
              {fields.actions && (
                <div className="ix_btn_row">
                  <CmsButtons links={fields.actions} />
                </div>
              )}
            </Card>
          </div>
          <div className="col-lg-5">
            {fields.side_kicker !== undefined && <p className="ix_kicker ixd_mb16">{fields.side_kicker}</p>}
            <Accordion idPrefix={`faq-${section.id}`} items={faqItems} />
          </div>
        </div>
      </div>
    </section>
  );
}
