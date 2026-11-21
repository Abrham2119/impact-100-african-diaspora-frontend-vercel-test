import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/Toaster';
import { LocaleProvider } from '@/i18n/LocaleProvider';
import { useLegacyHashParams } from '@/hooks/useLegacyHashParams';
import { DemoRoleSwitcher } from '@/features/auth/components/DemoRoleSwitcher';

// Top-level layout wrapper for the whole app (global chrome like toasts and the locale).
// Child layouts render into the <Outlet/>.
// It paints nothing itself: design pages show the design's own page background,
// and starter screens get theirs from <TwScope> (ARCHITECTURE.md §1.3).
// LocaleProvider lives here, inside the router, because the URL prefix is part of the locale.
export function RootLayout() {
  useLegacyHashParams();
  return (
    <LocaleProvider>
      <Outlet />
      <Toaster />
      <DemoRoleSwitcher />
    </LocaleProvider>
  );
}
