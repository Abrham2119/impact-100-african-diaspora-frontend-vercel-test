import {
  createContext,
  forwardRef,
  useContext,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '@/lib/classes';

// `.contact_input` form field: label + control + optional `.ix_help` + `.ix_err`.
//   <div class="contact_input"><label for="op_d">Date received</label><input id="op_d" type="date">
//     <span class="ix_help">Must fall inside an existing cycle</span></div>
//   …<input id="j_email" class="ix_input_bad"><span class="ix_err" role="alert">That email doesn’t look right…</span>
// The control components read the field's id / description / error state from
// context, so pages only write:
//   <Field id="j_email" label={t('forms.email')} error={errors.email?.message}>
//     <Input type="email" {...register('email')} />
//   </Field>
// All controls forward refs (React Hook Form `register`).

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldProps {
  id: string;
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Field({ id, label, help, error, className, children }: FieldProps) {
  const helpId = help !== undefined ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error) }}>
      <div className={cx('contact_input', className)}>
        <label htmlFor={id}>{label}</label>
        {children}
        {help !== undefined && (
          <span id={helpId} className="ix_help">
            {help}
          </span>
        )}
        {error ? (
          <span id={errorId} className="ix_err" role="alert">
            {error}
          </span>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

// Shared wiring for every control inside a <Field>.
function useControlProps(own: { id?: string; className?: string; 'aria-describedby'?: string }, baseClass?: string) {
  const field = useContext(FieldContext);
  const invalid = field?.invalid ?? false;
  return {
    id: own.id ?? field?.id,
    className: cx(baseClass, invalid && 'ix_input_bad', own.className),
    'aria-invalid': invalid || undefined,
    'aria-describedby': cx(field?.describedBy, own['aria-describedby']),
  };
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const wired = useControlProps(props);
  return <input ref={ref} {...props} {...wired} />;
});
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => {
  const wired = useControlProps(props);
  return <textarea ref={ref} {...props} {...wired} />;
});
Textarea.displayName = 'Textarea';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** convenience for simple lists; otherwise pass <option> children */
  options?: SelectOption[];
}

// `.ix_select` — the design's native select style.
//   <select id="op_meth" class="ix_select"><option value="c">Cheque</option>…</select>
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ options, children, ...props }, ref) => {
  const wired = useControlProps(props, 'ix_select');
  return (
    <select ref={ref} {...props} {...wired}>
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {children}
    </select>
  );
});
Select.displayName = 'Select';
