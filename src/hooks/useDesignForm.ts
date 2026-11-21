import { useForm, type DefaultValues, type FieldValues } from 'react-hook-form';
import type { ZodSchema } from 'zod';
import { zodResolver } from '@/lib/utils/zodResolver';

// The design's forms validate on submit and show errors only after the first attempt (`tried` in
// the .dc.html scripts), then re-check as the user types. React Hook Form + the local zod
// resolver, with the error copy built into the schema from UiStrings (`forms` namespace).
export function useDesignForm<T extends FieldValues>(schema: ZodSchema<T>, defaultValues: DefaultValues<T>) {
  return useForm<T>({ resolver: zodResolver(schema), defaultValues, mode: 'onSubmit', reValidateMode: 'onChange' });
}
