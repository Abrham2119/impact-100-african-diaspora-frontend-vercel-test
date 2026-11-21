import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Field, Input, Panel, QueryState, ResultBox, Select, Textarea } from '@/components/design';
import type { AdminProposal } from '@/domain/entities/governance.types';
import { Can } from '@/features/auth/components/Can';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useT } from '@/i18n/useT';
import { useAdminProposal, useSaveProposal } from '../hooks/useAdmin';
import { adminErrorText } from './labels';

// New proposal (admin_proposal_form.dc.html): a grant proposal for the ballot. "save draft" keeps it
// (`?draft=<id>` reopens it — also where an accepted proposal idea lands); "publish proposal" puts it
// on Grants under "Under review" and on the grant ballot in the member portal.
const DRAFT_PARAM = 'draft';
const dollars = (value: string) => Number(value.replace(/[\s,$]/g, ''));

interface Values {
  orgName: string;
  countryKey: string;
  portfolioKey: string;
  budget: string;
  summary: string;
  conflicts: string;
  opensAt: string;
  closesAt: string;
}
const EMPTY: Values = { orgName: '', countryKey: '', portfolioKey: '', budget: '', summary: '', conflicts: '', opensAt: '', closesAt: '' };
const valuesOf = (p: AdminProposal): Values => ({
  orgName: p.orgName,
  countryKey: p.countryKey,
  portfolioKey: p.portfolioKey,
  budget: p.budgetCents ? String(p.budgetCents / 100) : '',
  summary: p.summary,
  conflicts: p.conflicts,
  opensAt: p.opensAt,
  closesAt: p.closesAt,
});

interface Saved {
  published: boolean;
  name: string;
}

export function ProposalFormPage() {
  const t = useT('admin');
  const [params] = useSearchParams();
  const draftId = params.get(DRAFT_PARAM);
  const draft = useAdminProposal(draftId);
  // the confirmation outlives the form, which remounts (empty) after publishing a reopened draft
  const [saved, setSaved] = useState<Saved | null>(null);
  const confirmation = saved && (
    <ResultBox kind="ok" title={t(saved.published ? 'proposal.published' : 'proposal.draftSaved')}>
      {t(saved.published ? 'proposal.publishedBody' : 'proposal.draftSavedBody', { name: saved.name })}
    </ResultBox>
  );
  // a draft reopens with its values; a new proposal starts empty (keyed so the form resets)
  return draftId ? (
    <QueryState isPending={draft.isPending} isError={draft.isError} onRetry={() => void draft.refetch()}>
      <ProposalForm key={draftId} initial={draft.data && draft.data.status === 'DRAFT' ? draft.data : null} onSaved={setSaved} confirmation={confirmation} />
    </QueryState>
  ) : (
    <ProposalForm key="new" initial={null} onSaved={setSaved} confirmation={confirmation} />
  );
}

function ProposalForm({ initial, onSaved, confirmation }: { initial: AdminProposal | null; onSaved: (saved: Saved | null) => void; confirmation: ReactNode }) {
  const t = useT('admin');
  const catalog = useCatalog();
  const save = useSaveProposal();
  const [, setParams] = useSearchParams();
  // the draft being written (saved once, then updated)
  const [draftId, setDraftId] = useState(initial?.id);
  const [failed, setFailed] = useState<string | null>(null);
  const schema = useMemo(
    () =>
      z
        .object({
          orgName: z.string().refine((v) => v.trim().length > 0, t('proposal.orgRequired')),
          countryKey: z.string(),
          portfolioKey: z.string(),
          budget: z.string().refine((v) => Number.isFinite(dollars(v)) && dollars(v) > 0, t('proposal.budgetRequired')),
          summary: z.string().refine((v) => v.trim().length > 0, t('proposal.summaryRequired')),
          conflicts: z.string(),
          opensAt: z.string(),
          closesAt: z.string(),
        })
        .refine((v) => !v.opensAt || !v.closesAt || v.closesAt > v.opensAt, { message: t('proposal.closesAfter'), path: ['closesAt'] }),
    [t],
  );
  const form = useDesignForm(schema, initial ? valuesOf(initial) : EMPTY);
  const errors = form.formState.errors;
  const countries = catalog.featuredCountryKeys;
  const portfolios = catalog.portfolioKeys;

  // the selects show their first option until one is picked: the form holds the same value
  useEffect(() => {
    if (!form.getValues('countryKey') && countries[0]) form.setValue('countryKey', countries[0]);
    if (!form.getValues('portfolioKey') && portfolios[0]) form.setValue('portfolioKey', portfolios[0]);
  }, [countries, portfolios, form]);

  const submit = (publish: boolean) =>
    form.handleSubmit((v) => {
      setFailed(null);
      onSaved(null);
      return save
        .mutateAsync({ id: draftId, publish, ...v, budgetCents: Math.round(dollars(v.budget) * 100) })
        .then((saved) => {
          onSaved({ published: publish, name: saved.orgName });
          if (!publish) return setDraftId(saved.id);
          setDraftId(undefined);
          form.reset({ ...EMPTY, countryKey: countries[0] ?? '', portfolioKey: portfolios[0] ?? '' });
          if (initial) setParams({}, { replace: true });
        })
        .catch((e: unknown) => setFailed(adminErrorText(t, e)));
    });

  return (
    <Panel title={t('proposal.title')} lead={t('proposal.lead')}>
      <form onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="row">
          <div className="col-md-6">
            <Field id="pp_org" label={t('proposal.org')} error={errors.orgName?.message}>
              <Input type="text" placeholder="" {...form.register('orgName')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="pp_c" label={t('proposal.country')}>
              <Select options={countries.map((key) => ({ value: key, label: catalog.country(key) }))} {...form.register('countryKey')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="pp_p" label={t('proposal.portfolio')}>
              <Select options={portfolios.map((key) => ({ value: key, label: catalog.portfolio(key) }))} {...form.register('portfolioKey')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="pp_b" label={t('proposal.budget')} error={errors.budget?.message}>
              <Input type="text" inputMode="numeric" placeholder={t('proposal.budgetPlaceholder')} {...form.register('budget')} />
            </Field>
          </div>
          <div className="col-12">
            <Field id="pp_s" label={t('proposal.summary')} error={errors.summary?.message}>
              <Textarea rows={5} placeholder="" {...form.register('summary')} />
            </Field>
          </div>
          <div className="col-12">
            <Field id="pp_coi" label={t('proposal.conflicts')}>
              <Textarea rows={5} placeholder={t('proposal.conflictsPlaceholder')} {...form.register('conflicts')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="pp_o" label={t('proposal.opens')}>
              <Input type="datetime-local" placeholder="" {...form.register('opensAt')} />
            </Field>
          </div>
          <div className="col-md-6">
            <Field id="pp_cl" label={t('proposal.closes')} error={errors.closesAt?.message}>
              <Input type="datetime-local" placeholder="" {...form.register('closesAt')} />
            </Field>
          </div>
        </div>
        <Can require="ballots:create">
          <div className="ix_btn_row">
            <button type="button" className="common_btn" disabled={save.isPending} onClick={(e) => void submit(false)(e)}>
              {t('proposal.saveDraft')}
            </button>
            <button type="button" className="common_btn ix_btn_dark" disabled={save.isPending} onClick={(e) => void submit(true)(e)}>
              {t('proposal.publish')}
            </button>
          </div>
        </Can>
        {failed && (
          <span className="ix_err" role="alert">
            {failed}
          </span>
        )}
        {confirmation}
      </form>
    </Panel>
  );
}
