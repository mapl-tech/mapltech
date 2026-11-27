/**
 * bio.mapltech.com: the video sales page linked from MAPL TECH's social bios
 * (Leshan, Nov 19, 2026: "Build a VSL page like scalingprocess.com/vsl, with
 * the video in public/images/VSL").
 *
 * Sourcing rule (as stories.ts): every claim is either said by the founder in
 * the video (VSL.transcript, transcribed from the file) or already published
 * on mapltech.com (site.ts, stories.ts, the FAQ). Nothing is new here.
 */
import { googleReviews, siteConfig, testimonials } from '@/config/site';
import { findStory } from '@/components/case/stories';
import { PROOF } from '@/components/flagship/content';
import { caseFor } from '@/components/flagship/caseFor';
import { BUDGET_FLOOR } from './questions';

/** Where the page lives. src/app/bio is served at the subdomain's root (next.config.ts). */
export const BIO_ORIGIN = 'https://bio.mapltech.com';

export { VSL, CTA_LABEL } from './vsl';

export const HERO = {
  title: 'One fixed price. An agreed launch date.',
  /** The title's two sentences, each on its own line(s), so it never breaks mid-phrase. */
  titleLines: ['One fixed price.', 'An agreed launch date.'],
  lede: 'We build websites, booking systems and AI tools. If we miss the launch date, you don’t pay the final payment.',
  effort: 'Tell us what you’re building and your deadline. It takes about 2 minutes.',
  trust: ['Fixed quote after one 20‑minute call', 'Weekly progress, and you own the code', 'A reply within 24 hours'],
} as const;

export const RATING = {
  label: `Rated ${googleReviews.rating} on Google`,
  href: googleReviews.url,
} as const;

/** "How it works": the video's promises, in the order a client meets them. */
export const STEPS = [
  {
    title: 'Tell us what you’re building',
    text: 'Answer a few short questions about the project and your deadline. It takes about 2 minutes.',
  },
  {
    title: 'Talk with us for 20 minutes',
    text: 'You get one fixed price and an agreed launch date. If we miss that date, you don’t pay the final payment.',
  },
  {
    title: 'See progress every week',
    text: 'We build it with you and show you the progress every week.',
  },
  {
    title: 'Launch, and the code is yours',
    text: 'You own the code, and every package includes 30 to 90 days of support after launch.',
  },
] as const;

export interface BioCase {
  slug: string;
  client: string;
  /** Service line or kind of project, then the place: "Our own product · Jamaica". */
  kind: string;
  summary: string;
  image: string;
  alt: string;
  /** The case's first published result, or what it shows when it publishes none. */
  value?: string;
  result: string;
  href: string;
}

/**
 * Four case studies, MAPL Tours first (the video's "Jamaica travel business").
 * Each card reads its story (stories.ts), so the words and numbers are the
 * case pages' own and can never drift from them.
 */
const CASE_SLUGS = ['mapl-tours', 'lro-staffing', 'dodo-island-discoveries', 'chha-ncr'] as const;

export const CASES: readonly BioCase[] = CASE_SLUGS.flatMap((slug) => {
  const story = findStory(slug);
  if (!story?.media) return [];
  const first = story.results?.[0];
  return [
    {
      slug,
      client: story.client,
      kind: [story.tags[0], story.tags[2]].filter(Boolean).join(' · '),
      summary: story.headline,
      image: story.media.desktop,
      alt: story.media.alt,
      value: first?.value,
      result: first ? first.label : (story.shows?.[0]?.proof ?? ''),
      href: `${siteConfig.url}/our-work/${slug}`,
    },
  ];
});

/**
 * The one approved client quote (site.ts testimonials), with her photo, the
 * words a skimming reader should catch (`highlight`, set brighter by
 * ui/QuoteText) and the case study it is about on mapltech.com, so the words
 * can be checked against the work.
 */
const alita = testimonials.find((t) => t.company === 'LRO Staffing');
const alitaCase = alita ? caseFor(alita.quote) : null;
export const QUOTE = alita
  ? {
      text: alita.quote,
      highlight: alita.highlight,
      name: alita.name,
      role: `${alita.role}, ${alita.company}`,
      image: alita.image,
      study: alitaCase
        ? { slug: alitaCase.slug, label: `Read the ${alitaCase.client} case study`, href: `${siteConfig.url}${alitaCase.href}` }
        : null,
    }
  : null;

/**
 * The next step at the foot of an answer: a link somewhere else. Never the call
 * request itself: the FAQ's own ask (desktop) and the phone's sticky bar are in
 * view beside every answer, and the same action twice in one section, in two
 * styles, read as two different things.
 */
export interface FaqAction {
  label: string;
  href: string;
  placement: string;
}

export interface FaqItem {
  question: string;
  /** The bottom line, set in bold before the detail, so a skim reads the answer. */
  lead: string;
  detail: string;
  action?: FaqAction;
}

/**
 * The questions a bio visitor asks before booking, in the order they ask them
 * (the owner-approved facts, unchanged since Nov 19, 2026; Nov 20 split each
 * into its bottom line and the detail).
 */
export const FAQ: readonly FaqItem[] = [
  {
    question: 'What does it cost?',
    lead: `Projects start at ${BUDGET_FLOOR} (US dollars).`,
    detail: 'Our prices are public on mapltech.com. After a 20-minute call, you get one fixed price for your project.',
    action: { label: 'See our prices', href: `${siteConfig.url}/pricing`, placement: 'bio_faq_prices' },
  },
  {
    question: 'What if you miss the launch date?',
    lead: 'You don’t pay the final payment.',
    detail: 'We agree the launch date with you before the work starts.',
  },
  {
    question: 'Who owns the code?',
    lead: 'You do.',
    detail: 'We hand over the code with clear notes, so your team can carry on where we left off.',
  },
  {
    question: 'How will I know how it’s going?',
    lead: 'Weekly progress.',
    detail: 'Every week, we show you what has been built.',
  },
  {
    question: 'Do you work outside Canada?',
    lead: 'Yes.',
    detail: 'We have offices in Toronto (our head office), Lagos and Kingston, and we work with businesses directly as well as with agencies.',
  },
  {
    question: 'What happens after I book?',
    lead: 'We reply within 24 hours.',
    detail: 'That reply sets the time for your 20-minute call. On the call, we talk through what you’re building and your deadline. Then you get a fixed quote and a launch date.',
  },
];

/** The FAQ's heading, its lede, and the line under the ask beside it (desktop). */
export const FAQ_HEAD = {
  title: 'Questions people ask',
  lede: 'Short answers. Bring any others to your 20-minute call.',
  askNote: 'We reply within 24 hours. Fixed quote after one 20-minute call.',
} as const;

export const CLOSE = {
  title: 'Not sure what it would cost, or how long it would take?',
  lede: 'Tell us what you’re building and your deadline. After a 20-minute call, you get one fixed price and an agreed launch date.',
} as const;

/** The client logos on mapltech.com's homepage (flagship PROOF.logos, the files in /images/clients/mono). */
export const CLIENTS = { label: PROOF.clientsLabel, logos: PROOF.logos } as const;

export const LEGAL = {
  // "Inc." appears only on /privacy and /terms (Leshan, Nov 19, 2026).
  company: 'MAPL TECH',
  offices: 'Canada · Nigeria · Jamaica',
  email: siteConfig.email,
  privacy: `${siteConfig.url}/privacy`,
  terms: `${siteConfig.url}/terms`,
  home: siteConfig.url,
} as const;
