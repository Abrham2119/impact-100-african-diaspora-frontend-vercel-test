import type { MatrixAction, MatrixRow } from '@/domain/entities/admin.types';

// The permission matrix (admin_permissions.dc.html), verbatim: ● granted · — not granted.
const cells = (dots: string): Record<MatrixAction, boolean> => {
  const [view, create, update, del, approve, exp] = dots.split('').map((c) => c === '●');
  return { view, create, update, delete: del, approve, export: exp };
};

export const MATRIX: MatrixRow[] = [
  { module: 'charterSettings', role: 'CHAPTER_ADMIN', roleLabel: 'admin', cells: cells('●●●-●●') },
  { module: 'peopleRoles', role: 'CHAPTER_ADMIN', roleLabel: 'admin', cells: cells('●●●-●●') },
  { module: 'paymentsLedger', role: 'USAFI_FINANCE', roleLabel: 'finance', cells: cells('●●●--●') },
  { module: 'donations', role: 'USAFI_FINANCE', roleLabel: 'finance', cells: cells('●-●--●') },
  { module: 'proposalsBallots', role: 'CHAPTER_ADMIN', roleLabel: 'admin', cells: cells('●●●--●') },
  { module: 'voting', role: 'MEMBER', roleLabel: 'votingMember', cells: cells('●●----') },
  { module: 'comments', role: 'MEMBER', roleLabel: 'member', cells: cells('●●----') },
  { module: 'results', role: 'CHAPTER_ADMIN', roleLabel: 'admin', cells: cells('●---●●') },
  { module: 'charterSigning', role: 'MEMBER', roleLabel: 'member', cells: cells('●●----') },
  { module: 'committeeScoring', role: 'COMMITTEE_MEMBER', roleLabel: 'committee', cells: cells('●●●---') },
  { module: 'contentNews', role: 'CONTENT_EDITOR', roleLabel: 'editor', cells: cells('●●●●●-') },
  { module: 'hubDashboard', role: 'HUB_CO_AMBASSADOR', roleLabel: 'coAmbassador', cells: cells('●----●') },
  { module: 'volunteerSignups', role: 'HUB_CO_AMBASSADOR', roleLabel: 'coAmbassador', cells: cells('●-●--●') },
  { module: 'auditLog', role: 'CHAPTER_ADMIN', roleLabel: 'admin', cells: cells('●----●') },
];

/** The permission prefix of each matrix module and the permissions an action means (when they exist). */
const PREFIX: Record<string, string> = {
  charterSettings: 'charter_settings',
  peopleRoles: 'users',
  paymentsLedger: 'payments',
  donations: 'donations',
  proposalsBallots: 'ballots',
  voting: 'votes',
  comments: 'comments',
  results: 'results',
  charterSigning: 'signatures',
  committeeScoring: 'scoring',
  contentNews: 'content',
  hubDashboard: 'hub_dashboard',
  volunteerSignups: 'signups',
  auditLog: 'audit',
};
const SUFFIXES: Record<MatrixAction, string[]> = {
  view: ['read', 'list'],
  create: ['create'],
  update: ['update'],
  delete: ['delete'],
  approve: ['approve'],
  export: ['export'],
};
export const matrixPermissions = (module: string, action: MatrixAction): string[] =>
  PREFIX[module] ? SUFFIXES[action].map((suffix) => `${PREFIX[module]}:${suffix}`) : [];
