import { useState } from 'react';
import { KeyValueList, Panel, QueryState, ResultBox } from '@/components/design';
import type { ScoringCriterion } from '@/domain/entities/governance.types';
import { rubricTotal } from '@/domain/rules/admin';
import { Can } from '@/features/auth/components/Can';
import { MIN_REVIEWERS, SCORE_SCALE } from '@/features/governance/fixtures/admin';
import { useT } from '@/i18n/useT';
import { useRubric, useSaveRubric } from '../hooks/useAdmin';
import { adminErrorText } from './labels';

// Rubric settings (admin_rubric.dc.html): the five criteria's weightings (whole percentages that
// add up to 100; the total shows live), and the score scale / reviewers. Saved weights are what the
// committee's reviews in the portal are weighted with.
export function RubricPage() {
  const query = useRubric();
  return (
    <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {query.data && <Rubric criteria={query.data} />}
    </QueryState>
  );
}

function Rubric({ criteria }: { criteria: ScoringCriterion[] }) {
  const t = useT('admin');
  const save = useSaveRubric();
  const [weights, setWeights] = useState(() => criteria.map((c) => String(c.weightPct)));
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const numbers = weights.map((w) => (w.trim() === '' ? Number.NaN : Number(w)));
  const total = rubricTotal(numbers);
  const ready = total === 100 && numbers.every((n) => Number.isInteger(n) && n >= 0);

  return (
    <>
      <Panel title={t('rubric.title')} lead={t('rubric.lead')}>
        <div className="row">
          {criteria.map((c, i) => (
            <div key={c.name} className="col-md-4">
              <div className="contact_input">
                <label htmlFor={`rw${i}`}>{c.name}</label>
                <input
                  id={`rw${i}`}
                  type="text"
                  inputMode="numeric"
                  placeholder=""
                  value={weights[i]}
                  aria-describedby={`rw${i}-help`}
                  onChange={(e) => {
                    setSaved(false);
                    setWeights((list) => list.map((w, j) => (j === i ? e.target.value : w)));
                  }}
                />
                <span id={`rw${i}-help`} className="ix_help">
                  {t('rubric.pct')}
                </span>
              </div>
            </div>
          ))}
          <div className="col-md-4">
            {/* design: <div class="ix_stat" style="margin-top:20px"> */}
            <div className="ix_stat mt_20" aria-live="polite">
              <p>{t('rubric.total')}</p>
              <h3>{t('rubric.totalValue', { total })}</h3>
              <span>{ready ? t('rubric.ready') : t('rubric.notReady')}</span>
            </div>
          </div>
        </div>
        <Can require="scoring:approve">
          <div className="ix_btn_row">
            <button
              type="button"
              className="common_btn"
              disabled={save.isPending}
              onClick={() => {
                setFailed(null);
                save
                  .mutateAsync(numbers)
                  .then(() => setSaved(true))
                  .catch((e: unknown) => setFailed(adminErrorText(t, e)));
              }}
            >
              {t('rubric.save')}
            </button>
          </div>
        </Can>
        {failed && (
          <span className="ix_err" role="alert">
            {failed}
          </span>
        )}
        {saved && (
          <ResultBox kind="ok" title={t('rubric.saved')}>
            {t('rubric.savedBody')}
          </ResultBox>
        )}
      </Panel>
      <Panel title={t('rubric.scale')}>
        <KeyValueList
          rows={[
            { key: 'scale', label: t('rubric.scaleLabel'), value: t('rubric.scaleValue', { min: SCORE_SCALE.min, max: SCORE_SCALE.max }) },
            { key: 'reviewers', label: t('rubric.minReviewers'), value: t('rubric.minReviewersValue', { count: MIN_REVIEWERS }) },
            { key: 'weighted', label: t('rubric.weighted'), value: t('rubric.weightedValue') },
          ]}
        />
      </Panel>
    </>
  );
}
