import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Badge, Field, Modal, Panel, QueryState, ResultBox, Table, Textarea } from '@/components/design';
import type { PublicationRow } from '@/domain/entities/admin.types';
import { countsReconcile } from '@/domain/rules/admin';
import { Can } from '@/features/auth/components/Can';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate } from '@/lib/format';
import { useAddNotice, usePublications, usePublishResult } from '../hooks/useAdmin';
import { adminErrorText } from './labels';

// Publish results (admin_publish.dc.html): closed ballots ready to publish (outcome from the rules
// engine, counts must reconcile with the participations), and published results — never edited, but
// a failed one can carry a correction notice.
const total = (r: PublicationRow) => r.yes + r.no + r.abstain;

export function PublishPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const query = usePublications();
  const publish = usePublishResult();
  const [noticeFor, setNoticeFor] = useState<PublicationRow | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const ready = (query.data ?? []).filter((r) => r.status === 'READY');
  const published = (query.data ?? []).filter((r) => r.status === 'PUBLISHED');
  const outcome = (r: PublicationRow) => <Badge kind={r.outcome === 'PASSED' ? 'ok' : 'bad'}>{t(`outcome.${r.outcome}`)}</Badge>;
  const notice = (r: PublicationRow) => {
    if (r.notice && r.noticeOn) return t('publish.noticeAdded', { date: formatDate(r.noticeOn, locale) });
    if (r.outcome === 'PASSED') return t('people.none');
    return (
      <Can require="results:approve" fallback={t('people.none')}>
        <button type="button" className="common_btn ix_btn_sm ix_btn_dark" onClick={() => setNoticeFor(r)}>
          {t('publish.addNotice')}
        </button>
      </Can>
    );
  };

  return (
    <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      <Panel title={t('publish.ready')} lead={t('publish.readyLead')}>
        {failed && (
          <span className="ix_err" role="alert">
            {failed}
          </span>
        )}
        <Table<PublicationRow>
          rows={ready}
          rowKey={(r) => r.id}
          empty={t('publish.noReady')}
          columns={[
            { key: 'ballot', header: t('publish.ballot'), cell: (r) => r.title },
            { key: 'eligible', header: t('publish.eligible'), cell: (r) => r.eligible },
            { key: 'yes', header: t('publish.yes'), cell: (r) => r.yes },
            { key: 'no', header: t('publish.no'), cell: (r) => r.no },
            { key: 'abstain', header: t('publish.abstain'), cell: (r) => r.abstain },
            { key: 'outcome', header: t('publish.outcome'), cell: outcome },
            {
              key: 'act',
              header: '',
              cell: (r) => (
                <Can require="results:approve" fallback={t('people.none')}>
                  <button
                    type="button"
                    className="common_btn ix_btn_sm"
                    disabled={publish.isPending || !countsReconcile(r)}
                    onClick={() => {
                      setFailed(null);
                      publish.mutateAsync(r.id).catch((e: unknown) => setFailed(adminErrorText(t, e)));
                    }}
                  >
                    {t('publish.publish')}
                  </button>
                </Can>
              ),
            },
          ]}
        />
      </Panel>
      {ready.map((r) =>
        countsReconcile(r) ? (
          <ResultBox key={r.id} kind="wait" title={t('publish.reconcile')}>
            {t('publish.reconcileBody', { total: total(r) })}
          </ResultBox>
        ) : (
          <ResultBox key={r.id} kind="bad" title={t('publish.mismatch')}>
            {t('publish.mismatchBody', { total: total(r), participations: r.participations })}
          </ResultBox>
        ),
      )}
      <Panel title={t('publish.published')}>
        <Table<PublicationRow>
          rows={published}
          rowKey={(r) => r.id}
          empty={t('list.empty')}
          columns={[
            { key: 'ballot', header: t('publish.ballot'), cell: (r) => r.title },
            { key: 'published', header: t('publish.publishedOn'), cell: (r) => (r.publishedOn ? formatDate(r.publishedOn, locale) : t('people.none')) },
            { key: 'outcome', header: t('publish.outcome'), cell: outcome },
            { key: 'notice', header: t('publish.notice'), cell: notice },
          ]}
        />
      </Panel>
      {noticeFor && <NoticeDialog result={noticeFor} onClose={() => setNoticeFor(null)} />}
    </QueryState>
  );
}

function NoticeDialog({ result, onClose }: { result: PublicationRow; onClose: () => void }) {
  const t = useT('admin');
  const add = useAddNotice();
  const [failed, setFailed] = useState<string | null>(null);
  const schema = useMemo(() => z.object({ text: z.string().refine((v) => v.trim().length >= 10, t('publish.noticeRequired')) }), [t]);
  const form = useDesignForm(schema, { text: '' });
  const submit = form.handleSubmit(({ text }) =>
    add
      .mutateAsync({ id: result.id, text })
      .then(onClose)
      .catch((e: unknown) => setFailed(adminErrorText(t, e))),
  );

  return (
    <Modal labelledBy="cn_h" onClose={onClose}>
      <div className="ix_card">
        <h3 id="cn_h">{t('publish.noticeTitle')}</h3>
        <p>{t('publish.noticeBody', { title: result.title })}</p>
        <form onSubmit={(e) => void submit(e)} noValidate>
          <Field id="cn_t" label={t('publish.noticeLabel')} error={form.formState.errors.text?.message ?? failed ?? undefined}>
            <Textarea rows={4} {...form.register('text')} />
          </Field>
          <div className="ix_btn_row">
            <button type="submit" className="common_btn" disabled={add.isPending}>
              {t('publish.noticeSave')}
            </button>
            <button type="button" className="common_btn ix_btn_ghost" onClick={onClose}>
              {t('people.cancel')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
