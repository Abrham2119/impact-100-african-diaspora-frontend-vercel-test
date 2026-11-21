import { useState } from 'react';
import {
  Accordion,
  Badge,
  BreadcrumbBanner,
  Button,
  ButtonAnchor,
  ButtonRow,
  Card,
  Chip,
  ChipGroup,
  Field,
  FlowSteps,
  Input,
  Note,
  Pagination,
  ProgressBar,
  ResultBox,
  SectionHeading,
  Select,
  Slider,
  Stepper,
  Table,
  Textarea,
  Timeline,
} from '@/components/design';
import type { BadgeKind } from '@/components/design';

// Every Step 3 design component with sample content copied from the snapshots
// (join, donate, volunteer, grants, nonprofits, faq, admin ledger, portal amendment).
// Dev-only documentation; the product gets its copy from the CMS / UiStrings.

const AREAS = [
  { key: 'all', label: 'All roles', count: 19 },
  { key: 'chapter', label: 'Chapter', count: 6 },
  { key: 'us', label: 'US hubs', count: 5 },
  { key: 'usafi', label: 'USAFI portfolios', count: 4 },
  { key: 'africa', label: 'African hubs', count: 4 },
];

const BADGES: { kind: BadgeKind; label: string }[] = [
  { kind: 'neutral', label: 'Community need' },
  { kind: 'ok', label: 'Confirmed' },
  { kind: 'warn', label: 'Pending approval' },
  { kind: 'info', label: 'Scheduled' },
  { kind: 'accent', label: 'Your hub' },
  { kind: 'bad', label: 'Refunded' },
];

interface LedgerRow {
  id: string;
  received: string;
  person: string;
  purpose: string;
  amount: string;
  source: string;
  reference: string;
}

const LEDGER: LedgerRow[] = [
  { id: '1', received: 'Dec 1, 2026', person: 'Amara Mensah', purpose: 'Pledge', amount: '$170.00', source: 'WAZI', reference: 'wz_88231' },
  { id: '2', received: 'Nov 30, 2026', person: 'Grace Mwale', purpose: 'Direct donation · Kenya', amount: '$25.00', source: 'WAZI', reference: 'wz_88102' },
  { id: '3', received: 'Nov 28, 2026', person: 'David Otieno', purpose: 'Pledge', amount: '$300.00', source: 'Offline · cheque', reference: 'recorded by A. Diallo' },
];

const PORTFOLIOS = [
  { key: 'p1', name: 'Diaspora Engagement', flagship: 'Impact 100' },
  { key: 'p2', name: 'Academic Partnerships', flagship: 'Victoria Falls Summit' },
  { key: 'p3', name: 'Youth & Women Entrepreneurship', flagship: 'To be announced' },
  { key: 'p4', name: 'Sustainable Development', flagship: 'THRIVE Africa Network projects' },
  { key: 'p5', name: 'Grants Selection', flagship: 'Five-criterion rubric' },
  { key: 'p6', name: 'US regional hubs', flagship: 'Five hubs in 2026–27' },
];

export function PrimitivesBoard() {
  const [area, setArea] = useState('all');
  const [freq, setFreq] = useState<'once' | 'monthly'>('once');

  return (
    <div className="db_board">
      <BreadcrumbBanner title="About Us" trail={[{ label: 'Home', to: '/' }, { label: 'About Us' }]} />

      <div className="container db_prims">
        <div>
          <h3 className="db_cmp_h3">Buttons</h3>
          <ButtonRow>
            <Button>record payment</Button>
            <Button variant="dark">donate</Button>
            <Button variant="ghost">back</Button>
            <Button variant="ghost" disabled>
              back
            </Button>
            <Button size="sm">approve</Button>
            <Button size="sm" variant="dark">
              export
            </Button>
            <Button size="sm" variant="accent">
              add role
            </Button>
            <ButtonAnchor href="#checkout">continue to WAZIImpact.org</ButtonAnchor>
          </ButtonRow>
        </div>

        <div>
          <h3 className="db_cmp_h3">Section heading + lead</h3>
          <div className="row">
            <div className="col-xl-8 col-lg-10 m-auto">
              <SectionHeading
                kicker="Upcoming"
                title="Gather with us"
                lead="Open to members and anyone curious about joining. Most events run in person with a live online option for members across the US."
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="db_cmp_h3">Cards</h3>
          <div className="row ix_gap">
            <div className="col-lg-4">
              <Card>
                <span className="ix_num">1</span>
                <h3>Give in the cycle</h3>
                <p>Pledges, payments and eligibility are tracked per cycle.</p>
              </Card>
            </div>
            <div className="col-lg-4">
              <Card tone="dark" kicker="Voting member" footer={<Button size="sm">choose Investor</Button>}>
                <h3>Investor</h3>
                <p>More than $500 received in the cycle: vote and approve.</p>
              </Card>
            </div>
            <div className="col-lg-4">
              <Card tone="soft" kicker="What happens next">
                <p>An editor checks the story and photo.</p>
              </Card>
              <Note>Weightings are set by the Grants Selection committee.</Note>
            </div>
          </div>
        </div>

        <div>
          <h3 className="db_cmp_h3">Badges · chips</h3>
          <div className="db_demo_row">
            {BADGES.map((badge) => (
              <Badge key={badge.kind} kind={badge.kind}>
                {badge.label}
              </Badge>
            ))}
          </div>
          <ChipGroup className="mt_30" label="Filter roles by area">
            {AREAS.map((option) => (
              <Chip key={option.key} on={area === option.key} count={option.count} onClick={() => setArea(option.key)}>
                {option.label}
              </Chip>
            ))}
          </ChipGroup>
          <ChipGroup className="mt_30">
            <Chip on={freq === 'once'} onClick={() => setFreq('once')}>
              One-time
            </Chip>
            <Chip on={freq === 'monthly'} onClick={() => setFreq('monthly')}>
              Monthly
            </Chip>
          </ChipGroup>
        </div>

        <div>
          <h3 className="db_cmp_h3">Result boxes</h3>
          <div className="row ix_gap">
            <div className="col-lg-4">
              <ResultBox kind="ok" title="You look eligible">
                Great — contact us with the “Partner organization” topic and we will send you the proposal form.
              </ResultBox>
            </div>
            <div className="col-lg-4">
              <ResultBox kind="wait" title="Awaiting payment confirmation">
                As soon as WAZIImpact.org confirms your payment we will activate your membership.
              </ResultBox>
            </div>
            <div className="col-lg-4">
              <ResultBox kind="bad" title="Not eligible yet">
                Your organisation does not meet every requirement right now.
              </ResultBox>
            </div>
          </div>
        </div>

        <div>
          <h3 className="db_cmp_h3">Form fields</h3>
          <div className="row">
            <div className="col-md-6">
              <Field id="ds_name" label="Full name">
                <Input type="text" defaultValue="Amara Mensah" />
              </Field>
            </div>
            <div className="col-md-6">
              <Field
                id="ds_email"
                label="Email"
                error="That email doesn’t look right — check it has an @ and a domain, like name@example.com."
              >
                <Input type="email" defaultValue="amara@" />
              </Field>
            </div>
            <div className="col-md-6">
              <Field id="ds_method" label="Method">
                <Select
                  options={[
                    { value: 'c', label: 'Cheque' },
                    { value: 't', label: 'Bank transfer' },
                  ]}
                />
              </Field>
            </div>
            <div className="col-md-6">
              <Field id="ds_date" label="Date received" help="Must fall inside an existing cycle">
                <Input type="date" />
              </Field>
            </div>
            <div className="col-12">
              <Field id="ds_reason" label="Reason">
                <Textarea rows={5} placeholder="Why this payment is recorded by hand" />
              </Field>
            </div>
          </div>
        </div>

        <div>
          <h3 className="db_cmp_h3">Flow · steps · timeline</h3>
          <div className="row ix_gap">
            <div className="col-lg-6">
              <FlowSteps
                steps={[
                  { id: 'a', num: '01', title: 'Launch the first grant cycle', text: 'With our inaugural members.' },
                  { id: 'b', num: '02', title: 'Award the first major grant', text: 'To a high-impact USAFI partner organization.' },
                  { id: 'c', num: '03', title: 'Deepen diaspora engagement', text: 'Through regional partnerships and hubs.' },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <FlowSteps
                variant="compact"
                steps={[
                  { id: 'a', num: '1', title: 'Nominate', text: 'Members suggest partners and proposals.' },
                  { id: 'b', num: '2', title: 'Review', text: 'The Grants Selection committee scores each proposal.' },
                  { id: 'c', num: '3', title: 'Publish', text: 'An admin publishes proposals for members to read.' },
                  { id: 'd', num: '4', title: 'Vote', text: 'Voting members decide; quorum and majority rules apply.' },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <Stepper label="Join progress" steps={['Level', 'Details', 'Payment', 'Done']} current={2} />
            </div>
            <div className="col-lg-6">
              <Timeline
                items={[
                  { id: 'a', title: 'Circulating', text: 'Shared with every member on Jan 12, 2027. Minimum circulation: 14 days.', done: true },
                  { id: 'b', title: 'On ballot', text: 'An admin can place it on a ballot after circulation.' },
                  { id: 'c', title: 'Adopted or rejected', text: 'Decided by the quorum and majority rules.' },
                ]}
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="db_cmp_h3">Table</h3>
          <Table<LedgerRow>
            caption="Payments ledger"
            rows={LEDGER}
            rowKey={(row) => row.id}
            columns={[
              { key: 'received', header: 'Received', cell: (row) => row.received },
              { key: 'person', header: 'Person', cell: (row) => row.person },
              { key: 'purpose', header: 'For', cell: (row) => row.purpose },
              { key: 'amount', header: 'Amount', cell: (row) => row.amount },
              { key: 'source', header: 'Source', cell: (row) => row.source },
              { key: 'reference', header: 'Reference', cell: (row) => row.reference },
              { key: 'status', header: 'Status', cell: () => <Badge kind="ok">Confirmed</Badge> },
            ]}
          />
        </div>

        <div>
          <h3 className="db_cmp_h3">Accordion</h3>
          <Accordion
            idPrefix="ds_faq"
            items={[
              {
                id: 'q1',
                question: 'Can any nonprofit apply?',
                answer:
                  'Grants go to high-impact organizations in Sub-Saharan Africa within USAFI’s partner network. If you aren’t a USAFI partner yet, express interest through our contact page and we’ll share next steps.',
              },
              {
                id: 'q2',
                question: 'When will the first grants be made?',
                answer:
                  'The first grant cycle launches in 2027, with grants management and distribution running April through September.',
              },
              {
                id: 'q3',
                question: 'How are proposals reviewed?',
                answer: 'The Grants Selection committee’s volunteer reviewers score proposals against a transparent rubric.',
              },
            ]}
          />
        </div>

        <div>
          <h3 className="db_cmp_h3">Slider</h3>
          <Slider
            className="row"
            items={PORTFOLIOS}
            getKey={(item) => item.key}
            config={{
              show: 4,
              scroll: 4,
              breakpoints: [
                { maxWidth: 1200, show: 3 },
                { maxWidth: 992, show: 2, scroll: 2 },
                { maxWidth: 768, show: 2 },
                { maxWidth: 576, show: 1, scroll: 1 },
              ],
            }}
            dotLabel={(page, pages) => `${page} of ${pages}`}
            renderItem={(item) => (
              <div className="col-12">
                <Card kicker={item.name}>
                  <h4>{item.flagship}</h4>
                </Card>
              </div>
            )}
          />
        </div>

        <div>
          <h3 className="db_cmp_h3">Progress bar · pagination</h3>
          <div className="row">
            <div className="col-lg-4">
              <ProgressBar label="Donate" percent={72} />
            </div>
          </div>
          <Pagination
            className="mt_50"
            page={1}
            totalPages={3}
            hrefFor={(page) => `/design/primitives?page=${page}`}
            labels={{ nav: 'News pages', previous: 'Previous', next: 'Next' }}
          />
        </div>
      </div>
    </div>
  );
}
