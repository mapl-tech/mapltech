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

/** The one approved client quote (site.ts testimonials), with her photo. */
const alita = testimonials.find((t) => t.company === 'LRO Staffing');
export const QUOTE = alita
  ? { text: alita.quote, name: alita.name, role: `${alita.role}, ${alita.company}`, image: alita.image }
  : null;

/** The questions a bio visitor asks before booking, in the order they ask them. */
export const FAQ = [
  {
    question: 'What does it cost?',
    answer: `Projects start at ${BUDGET_FLOOR} (US dollars), and our prices are public on mapltech.com. After a 20-minute call, you get one fixed price for your project.`,
  },
  {
    question: 'What if you miss the launch date?',
    answer: 'You don’t pay the final payment. We agree the launch date with you before the work starts.',
  },
  {
    question: 'Who owns the code?',
    answer: 'You do. We hand over the code with clear notes, so your team can carry on where we left off.',
  },
  {
    question: 'How will I know how it’s going?',
    answer: 'You get weekly progress: every week, we show you what has been built.',
  },
  {
    question: 'Do you work outside Canada?',
    answer: 'Yes. We have offices in Toronto (our head office), Lagos and Kingston, and we work with businesses directly as well as with agencies.',
  },
  {
    question: 'What happens after I book?',
    answer: 'We reply within 24 hours to set a time for your 20-minute call. On the call, we talk through what you’re building and your deadline. Then you get a fixed quote and a launch date.',
  },
] as const;

export const CLOSE = {
  title: 'Not sure what it would cost, or how long it would take?',
  lede: 'Tell us what you’re building and your deadline. After a 20-minute call, you get one fixed price and an agreed launch date.',
} as const;

export const LEGAL = {
  company: 'MAPL TECH Inc.',
  offices: 'Toronto · Lagos · Kingston',
  email: siteConfig.email,
  privacy: `${siteConfig.url}/privacy`,
  terms: `${siteConfig.url}/terms`,
  home: siteConfig.url,
} as const;
