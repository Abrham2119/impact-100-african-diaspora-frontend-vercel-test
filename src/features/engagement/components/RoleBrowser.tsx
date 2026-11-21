import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Badge, Button, ButtonRow, Card, Chip, ChipGroup, Field, Input, ResultBox, Textarea } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import type { FormBlockData } from '@/features/content/components/formRegistry';
import { CollectionState, SectionHeadingRow } from '@/features/content/components/sections/shared';
import { useSectionEntries } from '@/features/content/hooks/useSectionEntries';
import { volunteerRoles } from '@/features/content/schemas/sectionTypes';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { interestsStorage } from '@/infrastructure/storage/interests.storage';
import { submissionStorage } from '@/infrastructure/storage/submission.storage';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { cx } from '@/lib/classes';
import { isEmail, isName } from '@/lib/validation';
import { useSubmitVolunteerSignup } from '../hooks/useEngagement';

// form_block `volunteer` — /volunteer (volunteer.dc.html): area filters with counts (`?area=`,
// legacy `#area=usafi`), role cards (C:volunteer_roles) with "Matches your interests" (the hub and
// portfolio picked on the grants map), the tray (`?roles=a,b` preselects) and the sign-up form →
// `POST engagement/volunteer-signups` (mocked) → /volunteer/thanks with the teams it went to.
// Items: the filters (key all | chapter | us | usafi | africa, `title` = label).
const ALL = 'all';

export function RoleBrowser({ section }: { section: FormBlockData }) {
  const { fields, items, settings } = section;
  const tf = useT('forms');
  const { locale, toPath } = useLocale();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const roles = useSectionEntries(volunteerRoles, settings.source ?? { collection: 'volunteer_roles' });
  const [areaParam, setAreaParam] = useSearchParamState('area');
  const [rolesParam] = useSearchParamState('roles');
  const [interests] = useState(interestsStorage.read);
  const signup = useSubmitVolunteerSignup();

  const areaLabel = useMemo(() => new Map(items.map((item) => [item.settings.key ?? '', item.fields.title ?? ''])), [items]);
  const area = areaParam !== null && areaLabel.has(areaParam) ? areaParam : ALL;
  const matches = (interestKey: string | undefined) =>
    interestKey !== undefined && (interestKey === interests.hub || interestKey === interests.portfolio);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().refine(isName, tf('error.name')),
        email: z.string().refine(isEmail, tf('error.email')),
        location: z.string().refine((value) => value.trim().length > 0, tf('error.location')),
        note: z.string(),
        roles: z.array(z.string()).min(1, tf('error.tray')),
      }),
    [tf],
  );
  const form = useDesignForm(schema, {
    name: '',
    email: '',
    location: '',
    note: '',
    roles: rolesParam ? rolesParam.split(',').filter(Boolean) : [],
  });
  const { errors, isSubmitted } = form.formState;
  const tray = form.watch('roles');
  const setTray = (next: string[]) => form.setValue('roles', next, { shouldValidate: isSubmitted });
  const toggle = (key: string) => setTray(tray.includes(key) ? tray.filter((k) => k !== key) : [...tray, key]);

  const byKey = useMemo(() => new Map(roles.entries.map((role) => [role.key, role])), [roles.entries]);
  const visible = roles.entries.filter((role) => area === ALL || role.data.area === area);
  const trayRoles = tray.map((key) => byKey.get(key)).filter((role): role is NonNullable<typeof role> => role !== undefined);

  const send = form.handleSubmit((values) =>
    signup.mutate(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        location: values.location.trim(),
        ...(values.note.trim() ? { note: values.note.trim() } : {}),
        role_keys: values.roles,
        source_path: pathname,
      },
      {
        onSuccess: (response) => {
          const n = response.teams.length;
          const plural = new Intl.PluralRules(locale).select(n) === 'one' ? 'volunteer.teams.one' : 'volunteer.teams.other';
          submissionStorage.save('volunteer', {
            count: tf(plural, { count: n }),
            teams: response.teams.map((team) => team.label).join(' · '),
          });
          navigate(toPath(PATHS.public.volunteerThanks));
        },
      },
    ),
  );

  return (
    <section className="mt_100">
      <div className="container">
        <SectionHeadingRow kicker={fields.kicker} title={fields.title} lead={fields.lead} width="wide" />
        <CollectionState isPending={roles.isPending} isError={roles.isError} isEmpty={roles.entries.length === 0} onRetry={() => void roles.refetch()}>
          <ChipGroup label={tf('volunteer.filters')} className="mt_50">
            {items.map((item) => {
              const key = item.settings.key ?? ALL;
              const count = key === ALL ? roles.entries.length : roles.entries.filter((role) => role.data.area === key).length;
              return (
                <Chip key={item.id} on={area === key} count={count} onClick={() => setAreaParam(key === ALL ? null : key)}>
                  {item.fields.title}
                </Chip>
              );
            })}
          </ChipGroup>
          <div className="row ix_gap mt_30">
            <div className="col-lg-8">
              <div className="row ix_gap">
                {visible.map((role) => {
                  const inTray = tray.includes(role.key);
                  return (
                    <div key={role.key} className="col-md-6">
                      <Card className="ix_role">
                        <div className="ix_role_top">
                          <span className="ix_kicker">{areaLabel.get(role.data.area)}</span>
                          {matches(role.data.interest_key) && <Badge kind="accent">{tf('volunteer.match')}</Badge>}
                        </div>
                        <h4 className="ixd_mt8">{role.fields.title}</h4>
                        <p>{role.fields.description}</p>
                        <p className="ix_note">{tf('volunteer.team', { team: role.fields.team })}</p>
                        <ButtonRow>
                          <Button size="sm" variant={inTray ? 'accent' : 'default'} aria-pressed={inTray} onClick={() => toggle(role.key)}>
                            {inTray ? tf('volunteer.inTray') : tf('volunteer.add')}
                          </Button>
                        </ButtonRow>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-lg-4">
              <Card className="ix_tray ixd_h_auto" kicker={tf('volunteer.tray')}>
                <h3 className="ixd_mt6">{tf('volunteer.selected', { count: tray.length })}</h3>
                {trayRoles.map((role) => (
                  <div key={role.key} className="ix_tray_item">
                    <div>
                      <b>{role.fields.title}</b>
                      <p className="ix_note ixd_m2_0">{role.fields.team}</p>
                    </div>
                    <button
                      type="button"
                      className="ix_x"
                      aria-label={tf('volunteer.remove', { title: role.fields.title })}
                      onClick={() => setTray(tray.filter((key) => key !== role.key))}
                    >
                      <i className="far fa-times" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                {tray.length === 0 && <p className="ix_note">{tf('volunteer.trayEmpty')}</p>}
                <form onSubmit={send} noValidate>
                  <Field id="v_name" label={tf('volunteer.name')} error={errors.name?.message}>
                    <Input type="text" autoComplete="name" {...form.register('name')} />
                  </Field>
                  <Field id="v_email" label={tf('volunteer.email')} error={errors.email?.message}>
                    <Input type="email" autoComplete="email" {...form.register('email')} />
                  </Field>
                  <Field id="v_loc" label={tf('volunteer.location')} error={errors.location?.message}>
                    <Input type="text" placeholder={tf('volunteer.locationPlaceholder')} {...form.register('location')} />
                  </Field>
                  <Field id="v_note" label={tf('volunteer.note')}>
                    <Textarea rows={3} {...form.register('note')} />
                  </Field>
                  {errors.roles && (
                    <span className={cx('ix_err')} role="alert">
                      {errors.roles.message}
                    </span>
                  )}
                  {signup.isError && <ResultBox kind="bad" title={tf('error.submit')} />}
                  <ButtonRow>
                    <Button type="submit" disabled={signup.isPending}>
                      {fields.submit_label}
                    </Button>
                  </ButtonRow>
                </form>
              </Card>
            </div>
          </div>
        </CollectionState>
      </div>
    </section>
  );
}
