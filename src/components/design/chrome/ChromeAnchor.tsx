import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

// A chrome link: in-app paths render a router <Link>, anything else (external URLs, the
// template's "#" social placeholders) a plain <a>. Same element and classes either way.
type ChromeAnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  external?: boolean;
  children: ReactNode;
};

export function ChromeAnchor({ to, external, children, ...rest }: ChromeAnchorProps) {
  if (external || !to.startsWith('/')) {
    return (
      <a href={to} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} {...rest}>
      {children}
    </Link>
  );
}
