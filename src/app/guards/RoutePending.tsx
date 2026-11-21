import { LoadingState } from '@/components/design';
import { useT } from '@/i18n/useT';

// Design-styled placeholder shown by the guards while the session rehydrates.
export function RoutePending() {
  const t = useT('common');
  return <LoadingState label={t('states.loading')} />;
}
