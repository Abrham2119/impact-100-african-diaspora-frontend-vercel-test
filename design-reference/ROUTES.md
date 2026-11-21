# Screens, routes and layouts

The routes below are a proposal. Keep the page-to-layout mapping. Route names may be adjusted in ARCHITECTURE.md, but every screen listed here must exist.

Visual target: `snapshots/<file>.html`. Behaviour target: `pages/<file>.dc.html`.

| # | Screen file | Route | Layout | Module | Notes |
|---|---|---|---|---|---|
| 1 | `index` | `/` | Public | M4 Public | Hero (3 slides), about, purpose, campaign cycle, membership levels, WAZI, campaigns, events slider (same data as /events), testimonials, leadership |
| 2 | `about_us` | `/about` | Public | M4 Public | Intro, where we sit, portfolios, values, partners, leadership, committees, sponsors |
| 3 | `committees` | `/about/committees` | Public | M4 Public | 11 committees; deep link ?c= |
| 4 | `charter` | `/charter` | Public | M4 Public | Sticky section menu + version select; content from CMS (charter versions) |
| 5 | `volunteers` | `/about/volunteers` | Public | M4 Public |  |
| 6 | `testimonial` | `/about/testimonials` | Public | M4 Public |  |
| 7 | `donot_list` | `/about/donors` | Public | M4 Public | Donor list |
| 8 | `photo_gallery` | `/gallery/photos` | Public | M4 Public |  |
| 9 | `video_gallery` | `/gallery/videos` | Public | M4 Public |  |
| 10 | `faq` | `/faq` | Public | M4 Public |  |
| 11 | `contact` | `/contact` | Public | M19 Contact | 6 topics; ?topic= preselect |
| 12 | `contact_thanks` | `/contact/thanks` | Public | M19 Contact |  |
| 13 | `privacy` | `/privacy` | Public | §9 Privacy |  |
| 14 | `newsletter_confirmed` | `/newsletter/confirmed` | Public | M10 Newsletter |  |
| 15 | `unsubscribed` | `/newsletter/unsubscribed` | Public | M10 Newsletter |  |
| 16 | `our_model` | `/our-model` | Public | M4 Public | Who decides what table + fact cards |
| 17 | `join` | `/join` | Public | M6 Join | Level → Details → Payment → Done; ?level= |
| 18 | `donate` | `/donate` | Public | M9 Donations | Direct donor; area of interest (4 portfolios) + Sub-Saharan country; ?fund= |
| 19 | `donate_thanks` | `/donate/thanks` | Public | M9 Donations |  |
| 20 | `cancel_gift` | `/donate/cancel` | Public | M9 Donations |  |
| 21 | `volunteer` | `/volunteer` | Public | M18 Volunteer | 19 roles, filters, tray; ?area= |
| 22 | `volunteer_thanks` | `/volunteer/thanks` | Public | M18 Volunteer |  |
| 23 | `grants` | `/grants` | Public | M5 Grants | Africa map, hub panel (matching proposals + volunteer role), how grants are selected, roadmap, portfolios, work plan |
| 24 | `campaign_list` | `/campaigns` | Public | Campaigns | Active campaign + campaign history (same card) |
| 25 | `campaign_details` | `/campaigns/:slug` | Public | Campaigns | Membership chips, join/renew links |
| 26 | `category` | `/campaigns/category/:slug` | Public | Campaigns |  |
| 27 | `nonprofits` | `/nonprofits` | Public | M4 Public | How it works (5), eligibility check (4 Qs), FAQs (7) |
| 28 | `event` | `/events` | Public | M17 Events | 8 events + US regional hubs launch plan |
| 29 | `event_details` | `/events/:id` | Public | M17 Events | RSVP form |
| 30 | `hubs` | `/hubs` | Public | M17 Hubs | ?hub= |
| 31 | `blogs` | `/news` | Public | M20 News | 4 stories |
| 32 | `blog_details` | `/news/:slug` | Public | M20 News |  |
| 33 | `share_story` | `/news/share-a-story` | Public | M20 News |  |
| 34 | `sign_in` | `/auth/sign-in` | Auth | M1 Auth | Emailed link + WAZI SSO |
| 35 | `sign_up` | `/auth/sign-up` | Auth | M1 Auth |  |
| 36 | `forgot_password` | `/auth/forgot-password` | Auth | M1 Auth |  |
| 37 | `check_email` | `/auth/check-email` | Auth | M1 Auth |  |
| 38 | `two_step` | `/auth/two-step` | Auth | M1 Auth |  |
| 39 | `two_step_enrol` | `/auth/two-step/setup` | Auth | M1 Auth |  |
| 40 | `portal` | `/portal` | Portal | M7 Portal | Card-style summary (membership card, pay installment card fixed height, 4 status cards) |
| 41 | `portal_history` | `/portal/history` | Portal | M7 Portal |  |
| 42 | `portal_vote` | `/portal/vote` | Portal | M11 Voting | Schedule, turnout vs quorum, COI dialog |
| 43 | `portal_proposal` | `/portal/vote/:proposalId` | Portal | M11 Voting |  |
| 44 | `portal_receipt` | `/portal/vote/receipt/:ballotId` | Portal | M11 Voting |  |
| 45 | `portal_decisions` | `/portal/decisions` | Portal | M12 Decisions | Propose amendment (≥10 chars) |
| 46 | `portal_amendment` | `/portal/decisions/:id` | Portal | M12 Decisions |  |
| 47 | `portal_results` | `/portal/results` | Portal | M13 Results |  |
| 48 | `portal_result` | `/portal/results/:id` | Portal | M13 Results |  |
| 49 | `portal_suggest` | `/portal/suggest` | Portal | M14 Nominations |  |
| 50 | `portal_sign` | `/portal/charter/sign` | Portal | M15 Signing | Locked until eligible; typed-name match |
| 51 | `portal_signed` | `/portal/charter/signed` | Portal | M15 Signing |  |
| 52 | `portal_reviews` | `/portal/reviews` | Portal | M16 Scoring |  |
| 53 | `portal_score` | `/portal/reviews/:proposalId` | Portal | M16 Scoring |  |
| 54 | `portal_profile` | `/portal/profile` | Portal | M7 Portal |  |
| 55 | `portal_privacy` | `/portal/privacy` | Portal | M7 Portal |  |
| 56 | `admin` | `/admin` | Admin | Overview |  |
| 57 | `admin_finance` | `/admin/finance` | Admin | Overview |  |
| 58 | `admin_hub` | `/admin/hubs` | Admin | Overview |  |
| 59 | `admin_exports` | `/admin/exports` | Admin | Overview |  |
| 60 | `admin_people` | `/admin/people` | Admin | People |  |
| 61 | `admin_person` | `/admin/people/:id` | Admin | People |  |
| 62 | `admin_roles` | `/admin/roles` | Admin | People |  |
| 63 | `admin_permissions` | `/admin/permissions` | Admin | People |  |
| 64 | `admin_cycles` | `/admin/campaigns` | Admin | Charter rules | Campaigns table + set-up (goal fixed $100,000) |
| 65 | `admin_settings` | `/admin/settings` | Admin | Charter rules |  |
| 66 | `admin_approvals` | `/admin/approvals` | Admin | Charter rules |  |
| 67 | `admin_settings_history` | `/admin/settings/history` | Admin | Charter rules |  |
| 68 | `admin_ledger` | `/admin/ledger` | Admin | Payments |  |
| 69 | `admin_offline` | `/admin/ledger/offline` | Admin | Payments |  |
| 70 | `admin_flags` | `/admin/finance-flags` | Admin | Payments |  |
| 71 | `admin_reconciliation` | `/admin/reconciliation` | Admin | Payments |  |
| 72 | `admin_ballots` | `/admin/ballots` | Admin | Governance |  |
| 73 | `admin_proposal_form` | `/admin/proposals/new` | Admin | Governance |  |
| 74 | `admin_decisions` | `/admin/decisions` | Admin | Governance |  |
| 75 | `admin_publish` | `/admin/results/publish` | Admin | Governance |  |
| 76 | `admin_nominations` | `/admin/nominations` | Admin | Governance |  |
| 77 | `admin_signatures` | `/admin/signatures` | Admin | Governance |  |
| 78 | `admin_rubric` | `/admin/rubric` | Admin | Governance |  |
| 79 | `admin_review_board` | `/admin/review-board` | Admin | Governance |  |
| 80 | `admin_signups` | `/admin/volunteer-signups` | Admin | Engagement |  |
| 81 | `admin_submissions` | `/admin/submissions` | Admin | Engagement |  |
| 82 | `admin_routing` | `/admin/routing` | Admin | Engagement |  |
| 83 | `admin_cms` | `/admin/cms` | Admin | Content | CMS studio |
| 84 | `admin_preview` | `/admin/cms/preview` | Admin | Content |  |
| 85 | `admin_emails` | `/admin/emails` | Admin | System |  |
| 86 | `admin_delivery` | `/admin/emails/delivery` | Admin | System |  |
| 87 | `admin_audit` | `/admin/audit` | Admin | System |  |
| 88 | `admin_audit_entry` | `/admin/audit/:id` | Admin | System |  |

Design-system boards (not routes): `Main` (tokens), `Components`, `theme_preview`.

Deep-link query params (from the design hash links): `topic`, `area`, `level`, `hub`, `fund`, `plan`, `c`, `e`.
