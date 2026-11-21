import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button, ButtonRow, Card, Field, Input, ResultBox, Textarea, Timeline } from '@/components/design';
import { RichText } from '@/features/content/components/RichText';
import type { FormBlockData } from '@/features/content/components/formRegistry';
import { useDesignForm } from '@/hooks/useDesignForm';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { LONG_TEXT_MAX, LONG_TEXT_MIN, isEmail, isName } from '@/lib/validation';
import { useSubmitStory } from '../hooks/useEngagement';

// form_block `share_story` — /news/share-a-story (share_story.dc.html): the story form (optional
// photo: JPG/PNG/WebP up to 5 MB, its description then required) → `POST engagement/stories`
// (multipart, mocked), then the "with an editor" result. Side card: "What happens next" (items =
// timeline steps, `done` marks the reached ones) and a link to the member stories.
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export function ShareStoryForm({ section }: { section: FormBlockData }) {
  const { fields, items } = section;
  const tf = useT('forms');
  const { toPath } = useLocale();
  const story = useSubmitStory();

  const schema = useMemo(
    () =>
      z
        .object({
          name: z.string().refine(isName, tf('error.name')),
          email: z.string().refine(isEmail, tf('error.email')),
          title: z.string().refine((value) => value.trim().length > 0, tf('error.title')),
          body: z.string().refine((value) => value.trim().length >= LONG_TEXT_MIN && value.trim().length <= LONG_TEXT_MAX, tf('error.story')),
          photo: z
            .custom<FileList | undefined>()
            .refine((files) => !files?.[0] || (PHOTO_TYPES.includes(files[0].type) && files[0].size <= PHOTO_MAX_BYTES), tf('error.photo')),
          photoAlt: z.string(),
        })
        .refine((values) => !values.photo?.[0] || values.photoAlt.trim().length > 0, { path: ['photoAlt'], message: tf('error.photoAlt') }),
    [tf],
  );
  const form = useDesignForm(schema, { name: '', email: '', title: '', body: '', photo: undefined, photoAlt: '' });
  const { errors } = form.formState;
  const send = form.handleSubmit((values) => {
    const photo = values.photo?.[0];
    story.mutate({
      name: values.name.trim(),
      email: values.email.trim(),
      title: values.title.trim(),
      body: values.body.trim(),
      ...(photo ? { photo, photo_alt: values.photoAlt.trim() } : {}),
    });
  });

  return (
    <section className="mt_100">
      <div className="container">
        <div className="row ix_gap">
          <div className="col-lg-7">
            <Card kicker={fields.kicker}>
              {fields.title !== undefined && <h2 className="ixd_title_36 ixd_mt8">{fields.title}</h2>}
              {fields.body && <RichText value={fields.body} />}
              {story.isSuccess ? (
                <ResultBox kind="ok" title={fields.success_title}>
                  {fields.success_body}
                </ResultBox>
              ) : (
                <form onSubmit={send} noValidate>
                  <div className="row">
                    <div className="col-md-6">
                      <Field id="s_name" label={tf('story.name')} error={errors.name?.message}>
                        <Input type="text" autoComplete="name" {...form.register('name')} />
                      </Field>
                    </div>
                    <div className="col-md-6">
                      <Field id="s_email" label={tf('story.email')} error={errors.email?.message}>
                        <Input type="email" autoComplete="email" {...form.register('email')} />
                      </Field>
                    </div>
                    <div className="col-12">
                      <Field id="s_title" label={tf('story.title')} error={errors.title?.message}>
                        <Input type="text" {...form.register('title')} />
                      </Field>
                    </div>
                    <div className="col-12">
                      <Field id="s_body" label={tf('story.body')} error={errors.body?.message}>
                        <Textarea rows={5} placeholder={tf('story.bodyPlaceholder')} {...form.register('body')} />
                      </Field>
                    </div>
                    <div className="col-12">
                      <Field id="s_img" label={tf('story.photo')} help={tf('story.photoHelp')} error={errors.photo?.message}>
                        <Input type="file" accept={PHOTO_TYPES.join(',')} {...form.register('photo')} />
                      </Field>
                    </div>
                    <div className="col-12">
                      <Field id="s_alt" label={tf('story.photoAlt')} error={errors.photoAlt?.message}>
                        <Input type="text" {...form.register('photoAlt')} />
                      </Field>
                    </div>
                  </div>
                  {story.isError && <ResultBox kind="bad" title={tf('error.submit')} />}
                  <ButtonRow>
                    <Button type="submit" disabled={story.isPending}>
                      {fields.submit_label}
                    </Button>
                  </ButtonRow>
                </form>
              )}
            </Card>
          </div>
          <div className="col-lg-5">
            <Card
              tone="soft"
              footer={
                fields.side_link ? (
                  <Link className="ix_link" to={toPath(fields.side_link.href)}>
                    {fields.side_link.label}
                  </Link>
                ) : undefined
              }
            >
              {fields.side_title !== undefined && <h4>{fields.side_title}</h4>}
              <Timeline
                className="mt_30"
                items={items.map((item) => ({
                  id: item.id,
                  title: item.fields.title,
                  text: item.fields.value,
                  done: item.settings.done,
                }))}
              />
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
