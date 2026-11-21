import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cx } from '@/lib/classes';

// `.common_btn` — the design's pill button (DESIGN_SYSTEM.md "Buttons").
// Class order matches the snapshots: common_btn · ix_btn_sm · variant · extras,
// e.g. "common_btn ix_btn_sm ix_btn_dark", "common_btn ix_btn_dark ix_hide_md".
// Three elements, same look: <Button> (action), <ButtonLink> (in-app route),
// <ButtonAnchor> (external URL, e.g. WAZIImpact.org checkout).

export type ButtonVariant = 'default' | 'dark' | 'ghost' | 'accent';
export type ButtonSize = 'md' | 'sm';

const VARIANT_CLASS: Record<ButtonVariant, string | undefined> = {
  default: undefined,
  dark: 'ix_btn_dark',
  ghost: 'ix_btn_ghost',
  accent: 'ix_btn_acc',
};

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** extra design classes appended last, e.g. "ix_hide_md" */
  className?: string;
  children: ReactNode;
}

export function commonBtnClass({
  variant = 'default',
  size = 'md',
  disabled = false,
  className,
}: Omit<ButtonStyleProps, 'children'> & { disabled?: boolean }): string {
  return cx('common_btn', size === 'sm' && 'ix_btn_sm', VARIANT_CLASS[variant], disabled && 'ix_disabled', className) ?? 'common_btn';
}

type NativeButtonProps = ButtonStyleProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>;

export const Button = forwardRef<HTMLButtonElement, NativeButtonProps>(
  ({ variant, size, className, disabled, type = 'button', children, ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={commonBtnClass({ variant, size, className, disabled })}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  ),
);
Button.displayName = 'Button';

type LinkButtonProps = ButtonStyleProps & Omit<LinkProps, 'className' | 'children'> & { disabled?: boolean };

// A disabled link stays in the markup (as in the join wizard's "back") but is
// removed from the tab order and announced as disabled.
function blockWhenDisabled(disabled: boolean | undefined) {
  return disabled ? (event: MouseEvent<HTMLAnchorElement>) => event.preventDefault() : undefined;
}

export const ButtonLink = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ variant, size, className, disabled, onClick, children, ...rest }, ref) => (
    <Link
      ref={ref}
      className={commonBtnClass({ variant, size, className, disabled })}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={blockWhenDisabled(disabled) ?? onClick}
      {...rest}
    >
      {children}
    </Link>
  ),
);
ButtonLink.displayName = 'ButtonLink';

type AnchorButtonProps = ButtonStyleProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & { href: string; disabled?: boolean };

export const ButtonAnchor = forwardRef<HTMLAnchorElement, AnchorButtonProps>(
  ({ variant, size, className, disabled, onClick, children, ...rest }, ref) => (
    <a
      ref={ref}
      className={commonBtnClass({ variant, size, className, disabled })}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={blockWhenDisabled(disabled) ?? onClick}
      {...rest}
    >
      {children}
    </a>
  ),
);
ButtonAnchor.displayName = 'ButtonAnchor';

// `.ix_btn_row` — horizontal group of buttons.
export function ButtonRow({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('ix_btn_row', className)}>{children}</div>;
}

// `.play_btn` — round play button (video popups), as on the Main/Components boards.
export function PlayButton({
  label,
  href = '#',
  onClick,
}: {
  /** accessible name, e.g. "Play video" (from UiStrings / CMS) */
  label: string;
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a className="play_btn" href={href} aria-label={label} onClick={onClick}>
      <i className="fas fa-play" aria-hidden="true" />
    </a>
  );
}
