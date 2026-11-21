import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, EmptyState, Field, Panel, ResultBox, Textarea } from '@/components/design';
import { weightedScore } from '@/domain/rules/governance';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import type { ReviewsView } from '@/features/governance/api/governanceRepository';
import { useRecuse, useReviews, useSaveReview } from '@/features/governance/hooks/usePortalGovernance';
import { useT } from '@/i18n/useT';
import { cx } from '@/lib/classes';
import { PortalState } from './PortalState';

// Score a proposal (portal_score.dc.html): five weighted criteria scored 1–5 (each pick is saved as
// a draft), the live weighted total, comments, submit (all five needed) or recuse. Submitted and
// recused reviews are read-only.
const SCALE = [1, 2, 3, 4, 5];

export function ScorePage() {
  const tc = useT('common');
  const { proposalId } = useParams();
  const query = useReviews();
  const assignment = query.data?.assignments.find((a) => a.proposalId === proposalId);

  return (
    <PortalState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {query.data && assignment ? <ScoreForm key={assignment.proposalId} criteria={query.data.criteria} assignment={assignment} /> : <EmptyState>{tc('states.empty')}</EmptyState>}
    </PortalState>
  );
}

function ScoreForm({ criteria, assignment }: { criteria: ReviewsView['criteria']; assignment: ReviewsView['assignments'][number] }) {
  const t = useT('portal');
  const catalog = useCatalog();
  const save = useSaveReview();
  const recuse = useRecuse();
  const [scores, setScores] = useState(assignment.scores);
  const [comment, setComment] = useState(assignment.comment);
  const [tried, setTried] = useState(false);
  const locked = assignment.status === 'SUBMITTED' || assignment.status === 'RECUSED';
  const complete = scores.every((s) => s !== null);
  const total = weightedScore(scores, criteria).toFixed(2);
  // draft saves (one per pick) never block submitting; only a pending submit does
  const submitting = save.isPending && save.variables?.submit === true;

  const pick = (index: number, value: number) => {
    const next = scores.map((s, i) => (i === index ? value : s));
    setScores(next);
    setTried(false);
    save.mutate({ proposalId: assignment.proposalId, scores: next, comment, submit: false });
  };
  const submit = () => {
    if (!complete) return setTried(true);
    save.mutate({ proposalId: assignment.proposalId, scores, comment, submit: true });
  };

  return (
    <Panel
      title={`${assignment.proposal.title} · ${catalog.country(assignment.proposal.countryKey)}`}
      lead={t('score.lead')}
      right={<Badge kind="accent">{t('score.total', { total })}</Badge>}
    >
      {criteria.map((criterion, i) => (
        <div key={criterion.name} className="ix_toggle_row">
          <div>
            <b>{criterion.name}</b>
            <span className="ix_help">{t('score.weight', { weight: criterion.weightPct })}</span>
          </div>
          <div className="ix_score" role="radiogroup" aria-label={criterion.name}>
            {SCALE.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={scores[i] === n}
                className={cx(scores[i] === n && 'ix_on')}
                disabled={locked}
                onClick={() => pick(i, n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}
      <Field id="sc_c" label={t('score.comments')}>
        <Textarea rows={4} value={comment} readOnly={locked} onChange={(e) => setComment(e.target.value)} />
      </Field>
      {tried && !complete && (
        <span className="ix_err" role="alert">
          {t('score.incomplete')}
        </span>
      )}
      {assignment.status === 'SUBMITTED' && (
        <ResultBox kind="ok" title={t('score.submittedTitle')}>
          {complete ? t('score.submittedBody', { total }) : undefined}
        </ResultBox>
      )}
      {!locked && (
        <div className="ix_btn_row">
          <button type="button" className="common_btn" disabled={submitting} onClick={submit}>
            {t('score.submit')}
          </button>
          <button type="button" className="common_btn ix_btn_ghost" disabled={recuse.isPending} onClick={() => recuse.mutate(assignment.proposalId)}>
            {t('score.recuse')}
          </button>
        </div>
      )}
      {assignment.status === 'RECUSED' && (
        <ResultBox kind="wait" title={t('score.recusedTitle')}>
          {t('score.recusedBody')}
        </ResultBox>
      )}
    </Panel>
  );
}
