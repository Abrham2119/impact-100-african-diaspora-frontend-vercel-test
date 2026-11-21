import type {
  Amendment,
  Ballot,
  BallotProposal,
  CharterSignature,
  ClosedVote,
  Comment,
  CycleFinancials,
  Decision,
  Nomination,
  Participation,
  ReviewAssignment,
  ScoringCriterion,
} from '@/domain/entities/governance.types';

// Portal governance data, verbatim from design-reference/pages/portal_*.dc.html (sample data,
// FQ8). Design inconsistencies are kept as data (e.g. the committee score "4.3 / 5").

export const BALLOT: Ballot = {
  key: 'grant-2026-27',
  opensOn: '2027-02-15',
  opensTime: '9:00 ET',
  closesOn: '2027-03-01',
  closesTime: '23:59 ET',
  eligibleCount: 84,
  quorumPct: 50,
  baseYesNo: 31,
  baseAbstain: 3,
};

export const PROPOSALS: BallotProposal[] = [
  {
    id: 'kenya-youth-digital-skills',
    ballotKey: BALLOT.key,
    countryKey: 'kenya',
    portfolioKey: 'diaspora-engagement',
    title: 'Youth digital skills programme',
    budgetCents: 2_500_000,
    summary: 'Trains 300 young people in Nairobi in coding and digital work over 12 months, with job placement support.',
    conflicts: 'None declared',
    detail: {
      submittedBy: 'a Nairobi youth technology nonprofit',
      publishedOn: '2027-02-10',
      committeeScore: '4.3',
      reviewers: 3,
      reach: '300',
      reachNote: 'young people in 12 months',
      description:
        'The programme trains 300 young people in Nairobi in coding and digital work over 12 months. Graduates get mentoring and job-placement support with local employers. The organisation has run since 2019 and reports to its board every quarter.',
      budgetLines: [
        { item: 'Trainers and mentors', amountCents: 1_400_000 },
        { item: 'Laptops and connectivity', amountCents: 650_000 },
        { item: 'Placement support', amountCents: 300_000 },
        { item: 'Reporting and evaluation', amountCents: 150_000 },
      ],
      rubric: [
        { criterion: 'Need', score: 4.7 },
        { criterion: 'Capacity', score: 4.0 },
        { criterion: 'Impact', score: 4.5 },
        { criterion: 'Sustain.', score: 3.8 },
        { criterion: 'Alignment', score: 4.6 },
      ],
      conflictsNote: 'None declared by the applicant or reviewers.',
    },
  },
  {
    id: 'ghana-community-health',
    ballotKey: BALLOT.key,
    countryKey: 'ghana',
    portfolioKey: 'sustainable-development',
    title: 'Community health outreach',
    budgetCents: 1_850_000,
    summary: 'Mobile clinics in three districts outside Accra, reaching about 4,000 people.',
    conflicts: 'One committee member recused (board link).',
  },
  {
    id: 'zambia-women-agribusiness',
    ballotKey: BALLOT.key,
    countryKey: 'zambia',
    portfolioKey: 'academic-partnerships',
    title: 'Women-led agribusiness fund',
    budgetCents: 2_200_000,
    summary: 'Small working-capital grants for 40 women-led farm businesses near Livingstone.',
    conflicts: 'None declared',
  },
];

/** receipt codes as the design forms them: RX-<7341 + 97·i>-K */
export const receiptFor = (index: number): string => `RX-${7341 + index * 97}-K`;

export const PARTICIPATIONS: Participation[] = [];

export const COMMENTS: Comment[] = [
  { id: 'c1', targetId: 'kenya-youth-digital-skills', authorName: 'Wanjiru K.', authorLevel: 'Investor', text: 'Strong partner — I visited their centre last year.' },
  { id: 'c2', targetId: 'kenya-youth-digital-skills', authorName: 'David O.', authorLevel: 'Initiator', text: 'What does the placement support cost per person?' },
  { id: 'c3', targetId: 'ghana-community-health', authorName: 'Efua A.', authorLevel: 'Innovator', text: 'The budget is clear and realistic.' },
  { id: 'c4', targetId: 'a-quorum-40', authorName: 'Kofi B.', authorLevel: 'Investor', text: 'Makes sense for smaller decisions. Grant votes should stay at 50%.' },
];

export const DECISIONS: Decision[] = [
  { id: 'd-atlanta-celebration', title: 'Hold the grant celebration in Atlanta', description: 'Move the 2027 grant celebration to the Atlanta hub launch weekend.', closesOn: '2027-03-01', votes: {} },
  { id: 'd-work-plan', title: 'Adopt the 2026–27 work plan', description: 'Approve the work plan presented by the Co-Chairs.', closesOn: '2027-03-01', votes: {} },
];

/** the charter sections an amendment can target (portal_decisions.dc.html) */
export const CHARTER_SECTIONS = [
  '1. Purpose',
  '2. Campaign cycle',
  '3. Membership and levels',
  '4. Payments and installments',
  '5. Voting',
  '6. Quorum and outcomes',
  '7. Grant selection',
  '8. Amendments',
  '9. Signing the charter',
];

export const AMENDMENTS: Amendment[] = [
  {
    id: 'a-quorum-40',
    section: '6. Quorum and outcomes',
    change: 'Lower quorum to 40% for decisions that are not grant votes.',
    currentText: 'Quorum: at least 50% of eligible voters (rounded up) must cast a Yes or No vote.',
    proposedText: 'Quorum: at least 50% of eligible voters (rounded up) for grant votes, and 40% for other Chapter decisions.',
    status: 'CIRCULATING',
    authorName: 'Efua A.',
    authorLevel: 'Innovator',
    circulatedOn: '2027-01-12',
    sectionShort: '6. Quorum',
    changeShort: 'Lower quorum to 40% for non-grant decisions',
  },
  { id: 'a-student-level', section: '3. Membership and levels', change: 'Add a Student level at $100 with no vote.', status: 'CIRCULATING', sectionShort: '3. Membership' },
  // circulated and adopted into Charter v1.0 (admin_decisions.dc.html)
  { id: 'a-november-installments', section: '2. Campaign cycle', change: 'Allow installment plans to start in November.', status: 'ADOPTED', sectionShort: '2. Cycle', circulatedOn: '2025-12-01', adoptedIn: 'v1.0' },
];

export const FINANCIALS: CycleFinancials = {
  cycle: '2025–26',
  pledgedCents: 9_650_000,
  receivedCents: 9_125_000,
  donationsCents: 1_430_000,
  donationsNote: 'By fund: general $8.1k · hubs $6.2k',
  grantedCents: 8_500_000,
  partners: 4,
};

export const CLOSED_VOTES: ClosedVote[] = [
  { id: 'r-grant-2025-26', title: 'Grant ballot 2025–26 · Water and sanitation, Zambia', eligible: 88, yes: 44, no: 15, abstain: 2, publishedOn: '2026-04-04', settingsVersion: 'v1.0', quorumPct: 50 },
  { id: 'r-november-installments', title: 'Adopt installment plans from November', eligible: 84, yes: 30, no: 12, abstain: 3, publishedOn: '2026-04-04', settingsVersion: 'v1.0', quorumPct: 50 },
  { id: 'r-atlanta-seat', title: 'Add a second Atlanta co-Ambassador seat', eligible: 84, yes: 25, no: 10, abstain: 3, publishedOn: '2026-04-04', settingsVersion: 'v1.0', quorumPct: 50 },
  { id: 'r-agm-online', title: 'Move the AGM online', eligible: 84, yes: 22, no: 22, abstain: 4, publishedOn: '2026-04-04', settingsVersion: 'v1.0', quorumPct: 50 },
];

/** suggestions allowed per member per cycle */
export const NOMINATION_LIMIT = 10;

// Amara's (portal_suggest) and the other members' in the admin queue (admin_nominations.dc.html), in the queue's order.
export const NOMINATIONS: Nomination[] = [
  { id: 'n1', userId: 'u-amara', type: 'NOMINEE', title: 'Nairobi youth tech centre', countryKey: 'kenya', status: 'IN_REVIEW', reviewerNote: 'Committee visiting in March' },
  { id: 'n3', userId: 'u-grace', type: 'PROPOSAL', title: 'Solar power for rural clinics', countryKey: 'zambia', status: 'SUBMITTED', reviewerNote: null },
  { id: 'n2', userId: 'u-amara', type: 'PRIORITY', title: 'More hub events in the South', countryKey: null, status: 'ACCEPTED', reviewerNote: 'Added to the work plan' },
  { id: 'n4', userId: 'u-david', type: 'PROPOSAL', title: 'Girls’ football league', countryKey: 'ghana', status: 'ACCEPTED', reviewerNote: null, submitterName: 'D. Otieno' },
];

// The signature register (admin_signatures.dc.html): ET wall clock, newest first. Amara hasn't signed yet.
export const SIGNATURES: CharterSignature[] = [
  { userId: 'u-wanjiru', typedName: 'Wanjiru Kamau', signedAt: '2027-01-04T10:12', version: 'v1.0 (2026)', ip: '198.51.100.7' },
  { userId: 'u-kofi', typedName: 'Kofi Boateng', signedAt: '2026-12-02T21:40', version: 'v1.0 (2026)', ip: '203.0.113.9' },
  { userId: 'u-ngozi', typedName: 'Ngozi Eze', signedAt: '2026-11-30T08:03', version: 'v1.0 (2026)', ip: '192.0.2.44' },
];
export const CHARTER_VERSION = 'v1.0 (2026)';

export const SCORING_CRITERIA: ScoringCriterion[] = [
  { name: 'Community need', weightPct: 25 },
  { name: 'Organizational capacity', weightPct: 20 },
  { name: 'Impact', weightPct: 25 },
  { name: 'Sustainability', weightPct: 15 },
  { name: 'Alignment', weightPct: 15 },
];

export const REVIEWS: ReviewAssignment[] = [
  { reviewerId: 'u-amara', proposalId: 'kenya-youth-digital-skills', dueOn: '2027-02-05', status: 'SUBMITTED', scores: [null, null, null, null, null], comment: '' },
  { reviewerId: 'u-amara', proposalId: 'ghana-community-health', dueOn: '2027-02-05', status: 'IN_PROGRESS', scores: [4, 3, null, null, null], comment: '' },
  { reviewerId: 'u-amara', proposalId: 'zambia-women-agribusiness', dueOn: '2027-02-05', status: 'NOT_STARTED', scores: [null, null, null, null, null], comment: '' },
];
