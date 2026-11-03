/**
 * Homepage copy and facts (flagship redesign, Nov 2026).
 *
 * Every number here is either published by MAPL TECH already (site.ts, the live
 * homepage) or computed from data in the repo; nothing is estimated. Sources are
 * cited inline. Copy rules: no em dashes, no hype verbs, one label per action.
 */
import { listedProjects, pricing, testimonials } from '@/config/site';
import { parsePriceLabel, type EstimateService } from '@/lib/estimate';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';

/** The one primary action, labelled the same everywhere (header, hero, bar, close). */
export const PRIMARY_CTA = { label: PROJECT_LABEL, href: PROJECT_HREF } as const;
export const SECONDARY_CTA = { label: 'See the work', href: '/our-work' } as const;

interface TitleRun {
  text: string;
  accent?: boolean;
}

/**
 * The hero keeps the live site's purpose and words: "The engineering backbone
 * behind agencies that refuse to cut corners." Broken into the four lines it
 * sets at desktop widths (phones let it wrap freely).
 */
export const HERO = {
  titleLines: [
    [{ text: 'The ' }, { text: 'engineering', accent: true }],
    [{ text: 'backbone', accent: true }, { text: ' behind' }],
    [{ text: 'agencies that refuse' }],
    [{ text: 'to cut corners.' }],
  ] as readonly (readonly TitleRun[])[],
  lede: 'We build the websites, automation, software and cloud systems that agencies sell, and we deliver them under your brand.',
} as const;

/** Lowest public "from" price across the four service lines (site.ts `pricing`). */
function lowestFromPrice(): number {
  const labels = [
    ...pricing.webDevelopment.tiers,
    ...pricing.automation.tiers,
    ...pricing.internalTools.tiers,
    ...pricing.cloudEngineering.tiers,
  ].map((tier) => tier.price);
  const lows = labels.map((label) => parsePriceLabel(label).low).filter((n): n is number => typeof n === 'number');
  return Math.min(...lows);
}

export const LOWEST_PRICE = lowestFromPrice();

function money(n: number): string {
  return `$${n.toLocaleString('en-US')}`;
}

/** Proof strip. Numbers as published on the live homepage (Projects Supported, Years Combined Experience). */
export const PROOF = {
  // Sizes keep each file's own aspect ratio (LRO 400x273, FOCAS 300x86, CHHA 184x192,
  // Loop and Crowned Spice square), optically balanced around a 34px height.
  logos: [
    { name: 'LRO Staffing', src: '/images/clients/lro-staffing.png', width: 50, height: 34, invert: true },
    { name: 'Loop', src: '/images/clients/loop.webp', width: 34, height: 34, invert: false },
    { name: 'FOCAS Canada', src: '/images/clients/focas-canada.png', width: 84, height: 24, invert: true },
    { name: 'CHHA-NCR', src: '/images/clients/chha-ncr.svg', width: 33, height: 34, invert: true },
    { name: 'Crowned Spice', src: '/images/clients/crowned-spice.png', width: 34, height: 34, invert: false },
  ],
  stats: [
    { value: 200, suffix: '+', label: 'projects supported' },
    { value: 25, suffix: '+', label: 'years of combined engineering experience' },
    { value: 3, suffix: '', label: 'offices: Toronto, Lagos, Kingston' },
  ],
} as const;

export interface Layer {
  id: string;
  service: EstimateService;
  name: string;
  /** Link text to the service page, cased by hand ("AI", not "ai"). */
  linkLabel: string;
  summary: string;
  fromPrice: string;
  href: string;
  image: { src: string; alt: string; width: number; height: number } | null;
}

function from(label: string): string {
  const low = parsePriceLabel(label).low;
  return typeof low === 'number' ? `From ${money(low)}` : label;
}

export const LAYERS: readonly Layer[] = [
  {
    id: 'layer-web',
    service: 'web',
    name: 'Web Development',
    linkLabel: 'How we build websites',
    summary: 'Fast websites that rank on Google, meet accessibility standards on launch day, and that your client can update without help.',
    fromPrice: from(pricing.webDevelopment.tiers[0].price),
    href: '/services/web-development',
    image: {
      src: '/images/case-lro-website.jpg',
      alt: 'The LRO Staffing homepage, built by MAPL TECH: a job search panel under the headline "Building Careers. Strengthening Organizations."',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'layer-automation',
    service: 'automation',
    name: 'Automation & AI',
    linkLabel: 'How we build automation and AI',
    summary: 'AI and automation that take repetitive work off your client’s team: sorting new leads, follow-ups and reports.',
    fromPrice: from(pricing.automation.tiers[0].price),
    href: '/services/automation-ai-workflow-setup',
    image: {
      src: '/images/case-mapl-tours.jpg',
      alt: 'MAPL Tours, the AI-run travel company MAPL TECH builds and operates: the homepage over aerial footage of the Jamaican coast.',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'layer-tools',
    service: 'tools',
    name: 'Custom Internal Tools',
    linkLabel: 'How we build internal tools',
    summary: 'Dashboards, client portals and admin systems, built around how your client’s team really works.',
    fromPrice: from(pricing.internalTools.tiers[0].price),
    href: '/services/custom-internal-tools',
    image: {
      src: '/images/case-lro.jpg',
      alt: 'The LRO Interactive Salary Guide, a filterable salary benchmarking tool MAPL TECH built for recruiters and hiring managers.',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'layer-cloud',
    service: 'cloud',
    name: 'Cloud Engineering',
    linkLabel: 'How we run cloud infrastructure',
    summary: 'Cloud hosting on AWS, Google Cloud or Azure, with testing, monitoring and moves from old servers, so sites stay online.',
    fromPrice: from(pricing.cloudEngineering.tiers[0].price),
    href: '/services/cloud-engineering',
    image: null,
  },
];

export interface WorkCard {
  slug: string;
  client: string;
  kind: string;
  outcome: string;
  metrics: readonly { value: string; label: string }[];
  image: { src: string; alt: string };
  href: string;
}

const listedSlugs = new Set(listedProjects().map((p) => p.slug));

/**
 * Sources: LRO Staffing metrics from the build (eight expertise hubs) and the
 * live-site Lighthouse result published on leshanpatterson.com; MAPL Tours
 * figures as published on leshanpatterson.com (Nov 2026); CHHA-NCR from the
 * independent August 2026 audit (site.ts `caseStudies`).
 */
export const WORK: readonly WorkCard[] = (
  [
    {
      slug: 'lro-staffing',
      client: 'LRO Staffing',
      kind: 'Website · Ottawa and Toronto',
      outcome: 'One website for two audiences: people looking for work and employers looking to hire.',
      metrics: [
        { value: '100', label: 'Google Lighthouse score for accessibility and SEO, phone and desktop' },
        { value: '8', label: 'industry pages, one click from the menu' },
      ],
      image: { src: '/images/case-lro-website.jpg', alt: 'LRO Staffing homepage with its job search panel.' },
      href: '/our-work/lro-staffing',
    },
    {
      slug: 'mapl-tours',
      client: 'MAPL Tours',
      kind: 'Our own product · Jamaica',
      outcome: 'A travel company we built and run ourselves, with AI handling quoting, booking and follow-up.',
      metrics: [
        { value: '~50%', label: 'of customers now arrive through ChatGPT' },
        { value: '~2,000', label: 'automatic checks run before every update' },
      ],
      image: { src: '/images/case-mapl-tours.jpg', alt: 'MAPL Tours homepage over aerial footage of the Jamaican coast.' },
      href: '/our-work/mapl-tours',
    },
    {
      slug: 'chha-ncr',
      client: 'CHHA-NCR',
      kind: 'Non-profit website · Ottawa',
      outcome: 'A new website for people with hearing loss, most of them over 55. Volunteers can update it themselves.',
      metrics: [
        { value: 'AA', label: 'accessibility rating for colour contrast, on every pair checked' },
        { value: '5', label: 'stages in the site’s guide, from noticing hearing loss to giving back' },
      ],
      image: { src: '/images/case-chha-ncr.jpg', alt: 'The CHHA-NCR homepage after the July 2026 relaunch.' },
      href: '/our-work/chha-ncr',
    },
  ] satisfies WorkCard[]
).filter((card) => listedSlugs.has(card.slug));

/** The one approved client quote (site.ts `testimonials`, LRO Staffing). */
export const SPOTLIGHT = testimonials.find((t) => t.company === 'LRO Staffing') ?? null;

/**
 * Beside the hero ask: the risk answer (both facts are the FAQ's own answers,
 * src/components/home/data.ts) and the first sentence of the approved quote.
 */
export const HERO_REASSURE = 'A fixed quote after one 20-minute call. We sign an NDA before you share anything.';
export const HERO_PROOF = SPOTLIGHT
  ? {
      quote: SPOTLIGHT.quote.match(/^[^.!?]+[.!?]/)?.[0] ?? SPOTLIGHT.quote,
      name: SPOTLIGHT.name,
      role: `${SPOTLIGHT.role}, ${SPOTLIGHT.company}`,
      image: SPOTLIGHT.image || null,
    }
  : null;

export const MOBILE_BAR_CONTEXT = `Public prices, from ${money(LOWEST_PRICE)}`;

/* ------------------------------------------------------------------ */
/* Homepage sections (Nov 2026 simplify pass): the live site's purpose, */
/* in plain words. Facts come from the live homepage and the FAQ.       */
/* ------------------------------------------------------------------ */

export const SERVICES_INTRO = {
  label: 'What we do',
  title: 'What we build for agencies.',
  lede: 'Four services, each with a public starting price. Use one, or combine them.',
} as const;

/** The four service rows: names, summaries and links from LAYERS; previews are real work. */
export const SERVICE_PREVIEWS: Record<string, { src: string; width: number; height: number } | null> = {
  web: { src: '/images/cases/lro-desktop.jpg', width: 1800, height: 1125 },
  automation: { src: '/images/cases/tours-desktop.jpg', width: 1800, height: 1125 },
  tools: { src: '/images/cases/salary-desktop.jpg', width: 1800, height: 1125 },
  cloud: null,
};

export const WORK_SECTION = {
  label: 'Selected work',
  title: 'Work we can show.',
  lede: 'Most of what we build carries our partners’ brands, not ours. These are projects we can show you.',
  all: { label: 'See all our work', href: '/our-work' },
} as const;

export const APPROACH = {
  label: 'Process',
  title: 'How it works.',
  lede: 'From your first message to launch day, you know what happens next.',
  steps: [
    { title: 'Tell us what you need', text: 'Answer four short questions. Then we talk for 20 minutes.' },
    { title: 'Get a fixed quote', text: 'We agree what is included, and you get one fixed price.' },
    { title: 'We build it with you', text: 'Your brand on the work, and a check-in with your team every week.' },
    { title: 'Launch and support', text: 'We launch, hand over documented code, and support you after launch.' },
  ],
} as const;

export const PROOF_SECTION = {
  label: 'Our track record',
  title: 'Why agencies choose us.',
} as const;

/** The close adds what the hero's reassurance does not: what the call is for (the contact page's own steps). */
export const CLOSE_BAND = {
  title: 'Have a project your clients are waiting on?',
  lede: 'Answer four short questions. Then we talk for 20 minutes, agree what is included, and send you a fixed quote.',
} as const;
