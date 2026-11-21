import { useState } from 'react';
import { Badge, ButtonRow, CharterSection as CharterSectionBlock, Field, Note, ResultBox, Select } from '@/components/design';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { useT } from '@/i18n/useT';
import { cx } from '@/lib/classes';
import type { SectionData } from '../../schemas/defineSection';
import { charterVersions, type charter } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { CmsButtons } from '../CmsButton';
import { RichText } from '../RichText';
import { CollectionState } from './shared';

// charter — the Chapter Charter (charter.dc.html): table of contents (active item), version select
// (`?v=`, default the current version) with the "earlier version" notice, the numbered sections
// of the chosen version (C:charter_versions), the sign / amend calls and the note.
export function CharterDocumentSection({ section }: { section: SectionData<typeof charter> }) {
  const t = useT('site');
  const { fields } = section;
  const { entries, isPending, isError, refetch } = useSectionEntries(charterVersions, section.settings.source);
  const [versionParam, setVersionParam] = useSearchParamState('v');
  const current = entries.find((entry) => entry.data.is_current) ?? entries[0];
  const version = entries.find((entry) => entry.key === versionParam) ?? current;
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const active = activeAnchor ?? version?.items[0]?.settings.anchor;

  return (
    <section className="mt_100">
      <div className="container">
        <CollectionState isPending={isPending} isError={isError} isEmpty={version === undefined} onRetry={() => void refetch()}>
          {version && current && (
            <div className="row ix_gap">
              <div className="col-lg-4">
                <div className="ix_toc">
                  <p className="ix_kicker ixd_toc_kicker">{t('charter.sections')}</p>
                  {version.items.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.settings.anchor}`}
                      className={cx(item.settings.anchor === active && 'ix_on')}
                      aria-current={item.settings.anchor === active ? 'location' : undefined}
                      onClick={() => setActiveAnchor(item.settings.anchor)}
                    >
                      {item.fields.title}
                    </a>
                  ))}
                  <Field id="ch_ver" label={t('charter.version')} className="ixd_px12">
                    <Select
                      value={version.key}
                      onChange={(event) => setVersionParam(event.target.value === current.key ? null : event.target.value)}
                      options={entries.map((entry) => ({ value: entry.key, label: entry.fields.label }))}
                    />
                  </Field>
                </div>
              </div>
              <div className="col-lg-8">
                <div className="ix_card ixd_h_auto">
                  <div className="d-flex flex-wrap justify-content-between align-items-center ixd_charter_head">
                    <div>
                      <h2 className="ixd_title_34">{fields.title}</h2>
                    </div>
                    <div>
                      <Badge kind="warn">{version.fields.badge}</Badge>
                    </div>
                  </div>
                  {version.key !== current.key && (
                    <ResultBox kind="wait" title={t('charter.oldTitle')} className="ixd_notice">
                      {t('charter.oldBody', { current: current.fields.badge })}
                    </ResultBox>
                  )}
                  <p className="ixd_charter_intro">{fields.intro}</p>
                  {version.items.map((item, i) => (
                    <CharterSectionBlock key={item.id} id={item.settings.anchor} num={String(i + 1).padStart(2, '0')} title={item.fields.title}>
                      <RichText value={item.fields.body} />
                    </CharterSectionBlock>
                  ))}
                  {fields.actions && (
                    <ButtonRow>
                      <CmsButtons links={fields.actions} />
                    </ButtonRow>
                  )}
                  {fields.note !== undefined && <Note>{fields.note}</Note>}
                </div>
              </div>
            </div>
          )}
        </CollectionState>
      </div>
    </section>
  );
}
