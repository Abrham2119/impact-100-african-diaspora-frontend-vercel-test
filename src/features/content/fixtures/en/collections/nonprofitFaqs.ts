import { para } from '../../builders';
import { entry } from '../build';

// C:nonprofit_faqs — "Questions from organizations" (nonprofits.dc.html `FAQ`), copy verbatim.
const FAQ: Array<[question: string, answer: string]> = [
  ['Can any nonprofit apply?', 'Grants go to high-impact organizations in Sub-Saharan Africa within USAFI’s partner network. If you aren’t a USAFI partner yet, express interest through our contact page and we’ll share next steps.'],
  ['When will the first grants be made?', 'The Chapter is building its infrastructure through 2026–27. The first grant cycle launches in 2027, with grants management and distribution running April through September.'],
  ['How are proposals reviewed?', 'The Grants Selection committee’s volunteer reviewers score proposals against a transparent rubric.'],
  ['Who decides which projects are funded?', 'Eligible members vote on preferred projects. Approved grants are paid by USAFI Impact.'],
  ['Which countries do you fund in?', 'Grants go to high-impact organizations in Sub-Saharan Africa within USAFI’s partner network.'],
  ['Who sends the money?', 'USAFI Impact, as fiscal sponsor, confirms standing and charitable use of funds. Approved grants are paid by USAFI Impact.'],
  ['What if a member has a connection to our organization?', 'Members may nominate partners they know. Chapter leaders summarize each project, its budget, and any conflicts of interest.'],
];

export const nonprofitFaqsEn = FAQ.map(([question, answer], i) => entry(`nonprofit-faq-${i + 1}`, { fields: { question, answer: para(answer) } }));
