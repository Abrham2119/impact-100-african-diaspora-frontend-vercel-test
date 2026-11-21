import { portalMenu } from '@/config/navigation/portalMenu';
import { ShellLayout } from './ShellLayout';

// Member portal shell (README "Four layouts" #3): rail Dashboard · Voting · Charter · Reviews ·
// Account · Website.
export function PortalShell() {
  return <ShellLayout menu={portalMenu} />;
}
