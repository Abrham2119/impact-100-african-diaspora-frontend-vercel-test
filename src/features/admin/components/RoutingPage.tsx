import { useState } from 'react';
import { Badge, CheckField, Field, Input, Modal, Panel, QueryState, Select, Table, type TableColumn } from '@/components/design';
import type { InboxTarget, RoutingKind, RoutingRule } from '@/domain/entities/engagement.types';
import { Can } from '@/features/auth/components/Can';
import { useEngagementCatalog } from '@/features/content/hooks/useEngagementCatalog';
import { useLocale } from '@/i18n/useLocale';
import { useCollection } from '@/features/content/hooks/useContent';
import { useT } from '@/i18n/useT';
import { useRoutingRules, useSaveRoutingRule } from '../hooks/useAdmin';
import { adminErrorText } from './labels';

// Routing rules (admin_routing.dc.html): each form kind and contact topic goes to a set inbox;
// hub forms (join, RSVP) go to the hub's inbox, committee interests to the committee's; each sends an
// automatic reply. New submissions are routed with these rules. Add / edit a rule (audited).
const KINDS: RoutingKind[] = ['CONTACT', 'HUB_RSVP', 'COMMITTEE'];
type Editing = { rule: RoutingRule | null };

export function RoutingPage() {
  const t = useT('admin');
  const forms = useEngagementCatalog();
  const query = useRoutingRules();
  const [editing, setEditing] = useState<Editing | null>(null);

  const inboxText = (inbox: InboxTarget) => (inbox.type === 'HUB' ? t('routing.hubInbox') : inbox.type === 'COMMITTEE' ? t('routing.committeeInbox') : inbox.address);
  const columns: Array<TableColumn<RoutingRule>> = [
    { key: 'kind', header: t('routing.kind'), cell: (r) => t(`routing.kind.${r.kind}`) },
    { key: 'topic', header: t('routing.topic'), cell: (r) => (r.topicKey ? forms.topic(r.topicKey) : t('routing.any')) },
    { key: 'inbox', header: t('routing.inbox'), cell: (r) => inboxText(r.inbox) },
    { key: 'reply', header: t('routing.autoReply'), cell: (r) => <Badge kind={r.autoReply ? 'ok' : 'neutral'}>{t(r.autoReply ? 'routing.on' : 'routing.off')}</Badge> },
    {
      key: 'act',
      header: '',
      cell: (r) => (
        <Can require="submissions:update" fallback={t('people.none')}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setEditing({ rule: r });
            }}
          >
            {t('routing.edit')}
          </a>
        </Can>
      ),
    },
  ];

  return (
    <>
      <Panel
        title={t('routing.title')}
        lead={t('routing.lead')}
        right={
          <Can require="submissions:update">
            <div className="ix_toolbar">
              <button type="button" className="common_btn ix_btn_sm" onClick={() => setEditing({ rule: null })}>
                {t('routing.add')}
              </button>
            </div>
          </Can>
        }
      >
        <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
          <Table<RoutingRule> rows={query.data ?? []} rowKey={(r) => r.id} columns={columns} empty={t('list.empty')} />
        </QueryState>
      </Panel>
      {editing && <RuleDialog rule={editing.rule} onClose={() => setEditing(null)} />}
    </>
  );
}

function RuleDialog({ rule, onClose }: { rule: RoutingRule | null; onClose: () => void }) {
  const t = useT('admin');
  const { locale } = useLocale();
  const topics = useCollection({ collection: 'contact_topics', limit: 100 }, locale);
  const save = useSaveRoutingRule();
  const [kind, setKind] = useState<RoutingKind>(rule?.kind ?? 'CONTACT');
  const [topicKey, setTopicKey] = useState(rule?.topicKey ?? '');
  const [inboxType, setInboxType] = useState<InboxTarget['type']>(rule?.inbox.type ?? 'ADDRESS');
  const [address, setAddress] = useState(rule?.inbox.type === 'ADDRESS' ? rule.inbox.address : '');
  const [autoReply, setAutoReply] = useState(rule?.autoReply ?? true);
  const [tried, setTried] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const addressMissing = inboxType === 'ADDRESS' && !address.trim();
  // hub and committee forms can use their own inbox; contact topics go to an address
  const inboxTypes: Array<InboxTarget['type']> = kind === 'HUB_RSVP' ? ['HUB', 'ADDRESS'] : kind === 'COMMITTEE' ? ['COMMITTEE', 'ADDRESS'] : ['ADDRESS'];
  const inboxLabel = (type: InboxTarget['type']) => (type === 'HUB' ? t('routing.hubInbox') : type === 'COMMITTEE' ? t('routing.committeeInbox') : t('routing.inboxType.ADDRESS'));

  const submit = () => {
    setTried(true);
    setFailed(null);
    if (addressMissing) return;
    const inbox: InboxTarget = inboxType === 'ADDRESS' ? { type: 'ADDRESS', address } : { type: inboxType };
    save
      .mutateAsync({ id: rule?.id, kind, topicKey: kind === 'CONTACT' && topicKey ? topicKey : null, inbox, autoReply })
      .then(onClose)
      .catch((e: unknown) => setFailed(adminErrorText(t, e)));
  };

  return (
    <Modal labelledBy="rr_h" onClose={onClose}>
      <div className="ix_card">
        <h3 id="rr_h">{t(rule ? 'routing.editTitle' : 'routing.addTitle')}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          noValidate
        >
          <Field id="rr_k" label={t('routing.kind')}>
            <Select
              value={kind}
              onChange={(e) => {
                const next = e.target.value as RoutingKind;
                setKind(next);
                setInboxType(next === 'HUB_RSVP' ? 'HUB' : next === 'COMMITTEE' ? 'COMMITTEE' : 'ADDRESS');
              }}
              options={KINDS.map((k) => ({ value: k, label: t(`routing.kind.${k}`) }))}
            />
          </Field>
          {kind === 'CONTACT' && (
            <Field id="rr_t" label={t('routing.topic')}>
              <Select value={topicKey} onChange={(e) => setTopicKey(e.target.value)}>
                <option value="">{t('routing.any')}</option>
                {(topics.data?.entries ?? []).map((e) => (
                  <option key={e.key} value={e.key}>
                    {typeof e.fields.name === 'string' ? e.fields.name : e.key}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          {inboxTypes.length > 1 && (
            <Field id="rr_i" label={t('routing.inboxType')}>
              <Select value={inboxType} onChange={(e) => setInboxType(e.target.value as InboxTarget['type'])} options={inboxTypes.map((type) => ({ value: type, label: inboxLabel(type) }))} />
            </Field>
          )}
          {inboxType === 'ADDRESS' && (
            <Field id="rr_a" label={t('routing.address')} error={tried && addressMissing ? t('routing.addressRequired') : (failed ?? undefined)}>
              <Input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
          )}
          <CheckField id="rr_r" label={t('routing.autoReplyLabel')} checked={autoReply} onChange={(e) => setAutoReply(e.target.checked)} />
          {failed && inboxType !== 'ADDRESS' && (
            <span className="ix_err" role="alert">
              {failed}
            </span>
          )}
          <div className="ix_btn_row">
            <button type="submit" className="common_btn" disabled={save.isPending}>
              {t('routing.save')}
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
