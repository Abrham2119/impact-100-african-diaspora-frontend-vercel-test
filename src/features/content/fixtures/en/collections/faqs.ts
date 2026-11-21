import { para } from '../../builders';
import { entry } from '../build';

// C:faqs — /faq and the home FAQ block (one source, decision of Step 5). Template sample
// content copied verbatim from design-reference/pages/faq.dc.html.
const ANSWER =
  'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto, nulla quidem! Labore minima earum perspiciatis praesentium nulla autem doloribus voluptatem ipsum, totam adipisci, quas hic eos et esse numquam laborum officiis consectetur inventore distinctio, repellat ipsam. Cumque fugit repellendus nostrum.';
const Q = [
  'How can I get involved in fundraising for your charity?',
  'Do you have any upcoming events or campaigns?',
  'What impact has your charity made so far?',
  'How can I volunteer with your organization?',
  'Where does my donation go?',
  'How can I donate to your cause?',
  'What is your charity\'s mission?',
];

export const faqsEn = Q.map((question, i) => entry(`faq-${i + 1}`, { fields: { question, answer: para(ANSWER) } }));
