/**
 * /referral copy and facts (flagship redesign, Nov 2026).
 *
 * Every statement about the program comes from the live referral page:
 * "When they become a client, you earn a referral bonus for making the
 * introduction", the three steps (submit a referral; we reach out mentioning
 * your introduction; when the referral becomes a client we thank you with a
 * referral bonus). No bonus amount, percentage or payment date is published,
 * so none is stated anywhere, and the calculator says plainly that its figure
 * is project value, not the bonus. Prices are read from site.ts.
 */
import type { FaqItem } from '@/lib/schema';
import { factsOf } from './content';

export const REFERRAL_PATH = '/referral';
export const REFERRAL_URL = 'https://mapltech.com/referral';
export const REFERRAL_TITLE = 'Referral program: introduce an agency';
export const REFERRAL_DESCRIPTION =
  'Introduce an agency to MAPL TECH. When they become a client, we thank you with a referral bonus. See how it works and refer an agency in one short form.';

const web = factsOf('web');
const automation = factsOf('automation');
const tools = factsOf('tools');
const cloud = factsOf('cloud');

export const REFERRAL_HERO = {
  eyebrow: 'Referral program',
  titleLines: ['Introduce an agency.', 'Earn a bonus when they become a client.'],
  // 22 words: the "how" behind the headline, from the live page's step two.
  lede: 'Send us their details and what they need. Our team reaches out, mentions your introduction and talks through the project with them.',
  trust: 'One short form. No account needed.',
} as const;

/** The live page's three steps, in its own order and words. */
export const REFERRAL_STEPS = [
  { name: 'You introduce them', text: 'Fill out the form with the agency or partner’s details and what they need.' },
  { name: 'We reach out', text: 'Our team contacts them, mentions your introduction and discusses their needs.' },
  { name: 'They become a client', text: 'When the agency you introduced becomes a client, we thank you with a referral bonus.' },
] as const;

export const REFERRAL_ESTIMATOR = {
  title: 'Put a number on your introductions.',
  lede: 'Pick how many agencies you might introduce in a year and what they mostly need. The figure is project value at our public prices, not your bonus.',
} as const;

// Services are always named by their canonical labels (SERVICE_META via factsOf).
const toolsAndCloud =
  tools.from === cloud.from
    ? `${tools.name} and ${cloud.name} at ${tools.fromLabel}`
    : `${tools.name} at ${tools.fromLabel} and ${cloud.name} at ${cloud.fromLabel}`;

export const REFERRAL_THEY_GET = {
  title: 'What the agency you introduce gets.',
  // Answer-first: what your contact is offered, with the real starting prices.
  answer: `Public prices, a 20-minute scoping call and a fixed quote after it. ${web.name} starts at ${web.fromLabel}, ${automation.name} at ${automation.fromLabel}, ${toolsAndCloud}.`,
  // First clause: the homepage's published line (flagship content.ts WORK_INTRO).
  note: 'Most of what we build ships under our partners’ names, so the work can go out under the agency’s brand, not ours.',
} as const;

export const REFERRAL_FORM = {
  title: 'Refer an agency.',
  lede: 'Tell us about the agency and how to reach them. We will contact them and mention that you introduced them.',
  // What the form asks of you, answered beside it (the fields in ReferralSignup).
  needs: [
    { term: 'Required', detail: 'Four fields: your name and email, and theirs.' },
    { term: 'Optional', detail: 'Your company, the agency’s name, what they need and a note.' },
  ],
} as const;

/** Terms as FAQ: every answer is composed from copy already published on the site. */
export const REFERRAL_TERMS: FaqItem[] = [
  {
    question: 'How do I refer an agency?',
    answer:
      'Fill out the referral form with the agency or partner’s details and their needs. Our team contacts them, mentions your introduction and discusses their needs.',
  },
  {
    question: 'When do I receive the referral bonus?',
    answer: 'When the agency you referred becomes a client, we thank you with a referral bonus for making the introduction.',
  },
  {
    question: 'Is the figure in the calculator my bonus?',
    answer:
      'No. It is the project value your introductions would represent at our public prices. The referral bonus is separate: we thank you with one when an agency you introduced becomes a client.',
  },
  {
    question: 'Who can I refer?',
    answer: `Agencies and partners that need help with ${web.name}, ${automation.name}, ${tools.name} or ${cloud.name}.`,
  },
  {
    question: 'What does the agency I refer get?',
    answer: `A 20-minute scoping call and a fixed quote after it. ${web.name} starts at ${web.fromLabel}, ${automation.name} at ${automation.fromLabel}, ${tools.name} at ${tools.fromLabel} and ${cloud.name} at ${cloud.fromLabel}.`,
  },
  {
    question: 'Where does MAPL TECH work?',
    answer:
      'MAPL TECH is headquartered in Toronto, Canada, with offices in Lagos, Nigeria and Kingston, Jamaica, and works with agencies in Canada, Nigeria, Jamaica and beyond.',
  },
];

export const REFERRAL_TERMS_COPY = {
  title: 'Referral questions, answered plainly.',
  lede: 'How the program works, in the same words we use on every page.',
} as const;
