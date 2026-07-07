import { Outlet, NavLink, Link } from 'react-router-dom';
import { PATHS } from '@/app/routes/paths';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/store/authStore';
import { useAuthLogout } from '@/hooks/useAuthLogout';
import type { Permission } from '@/domain/enums/permission.enum';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  permission?: Permission;
}

const NAV: NavItem[] = [
  { to: PATHS.app.dashboard, label: 'Dashboard', icon: '▤' },
  { to: PATHS.app.notifications, label: 'Notifications', icon: '🔔' },
  { to: PATHS.app.users, label: 'Users', icon: '👥', permission: 'users:list' },
  { to: PATHS.app.profile, label: 'Profile', icon: '👤' },
  { to: PATHS.app.settings, label: 'Settings', icon: '⚙' },
];

// Sidebar + header shell for the authenticated app.
export function PrivateLayout() {
  const user = useAuthStore((s) => s.user);
  const can = useAuthStore((s) => s.can);
  const logout = useAuthLogout();

  const visibleNav = NAV.filter((item) => !item.permission || can(item.permission));

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to={PATHS.app.dashboard} className="text-lg font-bold text-primary">
            ⬡ Express Auth
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )
              }
            >
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            Log out
          </Button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.email}</span>
            {user?.role && (
              <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {user.role}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="md:hidden" onClick={logout}>
              Log out
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
