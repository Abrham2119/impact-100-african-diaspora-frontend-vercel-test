import { Fragment, useState } from 'react';
import { Field, Input, Panel, QueryState, ResultBox, Table, Textarea, type TableColumn } from '@/components/design';
import type { EmailTemplate } from '@/domain/entities/admin.types';
import { unknownVariables } from '@/domain/rules/admin';
import { Can } from '@/features/auth/components/Can';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDayMonth } from '@/lib/format';
import { DEFAULT_TEMPLATE_ID } from '../fixtures/system';
import { useEmailTemplates, useSaveTemplate, useSendTestEmail } from '../hooks/useAdmin';
import { useAdminList } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';
import { adminErrorText } from './labels';

// Email templates (admin_emails.dc.html): every template, its category and attachment; "Edit" opens
// it in the editor below (`?template=<id>`, "Vote opening" by default). Variables must resolve before
// sending: only the listed ones are accepted. "send test" sends it to you and logs the delivery.
export function EmailsPage() {
  const t = useT('admin');
  const { locale } = useLocale();
  const query = useEmailTemplates();
  const [selected, setSelected] = useSearchParamState('template');
  const current = query.data?.find((x) => x.id === (selected ?? DEFAULT_TEMPLATE_ID)) ?? query.data?.[0];

  const columns: Array<TableColumn<EmailTemplate>> = [
    { key: 'template', header: t('emails.template'), cell: (x) => x.name, sortValue: (x) => x.name },
    { key: 'category', header: t('emails.category'), cell: (x) => t(`emails.category.${x.category}`), sortValue: (x) => x.category },
    { key: 'attachment', header: t('emails.attachment'), cell: (x) => (x.attachment ? t(`emails.attachment.${x.attachment}`) : t('people.none')) },
    { key: 'edited', header: t('emails.edited'), cell: (x) => formatDayMonth(x.editedOn, locale), sortValue: (x) => x.editedOn },
    {
      key: 'act',
      header: '',
      cell: (x) => (
        <a
          href={`?template=${encodeURIComponent(x.id)}`}
          onClick={(e) => {
            e.preventDefault();
            setSelected(x.id);
            // the editor remounts with the chosen template; focus its subject once it's there
            requestAnimationFrame(() => document.getElementById('et_s')?.focus());
          }}
        >
          {t('emails.edit')}
        </a>
      ),
    },
  ];
  const list = useAdminList(query.data, { columns });

  return (
    <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      <Panel title={t('emails.title')} lead={t('emails.lead')}>
        <Table<EmailTemplate> rows={list.rows} rowKey={(x) => x.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
        <AdminPager page={list.page} totalPages={list.totalPages} />
      </Panel>
      {current && <TemplateEditor key={`${current.id}:${current.editedOn}`} template={current} />}
    </QueryState>
  );
}

function TemplateEditor({ template }: { template: EmailTemplate }) {
  const t = useT('admin');
  const save = useSaveTemplate();
  const sendTest = useSendTestEmail();
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<'saved' | 'tested' | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const unknown = unknownVariables(`${subject}\n${body}`, template.variables);
  const subjectError = tried && !subject.trim() ? t('emails.subjectRequired') : undefined;
  const bodyError = tried && unknown.length ? t('emails.unknown', { list: unknown.map((v) => `[${v}]`).join(' ') }) : undefined;

  const run = (action: 'saved' | 'tested') => {
    setTried(true);
    setDone(null);
    setFailed(null);
    if (!subject.trim() || unknown.length) return;
    const input = { id: template.id, subject, body };
    (action === 'saved' ? save.mutateAsync(input) : sendTest.mutateAsync(input)).then(() => setDone(action)).catch((e: unknown) => setFailed(adminErrorText(t, e)));
  };

  return (
    <Panel title={t('emails.editTitle', { name: template.name })} lead={t('emails.editLead')}>
      <div className="row">
        <div className="col-12">
          <Field id="et_s" label={t('emails.subject')} error={subjectError}>
            <Input type="text" placeholder="" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
        </div>
        <div className="col-12">
          <Field id="et_b" label={t('emails.body')} error={bodyError ?? failed ?? undefined}>
            <Textarea rows={5} placeholder="" value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
        </div>
      </div>
      <p className="ix_note">
        {t('emails.available')}{' '}
        {template.variables.map((v, i) => (
          <Fragment key={v}>
            {i > 0 && ' '}
            <span className="ix_code">[{v}]</span>
          </Fragment>
        ))}
      </p>
      <Can require="emails:update">
        <div className="ix_btn_row">
          <button type="button" className="common_btn" disabled={save.isPending} onClick={() => run('saved')}>
            {t('emails.save')}
          </button>
          <button type="button" className="common_btn ix_btn_dark" disabled={sendTest.isPending} onClick={() => run('tested')}>
            {t('emails.sendTest')}
          </button>
        </div>
      </Can>
      {done && (
        <ResultBox kind="ok" title={t(done === 'saved' ? 'emails.saved' : 'emails.testSent')}>
          {t(done === 'saved' ? 'emails.savedBody' : 'emails.testSentBody', { name: template.name })}
        </ResultBox>
      )}
    </Panel>
  );
}
