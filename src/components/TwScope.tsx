import type { ReactNode } from 'react';

// Boundary for the starter (Tailwind) screens — ARCHITECTURE.md §1.3.
// Inside .tw-root the design CSS is neutralised and Tailwind's preflight applies
// (src/styles/tw-scope.css); background, text colour, font and min-height come
// from the scoped base styles in src/index.css. Design screens never render
// inside this wrapper.
export function TwScope({ children }: { children: ReactNode }) {
  return <div className="tw-root">{children}</div>;
}
