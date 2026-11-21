import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Badge, Field, Input, Modal, Panel, QueryState, Select, Table, type TableColumn } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import type { PersonRow } from '@/domain/entities/admin.types';
import { AdminError } from '@/domain/rules/admin';
import { Can } from '@/features/auth/components/Can';
import { useCatalog } from '@/features/content/hooks/useCatalog';
import { levelName } from '@/features/membership/lib/levelName';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useT } from '@/i18n/useT';
import { isEmail, isName } from '@/lib/validation';
import { ASSIGNABLE_ROLES } from '../api/peopleRepository';
import { useAddPerson, usePeople } from '../hooks/useAdmin';
import { useAdminList, useListFilter } from '../hooks/useAdminList';
import { AdminPager } from './AdminPager';
import { hubShort, rolesText, voteStatus } from './labels';

// People (admin_people.dc.html): one record per email; search, role filter, sortable columns and
// pages (all in the URL); levels and votes are computed from the ledger. "add person" opens a dialog.
export function PeoplePage() {
  const t = useT('admin');
  const ts = useT('site');
  const searchId = useId();
  const roleId = useId();
  const query = usePeople();
  const [role, setRole] = useListFilter('role');
  const [adding, setAdding] = useState(false);

  const columns: Array<TableColumn<PersonRow>> = [
    { key: 'name', header: t('people.name'), cell: (p) => p.fullName, sortValue: (p) => p.fullName },
    { key: 'email', header: t('people.email'), cell: (p) => p.email, sortValue: (p) => p.email },
    { key: 'hub', header: t('people.hub'), cell: (p) => hubShort(t, p.usHubKey), sortValue: (p) => p.usHubKey ?? '' },
    { key: 'roles', header: t('people.roles'), cell: (p) => rolesText(t, p) },
    { key: 'level', header: t('people.level'), cell: (p) => (p.levelKey ? levelName(ts, p.levelKey) : t('people.none')), sortValue: (p) => p.levelKey ?? '' },
    {
      key: 'vote',
      header: t('people.vote'),
      cell: (p) => {
        const status = voteStatus(p);
        return status === 'VOTING' ? <Badge kind="ok">{t('people.voting')}</Badge> : <Badge>{status === 'NO_VOTE' ? t('people.noVote') : t('people.none')}</Badge>;
      },
      sortValue: (p) => (p.votingEligible ? 0 : 1),
    },
    { key: 'open', header: '', cell: (p) => <Link to={PATHS.admin.person(p.id)}>{t('people.open')}</Link> },
  ];
  const list = useAdminList(query.data, {
    columns,
    searchText: (p) => `${p.fullName} ${p.email}`,
    filters: { role: (p, value) => p.grants.some((g) => g.role === value) },
  });

  return (
    <Panel
      title={t('people.title')}
      lead={t('people.lead')}
      right={
        <div className="ix_toolbar">
          <label className="ix_sr" htmlFor={searchId}>
            {t('people.search')}
          </label>
          <input id={searchId} type="search" placeholder={t('people.search')} value={list.query} onChange={(e) => list.onSearch(e.target.value)} />
          <label className="ix_sr" htmlFor={roleId}>
            {t('people.role')}
          </label>
          <select id={roleId} className="ix_select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">{t('people.allRoles')}</option>
            {ASSIGNABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {t(`role.${r}`)}
              </option>
            ))}
          </select>
          <Can require="users:create">
            <button type="button" className="common_btn ix_btn_sm" onClick={() => setAdding(true)}>
              {t('people.add')}
            </button>
          </Can>
        </div>
      }
    >
      <QueryState isPending={query.isPending} isError={query.isError} onRetry={() => void query.refetch()}>
        <Table<PersonRow> rows={list.rows} rowKey={(p) => p.id} columns={columns} sort={list.sort} onSort={list.onSort} empty={t('list.empty')} />
        <AdminPager page={list.page} totalPages={list.totalPages} />
      </QueryState>
      {adding && <AddPerson onClose={() => setAdding(false)} />}
    </Panel>
  );
}

function AddPerson({ onClose }: { onClose: () => void }) {
  const t = useT('admin');
  const tf = useT('forms');
  const catalog = useCatalog();
  const add = useAddPerson();
  const [failed, setFailed] = useState<string | null>(null);
  const schema = useMemo(
    () => z.object({ fullName: z.string().refine(isName, tf('error.name')), email: z.string().refine(isEmail, tf('error.email')), usHubKey: z.string() }),
    [tf],
  );
  const form = useDesignForm(schema, { fullName: '', email: '', usHubKey: '' });
  const errors = form.formState.errors;
  const submit = form.handleSubmit(({ fullName, email, usHubKey }) =>
    add
      .mutateAsync({ fullName, email, usHubKey: usHubKey || null })
      .then(onClose)
      .catch((error: unknown) => setFailed(error instanceof AdminError ? t(`error.${error.code}` as 'error.generic') : t('error.generic'))),
  );

  return (
    <Modal labelledBy="ap_h" onClose={onClose}>
      <div className="ix_card">
        <h3 id="ap_h">{t('people.addTitle')}</h3>
        <p>{t('people.addLead')}</p>
        <form onSubmit={(e) => void submit(e)} noValidate>
          <Field id="ap_name" label={t('people.fullName')} error={errors.fullName?.message}>
            <Input type="text" autoComplete="off" {...form.register('fullName')} />
          </Field>
          <Field id="ap_email" label={t('people.email')} error={errors.email?.message ?? failed ?? undefined}>
            <Input type="email" autoComplete="off" {...form.register('email')} />
          </Field>
          <Field id="ap_hub" label={t('people.usHub')}>
            <Select options={[{ value: '', label: t('people.noHub') }, ...catalog.hubKeys.map((k) => ({ value: k, label: catalog.hub(k) }))]} {...form.register('usHubKey')} />
          </Field>
          <div className="ix_btn_row">
            <button type="submit" className="common_btn" disabled={add.isPending}>
              {t('people.addCta')}
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

