import type { ReactNode } from 'react';
import { ErrorState, LoadingState } from '../states/QueryStates';
import { useT } from '@/i18n/useT';

// Loading / error states of a portal or admin screen in the design's style (ARCHITECTURE §6.5).
export function QueryState({ isPending, isError, onRetry, children }: { isPending: boolean; isError: boolean; onRetry: () => void; children: ReactNode }) {
  const t = useT('common');
  if (isPending) return <LoadingState label={t('states.loading')} />;
  if (isError) {
    return (
      <ErrorState title={t('states.errorTitle')} retryLabel={t('states.retry')} onRetry={onRetry}>
        {t('states.errorBody')}
      </ErrorState>
    );
  }
  return <>{children}</>;
}
