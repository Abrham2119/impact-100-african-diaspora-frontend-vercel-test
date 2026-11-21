import { FORM_REGISTRY, type FormBlockData } from '../formRegistry';

// form_block — renders the interactive component registered for its `form_key`.
export function FormBlockSection({ section }: { section: FormBlockData }) {
  const Form = FORM_REGISTRY[section.settings.form_key];
  if (!Form) {
    if (import.meta.env.DEV) console.warn(`[cms] no form registered for "${section.settings.form_key}"`);
    return null;
  }
  return <Form section={section} />;
}
