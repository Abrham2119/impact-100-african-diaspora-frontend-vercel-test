import { useMemo, type ComponentType } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Field, Input, ResultBox, Select, Textarea } from '@/components/design';
import { ContactAddressIcon, ContactEmailIcon, ContactPhoneIcon } from '@/components/design/blocks/detailIcons';
import { PATHS } from '@/app/routes/paths';
import { CmsImage } from '@/features/content/components/CmsImage';
import { RichText } from '@/features/content/components/RichText';
import type { FormBlockData } from '@/features/content/components/formRegistry';
import { useSectionEntries } from '@/features/content/hooks/useSectionEntries';
import { contactTopics } from '@/features/content/schemas/sectionTypes';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useSearchParamState } from '@/hooks/useSearchParamState';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { LONG_TEXT_MAX, LONG_TEXT_MIN, isEmail, isName } from '@/lib/validation';
import { useSubmitContact } from '../hooks/useEngagement';

// form_block `contact` — /contact (contact.dc.html): the three contact cards, the form (6 topics
// from C:contact_topics, `?topic=` preselects one — legacy `#topic=partner` links too), consent,
// the image and the map tile. Sends `POST engagement/contact` (mocked) → /contact/thanks.
// Items: the cards (key address | email | phone; `value` text or `link`) and the map (key map, `link`).
const ICONS: Record<string, ComponentType> = { address: ContactAddressIcon, email: ContactEmailIcon, phone: ContactPhoneIcon };

export function ContactForm({ section }: { section: FormBlockData }) {
  const { fields, items, media, settings } = section;
  const tf = useT('forms');
  const { toPath } = useLocale();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const topics = useSectionEntries(contactTopics, settings.source ?? { collection: 'contact_topics' });
  const [topicParam, setTopicParam] = useSearchParamState('topic');
  const submit = useSubmitContact();
  const cards = items.filter((item) => item.settings.key !== 'map');
  const map = items.find((item) => item.settings.key === 'map');
  const topic = topics.entries.some((entry) => entry.key === topicParam) ? (topicParam ?? '') : (settings.default_key ?? topics.entries[0]?.key ?? '');

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().refine(isName, tf('error.name')),
        email: z.string().refine(isEmail, tf('error.email')),
        phone: z.string(),
        message: z
          .string()
          .refine((value) => value.trim().length >= LONG_TEXT_MIN && value.trim().length <= LONG_TEXT_MAX, tf('error.message')),
        consent: z.boolean().refine(Boolean, tf('error.consent')),
      }),
    [tf],
  );
  const form = useDesignForm(schema, { name: '', email: '', phone: '', message: '', consent: false });
  const { errors } = form.formState;
  const send = form.handleSubmit((values) =>
    submit.mutate(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
        topic_key: topic,
        message: values.message.trim(),
        consent: values.consent,
        source_path: pathname,
      },
      { onSuccess: () => navigate(toPath(PATHS.public.contactThanks)) },
    ),
  );
  const [before, after] = (fields.consent_label ?? '').split('{link}');

  return (
    <section className="contact mt_100">
      <div className="container">
        <div className="row">
          {cards.map((card) => {
            const Icon = ICONS[card.settings.key ?? ''];
            return (
              <div key={card.id} className="col-lg-4 col-md-6">
                <div className="contact_info">
                  <span>{Icon && <Icon />}</span>
                  <h3>{card.fields.title}</h3>
                  {card.fields.link ? <a href={card.fields.link.href}>{card.fields.link.label}</a> : <p>{card.fields.value}</p>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="contact_form">
          <form onSubmit={send} noValidate>
            <div className="row">
              <div className="col-xl-7 col-lg-6">
                {fields.title !== undefined && <h3>{fields.title}</h3>}
                {fields.lead !== undefined && <p className="ix_note ixd_mt6">{fields.lead}</p>}
                <div className="row">
                  <div className="col-xl-6 col-md-6">
                    <Field id="ct_name" label={tf('contact.name')} error={errors.name?.message}>
                      <Input type="text" autoComplete="name" placeholder={tf('contact.namePlaceholder')} {...form.register('name')} />
                    </Field>
                  </div>
                  <div className="col-xl-6 col-md-6">
                    <Field id="ct_email" label={tf('contact.email')} error={errors.email?.message}>
                      <Input type="email" autoComplete="email" placeholder={tf('contact.emailPlaceholder')} {...form.register('email')} />
                    </Field>
                  </div>
                  <div className="col-xl-6 col-md-6">
                    <Field id="ct_phone" label={tf('contact.phone')}>
                      <Input type="text" autoComplete="tel" placeholder={tf('contact.phonePlaceholder')} {...form.register('phone')} />
                    </Field>
                  </div>
                  <div className="col-xl-6 col-md-6">
                    <Field id="ct_topic" label={tf('contact.topic')}>
                      <Select
                        value={topic}
                        onChange={(event) => setTopicParam(event.target.value)}
                        options={topics.entries.map((entry) => ({ value: entry.key, label: entry.fields.name }))}
                      />
                    </Field>
                  </div>
                  <div className="col-xl-12">
                    <Field id="ct_msg" label={tf('contact.message')} error={errors.message?.message}>
                      <Textarea rows={5} placeholder={tf('contact.messagePlaceholder')} {...form.register('message')} />
                    </Field>
                  </div>
                  <div className="col-xl-12">
                    <div className="contact_input mt_10">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          id="ct_consent"
                          type="checkbox"
                          aria-invalid={errors.consent ? true : undefined}
                          aria-describedby={errors.consent ? 'ct_consent-error' : undefined}
                          {...form.register('consent')}
                        />
                        <label className="form-check-label" htmlFor="ct_consent">
                          {before}
                          {fields.consent_link && (
                            <Link className="ix_link" to={toPath(fields.consent_link.href)}>
                              {fields.consent_link.label}
                            </Link>
                          )}
                          {after}
                        </label>
                      </div>
                      {errors.consent && (
                        <span id="ct_consent-error" className="ix_err" role="alert">
                          {errors.consent.message}
                        </span>
                      )}
                      {submit.isError && <ResultBox kind="bad" title={tf('error.submit')} />}
                      <button className="common_btn" type="submit" disabled={submit.isPending}>
                        {fields.submit_label}
                      </button>
                    </div>
                  </div>
                </div>
                {fields.note && <RichText value={fields.note} />}
              </div>
              <div className="col-xl-5 col-lg-6">
                {media.image && (
                  <div className="contact_img">
                    <CmsImage media={media.image} className="img-fluid" />
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
        {map?.fields.link && (
          <div className="contact_map mt_100">
            <a className="dc_map" href={map.fields.link.href} target="_blank" rel="noopener">
              <i className="fas fa-map-marker-alt" aria-hidden="true" />
              {` ${map.fields.link.label}`}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
