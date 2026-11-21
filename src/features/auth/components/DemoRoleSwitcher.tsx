import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card } from '@/components/design';
import { isMockData } from '@/infrastructure/api/dataSource';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { mockAuthTools } from '../api/mockAuthRepository';
import { landingFor } from '../lib/resolveLanding';

// Demo role switcher (Part A, FE-3/FE-7): while the data is mock, a collapsed "Demo" button lets
// reviewers sign in as any demo user (two-step already passed), sign out, or reset the demo auth
// state. Gone with VITE_DATA_SOURCE=api. `?demo=off` hides it for this browser (screenshots),
// `?demo=on` brings it back.
const HIDDEN_KEY = 'ix_demo_hidden';

export function DemoRoleSwitcher() {
  if (!isMockData) return null;
  return <Switcher />;
}

function Switcher() {
  const t = useT('common');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(() => localStorage.getItem(HIDDEN_KEY) === '1');
  const session = useAuthStore((s) => s.session);
  const setDesignSession = useAuthStore((s) => s.setDesignSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  const demoParam = params.get('demo');
  useEffect(() => {
    if (demoParam === 'off') localStorage.setItem(HIDDEN_KEY, '1');
    if (demoParam === 'on') localStorage.removeItem(HIDDEN_KEY);
    if (demoParam === 'off' || demoParam === 'on') setHidden(demoParam === 'off');
  }, [demoParam]);
  if (hidden) return null;

  const current = mockAuthTools.demoUsers.find((d) => d.user.id === session?.id);
  const signInAs = (key: string) => {
    const next = mockAuthTools.sessionFor(key);
    if (!next) return;
    queryClient.clear();
    setDesignSession(next);
    setOpen(false);
    navigate(landingFor(next.session));
  };
  const signOut = () => {
    clearSession();
    queryClient.clear();
    setOpen(false);
    navigate('/');
  };
  const reset = () => {
    mockAuthTools.reset();
    signOut();
  };

  return (
    <div className="ixd_demo_switcher">
      {open && (
        <Card className="ixd_demo_panel" kicker={t('demo.title')} id="demo-switcher-panel">
          <p className="ix_note ixd_mt6">{t('demo.note')}</p>
          <ul className="ixd_demo_list">
            {mockAuthTools.demoUsers.map((demo) => (
              <li key={demo.key}>
                <button type="button" className="ixd_demo_user" aria-pressed={demo.key === current?.key} onClick={() => signInAs(demo.key)}>
                  <b>{t(`demo.role.${demo.roleKey}`)}</b>
                  <span>{demo.user.fullName}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="ix_btn_row">
            <Button size="sm" variant="ghost" onClick={signOut}>
              {t('demo.signOut')}
            </Button>
            <Button size="sm" variant="dark" onClick={reset}>
              {t('demo.reset')}
            </Button>
          </div>
        </Card>
      )}
      <Button size="sm" variant="dark" aria-expanded={open} aria-controls="demo-switcher-panel" onClick={() => setOpen((o) => !o)}>
        {current ? t('demo.as', { role: t(`demo.role.${current.roleKey}`) }) : t('demo.button')}
      </Button>
    </div>
  );
}
