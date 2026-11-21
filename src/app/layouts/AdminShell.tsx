import { adminMenu } from '@/config/navigation/adminMenu';
import { ShellLayout } from './ShellLayout';

// Admin console shell (README "Four layouts" #4): rail Dashboard · People · Rules · Payments ·
// Governance · Engage · Content · System · Website · Portal.
export function AdminShell() {
  return <ShellLayout menu={adminMenu} />;
}
