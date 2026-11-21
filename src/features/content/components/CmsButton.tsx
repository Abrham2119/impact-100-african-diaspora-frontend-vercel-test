import { ButtonAnchor, ButtonLink, type ButtonSize, type ButtonVariant } from '@/components/design';
import type { CmsButtonVariant, CmsLink } from '@/domain/entities/content.types';
import { cx } from '@/lib/classes';
import { useLocale } from '@/i18n/useLocale';

// A CMS link field rendered as the design's `.common_btn` (CONTENT_AND_I18N §1 "Buttons and
// links": label, target and style are editor-managed). In-app targets get the locale prefix;
// external ones open in a new tab. `ghost_light` is the white ghost button on dark bands.
const STYLE: Record<CmsButtonVariant, { variant: ButtonVariant; className?: string }> = {
  default: { variant: 'default' },
  dark: { variant: 'dark' },
  ghost: { variant: 'ghost' },
  ghost_light: { variant: 'ghost', className: 'ixd_btn_on_dark' },
};

export interface CmsButtonProps {
  link: CmsLink;
  size?: ButtonSize;
  className?: string;
}

export function CmsButton({ link, size, className }: CmsButtonProps) {
  const { toPath } = useLocale();
  const style = STYLE[link.variant];
  const classes = cx(style.className, className);
  if (link.external) {
    return (
      <ButtonAnchor href={link.href} variant={style.variant} size={size} className={classes} target="_blank" rel="noopener">
        {link.label}
      </ButtonAnchor>
    );
  }
  return (
    <ButtonLink to={toPath(link.href)} variant={style.variant} size={size} className={classes}>
      {link.label}
    </ButtonLink>
  );
}

/** A row of CMS buttons (`.ix_btn_row`), e.g. under a card grid. */
export function CmsButtons({ links, size }: { links: CmsLink[]; size?: ButtonSize }) {
  return (
    <>
      {links.map((link) => (
        <CmsButton key={`${link.href}|${link.label}`} link={link} size={size} />
      ))}
    </>
  );
}
