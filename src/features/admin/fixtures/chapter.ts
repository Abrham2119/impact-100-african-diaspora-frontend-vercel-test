// The chapter's figures as the admin overview shows them (admin, admin_finance, admin_hub,
// admin_roles .dc.html), verbatim. They are the baseline: the demo's own records (Amara's
// installments, offline payments, new flags…) move them from here.
export const CHAPTER = {
  cycleLabel: '2026–27',
  members: 126,
  votingEligible: 84,
  receivedCents: 7_184_000,
  pledgedCents: 11_250_000,
  byLevel: [
    { levelKey: 'initiator', count: 31 },
    { levelKey: 'incubator', count: 28 },
    { levelKey: 'innovator', count: 25 },
    { levelKey: 'investor', count: 42 },
  ],
  /** the count drawn at 100 % in "Membership by level" (31 → 52 %, 42 → 70 %) */
  levelScale: 60,
  pledgedNotMembers: 38,
  /** cookie-free analytics, last 30 days (sample: widths as the design draws them) */
  funnel: [
    { key: 'visits', value: 8420, widthPct: 100 },
    { key: 'joinStarted', value: 412, widthPct: 34 },
    { key: 'joinPaid', value: 96, widthPct: 14 },
    { key: 'donations', value: 153, widthPct: 18 },
    { key: 'signups', value: 71, widthPct: 9 },
  ],
  attention: { flags: 5, nominations: 12, stories: 4 },
  finance: {
    donationsCents: 961_500,
    gifts: 153,
    donationsByPortfolio: [
      { portfolioKey: 'diaspora-engagement', cents: 518_000 },
      { portfolioKey: 'academic-partnerships', cents: 164_000 },
      { portfolioKey: 'youth-women-entrepreneurship', cents: 191_500 },
      { portfolioKey: 'sustainable-development', cents: 88_000 },
    ],
    byLevel: [
      { levelKey: 'initiator', pledges: 41, pledgedCents: 1_025_000, receivedCents: 890_000, paidInFull: 29 },
      { levelKey: 'incubator', pledges: 37, pledgedCents: 1_850_000, receivedCents: 1_264_000, paidInFull: 18 },
      { levelKey: 'innovator', pledges: 30, pledgedCents: 2_250_000, receivedCents: 1_430_000, paidInFull: 11 },
      { levelKey: 'investor', pledges: 61, pledgedCents: 6_100_000, receivedCents: 3_600_000, paidInFull: 14 },
    ],
  },
} as const;

/** The Atlanta hub dashboard (admin_hub.dc.html), verbatim. */
export const HUBS: Record<string, { members: number; signups: number; rsvps: number; receivedCents: number; pledgedCents: number }> = {
  atlanta: { members: 23, signups: 14, rsvps: 61, receivedCents: 942_000, pledgedCents: 1_500_000 },
};
export const HUB_SIGNUPS = [
  { id: 'hs-1', hubKey: 'atlanta', name: 'Tunde A.', type: 'JOIN_HUB', role: null, date: '2026-11-16', status: 'NEW' },
  { id: 'hs-2', hubKey: 'atlanta', name: 'Grace M.', type: 'VOLUNTEER', role: 'Atlanta hub launch team', date: '2026-11-15', status: 'CONTACTED' },
  { id: 'hs-3', hubKey: 'atlanta', name: 'Samuel O.', type: 'JOIN_HUB', role: null, date: '2026-11-12', status: 'WELCOMED' },
] as const;
export const HUB_EVENTS = [
  { id: 'he-1', hubKey: 'atlanta', title: 'Atlanta hub launch', date: '2026-12-12', rsvps: 61, capacity: 80 },
  { id: 'he-2', hubKey: 'atlanta', title: 'Giving circle supper', date: '2027-01-23', rsvps: 18, capacity: 30 },
] as const;
