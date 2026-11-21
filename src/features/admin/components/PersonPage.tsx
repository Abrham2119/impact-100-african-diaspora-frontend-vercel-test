import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { EmptyState, Field, Modal, Panel, QueryState, Select, Table } from '@/components/design';
import { useShellCrumb } from '@/app/layouts/shellCrumb';
import type { PersonActivity, PersonDetail, RoleGrant } from '@/domain/entities/admin.types';
import type { ChapterRoleName } from '@/domain/enums/role.enum';
import { AdminError } from '@/domain/rules/admin';
import { Can } from '@/features/auth/components/Can';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { imageUrl } from '@/features/content/fixtures/builders';
import { levelName } from '@/features/membership/lib/levelName';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate, formatMoney } from '@/lib/format';
import { useGrantRole, usePerson, useRevokeRole, useSetAccess } from '../hooks/useAdmin';
import { roleLabel } from './labels';

// Person detail (admin_person.dc.html): who they are and what the ledger makes them (level, vote,
// pledge), their roles (grant / revoke; scope, who granted, since), access, and recent activity.
const GRANTABLE: ChapterRoleName[] = ['COMMITTEE_MEMBER', 'HUB_CO_AMBASSADOR', 'CONTENT_EDITOR', 'CHAPTER_ADMIN', 'USAFI_FINANCE'];

export function PersonPage() {
  const t = useT('admin');
  const { id } = useParams();
  const query = usePerson(id);
  useShellCrumb(query.data?.fullName);

  return (
    <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
      {query.data ? <PersonView person={query.data} /> : <EmptyState>{t('person.notFound')}</EmptyState>}
    </QueryState>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function PersonView({ person }: { person: PersonDetail }) {
  const t = useT('admin');
  const ts = useT('site');
  const { locale } = useLocale();
  const catalog = useCatalog();
  const money = (cents: number) => formatMoney(cents, locale);
  const revoke = useRevokeRole();
  const setAccess = useSetAccess();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const fail = (e: unknown) => setError(e instanceof AdminError ? t(`error.${e.code}` as 'error.generic') : t('error.generic'));

  const joined = formatDate(person.joinedOn, locale);
  const meta = person.usHubKey ? t('person.meta', { email: person.email, hub: catalog.hub(person.usHubKey), date: joined }) : t('person.metaNoHub', { email: person.email, date: joined });
  const interests = [catalog.country(person.africanHubKey), catalog.portfolioName(person.portfolioKey)].filter(Boolean).join(' · ') || t('people.none');
  const scopeOf = (g: RoleGrant) => (g.scopeType === 'HUB' ? catalog.hub(g.scopeId) : g.scopeType === 'COMMITTEE' ? catalog.committee(g.scopeId) : t('people.none'));
  const activityText = (a: PersonActivity) =>
    t(`activity.${a.kind}`, {
      amount: a.values.amount ? money(Number(a.values.amount)) : '',
      title: a.values.title ?? '',
      role: a.values.role ? roleLabel(t, a.values.role as ChapterRoleName) : '',
    });

  return (
    <>
      <div className="dashboard_contant">
        <div className="dashboard_profile">
          <div className="img">{person.avatarFile ? <img src={imageUrl(person.avatarFile)} alt="" className="img-fluid w-100" /> : <div className="ix_avatar">{initials(person.fullName)}</div>}</div>
          <div className="text">
            <h6>{person.fullName}</h6>
            <p>{meta}</p>
          </div>
        </div>
        <ul className="dashboard_profile_info">
          <li>
            <span>{t('person.level')}</span>
            {person.levelKey ? t('person.levelValue', { level: levelName(ts, person.levelKey) }) : t('people.none')}
          </li>
          <li>
            <span>{t('person.voting')}</span>
            {person.votingEligible ? t('person.eligible', { received: money(person.receivedCents) }) : t('person.notEligible', { received: money(person.receivedCents) })}
          </li>
          <li>
            <span>{t('person.pledge')}</span>
            {person.pledgeLevelKey
              ? t('person.pledgeValue', { level: levelName(ts, person.pledgeLevelKey), amount: money(person.pledgeCents), count: person.installmentCount })
              : t('people.none')}
          </li>
          <li>
            <span>{t('person.interests')}</span>
            {interests}
          </li>
          <li>
            <span>{t('person.wazi')}</span>
            {person.waziLinked ? t('person.linked') : t('person.notLinked')}
          </li>
        </ul>
      </div>
      <Panel title={t('person.roles')} lead={t('person.rolesLead')}>
        <Table<RoleGrant>
          rows={person.grants}
          rowKey={(g) => `${g.role}-${g.scopeId ?? ''}`}
          columns={[
            { key: 'role', header: t('person.role'), cell: (g) => roleLabel(t, g.role) },
            { key: 'scope', header: t('person.scope'), cell: scopeOf },
            { key: 'by', header: t('person.grantedBy'), cell: (g) => g.grantedBy ?? t('person.automatic') },
            { key: 'since', header: t('person.since'), cell: (g) => formatDate(g.grantedOn, locale) },
            {
              key: 'revoke',
              header: '',
              cell: (g) =>
                g.grantedBy === null ? (
                  t('people.none')
                ) : (
                  <Can require="roles:assign" fallback={t('people.none')}>
                    <a
                      href="#"
                      role="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setError(null);
                        revoke.mutateAsync({ personId: person.id, role: g.role, scopeId: g.scopeId ?? null }).catch(fail);
                      }}
                    >
                      {t('person.revoke')}
                    </a>
                  </Can>
                ),
            },
          ]}
        />
        <GrantForm person={person} onError={setError} onDisable={() => setConfirming(true)} />
        {error && (
          <span className="ix_err" role="alert">
            {error}
          </span>
        )}
        {person.disabled && <p className="ix_note">{t('person.disabledNote')}</p>}
      </Panel>
      <Panel title={t('person.activity')}>
        <Table<PersonActivity>
          rows={person.activity}
          rowKey={(a) => `${a.date}-${a.kind}-${JSON.stringify(a.values)}`}
          empty={t('person.noActivity')}
          columns={[
            { key: 'when', header: t('person.when'), cell: (a) => formatDate(a.date, locale) },
            { key: 'what', header: t('person.what'), cell: activityText },
          ]}
        />
      </Panel>
      {confirming && (
        <Modal labelledBy="pd_h" onClose={() => setConfirming(false)}>
          <div className="ix_card">
            <h3 id="pd_h">{t('person.disableTitle')}</h3>
            <p>{t('person.disableBody', { name: person.fullName })}</p>
            <div className="ix_btn_row">
              <button
                type="button"
                className="common_btn ix_btn_dark"
                disabled={setAccess.isPending}
                onClick={() =>
                  setAccess
                    .mutateAsync({ personId: person.id, enabled: false })
                    .catch(fail)
                    .finally(() => setConfirming(false))
                }
              >
                {t('person.disableCta')}
              </button>
              <button type="button" className="common_btn ix_btn_ghost" onClick={() => setConfirming(false)}>
                {t('people.cancel')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

/** "Grant a role" + hub, and the access switch (admin_person.dc.html). */
function GrantForm({ person: p, onError, onDisable }: { person: PersonDetail; onError: (message: string | null) => void; onDisable: () => void }) {
  const t = useT('admin');
  const catalog = useCatalog();
  const grant = useGrantRole();
  const setAccess = useSetAccess();
  const fail = (e: unknown) => onError(e instanceof AdminError ? t(`error.${e.code}` as 'error.generic') : t('error.generic'));
  const schema = useMemo(() => z.object({ role: z.string(), hub: z.string() }), []);
  const form = useDesignForm(schema, { role: GRANTABLE[0], hub: catalog.hubKeys[0] ?? '' });
  const submit = form.handleSubmit(({ role, hub }) => {
    onError(null);
    return grant.mutateAsync({ personId: p.id, role: role as ChapterRoleName, hubKey: role === 'HUB_CO_AMBASSADOR' ? hub || catalog.hubKeys[0] || null : null }).catch(fail);
  });
  return (
    <form onSubmit={(e) => void submit(e)} noValidate>
      <div className="row mt_20">
        <div className="col-md-5">
          <Field id="rl" label={t('person.grant')}>
            <Select options={GRANTABLE.map((r) => ({ value: r, label: roleLabel(t, r) }))} {...form.register('role')} />
          </Field>
        </div>
        <div className="col-md-4">
          <Field id="rh" label={t('person.grantHub')} help={t('person.maxPerHub')}>
            <Select options={catalog.hubKeys.map((k) => ({ value: k, label: catalog.hub(k) }))} {...form.register('hub')} />
          </Field>
        </div>
      </div>
      <div className="ix_btn_row">
        <Can require="roles:assign">
          <button type="submit" className="common_btn ix_btn_sm" disabled={grant.isPending}>
            {t('person.grantCta')}
          </button>
        </Can>
        <Can require="users:suspend">
          {p.disabled ? (
            <button type="button" className="common_btn ix_btn_sm ix_btn_dark" onClick={() => setAccess.mutateAsync({ personId: p.id, enabled: true }).catch(fail)}>
              {t('person.enable')}
            </button>
          ) : (
            <button type="button" className="common_btn ix_btn_sm ix_btn_dark" onClick={onDisable}>
              {t('person.disable')}
            </button>
          )}
        </Can>
      </div>
    </form>
  );
}
