import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button, ButtonRow, Card, Field, Input, ResultBox } from '@/components/design';
import { useDesignForm } from '@/hooks/useDesignForm';
import type { CmsLink } from '@/domain/entities/content.types';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { isEmail, isName } from '@/lib/validation';
import { useRsvp } from '../hooks/useEngagement';

// "Save your place" (event_details.dc.html #rsvp): name + email → `POST engagement/events/:key/rsvps`
// (mocked), then "You're going". Signed-in one-click RSVP arrives with auth (Step 14).
export interface RsvpCopy {
  kicker: string;
  title: string;
  submit: string;
  login?: CmsLink;
  note?: string;
  doneTitle: string;
  doneBody: string;
}

export function RsvpForm({ eventKey, copy }: { eventKey: string; copy: RsvpCopy }) {
  const tf = useT('forms');
  const { toPath } = useLocale();
  const rsvp = useRsvp(eventKey);
  const schema = useMemo(
    () => z.object({ name: z.string().refine(isName, tf('error.name')), email: z.string().refine(isEmail, tf('error.email')) }),
    [tf],
  );
  const form = useDesignForm(schema, { name: '', email: '' });
  const { errors } = form.formState;
  const send = form.handleSubmit((values) => rsvp.mutate({ name: values.name.trim(), email: values.email.trim() }));

  return (
    <Card className="mt_50 ixd_h_auto" id="rsvp" kicker={copy.kicker}>
      <h3 className="ixd_mt6">{copy.title}</h3>
      {rsvp.isSuccess ? (
        <ResultBox kind="ok" title={copy.doneTitle}>
          {copy.doneBody}
        </ResultBox>
      ) : (
        <form onSubmit={send} noValidate>
          <div className="row">
            <div className="col-md-6">
              <Field id="rv_n" label={tf('rsvp.name')} error={errors.name?.message}>
                <Input type="text" autoComplete="name" placeholder={tf('rsvp.namePlaceholder')} {...form.register('name')} />
              </Field>
            </div>
            <div className="col-md-6">
              <Field id="rv_e" label={tf('rsvp.email')} error={errors.email?.message}>
                <Input type="email" autoComplete="email" {...form.register('email')} />
              </Field>
            </div>
          </div>
          {rsvp.isError && <ResultBox kind="bad" title={tf('error.submit')} />}
          <ButtonRow>
            <Button type="submit" disabled={rsvp.isPending}>
              {copy.submit}
            </Button>
            {copy.login && (
              <Link className="ix_link" to={toPath(copy.login.href)}>
                {copy.login.label}
              </Link>
            )}
          </ButtonRow>
          {copy.note !== undefined && <p className="ix_note">{copy.note}</p>}
        </form>
      )}
    </Card>
  );
}
