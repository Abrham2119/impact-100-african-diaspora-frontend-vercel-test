import type { ReactNode } from 'react';
import { Button } from '../primitives/Button';
import { Note } from '../primitives/Card';
import { ResultBox } from '../primitives/ResultBox';

// Loading, empty and error states built only from design components (ARCHITECTURE.md §6.5).
// All copy comes in through props (UiStrings `states.*`), never literals.

/** Keeps the block's place while data loads; the label is for assistive tech only. */
export function LoadingState({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="ix_sr">{label}</span>
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <Note>{children}</Note>;
}

export function ErrorState({
  title,
  children,
  retryLabel,
  onRetry,
}: {
  title: ReactNode;
  children?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <ResultBox kind="bad" title={title}>
      {children}
      {onRetry && retryLabel && (
        <>
          {' '}
          <Button size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </>
      )}
    </ResultBox>
  );
}
