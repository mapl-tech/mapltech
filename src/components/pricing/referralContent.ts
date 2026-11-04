/**
 * /referral copy and facts (flagship redesign, Nov 2026; simplified).
 *
 * Every statement about the program comes from the live referral page:
 * "When they become a client, you earn a referral bonus for making the
 * introduction", the three steps (submit a referral; we reach out mentioning
 * your introduction; when the referral becomes a client we thank you with a
 * referral bonus). No bonus amount, percentage or payment date is published,
 * so none is stated anywhere. Prices are read from site.ts.
 */
import { siteConfig } from '@/config/site';
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
  // 19 words: the "how" behind the headline, from the live page's step two.
  lede: 'Send us their details. We reach out, mention that you introduced them, and talk with them about their project.',
  trust: 'One short form. No account needed.',
} as const;

/** The live page's three steps, in its own order. */
export const REFERRAL_STEPS = [
  { name: 'You introduce them', text: 'Fill in the form with their details and what they need.' },
  { name: 'We reach out', text: 'We contact them, mention your introduction and talk about what they need.' },
  { name: 'They become a client', text: 'When the agency you introduced becomes a client, we thank you with a referral bonus.' },
] as const;

export const REFERRAL_FORM = {
  title: 'Refer an agency.',
  // What the form asks of you (the required fields in ReferralSignup): the
  // second pair is a person's, its label "Contact person’s name".
  lede: 'Four fields are required: your name and email, and the contact person’s. Everything else is optional.',
} as const;

/**
 * Questions, as FAQ: every answer is composed from copy already published on
 * the site. The white-label line is the homepage's ("Most of what we build
 * ships under our partners' names").
 */
export const REFERRAL_TERMS: FaqItem[] = [
  {
    // Asked the way referrers ask it, and answered with what is published: no
    // amount or payment date is (the owner sets those terms), so the answer
    // says so, restates only the live page's promise, and points to the
    // published address for the rest. No terms are added.
    question: 'How much is the referral bonus?',
    answer: `We don’t publish the amount or when it is paid. The bonus is our thank-you once the agency you introduced becomes a client. To ask about it before you refer, email ${siteConfig.email}.`,
  },
  {
    question: 'Who can I refer?',
    answer: `Agencies and partners that need help with ${web.name}, ${automation.name}, ${tools.name} or ${cloud.name}.`,
  },
  {
    question: 'What does the agency I refer get?',
    answer: `Public prices, a 20-minute call and a fixed quote after it. ${web.name} costs from ${web.fromLabel}, ${automation.name} from ${automation.fromLabel}, ${tools.name} from ${tools.fromLabel} and ${cloud.name} from ${cloud.fromLabel}. The work can go out under their own brand.`,
  },
  {
    question: 'Where does MAPL TECH work?',
    answer:
      'We are based in Toronto, Canada, with offices in Lagos, Nigeria and Kingston, Jamaica. We work with agencies in Canada, Nigeria, Jamaica and beyond.',
  },
];

export const REFERRAL_TERMS_COPY = {
  label: 'Questions',
  /** Also the FAQPage JSON-LD name. */
  title: 'Questions about referrals.',
  lede: 'What people ask before they refer an agency.',
} as const;

/**
 * The close band, for the visitor who is an agency with a build of its own.
 * Lede: the homepage close's own next step (a 20-minute call, the scope agreed
 * with you, a fixed quote). Display only: "20 minutes" keeps its number on the
 * line with a no-break space.
 */
export const REFERRAL_CLOSE = {
  title: 'Have a project of your own in mind?',
  lede: 'Tell us what you are building. We talk for 20\u00a0minutes, agree the scope with you, and send a fixed quote.',
} as const;
