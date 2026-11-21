import type { Permission } from '@/domain/enums/permission.enum';
import type { UiKey } from '@/features/content/fixtures/en/ui';

// Typed config of the app shells (ARCHITECTURE.md §3.1 AppShell, README "Four layouts"):
// the icon rail lists the groups, the section sidebar lists only the active group's items.
// Labels are UiString keys of the shell's namespace; nothing user-facing is hard-coded.

export type ShellNamespace = 'portal' | 'admin';

export interface ShellItem<N extends ShellNamespace> {
  key: string;
  labelKey: UiKey<N>;
  to: string;
  /** sidebar icon class; the portal sidebar has icons, the admin one does not */
  icon?: string;
  /** hidden unless the user holds ANY of these (UX only — the API authorizes) */
  permission?: Permission | Permission[];
}

export interface ShellGroup<N extends ShellNamespace> {
  key: string;
  /** rail label (admin: "Rules") */
  railLabelKey: UiKey<N>;
  /** sidebar title (admin: "Charter rules") */
  titleKey: UiKey<N>;
  icon: string;
  items: ShellItem<N>[];
}

/** Rail entries that leave the shell (Website, Portal). */
export interface ShellExitLink {
  key: string;
  labelKey: UiKey<'common'>;
  icon: string;
  to: string;
}

export interface ShellMenu<N extends ShellNamespace> {
  namespace: N;
  /** the console's own root crumb ("Member portal" / "Admin console") */
  rootLabelKey: UiKey<N>;
  rootTo: string;
  /** top-bar targets: the bell and the avatar */
  bellTo: string;
  accountTo: string;
  groups: ShellGroup<N>[];
  exits: ShellExitLink[];
}

/** Route metadata of a shell page: which rail group and sidebar item are active, its h1 and crumbs. */
export interface ShellRouteMeta<N extends ShellNamespace> {
  namespace: N;
  group: string;
  item: string;
  titleKey: UiKey<N>;
  /**
   * Breadcrumb after the root:
   *  - 'root'   → the console root itself (dashboards): Home › <b>Member portal</b>
   *  - 'item'   → Home › Member portal › <b>{item label}</b>            (default)
   *  - { key }  → Home › Member portal › {item label} › <b>{key}</b>     (detail pages)
   *  - { param }→ same, the last crumb is a route param until the page supplies a name
   */
  crumb?: 'root' | 'item' | { key: UiKey<N> } | { param: string };
}
