# Business rules: Impact 100 African Diaspora Chapter

These come from the client's charter (discussion draft, Sept 2026), the TRD and the decisions made during design. The **backend enforces** every rule. The frontend only reflects them for UX.

## Campaign cycle

- A campaign cycle runs **Oct 1 to Mar 31**. Contributions received **Apr 1 to Sep 30** are credited to the **next** cycle.
- **Only one campaign is active at a time.** Its goal is **always $100,000**, which is also the maximum. When the end date passes, the campaign moves to **history** automatically.
- Every campaign, active or historical, is shown with the same card design. Sample data: the active 2026–27 campaign has $71,840 raised; history holds 2025–26 ($91,250) and 2024–25 ($64,500).

## Membership (per campaign)

- There are four levels: **Initiator $250 · Incubator $500 · Innovator $750 · Investor $1,000**.
- A member's level is the highest level whose amount has been **received**. A member between two levels keeps the lower one.
- Membership starts once at least **$250** has been credited to the cycle.
- Membership covers **one campaign only**. A member **buys new** or **renews** for each campaign.
- A pledge may be paid in **installments**: up to 6 monthly payments, each rounded up to the nearest $5, all complete by **Mar 31**.
- Amounts paid above the pledge do not count toward it. Overpayments are flagged to USAFI finance.
- Payments are made through **WAZIImpact.org**. If the platform is unavailable, USAFI Impact can record an offline payment against the member's account.

## Donations (separate from membership)

- The donor type is **"Direct donor"**. A donation is **not** tied to a campaign.
- The donor chooses an **area of interest**: one of the 4 USAFI portfolios (Diaspora Engagement · Impact 100; Academic Partnerships · Victoria Falls Summit; Youth & Women Entrepreneurship · to be announced; Sustainable Development · THRIVE Africa Network projects).
- The donor also chooses a **country**: any Sub-Saharan country, including Sudan and Somaliland.
- Donations **never** count toward membership, level or voting eligibility. Monthly gifts can be cancelled.

## Voting and decisions

- A member is a **voting member** when **more than $500 (that is, $501 or more) has been received** in the cycle at the moment the vote opens. Pledged but unpaid amounts do not count.
- **One member, one vote**, whatever the level. Proxy votes are not allowed. Votes are cast through the portal (WAZIImpact.org).
- Before voting, the member must confirm there is **no conflict of interest**. A member with a material conflict must disclose it and abstain.
- **Quorum:** at least **50% of eligible voters (rounded up)** must cast a Yes or No vote. Abstentions are recorded but do not count toward quorum or the vote count.
- **Outcome order:** if quorum is not met, the motion fails. If the vote is tied, it fails. Otherwise a simple majority of votes cast decides.
- **Decision-making matrix:**
  - Members at $250–$500 attend meetings, receive information, suggest priorities, nominees and proposals, and advise.
  - Members at $501–$1,000 can also vote and approve outcomes.
- **Amendments:** a proposed amendment must be at least 10 characters. It circulates to all members before the vote. Adoption follows the quorum and outcome rules, may need USAFI Impact's approval, and creates a new charter version.

## Charter signing

- When at least **$250** has been credited, the member is an Initiator and receives the charter to review and sign. A single contribution of $250 or more triggers this on payment.
- For installment pledges above $250, the member signs once the pledge is **paid in full**, and no later than **Mar 31**.
- Signing requires the typed name to match the account name. The system stores a signature record and a confirmation.
- The charter has **versions**. "Discussion draft · Sept 2026" is current. Earlier versions are kept for reference and show the "earlier version" notice.

## Grants

- Grants go to high-impact organizations in Sub-Saharan Africa within **USAFI's partner network**. The flow is: express interest or be nominated, proposal summary, volunteer review (rubric), due diligence by USAFI Impact (the fiscal sponsor), then the member vote.
- The **rubric** has five criteria: community-identified need, organizational strength, impact and reach, sustainability, and alignment with our values. The Grants Selection committee sets the weightings.
- On the map, choosing a country and an interest area shows the **proposals under review** that match that country and area, plus the "<Country> hub support" volunteer role.
- The first grant cycle runs in 2027, with grants management and distribution from April to September.

## Roles (RBAC)

These roles come from the design and must be confirmed in ARCHITECTURE.md:

- Visitor
- Member (Initiator to Incubator)
- Voting member
- Reviewer (Grants Selection committee)
- Hub co-Ambassador
- Editor (CMS)
- Finance (USAFI)
- Chapter admin
- Super admin

Admin screens group into Overview, People, Charter rules, Payments, Governance, Engagement, Content and System. Every admin action is written to the **audit log**.
