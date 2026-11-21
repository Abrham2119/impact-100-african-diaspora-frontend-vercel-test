import { useId, useState } from 'react';
import { KeyValueList, Modal, Panel, QueryState, Table, type TableColumn } from '@/components/design';
import type { Submission, SubmissionKind } from '@/domain/entities/engagement.types';
import { Can } from '@/features/auth/components/Can';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { useEngagementCatalog } from '@/features/content/hooks/useEngagementCatalog';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDayMonth } from '@/lib/format';
import { useApproveStory, useSubmissions } from '../hooks/useAdmin';
import { useAdminList, useListFilter } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';
import { adminErrorText } from './labels';

// Submissions (admin_submissions.dc.html): every public form — contact, volunteer, hub, RSVP,
// committee, story, eligibility — stored before it is routed, with its source page and the inbox it
// went to. Kind filter in the URL; "Open" shows what was sent; a story can be approved as a news draft.
const KINDS: SubmissionKind[] = ['CONTACT', 'VOLUNTEER', 'HUB', 'RSVP', 'COMMITTEE', 'STORY', 'ELIGIBILITY'];

export function SubmissionsPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const catalog = useCatalog();
  const forms = useEngagementCatalog();
  const kindId = useId();
  const query = useSubmissions();
  const approve = useApproveStory();
  const [kind, setKind] = useListFilter('kind');
  const [opened, setOpened] = useState<Submission | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const topic = (s: Submission) => {
    if (s.topicText) return s.topicText;
    switch (s.kind) {
      case 'ELIGIBILITY':
        return s.answers ? t('submissions.answers', s.answers) : t('people.none');
      case 'COMMITTEE':
        return catalog.committee(s.topicKey);
      case 'HUB':
        return catalog.hub(s.topicKey);
      case 'RSVP':
        return forms.event(s.topicKey);
      case 'VOLUNTEER':
        return (s.topicKey ?? '').split(',').filter(Boolean).map(forms.roleTitle).join(' · ');
      default:
        return forms.topic(s.topicKey) || t('people.none');
    }
  };
  const inbox = (s: Submission) => (s.routedTo === 'HUB' ? t('routing.hubInbox') : s.routedTo === 'COMMITTEE' ? t('routing.committeeInbox') : s.routedTo);
  const action = (s: Submission) => {
    if (s.kind === 'STORY' && s.status === 'NEW')
      return (
        <Can require={['submissions:update', 'content:create']} fallback={<OpenLink onOpen={() => setOpened(s)} />}>
          <button
            type="button"
            className="common_btn ix_btn_sm"
            disabled={approve.isPending}
            onClick={() => {
              setFailed(null);
              approve.mutateAsync(s.id).catch((e: unknown) => setFailed(adminErrorText(t, e)));
            }}
          >
            {t('submissions.approve')}
          </button>
        </Can>
      );
    if (s.kind === 'STORY' && s.status === 'APPROVED') return t('submissions.approved');
    return <OpenLink onOpen={() => setOpened(s)} />;
  };
  const columns: Array<TableColumn<Submission>> = [
    { key: 'kind', header: t('submissions.kind'), cell: (s) => t(`submissions.kind.${s.kind}`), sortValue: (s) => s.kind },
    { key: 'from', header: t('submissions.from'), cell: (s) => s.fromName ?? t('people.none'), sortValue: (s) => s.fromName ?? '' },
    { key: 'topic', header: t('submissions.topic'), cell: topic, sortValue: topic },
    { key: 'source', header: t('submissions.source'), cell: (s) => s.sourcePath, sortValue: (s) => s.sourcePath },
    { key: 'routed', header: t('submissions.routed'), cell: inbox, sortValue: inbox },
    { key: 'received', header: t('submissions.received'), cell: (s) => formatDayMonth(s.receivedOn, locale), sortValue: (s) => s.receivedOn },
    { key: 'act', header: '', cell: action },
  ];
  const list = useAdminList(query.data, { columns, searchText: (s) => `${s.fromName ?? ''} ${topic(s)}`, filters: { kind: (s, value) => s.kind === value } });

  return (
    <>
      <Panel
        title={t('submissions.title')}
        lead={t('submissions.lead')}
        right={
          <div className="ix_toolbar">
            <label className="ix_sr" htmlFor={kindId}>
              {t('submissions.kindFilter')}
            </label>
            <select id={kindId} className="ix_select" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="">{t('submissions.all')}</option>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(`submissions.kind.${k}`)}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {failed && (
          <span className="ix_err" role="alert">
            {failed}
          </span>
        )}
        <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
          <Table<Submission> rows={list.rows} rowKey={(s) => s.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
          <AdminPager page={list.page} totalPages={list.totalPages} />
        </QueryState>
      </Panel>
      {opened && (
        <Modal labelledBy="sb_h" onClose={() => setOpened(null)}>
          <div className="ix_card">
            <h3 id="sb_h">{t('submissions.detailTitle', { kind: t(`submissions.kind.${opened.kind}`), from: opened.fromName ?? t('people.none') })}</h3>
            <KeyValueList
              rows={[
                { key: 'email', label: t('submissions.email'), value: opened.email ?? t('people.none') },
                { key: 'topic', label: t('submissions.topic'), value: topic(opened) || t('people.none') },
                ...(opened.title ? [{ key: 'title', label: t('submissions.storyTitle'), value: opened.title }] : []),
                { key: 'message', label: t('submissions.message'), value: opened.message ?? t('people.none') },
                { key: 'source', label: t('submissions.source'), value: opened.sourcePath },
                { key: 'routed', label: t('submissions.routed'), value: inbox(opened) },
                { key: 'received', label: t('submissions.received'), value: formatDayMonth(opened.receivedOn, locale) },
              ]}
            />
            <div className="ix_btn_row">
              <button type="button" className="common_btn ix_btn_ghost" onClick={() => setOpened(null)}>
                {t('submissions.close')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

/** The design's "Open" link (opens the submission's details). */
function OpenLink({ onOpen }: { onOpen: () => void }) {
  const t = useT('admin');
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onOpen();
      }}
    >
      {t('submissions.open')}
    </a>
  );
}
